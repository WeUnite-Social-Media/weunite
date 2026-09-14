import 'package:equatable/equatable.dart';

class AppUser extends Equatable {
  const AppUser({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.role,
    this.profileImg,
    this.bannerImg,
    this.bio,
  });

  final int id;
  final String name;
  final String username;
  final String email;
  final String role;
  final String? profileImg;
  final String? bannerImg;
  final String? bio;

  bool get isCompany => role.toUpperCase().contains('COMPANY');

  @override
  List<Object?> get props => [
        id,
        name,
        username,
        email,
        role,
        profileImg,
        bannerImg,
        bio,
      ];
}
