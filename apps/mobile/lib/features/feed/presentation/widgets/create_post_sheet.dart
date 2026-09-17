import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';

import '../../domain/post_events.dart';
import '../../domain/repositories/feed_repository.dart';
import '../cubit/create_post_cubit.dart';

/// The API rejects multipart requests above 10 MB
/// (`spring.servlet.multipart.max-file-size`).
const kMaxPostImageBytes = 10 * 1024 * 1024;

/// Opens [CreatePostSheet], re-providing what the modal route needs (modal
/// routes are not descendants of the session-scoped providers).
Future<void> showCreatePostSheet(BuildContext context) {
  final repository = context.read<FeedRepository>();
  final events = context.read<PostEvents>();
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (_) => RepositoryProvider.value(
      value: events,
      child: BlocProvider(
        create: (_) => CreatePostCubit(repository),
        child: const CreatePostSheet(),
      ),
    ),
  );
}

class CreatePostSheet extends StatefulWidget {
  const CreatePostSheet({super.key, this.imagePicker});

  /// Injectable for widget tests; defaults to the platform picker.
  final ImagePicker? imagePicker;

  @override
  State<CreatePostSheet> createState() => _CreatePostSheetState();
}

class _CreatePostSheetState extends State<CreatePostSheet> {
  final _controller = TextEditingController();
  late final ImagePicker _picker = widget.imagePicker ?? ImagePicker();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<CreatePostCubit, CreatePostState>(
      listenWhen: (previous, current) =>
          !previous.isSuccess && current.isSuccess,
      listener: (context, state) {
        context.read<PostEvents>().postCreated();
        Navigator.of(context).pop();
      },
      child: BlocBuilder<CreatePostCubit, CreatePostState>(
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
                  Text(
                    'Criar publicacao',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _controller,
                    minLines: 4,
                    maxLines: 8,
                    enabled: !state.isSubmitting,
                    decoration: const InputDecoration(
                      hintText: 'Compartilhe uma atualizacao...',
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (state.imagePath != null)
                    _ImagePreview(
                      path: state.imagePath!,
                      onRemove: state.isSubmitting
                          ? null
                          : context.read<CreatePostCubit>().removeImage,
                    )
                  else
                    OutlinedButton.icon(
                      onPressed:
                          state.isSubmitting ? null : () => _pickImage(context),
                      icon: const Icon(Icons.image_outlined),
                      label: const Text('Adicionar imagem'),
                    ),
                  if (state.errorMessage != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      state.errorMessage!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed:
                        state.isSubmitting ? null : () => _submit(context),
                    child: state.isSubmitting
                        ? const SizedBox.square(
                            dimension: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Publicar'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _pickImage(BuildContext context) async {
    final cubit = context.read<CreatePostCubit>();
    final XFile? file;
    try {
      file = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 2048,
        maxHeight: 2048,
        imageQuality: 85,
      );
    } on PlatformException {
      cubit.reportError('Nao foi possivel abrir a galeria.');
      return;
    }
    if (file == null) {
      return;
    }
    if (await file.length() > kMaxPostImageBytes) {
      cubit.reportError('A imagem deve ter no maximo 10 MB.');
      return;
    }
    cubit.selectImage(file.path);
  }

  void _submit(BuildContext context) {
    final cubit = context.read<CreatePostCubit>();
    final content = _controller.text.trim();
    if (content.isEmpty && cubit.state.imagePath == null) {
      cubit.reportError('Escreva algo ou adicione uma imagem.');
      return;
    }
    cubit.submit(content: content);
  }
}

class _ImagePreview extends StatelessWidget {
  const _ImagePreview({required this.path, required this.onRemove});

  final String path;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 240),
            child: Image.file(
              File(path),
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
        ),
        Positioned(
          top: 8,
          right: 8,
          child: IconButton.filledTonal(
            tooltip: 'Remover imagem',
            onPressed: onRemove,
            icon: const Icon(Icons.close),
          ),
        ),
      ],
    );
  }
}
