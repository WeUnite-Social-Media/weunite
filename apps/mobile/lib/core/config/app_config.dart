class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.websocketBaseUrl,
  });

  factory AppConfig.fromEnvironment() {
    const apiBaseUrl = String.fromEnvironment(
      'WEUNITE_API_URL',
      defaultValue: 'http://localhost:8080/api',
    );
    const websocketBaseUrl = String.fromEnvironment(
      'WEUNITE_WS_URL',
      defaultValue: 'http://localhost:8080/ws',
    );

    return const AppConfig(
      apiBaseUrl: apiBaseUrl,
      websocketBaseUrl: websocketBaseUrl,
    );
  }

  final String apiBaseUrl;
  final String websocketBaseUrl;
}
