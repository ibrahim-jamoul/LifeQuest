import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/demo_state.dart';
import 'demo_repository.dart';

final initialDemoProvider = Provider<DemoState>((ref) => const DemoState());
final demoRepositoryProvider = Provider<DemoRepository>((ref)=>InMemoryDemoRepository());
final demoProvider = NotifierProvider<DemoController,DemoState>(DemoController.new);

class DemoController extends Notifier<DemoState> {
  @override DemoState build() => ref.watch(initialDemoProvider);
  Future<void> _persist() => ref.read(demoRepositoryProvider).save(state);
  Future<void> consult(String id) async {
    if (state.consulted.contains(id)) return;
    state=state.copyWith(consulted:{...state.consulted,id});
    await _persist();
  }
  Future<void> finish(String id,{int stars=10}) async {
    state=completeExperience(state,id,stars:stars);
    await _persist();
  }
  Future<void> redeem(String id,int cost) async {
    state=redeemDemoReward(state,id,cost);
    await _persist();
  }
  Future<void> focus(String id) async {
    if(state.focusCompleted.contains(id)) return;
    final key='focus:$id';
    state=state.copyWith(focusCompleted:{...state.focusCompleted,id},
      transactions:[...state.transactions,StarTransaction(key,'Mémoire de travail',5,DateTime.now().toUtc().toIso8601String())]);
    await _persist();
  }
  Future<void> reset() async {
    await ref.read(demoRepositoryProvider).reset();
    state=const DemoState();
  }
}
