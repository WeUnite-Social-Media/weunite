import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../../../../core/theme/app_colors.dart';

/// A video attached to a post.
///
/// The API stores a post's media in one field (`imageUrl`, uploaded with
/// Cloudinary's `resource_type: auto`), so a video arrives through the same
/// field an image does and is told apart by its URL — the same approach the
/// chat uses for audio.
///
/// It starts paused on the first frame and muted: a feed that starts shouting
/// while you scroll is worse than one extra tap. The first tap plays with
/// sound on.
class PostVideo extends StatefulWidget {
  const PostVideo({required this.url, super.key});

  final String url;

  @override
  State<PostVideo> createState() => _PostVideoState();
}

class _PostVideoState extends State<PostVideo> {
  VideoPlayerController? _controller;
  bool _isReady = false;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final controller = VideoPlayerController.networkUrl(Uri.parse(widget.url));
    _controller = controller;
    try {
      await controller.initialize();
      await controller.setVolume(0);
      await controller.setLooping(true);
    } catch (_) {
      if (mounted) {
        setState(() => _failed = true);
      }
      return;
    }
    if (!mounted) {
      // The card scrolled away while the video was loading.
      await controller.dispose();
      return;
    }
    setState(() => _isReady = true);
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _togglePlay() async {
    final controller = _controller;
    if (controller == null || !_isReady) {
      return;
    }
    if (controller.value.isPlaying) {
      await controller.pause();
    } else {
      // First play turns the sound on: muted autoplay is for the feed, not
      // for a video someone deliberately started.
      await controller.setVolume(1);
      await controller.play();
    }
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_failed) {
      return const SizedBox(
        height: 120,
        child: Center(
          child: Icon(
            Icons.videocam_off_outlined,
            color: AppColors.mutedForeground,
          ),
        ),
      );
    }

    final controller = _controller;
    if (!_isReady || controller == null) {
      return const SizedBox(
        height: 220,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    final isPlaying = controller.value.isPlaying;
    return GestureDetector(
      onTap: _togglePlay,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Stack(
          alignment: Alignment.center,
          children: [
            AspectRatio(
              aspectRatio: controller.value.aspectRatio,
              child: VideoPlayer(controller),
            ),
            if (!isPlaying)
              Container(
                decoration: const BoxDecoration(
                  color: Colors.black45,
                  shape: BoxShape.circle,
                ),
                padding: const EdgeInsets.all(14),
                child: const Icon(
                  Icons.play_arrow,
                  color: Colors.white,
                  size: 34,
                ),
              ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: VideoProgressIndicator(
                controller,
                allowScrubbing: true,
                colors: const VideoProgressColors(
                  playedColor: AppColors.accentGreen,
                  bufferedColor: Colors.white30,
                  backgroundColor: Colors.white24,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
