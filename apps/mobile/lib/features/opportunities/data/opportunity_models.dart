import '../domain/entities/opportunity.dart';

class OpportunityDto {
  const OpportunityDto({
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

  factory OpportunityDto.fromJson(Map<String, dynamic> json) {
    final company = (json['company'] as Map?)?.cast<String, dynamic>() ?? {};
    final skills = (json['skills'] as List? ?? [])
        .whereType<Map>()
        .map((skill) => skill['name']?.toString() ?? '')
        .where((skill) => skill.isNotEmpty)
        .toList();

    return OpportunityDto(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      companyName: company['name']?.toString() ??
          company['username']?.toString() ??
          'Empresa',
      companyAvatar: company['profileImg']?.toString(),
      location: json['location']?.toString(),
      dateEnd: DateTime.tryParse(json['dateEnd']?.toString() ?? '') ??
          DateTime.now(),
      skills: skills,
      subscribersCount: int.tryParse(
            (json['subscribersCount'] ?? json['subscribers']?.length ?? 0)
                .toString(),
          ) ??
          0,
      isSubscribed: json['isSubscribed'] == true,
      isSaved: json['isSaved'] == true,
    );
  }

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

  Opportunity toEntity() {
    return Opportunity(
      id: id,
      title: title,
      description: description,
      companyName: companyName,
      companyAvatar: companyAvatar,
      location: location,
      dateEnd: dateEnd,
      skills: skills,
      subscribersCount: subscribersCount,
      isSubscribed: isSubscribed,
      isSaved: isSaved,
    );
  }
}
