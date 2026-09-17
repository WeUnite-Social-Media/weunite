import 'package:equatable/equatable.dart';

class Opportunity extends Equatable {
  const Opportunity({
    required this.id,
    required this.title,
    required this.description,
    required this.companyName,
    required this.dateEnd,
    this.companyId,
    this.companyAvatar,
    this.location,
    this.skills = const [],
    this.subscribersCount = 0,
    this.createdAt,
    this.isSaved = false,
    this.isSubscribed = false,
  });

  final int id;
  final String title;
  final String? description;
  final String companyName;

  /// User id of the company that published it, used to open its profile.
  final int? companyId;
  final String? companyAvatar;
  final String? location;
  final DateTime dateEnd;
  final List<String> skills;
  final int subscribersCount;

  /// When the company published it.
  final DateTime? createdAt;

  /// Saved by the signed-in athlete (bookmark).
  final bool isSaved;

  /// The signed-in athlete already applied to it.
  final bool isSubscribed;

  Opportunity copyWith({
    bool? isSaved,
    bool? isSubscribed,
    int? subscribersCount,
  }) {
    return Opportunity(
      id: id,
      title: title,
      description: description,
      companyId: companyId,
      companyName: companyName,
      companyAvatar: companyAvatar,
      location: location,
      dateEnd: dateEnd,
      skills: skills,
      createdAt: createdAt,
      subscribersCount: subscribersCount ?? this.subscribersCount,
      isSaved: isSaved ?? this.isSaved,
      isSubscribed: isSubscribed ?? this.isSubscribed,
    );
  }

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        companyName,
        companyId,
        companyAvatar,
        location,
        dateEnd,
        skills,
        subscribersCount,
        createdAt,
        isSaved,
        isSubscribed,
      ];
}
