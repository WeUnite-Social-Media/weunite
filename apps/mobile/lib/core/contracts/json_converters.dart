import 'package:json_annotation/json_annotation.dart';

/// Several API DTOs (e.g. `UserDTO`, `PostDTO`, `CommentDTO`) render `Long`
/// ids as `String.valueOf(id)`, while others (`OpportunityDTO`,
/// `ConversationDTO`, `MessageDTO`) keep them as JSON numbers. This
/// converter accepts only a JSON string and parses it strictly: a numeric
/// JSON value or a non-numeric string both throw, they never silently
/// become `0`.
class StringIdConverter implements JsonConverter<int, String> {
  const StringIdConverter();

  @override
  int fromJson(String json) => int.parse(json);

  @override
  String toJson(int object) => object.toString();
}
