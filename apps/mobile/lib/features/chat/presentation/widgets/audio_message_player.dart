import 'dart:async';

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

/// Inline play/pause player for an audio message bubble (a message whose
/// content is a URL recognized as audio by `detectMessageMediaKind`, mirrors
/// the player in `apps/web`'s `Message.tsx`). Shows the duration when known,
/// otherwise the current playback position, formatted as `mm:ss`.
class AudioMessagePlayer extends StatefulWidget {
  const AudioMessagePlayer({required this.url, super.key});

  final String url;

  @override
  State<AudioMessagePlayer> createState() => _AudioMessagePlayerState();
}

class _AudioMessagePlayerState extends State<AudioMessagePlayer> {
  final _player = AudioPlayer();
  bool _hasError = false;
  Duration? _duration;
  Duration _position = Duration.zero;
  bool _playing = false;
  StreamSubscription<Duration>? _positionSubscription;
  StreamSubscription<PlayerState>? _playerStateSubscription;

  @override
  void initState() {
    super.initState();
    _positionSubscription = _player.positionStream.listen((position) {
      if (mounted) {
        setState(() => _position = position);
      }
    });
    _playerStateSubscription = _player.playerStateStream.listen((state) {
      if (!mounted) {
        return;
      }
      setState(() => _playing = state.playing);
      if (state.processingState == ProcessingState.completed) {
        _player.seek(Duration.zero);
        _player.pause();
      }
    });
    unawaited(_load());
  }

  Future<void> _load() async {
    try {
      final duration = await _player.setUrl(widget.url);
      if (mounted) {
        setState(() => _duration = duration);
      }
    } catch (_) {
      // A malformed URL, an unreachable host, or no audio plugin registered
      // (e.g. running in a widget test) all surface as an unplayable
      // message instead of crashing the bubble.
      if (mounted) {
        setState(() => _hasError = true);
      }
    }
  }

  Future<void> _togglePlayPause() async {
    if (_hasError) {
      return;
    }
    if (_player.playing) {
      await _player.pause();
    } else {
      await _player.play();
    }
  }

  String _format(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString();
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    _playerStateSubscription?.cancel();
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shown =
        _position > Duration.zero ? _position : (_duration ?? Duration.zero);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          onPressed: _hasError ? null : _togglePlayPause,
          icon: Icon(
            _playing ? Icons.pause_circle_filled : Icons.play_circle_filled,
          ),
        ),
        Text(
          _hasError ? 'Audio indisponivel' : _format(shown),
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}
