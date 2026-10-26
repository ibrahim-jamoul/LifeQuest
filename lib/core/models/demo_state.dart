import 'dart:convert';

class StarTransaction {
  final String id;
  final String reason;
  final int delta;
  final String occurredAt;
  const StarTransaction(this.id, this.reason, this.delta, this.occurredAt);
  Map<String,dynamic> toJson() => {'id':id,'reason':reason,'delta':delta,'at':occurredAt};
  factory StarTransaction.fromJson(Map<String,dynamic> j) => StarTransaction(
    j['id'] as String, j['reason'] as String, j['delta'] as int, j['at'] as String);
}

class DemoState {
  final Set<String> completed;
  final Set<String> consulted;
  final Map<String,int> attempts;
  final List<StarTransaction> transactions;
  final Set<String> inventory;
  final Set<String> focusCompleted;
  const DemoState({this.completed = const <String>{}, this.consulted = const <String>{},
    this.attempts = const {}, this.transactions = const [],
    this.inventory = const <String>{}, this.focusCompleted = const <String>{}});
  int get stars => transactions.fold<int>(0,(v,t)=>v+t.delta);
  bool hasCompleted(String id) => completed.contains(id);
  DemoState copyWith({Set<String>? completed, Set<String>? consulted,
    Map<String,int>? attempts, List<StarTransaction>? transactions,
    Set<String>? inventory, Set<String>? focusCompleted}) => DemoState(
      completed: completed ?? this.completed, consulted: consulted ?? this.consulted,
      attempts: attempts ?? this.attempts, transactions: transactions ?? this.transactions,
      inventory: inventory ?? this.inventory, focusCompleted: focusCompleted ?? this.focusCompleted);
  Map<String,dynamic> toJson() => {'schema':1,'completed':completed.toList(),
    'consulted':consulted.toList(),'attempts':attempts,
    'transactions': transactions.map((x)=>x.toJson()).toList(),
    'inventory': inventory.toList(),'focusCompleted':focusCompleted.toList()};
  factory DemoState.fromJson(Map<String,dynamic> j) {
    if (j['schema'] != 1) throw const FormatException('Unsupported demo save version');
    return DemoState(
      completed:Set<String>.from(j['completed'] as List? ?? []),
      consulted:Set<String>.from(j['consulted'] as List? ?? []),
      attempts:Map<String,int>.from(j['attempts'] as Map? ?? {}),
      transactions:(j['transactions'] as List? ?? []).map((e) => StarTransaction.fromJson(Map<String,dynamic>.from(e as Map))).toList(),
      inventory:Set<String>.from(j['inventory'] as List? ?? []),
      focusCompleted:Set<String>.from(j['focusCompleted'] as List? ?? []));
  }
  static DemoState parse(String raw) => DemoState.fromJson(Map<String,dynamic>.from(jsonDecode(raw) as Map));
  String serialize() => jsonEncode(toJson());
}

/// Duplicate completion events MUST NOT credit the wallet twice.
DemoState completeExperience(DemoState current, String id, {int stars = 10}) {
  if (current.completed.contains(id)) return current;
  final entryId = 'complete:$id';
  return current.copyWith(
    completed:{...current.completed,id},
    attempts:{...current.attempts,id:(current.attempts[id]??0)+1},
    transactions:current.transactions.any((e)=>e.id==entryId)
      ?current.transactions
      :[...current.transactions,StarTransaction(entryId,'Compréhension : $id',stars,DateTime.now().toUtc().toIso8601String())]);
}

DemoState redeemDemoReward(DemoState current, String id, int cost) {
  if (cost < 0 || current.inventory.contains(id) || current.stars < cost) return current;
  final key = 'redeem:$id';
  if (current.transactions.any((e)=>e.id == key)) return current;
  return current.copyWith(
    inventory:{...current.inventory,id},
    transactions:[...current.transactions,StarTransaction(key,'Échange virtuel : $id',-cost,DateTime.now().toUtc().toIso8601String())]);
}
