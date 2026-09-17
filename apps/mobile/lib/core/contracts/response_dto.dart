import 'package:json_annotation/json_annotation.dart';

part 'response_dto.g.dart';

/// Subset of the API's generic `ResponseDTO<T>` envelope
/// (openapi: components.schemas.ResponseDTO*), used by every endpoint that
/// wraps its payload as `{"message": ..., "data": ...}`.
@JsonSerializable(genericArgumentFactories: true)
class ResponseDto<T> {
  const ResponseDto({this.message, required this.data});

  factory ResponseDto.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) =>
      _$ResponseDtoFromJson(json, fromJsonT);

  final String? message;
  final T data;
}
