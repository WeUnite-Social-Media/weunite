// Refreshes `openapi/weunite-api.json` from a running WeUnite API instance.
//
// Usage:
//   dart run tool/update_openapi.dart [--origin http://localhost:8080]
//
// The origin can also be set with the WEUNITE_API_ORIGIN environment
// variable; it defaults to http://localhost:8080. The script fetches
// `{origin}/v3/api-docs` (the default springdoc-openapi path; the API does
// not customize it, see `apps/api/src/main/resources/application.properties`
// and `SecurityConfig`), validates that the body is a JSON object with an
// `openapi` key, and writes the raw response body as-is to
// `openapi/weunite-api.json` (no reformatting), so the file stays a faithful
// snapshot of what the server returned.
import 'dart:convert';
import 'dart:io';

Future<void> main(List<String> args) async {
  final origin = _readOrigin(args);
  final uri = Uri.parse('$origin/v3/api-docs');

  final client = HttpClient();
  try {
    final request = await client.getUrl(uri);
    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();

    if (response.statusCode != 200) {
      stderr.writeln(
        'Failed to fetch $uri: HTTP ${response.statusCode}.',
      );
      exitCode = 1;
      return;
    }

    final Object? decoded;
    try {
      decoded = jsonDecode(body);
    } on FormatException {
      stderr.writeln('Response from $uri is not valid JSON.');
      exitCode = 1;
      return;
    }

    if (decoded is! Map || !decoded.containsKey('openapi')) {
      stderr.writeln(
        'Response from $uri does not look like an OpenAPI document '
        '(missing top-level "openapi" key).',
      );
      exitCode = 1;
      return;
    }

    final outputFile = File('openapi/weunite-api.json');
    await outputFile.create(recursive: true);
    await outputFile.writeAsString(body);
    stdout.writeln('Wrote ${outputFile.path} (${body.length} bytes).');
  } finally {
    client.close(force: true);
  }
}

String _readOrigin(List<String> args) {
  for (var i = 0; i < args.length; i++) {
    if (args[i] == '--origin' && i + 1 < args.length) {
      return args[i + 1];
    }
  }
  final fromEnv = Platform.environment['WEUNITE_API_ORIGIN'];
  if (fromEnv != null && fromEnv.isNotEmpty) {
    return fromEnv;
  }
  return 'http://localhost:8080';
}
