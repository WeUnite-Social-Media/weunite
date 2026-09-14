import 'package:equatable/equatable.dart';

class Opportunity extends Equatable {
  const Opportunity({
    required this.id,
    required this.title,
    required this.description,
    required this.companyName,
    required this.dateEnd,
    this.companyAvatar,
    this.location,
    this.skills = const [],
    this.subscribersCount = 0,
  });

  final int id;
  final String title;
  final String description;
  final String companyName;
  final String? companyAvatar;
  final String? location;
  final DateTime dateEnd;
  final List<String> skills;
  final int subscribersCount;

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        companyName,
        companyAvatar,
        location,
        dateEnd,
        skills,
        subscribersCount,
      ];
}
