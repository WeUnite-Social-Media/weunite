import 'package:flutter_test/flutter_test.dart';
import 'package:weunite_mobile/core/network/json_body.dart';

void main() {
  group('asJsonObject', () {
    test('returns the map as-is', () {
      expect(asJsonObject({'a': 1}), {'a': 1});
    });

    test('throws FormatException for a list', () {
      expect(() => asJsonObject([1, 2]), throwsFormatException);
    });

    test('throws FormatException for null', () {
      expect(() => asJsonObject(null), throwsFormatException);
    });
  });

  group('decodeJsonList', () {
    test('maps each element of a JSON array', () {
      final result = decodeJsonList<int>(
        [
          {'v': 1},
          {'v': 2},
        ],
        (json) => json['v'] as int,
      );

      expect(result, [1, 2]);
    });

    test('throws FormatException when the body is not a list', () {
      expect(
        () => decodeJsonList<int>({'v': 1}, (json) => json['v'] as int),
        throwsFormatException,
      );
    });

    test('throws FormatException when an element is not a JSON object', () {
      expect(
        () => decodeJsonList<int>(
          [1, 2],
          (json) => json['v'] as int,
        ),
        throwsFormatException,
      );
    });
  });

  group('decodeResponseData', () {
    test('unwraps ResponseDTO.data', () {
      final result = decodeResponseData<int>(
        {'message': 'ok', 'data': 7},
        (data) => data as int,
      );

      expect(result, 7);
    });

    test('throws FormatException when the body has no data key at all', () {
      expect(
        () => decodeResponseData<int>({'message': 'ok'}, (data) => data as int),
        throwsFormatException,
      );
    });

    test('throws FormatException when the body is not a JSON object', () {
      expect(
        () => decodeResponseData<int>([1, 2], (data) => data as int),
        throwsFormatException,
      );
    });
  });
}
