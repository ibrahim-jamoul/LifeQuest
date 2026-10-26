import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lifequest_mobile/app/lifequest_app.dart';

void main(){
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('parcours curiosité : prédire puis expérimenter',(tester) async {
    await tester.pumpWidget(const ProviderScope(child:LifeQuestApp()));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Je découvre'));
    await tester.tap(find.text('Je découvre'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Plus longue'));
    await tester.tap(find.text('Plus longue'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Expérimenter'));
    await tester.tap(find.text('Expérimenter'));
    await tester.pumpAndSettle();
    expect(find.text('2. Expérimente'),findsOneWidget);
  });
}
