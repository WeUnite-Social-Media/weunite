import '../contracts/response_dto.dart';

/// Casts [value] to a JSON object, throwing [FormatException] instead of
/// silently defaulting to `{}` when the server returned something else
/// (e.g. a list, a scalar, or `null`).
Map<String, dynamic> asJsonObject(Object? value) {
  if (value is Map<String, dynamic>) {
    return value;
  }
  throw FormatException('Expected a JSON object, got ${value.runtimeType}');
}

/// Casts [body] to a JSON array and maps each element with [fromJson],
/// throwing [FormatException] when the body is not a list.
List<T> decodeJsonList<T>(
  Object? body,
  T Function(Map<String, dynamic> json) fromJson,
) {
  if (body is! List) {
    throw FormatException('Expected a JSON array, got ${body.runtimeType}');
  }
  return body.map((item) => fromJson(asJsonObject(item))).toList();
}

/// Decodes [body] as a `ResponseDTO<T>` envelope (`{"message": ...,
/// "data": ...}`) and returns its `data` field, converted with [fromData].
///
/// The API omits null fields (`non_null` Jackson inclusion), so a missing
/// `data` key would otherwise be indistinguishable from an explicit `null`
/// and silently pass through when [fromData] accepts `null`.
T decodeResponseData<T>(
  Object? body,
  T Function(Object? data) fromData,
) {
  final json = asJsonObject(body);
  if (!json.containsKey('data')) {
    throw const FormatException('ResponseDTO without data');
  }
  return ResponseDto<T>.fromJson(json, fromData).data;
}
