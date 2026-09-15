import 'package:flutter/foundation.dart';

class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.websocketBaseUrl,
  });

  factory AppConfig.fromEnvironment() {
    const apiBaseUrl = String.fromEnvironment(
      'WEUNITE_API_URL',
    );
    const websocketBaseUrl = String.fromEnvironment(
      'WEUNITE_WS_URL',
    );

    return AppConfig(
      apiBaseUrl: apiBaseUrl.isNotEmpty ? apiBaseUrl : _defaultApiBaseUrl,
      websocketBaseUrl: websocketBaseUrl.isNotEmpty
          ? websocketBaseUrl
          : _defaultWebsocketBaseUrl,
    );
  }

  final String apiBaseUrl;
  final String websocketBaseUrl;

  static String get _hostBaseUrl {
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://localhost:8080';
  }

  static String get _defaultApiBaseUrl => '$_hostBaseUrl/api';

  static String get _defaultWebsocketBaseUrl => '$_hostBaseUrl/ws';
}
