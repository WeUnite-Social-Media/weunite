import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:video_player/video_player.dart';

import '../../domain/post_events.dart';
import '../../domain/post_media.dart';
import '../../domain/repositories/feed_repository.dart';
import '../cubit/create_post_cubit.dart';

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
                  if (state.imagePath != null) ...[
                    _ImagePreview(
                      path: state.imagePath!,
                      onRemove: state.isSubmitting
                          ? null
                          : context.read<CreatePostCubit>().removeImage,
                    ),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton.icon(
                        onPressed: state.isSubmitting
                            ? null
                            : () => _pickMedia(context),
                        icon: const Icon(Icons.swap_horiz),
                        label: const Text('Trocar midia'),
                      ),
                    ),
                  ] else
                    OutlinedButton.icon(
                      onPressed:
                          state.isSubmitting ? null : () => _pickMedia(context),
                      icon: const Icon(Icons.image_outlined),
                      label: const Text('Adicionar imagem ou video'),
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

  /// Picks an image **or** a video, the same choice the web offers with
  /// `accept="image/*, video/*"` on its post composer. `pickMedia` is the one
  /// picker entry that lets the person choose either without asking them first
  /// which kind they want.
  ///
  /// The image-only resizing arguments stay: `pickMedia` applies them to an
  /// image and ignores them for a video, which is what we want — re-encoding a
  /// video on the phone would be slow and lossy, and the 50 MB limit already
  /// keeps the upload sane.
  Future<void> _pickMedia(BuildContext context) async {
    final cubit = context.read<CreatePostCubit>();
    final XFile? file;
    try {
      file = await _picker.pickMedia(
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
    final problem = validatePostMedia(
      path: file.path,
      sizeInBytes: await file.length(),
    );
    if (problem != null) {
      cubit.reportError(problem);
      return;
    }
    cubit.selectImage(file.path);
  }

  void _submit(BuildContext context) {
    final cubit = context.read<CreatePostCubit>();
    final content = _controller.text.trim();
    // The API requires the text even when a file is attached
    // (`CreatePostRequestDTO`), and so does the web schema
    // (`text: z.string().min(1)`). Without this the request left the phone and
    // came back as "Validation failed for object='post'".
    if (content.isEmpty) {
      cubit.reportError('O texto e obrigatorio');
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
    final isVideo = isPostVideoPath(path);
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxHeight: 240),
            child: isVideo
                ? _VideoFilePreview(path: path)
                : Image.file(
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
            tooltip: isVideo ? 'Remover video' : 'Remover imagem',
            onPressed: onRemove,
            icon: const Icon(Icons.close),
          ),
        ),
      ],
    );
  }
}

/// First frame of the picked video, so the person sees what they chose instead
/// of a filename. It never plays here — the composer is for choosing, and the
/// feed is where the video runs.
class _VideoFilePreview extends StatefulWidget {
  const _VideoFilePreview({required this.path});

  final String path;

  @override
  State<_VideoFilePreview> createState() => _VideoFilePreviewState();
}

class _VideoFilePreviewState extends State<_VideoFilePreview> {
  VideoPlayerController? _controller;
  bool _isReady = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final controller = VideoPlayerController.file(File(widget.path));
    _controller = controller;
    try {
      await controller.initialize();
    } catch (_) {
      return;
    }
    if (!mounted) {
      await controller.dispose();
      return;
    }
    setState(() => _isReady = true);
  }

  @override
  void didUpdateWidget(_VideoFilePreview oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.path != widget.path) {
      _controller?.dispose();
      _controller = null;
      _isReady = false;
      _load();
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;
    if (!_isReady || controller == null) {
      return const SizedBox(
        height: 180,
        child: Center(child: CircularProgressIndicator()),
      );
    }
    return Stack(
      alignment: Alignment.center,
      children: [
        AspectRatio(
          aspectRatio: controller.value.aspectRatio,
          child: VideoPlayer(controller),
        ),
        Container(
          decoration: const BoxDecoration(
            color: Colors.black45,
            shape: BoxShape.circle,
          ),
          padding: const EdgeInsets.all(10),
          child: const Icon(
            Icons.videocam,
            color: Colors.white,
            size: 26,
          ),
        ),
      ],
    );
  }
}
