import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/config/app_config.dart';

void main() {
  tearDown(() {
    debugDefaultTargetPlatformOverride = null;
  });

  test('uses Android emulator host bridge by default on Android', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.android;

    final config = AppConfig.fromEnvironment();

    expect(config.apiBaseUrl, 'http://10.0.2.2:8080/api');
    expect(config.websocketBaseUrl, 'http://10.0.2.2:8080/ws');
  });

  test('uses localhost by default outside Android', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.windows;

    final config = AppConfig.fromEnvironment();

    expect(config.apiBaseUrl, 'http://localhost:8080/api');
    expect(config.websocketBaseUrl, 'http://localhost:8080/ws');
  });
}
