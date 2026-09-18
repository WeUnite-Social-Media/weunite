import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/features/profile/presentation/navigation/open_user_profile.dart';

void main() {
  test('the signed-in user goes to the own-profile tab', () {
    expect(profileLocationFor(userId: 1, currentUserId: 1), '/profile');
  });

  test('another user opens the read-only profile route', () {
    expect(profileLocationFor(userId: 2, currentUserId: 1), '/profile/2');
  });

  test('without a session every id opens the read-only route', () {
    expect(profileLocationFor(userId: 1, currentUserId: null), '/profile/1');
  });
}
