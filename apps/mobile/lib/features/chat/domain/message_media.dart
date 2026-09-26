/// Kind of media a chat message's content represents, detected from the
/// message content itself rather than from `ChatMessageType`/`message.type`.
///
/// The backend's `MessageType` enum (`Message.java`) only declares
/// `TEXT`, `IMAGE`, `FILE` — there is no `AUDIO` value. `apps/web` sends an
/// audio attachment as a plain message whose content is the uploaded file's
/// URL, and its `Message.tsx` decides it is audio purely by matching the URL
/// against a regex on the file extension (never by reading a message type
/// field, since the backend has nothing to read there). This mirrors that
/// same regex so the mobile bubble and the web bubble agree on what counts
/// as playable audio vs. a displayable image vs. plain text, independent of
/// whatever `MessageTypeDto` the message happens to carry.
enum MessageMediaKind { text, image, audio }

/// Mirrors `Message.tsx`'s `isImageUrl`: `/\.(jpg|jpeg|png|gif|webp)$/i`.
final RegExp _imageUrlPattern = RegExp(
  r'\.(jpg|jpeg|png|gif|webp)$',
  caseSensitive: false,
);

/// Mirrors `Message.tsx`'s `isAudioUrl`: `/\.(mp3|wav|ogg|m4a|webm)$/i`.
final RegExp _audioUrlPattern = RegExp(
  r'\.(mp3|wav|ogg|m4a|webm)$',
  caseSensitive: false,
);

/// Detects the media kind of a message's [content] by its file extension,
/// case-insensitively. Plain text (including a URL with no recognized media
/// extension) is [MessageMediaKind.text].
MessageMediaKind detectMessageMediaKind(String content) {
  if (_imageUrlPattern.hasMatch(content)) {
    return MessageMediaKind.image;
  }
  if (_audioUrlPattern.hasMatch(content)) {
    return MessageMediaKind.audio;
  }
  return MessageMediaKind.text;
}
