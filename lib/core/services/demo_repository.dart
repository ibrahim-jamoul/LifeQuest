import 'package:shared_preferences/shared_preferences.dart';
import '../models/demo_state.dart';

abstract interface class DemoRepository {
  Future<DemoState> load();
  Future<void> save(DemoState state);
  Future<void> reset();
}

class LocalDemoRepository implements DemoRepository {
  static const key = 'lifequest_demo_v1';
  final SharedPreferencesAsync preferences;
  LocalDemoRepository(this.preferences);
  @override Future<DemoState> load() async {
    final raw = await preferences.getString(key);
    if (raw == null) return const DemoState();
    // Do not silently erase a corrupt save.
    return DemoState.parse(raw);
  }
  @override Future<void> save(DemoState state) => preferences.setString(key,state.serialize());
  @override Future<void> reset() => preferences.remove(key);
}

class InMemoryDemoRepository implements DemoRepository {
  DemoState value;
  InMemoryDemoRepository([this.value = const DemoState()]);
  @override Future<DemoState> load() async => value;
  @override Future<void> save(DemoState state) async { value=state; }
  @override Future<void> reset() async { value=const DemoState(); }
}
