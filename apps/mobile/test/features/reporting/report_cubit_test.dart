import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/error/app_exception.dart';
import 'package:weunite_mobile/features/reporting/domain/entities/report_entity_type.dart';
import 'package:weunite_mobile/features/reporting/domain/entities/report_reason.dart';
import 'package:weunite_mobile/features/reporting/domain/repositories/report_repository.dart';
import 'package:weunite_mobile/features/reporting/presentation/cubit/report_cubit.dart';

class _Submission {
  const _Submission({
    required this.type,
    required this.entityId,
    required this.reason,
  });

  final ReportEntityType type;
  final int entityId;
  final String reason;
}

class _FakeReportRepository implements ReportRepository {
  final submissions = <_Submission>[];
  String? responseMessage;
  Object? error;

  @override
  Future<String?> submitReport({
    required ReportEntityType type,
    required int entityId,
    required String reason,
  }) async {
    submissions
        .add(_Submission(type: type, entityId: entityId, reason: reason));
    if (error != null) {
      throw error!;
    }
    return responseMessage;
  }
}

void main() {
  late _FakeReportRepository repository;

  setUp(() => repository = _FakeReportRepository());

  group('ReportCubit.submit', () {
    test(
      'shows a validation message and does not call the repository when no '
      'reason is selected',
      () async {
        final cubit =
            ReportCubit(repository, type: ReportEntityType.post, entityId: 1);

        await cubit.submit();

        expect(
          cubit.state.actionErrorMessage,
          'Por favor, selecione um motivo para a denúncia',
        );
        expect(repository.submissions, isEmpty);
      },
    );

    test(
      'sends the reason code when the details field is left empty',
      () async {
        repository.responseMessage = 'Denúncia registrada com sucesso!';
        final cubit = ReportCubit(
          repository,
          type: ReportEntityType.post,
          entityId: 42,
        );
        cubit.reasonChanged(ReportReason.spam);

        await cubit.submit();

        expect(repository.submissions.single.type, ReportEntityType.post);
        expect(repository.submissions.single.entityId, 42);
        expect(repository.submissions.single.reason, 'spam');
        expect(cubit.state.isSuccess, isTrue);
        expect(cubit.state.successMessage, 'Denúncia registrada com sucesso!');
      },
    );

    test(
      'free-text details REPLACE the reason code when present '
      '(apps/web ReportModal parity)',
      () async {
        final cubit = ReportCubit(
          repository,
          type: ReportEntityType.comment,
          entityId: 7,
        );
        cubit.reasonChanged(ReportReason.harassment);
        cubit.detailsChanged('  Este comentario tem detalhes especificos  ');

        await cubit.submit();

        expect(
          repository.submissions.single.reason,
          'Este comentario tem detalhes especificos',
        );
      },
    );

    test('falls back to a default success message when the API sends none',
        () async {
      final cubit =
          ReportCubit(repository, type: ReportEntityType.post, entityId: 1);
      cubit.reasonChanged(ReportReason.other);

      await cubit.submit();

      expect(
        cubit.state.successMessage,
        'Denúncia enviada com sucesso! Nossa equipe irá analisá-la em breve.',
      );
    });

    test('surfaces an API error prefixed for the snackbar', () async {
      repository.error = const AppException('Sessão inválida.');
      final cubit =
          ReportCubit(repository, type: ReportEntityType.post, entityId: 1);
      cubit.reasonChanged(ReportReason.spam);

      await cubit.submit();

      expect(cubit.state.isSubmitting, isFalse);
      expect(cubit.state.isSuccess, isFalse);
      expect(
        cubit.state.actionErrorMessage,
        'Erro ao enviar denúncia: Sessão inválida.',
      );
    });
  });
}
