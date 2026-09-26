import 'dart:async';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

/// Voice-message recorder shown in the chat composer in place of the mic
/// button while the text field is empty — same condition `apps/web`'s
/// `MessageInput.tsx` uses to swap its send button for `AudioRecorder.tsx`.
///
/// Three states, matching the web recorder:
/// - idle: a mic button that starts recording;
/// - recording: a pulsing dot + `mm:ss` elapsed time, a cancel button (which
///   discards the recording and deletes the temp file) and a stop/send
///   button;
/// - while a send is already in flight, the mic button is disabled.
class VoiceRecorderButton extends StatefulWidget {
  const VoiceRecorderButton({
    required this.onRecorded,
    this.enabled = true,
    super.key,
  });

  /// Called with the recorded file's local path once the user stops the
  /// recording. The caller is responsible for uploading and sending it.
  final ValueChanged<String> onRecorded;

  /// Whether starting a new recording is currently allowed (e.g. `false`
  /// while another message is already being sent).
  final bool enabled;

  @override
  State<VoiceRecorderButton> createState() => VoiceRecorderButtonState();
}

class VoiceRecorderButtonState extends State<VoiceRecorderButton> {
  final AudioRecorder _recorder = AudioRecorder();
  bool _isRecording = false;
  Duration _elapsed = Duration.zero;
  Timer? _timer;

  bool get isRecording => _isRecording;

  Future<void> _start() async {
    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nao foi possivel acessar o microfone'),
          ),
        );
      }
      return;
    }

    final directory = await getTemporaryDirectory();
    final path = '${directory.path}/'
        'chat-audio-${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(const RecordConfig(), path: path);

    if (!mounted) {
      return;
    }
    setState(() {
      _isRecording = true;
      _elapsed = Duration.zero;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() => _elapsed += const Duration(seconds: 1));
      }
    });
  }

  Future<void> _stopAndSend() async {
    _timer?.cancel();
    final path = await _recorder.stop();
    if (mounted) {
      setState(() => _isRecording = false);
    }
    if (path != null) {
      widget.onRecorded(path);
    }
  }

  Future<void> _cancel() async {
    _timer?.cancel();
    // Stops and deletes the underlying file — a cancelled recording must
    // never be uploaded or left behind as a temp file.
    await _recorder.cancel();
    if (mounted) {
      setState(() => _isRecording = false);
    }
  }

  String _format(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _timer?.cancel();
    unawaited(_recorder.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isRecording) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const _PulsingRecordingDot(),
          const SizedBox(width: 6),
          Text(
            _format(_elapsed),
            style: Theme.of(context).textTheme.labelMedium,
          ),
          IconButton(
            tooltip: 'Cancelar gravacao',
            onPressed: _cancel,
            icon: const Icon(Icons.delete_outline),
          ),
          IconButton(
            tooltip: 'Enviar audio',
            onPressed: _stopAndSend,
            icon: const Icon(Icons.send),
          ),
        ],
      );
    }
    return IconButton(
      tooltip: 'Gravar audio',
      onPressed: widget.enabled ? _start : null,
      icon: const Icon(Icons.mic_none),
    );
  }
}

/// A small red dot that fades in and out, the same "recording in progress"
/// signal `apps/web`'s `AudioRecorder.tsx` shows with a CSS pulse animation.
class _PulsingRecordingDot extends StatefulWidget {
  const _PulsingRecordingDot();

  @override
  State<_PulsingRecordingDot> createState() => _PulsingRecordingDotState();
}

class _PulsingRecordingDotState extends State<_PulsingRecordingDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 800),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween<double>(begin: 0.3, end: 1).animate(_controller),
      child: const Icon(Icons.circle, size: 10, color: Colors.red),
    );
  }
}
