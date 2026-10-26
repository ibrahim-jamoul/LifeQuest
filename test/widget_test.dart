import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lifequest_mobile/app/lifequest_app.dart';

void main(){
  testWidgets('le hub est accessible et annonce le mode démo',(tester) async {
    await tester.pumpWidget(const ProviderScope(child:LifeQuestApp()));
    await tester.pumpAndSettle();
    expect(find.text('LifeQuest'),findsOneWidget);
    expect(find.text('LA CURIOSITÉ DU JOUR'),findsOneWidget);
    expect(find.textContaining('Pourquoi ton ombre'),findsOneWidget);
  });
  testWidgets('la navigation École présente son catalogue',(tester) async {
    await tester.pumpWidget(const ProviderScope(child:LifeQuestApp()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('École').last);
    await tester.pumpAndSettle();
    expect(find.textContaining('Apprendre, comprendre'),findsOneWidget);
    expect(find.byType(TextField),findsOneWidget);
  });
}
