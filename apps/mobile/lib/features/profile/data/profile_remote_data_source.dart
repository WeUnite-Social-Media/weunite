import 'dart:convert';

import 'package:dio/dio.dart';

import '../../../core/contracts/skill_dto.dart';
import '../../../core/contracts/user_dto.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/image_media_type.dart';
import '../../../core/network/json_body.dart';
import 'update_profile_models.dart';

class ProfileRemoteDataSource {
  const ProfileRemoteDataSource(this._dio);

  final Dio _dio;

  Future<UserDto> getProfileByUsername(String username) async {
    try {
      final response = await _dio.get<Object?>('/user/username/$username');
      return decodeResponseData<UserDto>(
        response.data,
        (data) => UserDto.fromJson(asJsonObject(data)),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<UserDto> getProfileById(int userId) async {
    try {
      final response = await _dio.get<Object?>('/user/id/$userId');
      return decodeResponseData<UserDto>(
        response.data,
        (data) => UserDto.fromJson(asJsonObject(data)),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `GET /user/search?query=` — matches name, username and e-mail, and only
  /// returns users with a verified e-mail.
  Future<List<UserDto>> searchUsers(String query) async {
    try {
      final response = await _dio.get<Object?>(
        '/user/search',
        queryParameters: {'query': query},
      );
      return decodeResponseData<List<UserDto>>(
        response.data,
        (data) => (data! as List<Object?>)
            .map((item) => UserDto.fromJson(asJsonObject(item)))
            .toList(),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<int> countFollowers(int userId) async {
    try {
      final response =
          await _dio.get<Object?>('/follow/followers/$userId/count');
      return decodeResponseData<int>(response.data, (data) => data! as int);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<int> countFollowing(int userId) async {
    try {
      final response =
          await _dio.get<Object?>('/follow/following/$userId/count');
      return decodeResponseData<int>(response.data, (data) => data! as int);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<void> toggleFollow({
    required int followerId,
    required int followedId,
  }) async {
    try {
      await _dio
          .post<void>('/follow/followAndUnfollow/$followerId/$followedId');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `PUT /user/update/{username}` — multipart: a JSON `user` part plus the
  /// optional `profileImage` and `bannerImage` files.
  Future<UserDto> updateUser({
    required String username,
    required UpdateUserRequestDto request,
    String? profileImagePath,
    String? bannerImagePath,
  }) async {
    try {
      final parts = <String, Object>{
        'user': MultipartFile.fromString(
          jsonEncode(request.toJson()),
          contentType: DioMediaType('application', 'json'),
        ),
      };
      if (profileImagePath != null) {
        parts['profileImage'] = await _filePart(profileImagePath);
      }
      if (bannerImagePath != null) {
        parts['bannerImage'] = await _filePart(bannerImagePath);
      }
      final response = await _dio.put<Object?>(
        '/user/update/$username',
        data: FormData.fromMap(parts),
      );
      return decodeResponseData<UserDto>(
        response.data,
        (data) => UserDto.fromJson(asJsonObject(data)),
      );
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  Future<MultipartFile> _filePart(String path) {
    final filename = path.split(RegExp(r'[\\/]')).last;
    return MultipartFile.fromFile(
      path,
      filename: filename,
      contentType: imageMediaTypeFor(filename),
    );
  }

  Future<void> deleteBanner(String username) async {
    try {
      await _dio.delete<void>('/user/banner/delete/$username');
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `GET /opportunities/skills` — the shared skill catalog, also used by the
  /// athlete profile form.
  Future<List<SkillDto>> getSkills() async {
    try {
      final response = await _dio.get<Object?>('/opportunities/skills');
      return decodeJsonList(response.data, SkillDto.fromJson);
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }
}
