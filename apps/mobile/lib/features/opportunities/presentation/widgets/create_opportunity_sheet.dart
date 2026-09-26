import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../cubit/opportunities_cubit.dart';

/// Opens [CreateOpportunitySheet], re-providing the cubit the modal route
/// needs (modal routes are not descendants of the session-scoped providers).
Future<void> showCreateOpportunitySheet(BuildContext context) {
  final cubit = context.read<OpportunitiesCubit>();
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (_) => BlocProvider.value(
      value: cubit,
      child: const CreateOpportunitySheet(),
    ),
  );
}

/// Company-only form to publish a new opportunity
/// (`POST /opportunities/create/{companyId}`). The company id itself is
/// never passed in here: [OpportunitiesCubit.createOpportunity] resolves it
/// from the signed-in session.
class CreateOpportunitySheet extends StatefulWidget {
  const CreateOpportunitySheet({super.key});

  @override
  State<CreateOpportunitySheet> createState() => _CreateOpportunitySheetState();
}

class _CreateOpportunitySheetState extends State<CreateOpportunitySheet> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _skillsController = TextEditingController();
  DateTime _dateEnd = DateTime.now().add(const Duration(days: 30));

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    _skillsController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final value = await showDatePicker(
      context: context,
      initialDate: _dateEnd,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
    );
    if (value != null) {
      setState(() => _dateEnd = value);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final cubit = context.read<OpportunitiesCubit>();
    await cubit.createOpportunity(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      location: _locationController.text.trim(),
      dateEnd: _dateEnd,
      skills: _skillsController.text
          .split(',')
          .map((skill) => skill.trim())
          .where((skill) => skill.isNotEmpty)
          .toList(),
    );

    if (!mounted) {
      return;
    }
    if (cubit.state.actionErrorMessage == null) {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSubmitting = context.select<OpportunitiesCubit, bool>(
      (cubit) => cubit.state.isSubmitting,
    );

    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Criar oportunidade',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _titleController,
                enabled: !isSubmitting,
                decoration: const InputDecoration(labelText: 'Titulo'),
                validator: _required,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                minLines: 3,
                maxLines: 6,
                enabled: !isSubmitting,
                decoration: const InputDecoration(labelText: 'Descricao'),
                validator: _required,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _locationController,
                enabled: !isSubmitting,
                decoration: const InputDecoration(labelText: 'Local'),
                validator: _required,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _skillsController,
                enabled: !isSubmitting,
                decoration: const InputDecoration(
                  labelText: 'Habilidades',
                  hintText: 'Velocidade, Passe, Marketing',
                ),
                validator: _required,
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: isSubmitting ? null : _pickDate,
                icon: const Icon(Icons.calendar_today_outlined),
                label: Text(
                  'Encerra em ${_dateEnd.day.toString().padLeft(2, '0')}/'
                  '${_dateEnd.month.toString().padLeft(2, '0')}/'
                  '${_dateEnd.year}',
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: isSubmitting ? null : _submit,
                child: isSubmitting
                    ? const SizedBox.square(
                        dimension: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Publicar oportunidade'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String? _required(String? value) {
    return value == null || value.trim().isEmpty ? 'Campo obrigatorio.' : null;
  }
}
