import '../../../core/session/current_user_provider.dart';
import '../domain/entities/report_entity_type.dart';
import '../domain/repositories/report_repository.dart';
import 'report_remote_data_source.dart';

class ReportRepositoryImpl implements ReportRepository {
  ReportRepositoryImpl({
    required ReportRemoteDataSource remoteDataSource,
    required CurrentUserProvider currentUserProvider,
  })  : _remoteDataSource = remoteDataSource,
        _currentUserProvider = currentUserProvider;

  final ReportRemoteDataSource _remoteDataSource;
  final CurrentUserProvider _currentUserProvider;

  @override
  Future<String?> submitReport({
    required ReportEntityType type,
    required int entityId,
    required String reason,
  }) {
    final userId = _currentUserProvider.requireUserId();
    return _remoteDataSource.createReport(
      userId: userId,
      type: type.apiValue,
      entityId: entityId,
      reason: reason,
    );
  }
}
