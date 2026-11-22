import 'package:equatable/equatable.dart';

import 'profile.dart';

/// People the signed-in user follows who also follow a given profile
/// ("Seguido por ..."). [total] is the full count; [users] is only the
/// sample the API returned (3 by default).
class MutualFollowers extends Equatable {
  const MutualFollowers({this.total = 0, this.users = const []});

  final int total;
  final List<Profile> users;

  bool get isEmpty => total == 0 || users.isEmpty;

  /// How many people are not shown in [users] (the "+N").
  int get extra => total - users.length;

  @override
  List<Object?> get props => [total, users];
}
