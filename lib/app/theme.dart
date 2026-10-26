import 'package:flutter/material.dart';

abstract final class LqColors {
  static const ink = Color(0xFF202846);
  static const muted = Color(0xFF64718C);
  static const background = Color(0xFFF7F7FC);
  static const purple = Color(0xFF7760DB);
  static const lavender = Color(0xFFEDE8FF);
  static const sun = Color(0xFFFFCC68);
  static const teal = Color(0xFF37B5A4);
  static const coral = Color(0xFFFF917E);
  static const blue = Color(0xFF6AABF0);
  static const surface = Color(0xFFFFFFFF);
}

ThemeData lifeQuestTheme() {
  const color = ColorScheme.light(primary:LqColors.purple,onPrimary:Colors.white,
    surface:LqColors.surface,onSurface:LqColors.ink,secondary:LqColors.teal);
  return ThemeData(useMaterial3:true,colorScheme:color,scaffoldBackgroundColor:LqColors.background,
    fontFamily:'Roboto',
    appBarTheme:const AppBarTheme(backgroundColor:Colors.transparent,foregroundColor:LqColors.ink,
      surfaceTintColor:Colors.transparent,centerTitle:false,elevation:0),
    textTheme:const TextTheme(
      headlineLarge:TextStyle(fontSize:30,fontWeight:FontWeight.w900,color:LqColors.ink,height:1.12),
      headlineMedium:TextStyle(fontSize:24,fontWeight:FontWeight.w800,color:LqColors.ink,height:1.13),
      titleLarge:TextStyle(fontSize:20,fontWeight:FontWeight.w800,color:LqColors.ink),
      titleMedium:TextStyle(fontSize:16,fontWeight:FontWeight.w700,color:LqColors.ink),
      bodyLarge:TextStyle(fontSize:16,color:LqColors.ink,height:1.45),
      bodyMedium:TextStyle(fontSize:14,color:LqColors.ink,height:1.45),
      bodySmall:TextStyle(fontSize:12,color:LqColors.muted,height:1.3)),
    filledButtonTheme:FilledButtonThemeData(style:FilledButton.styleFrom(
      minimumSize:const Size(0,52),shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(18)),
      textStyle:const TextStyle(fontSize:15,fontWeight:FontWeight.w800))),
    cardTheme:CardThemeData(color:Colors.white,elevation:0,
      shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(24))),
  );
}
