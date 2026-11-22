import 'dart:convert';

import 'package:dio/dio.dart';

import '../../../core/contracts/skill_dto.dart';
import '../../../core/contracts/user_dto.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/image_media_type.dart';
import '../../../core/network/json_body.dart';
import '../domain/entities/mutual_followers.dart';
import 'profile_models.dart';
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

  /// `GET /follow/get/{followerId}/{followedId}`. The API answers with the
  /// raw FollowDTO (not the `{message, data}` envelope) and 200 + null body
  /// when there is no follow, the same shape the web client reads.
  Future<bool> isFollowing({
    required int followerId,
    required int followedId,
  }) async {
    try {
      final response =
          await _dio.get<Object?>('/follow/get/$followerId/$followedId');
      final body = response.data;
      if (body is! Map<String, Object?>) {
        return false;
      }
      final follow = body['data'] is Map<String, Object?>
          ? body['data']! as Map<String, Object?>
          : body;
      return follow['status'] == 'ACCEPTED';
    } catch (error, stackTrace) {
      throw mapDioError(error, stackTrace);
    }
  }

  /// `GET /follow/mutual/{targetUserId}?sample=` — followers of the target
  /// that the signed-in user also follows. The viewer comes from the JWT.
  Future<MutualFollowers> getMutualFollowers(
    int targetUserId, {
    int sample = 3,
  }) async {
    try {
      final response = await _dio.get<Object?>(
        '/follow/mutual/$targetUserId',
        queryParameters: {'sample': sample},
      );
      return decodeResponseData<MutualFollowers>(response.data, (data) {
        final json = asJsonObject(data);
        final users = (json['users'] as List<Object?>? ?? const [])
            .map((item) => UserDto.fromJson(asJsonObject(item)))
            .map((user) => user.toProfile(followersCount: 0, followingCount: 0))
            .toList();
        return MutualFollowers(
          total: (json['total'] as num?)?.toInt() ?? 0,
          users: users,
        );
      });
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
