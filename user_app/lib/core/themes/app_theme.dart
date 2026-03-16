import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Convert Tailwind HSL to Flutter Color
  static Color hsl(double h, double s, double l, [double a = 1.0]) {
    return HSLColor.fromAHSL(a, h, s / 100, l / 100).toColor();
  }

  // --- Light Theme ---
  static final Color _lightBg = hsl(205, 100, 97);
  static final Color _lightFg = hsl(220, 70, 10);
  static final Color _lightPrimary = hsl(210, 100, 45);
  static final Color _lightCard = hsl(0, 0, 100);

  // --- Dark Theme ---
  static final Color _darkBg = hsl(225, 30, 14);
  static final Color _darkFg = hsl(210, 40, 98);
  static final Color _darkPrimary = hsl(210, 100, 65);
  static final Color _darkCard = hsl(225, 50, 18);

  static TextTheme _buildTextTheme(TextTheme base, Color textColor) {
    return GoogleFonts.interTextTheme(base).copyWith(
      displayLarge: GoogleFonts.spaceGrotesk(textStyle: base.displayLarge?.copyWith(color: textColor)),
      displayMedium: GoogleFonts.spaceGrotesk(textStyle: base.displayMedium?.copyWith(color: textColor)),
      displaySmall: GoogleFonts.spaceGrotesk(textStyle: base.displaySmall?.copyWith(color: textColor)),
      headlineLarge: GoogleFonts.spaceGrotesk(textStyle: base.headlineLarge?.copyWith(color: textColor)),
      headlineMedium: GoogleFonts.spaceGrotesk(textStyle: base.headlineMedium?.copyWith(color: textColor)),
      headlineSmall: GoogleFonts.spaceGrotesk(textStyle: base.headlineSmall?.copyWith(color: textColor)),
      titleLarge: GoogleFonts.spaceGrotesk(textStyle: base.titleLarge?.copyWith(color: textColor)),
      bodyLarge: GoogleFonts.inter(textStyle: base.bodyLarge?.copyWith(color: textColor)),
      bodyMedium: GoogleFonts.inter(textStyle: base.bodyMedium?.copyWith(color: textColor)),
      bodySmall: GoogleFonts.inter(textStyle: base.bodySmall?.copyWith(color: textColor)),
    );
  }

  static ThemeData get lightTheme {
    final base = ThemeData.light();
    return base.copyWith(
      useMaterial3: true,
      scaffoldBackgroundColor: _lightBg,
      primaryColor: _lightPrimary,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _lightPrimary,
        brightness: Brightness.light,
        background: _lightBg,
        surface: _lightCard,
      ),
      textTheme: _buildTextTheme(base.textTheme, _lightFg),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white.withOpacity(0.95),
        elevation: 0,
        iconTheme: IconThemeData(color: _lightFg),
        titleTextStyle: GoogleFonts.spaceGrotesk(
          color: _lightFg,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    final base = ThemeData.dark();
    return base.copyWith(
      useMaterial3: true,
      scaffoldBackgroundColor: _darkBg,
      primaryColor: _darkPrimary,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _darkPrimary,
        brightness: Brightness.dark,
        background: _darkBg,
        surface: _darkCard,
      ),
      textTheme: _buildTextTheme(base.textTheme, _darkFg),
      appBarTheme: AppBarTheme(
        backgroundColor: _darkBg.withOpacity(0.95),
        elevation: 0,
        iconTheme: IconThemeData(color: _darkFg),
        titleTextStyle: GoogleFonts.spaceGrotesk(
          color: _darkFg,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
