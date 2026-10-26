import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app/lifequest_app.dart';
import 'core/models/demo_state.dart';
import 'core/services/demo_controller.dart';
import 'core/services/demo_repository.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  final repository = LocalDemoRepository(SharedPreferencesAsync());
  DemoState initial;
  try { initial=await repository.load(); }
  catch (_) {
    // If the data is corrupted, show a non-destructive recovery state instead of erasing it.
    runApp(const MaterialApp(home: Scaffold(body: Center(child: Padding(
      padding: EdgeInsets.all(24),child: Text('Sauvegarde locale illisible. Les données n’ont pas été effacées. Contacte le responsable de la démonstration.'))))));
    return;
  }
  runApp(ProviderScope(overrides:[
    demoRepositoryProvider.overrideWithValue(repository),
    initialDemoProvider.overrideWithValue(initial),
  ],child:const LifeQuestApp()));
}
