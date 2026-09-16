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
    this.isSubscribed = false,
    this.isSaved = false,
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
  final bool isSubscribed;
  final bool isSaved;

  Opportunity copyWith({
    int? subscribersCount,
    bool? isSubscribed,
    bool? isSaved,
  }) {
    return Opportunity(
      id: id,
      title: title,
      description: description,
      companyName: companyName,
      dateEnd: dateEnd,
      companyAvatar: companyAvatar,
      location: location,
      skills: skills,
      subscribersCount: subscribersCount ?? this.subscribersCount,
      isSubscribed: isSubscribed ?? this.isSubscribed,
      isSaved: isSaved ?? this.isSaved,
    );
  }

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
        isSubscribed,
        isSaved,
      ];
}
