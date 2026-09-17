import 'package:dio/dio.dart';

import '../../../core/contracts/user_dto.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/json_body.dart';

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
}
