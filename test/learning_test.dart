import 'package:flutter_test/flutter_test.dart';
import 'package:lifequest_mobile/core/models/learning.dart';

void main(){
  group('Modèle de lumière',(){
    test('à 45° une tige produit une ombre de sa hauteur',(){
      expect(shadowLength(stickHeight:2,angleDegrees:45),closeTo(2,0.00001));
    });
    test('une source basse allonge l’ombre',(){
      expect(shadowLength(stickHeight:1,angleDegrees:20),greaterThan(
        shadowLength(stickHeight:1,angleDegrees:70)));
    });
    test('à la verticale l’ombre tend vers zéro',(){
      expect(shadowLength(stickHeight:1,angleDegrees:90),0);
    });
    test('les paramètres invalides sont rejetés',(){
      expect(()=>shadowLength(stickHeight:1,angleDegrees:0),throwsArgumentError);
      expect(()=>shadowLength(stickHeight:0,angleDegrees:40),throwsArgumentError);
    });
  });
  group('Fractions',(){
    test('demi, deux quarts et trois sixièmes équivalents',(){
      expect(const Fraction(1,2).equivalentTo(const Fraction(2,4)),isTrue);
      expect(const Fraction(2,4).equivalentTo(const Fraction(3,6)),isTrue);
    });
    test('deux tiers distinct d’un demi',(){
      expect(const Fraction(2,3).equivalentTo(const Fraction(1,2)),isFalse);
    });
  });
}
