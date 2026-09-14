import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import 'profile_models.dart';

class ProfileRemoteDataSource {
  const ProfileRemoteDataSource(this._dio);

  final Dio _dio;

  Future<ProfileDto> getProfileByUsername(String username) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/user/username/$username');
      return ProfileDto.fromJson(response.data ?? {});
    } catch (error) {
      throw mapDioError(error);
    }
  }

  Future<ProfileDto> getProfileById(int userId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/user/id/$userId');
      return ProfileDto.fromJson(response.data ?? {});
    } catch (error) {
      throw mapDioError(error);
    }
  }

  Future<void> toggleFollow({
    required int followerId,
    required int followedId,
  }) async {
    try {
      await _dio.post<void>('/follow/followAndUnfollow/$followerId/$followedId');
    } catch (error) {
      throw mapDioError(error);
    }
  }
}
