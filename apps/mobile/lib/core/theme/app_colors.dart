import 'package:flutter/material.dart';

class AppColors {
  const AppColors._();

  static const background = Color(0xFFEEEEEE);
  static const foreground = Color(0xFF0A0A0A);
  static const card = Color(0xFFFFFFFF);
  static const muted = Color(0xFFF5F5F5);
  static const mutedForeground = Color(0xFF737373);
  static const primary = Color(0xFF171717);
  static const primaryForeground = Color(0xFFFAFAFA);
  static const accentGreen = Color(0xFF22C55E);

  /// Text on light green surfaces (tags, badges): accentGreen itself is too
  /// light to read there. green-800 on [accentGreenSurface] is ~7:1.
  static const accentGreenStrong = Color(0xFF166534);
  static const accentGreenSurface = Color(0xFFDCFCE7);
  static const border = Color(0xFFE5E5E5);
  static const destructive = Color(0xFFE7000B);
  static const sidebar = Color(0xFFFFFFFF);
}
