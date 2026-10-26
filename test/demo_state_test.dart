import 'package:flutter_test/flutter_test.dart';
import 'package:lifequest_mobile/core/models/demo_state.dart';
import 'package:lifequest_mobile/core/services/demo_repository.dart';

void main(){
  test('attribution d’étoiles idempotente pour un contenu terminé',(){
    final once=completeExperience(const DemoState(),'shadow');
    final twice=completeExperience(once,'shadow');
    expect(once.stars,10);expect(twice.stars,10);
    expect(twice.transactions.length,1);
    expect(twice.completed,contains('shadow'));
  });
  test('échange virtuel impossible en cas de solde insuffisant',(){
    final state=redeemDemoReward(const DemoState(),'badge',15);
    expect(state.inventory,isEmpty);expect(state.stars,0);
  });
  test('échange virtuel idempotent et non négatif',(){
    final state=completeExperience(completeExperience(const DemoState(),'a'),'b');
    final once=redeemDemoReward(state,'badge',15);
    final twice=redeemDemoReward(once,'badge',15);
    expect(twice.stars,5);expect(twice.inventory,contains('badge'));
    expect(twice.transactions.length,3);
  });
  test('sérialisation permet une reprise locale',(){
    final state=completeExperience(const DemoState(),'fractions');
    final revived=DemoState.parse(state.serialize());
    expect(revived.stars,state.stars);
    expect(revived.completed,contains('fractions'));
  });
  test('répertoire de démonstration isolé de la production',() async {
    final repository=InMemoryDemoRepository();
    final state=completeExperience(await repository.load(),'shadow');
    await repository.save(state);
    expect((await repository.load()).stars,10);
    await repository.reset();
    expect((await repository.load()).stars,0);
  });
}
