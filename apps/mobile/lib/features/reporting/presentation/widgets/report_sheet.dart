import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/report_entity_type.dart';
import '../../domain/entities/report_reason.dart';
import '../../domain/repositories/report_repository.dart';
import '../cubit/report_cubit.dart';

const _kMaxDetailsLength = 500;

/// Opens the report bottom sheet — a mobile adaptation of apps/web's
/// `ReportModal` dialog — for [type]/[entityId]. Generic on purpose: posts
/// wire it up first (`PostCard`'s three-dot menu), opportunities/comments
/// are expected to call this same function unchanged.
Future<void> showReportSheet(
  BuildContext context, {
  required ReportEntityType type,
  required int entityId,
  String? entityTitle,
}) {
  final repository = context.read<ReportRepository>();
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (_) => BlocProvider(
      create: (_) => ReportCubit(repository, type: type, entityId: entityId),
      child: ReportSheet(type: type, entityTitle: entityTitle),
    ),
  );
}

class ReportSheet extends StatefulWidget {
  const ReportSheet({required this.type, this.entityTitle, super.key});

  final ReportEntityType type;
  final String? entityTitle;

  @override
  State<ReportSheet> createState() => _ReportSheetState();
}

class _ReportSheetState extends State<ReportSheet> {
  final _detailsController = TextEditingController();

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ReportCubit, ReportState>(
      listenWhen: (previous, current) =>
          previous.isSuccess != current.isSuccess ||
          previous.actionErrorMessage != current.actionErrorMessage,
      listener: (context, state) {
        if (state.isSuccess) {
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.successMessage!)),
          );
          return;
        }
        if (state.actionErrorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.actionErrorMessage!)),
          );
          context.read<ReportCubit>().dismissActionError();
        }
      },
      builder: (context, state) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 16,
            bottom: MediaQuery.of(context).viewInsets.bottom + 16,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.warning_amber_rounded,
                      color: AppColors.destructive,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        widget.type.sheetTitle,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Sua denúncia será analisada pela nossa equipe. Use este '
                  'recurso apenas para conteúdos que violem nossas '
                  'diretrizes.',
                ),
                if (widget.entityTitle != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.muted,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text.rich(
                      TextSpan(
                        text: 'Denunciando: ',
                        children: [
                          TextSpan(
                            text: widget.entityTitle,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Text(
                  'Motivo da denúncia *',
                  style: Theme.of(context).textTheme.labelLarge,
                ),
                const SizedBox(height: 4),
                RadioGroup<ReportReason>(
                  groupValue: state.reason,
                  onChanged: state.isSubmitting
                      ? (_) {}
                      : (value) {
                          if (value != null) {
                            context.read<ReportCubit>().reasonChanged(value);
                          }
                        },
                  child: Column(
                    children: [
                      for (final reason in ReportReason.values)
                        RadioListTile<ReportReason>(
                          contentPadding: EdgeInsets.zero,
                          dense: true,
                          value: reason,
                          title: Text(reason.label),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _detailsController,
                  enabled: !state.isSubmitting,
                  maxLength: _kMaxDetailsLength,
                  maxLines: 4,
                  decoration: const InputDecoration(
                    labelText: 'Detalhes adicionais (opcional)',
                  ),
                  onChanged: context.read<ReportCubit>().detailsChanged,
                  buildCounter: (
                    context, {
                    required currentLength,
                    required isFocused,
                    required maxLength,
                  }) =>
                      Text('$currentLength/$maxLength caracteres'),
                ),
                const SizedBox(height: 4),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEFCE8),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFFEF08A)),
                  ),
                  child: const Text(
                    '⚠️ Aviso: Denúncias falsas podem resultar em '
                    'penalidades para sua conta.',
                    style: TextStyle(color: Color(0xFF854D0E)),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    // Both buttons are Expanded on purpose: the parent Column
                    // stretches, and a bare button in a Row gets an unbounded
                    // width constraint, which blows up layout on a phone.
                    Expanded(
                      child: TextButton(
                        onPressed: state.isSubmitting
                            ? null
                            : () => Navigator.of(context).pop(),
                        child: const Text('Cancelar'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.destructive,
                          foregroundColor: Colors.white,
                        ),
                        onPressed: state.canSubmit
                            ? context.read<ReportCubit>().submit
                            : null,
                        child: state.isSubmitting
                            ? const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  SizedBox.square(
                                    dimension: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Text('Enviando...'),
                                ],
                              )
                            : const Text('Enviar Denúncia'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
