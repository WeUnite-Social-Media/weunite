import 'package:json_annotation/json_annotation.dart';

import '../../../core/contracts/user_dto.dart';
import '../domain/entities/app_user.dart';

part 'auth_models.g.dart';

/// Request body for `POST /auth/login` (openapi: paths./auth/login).
@JsonSerializable(createFactory: false, createToJson: true)
class LoginRequestDto {
  const LoginRequestDto({required this.username, required this.password});

  final String username;
  final String password;

  Map<String, dynamic> toJson() => _$LoginRequestDtoToJson(this);
}

/// Request body for `POST /auth/signup` and `POST /auth/signup/company`
/// (openapi: components.schemas.CreateUserRequestDTO).
@JsonSerializable(createFactory: false, createToJson: true)
class CreateUserRequestDto {
  const CreateUserRequestDto({
    required this.name,
    required this.username,
    required this.email,
    this.password,
    required this.role,
    this.cnpj,
  });

  final String name;
  final String username;
  final String email;
  final String role;
  final String? password;
  final String? cnpj;

  Map<String, dynamic> toJson() => _$CreateUserRequestDtoToJson(this);
}

/// Subset of `AuthDTO` (openapi: components.schemas.AuthDTO), returned by
/// login (with `jwt`/`expiresIn`) and by signup (both omitted, since
/// `non_null` inclusion drops them).
@JsonSerializable()
class AuthDto {
  const AuthDto({required this.user, this.jwt, this.expiresIn});

  factory AuthDto.fromJson(Map<String, dynamic> json) =>
      _$AuthDtoFromJson(json);

  final UserDto user;
  final String? jwt;

  /// Milliseconds until the token expires (`JwtService.plusMillis`).
  final int? expiresIn;
}

extension UserDtoToAppUser on UserDto {
  AppUser toAppUser() {
    return AppUser(
      id: id,
      name: name,
      username: username,
      email: email,
      role: role,
      profileImg: profileImg,
      bannerImg: bannerImg,
      bio: bio,
    );
  }
}
