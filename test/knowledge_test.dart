import 'package:flutter_test/flutter_test.dart';
import 'package:lifequest_mobile/core/models/knowledge.dart';

void main(){
  test('toutes les relations ciblent des identifiants existants',(){
    expect(knowledgeGraph.hasValidLinks,isTrue);
  });
  test('le lien ombre → cadran solaire est navigable',(){
    final nodes=knowledgeGraph.linked('light-shadow');
    expect(nodes.map((n)=>n.id),contains('sundial'));
  });
  test('le graphe ne confond pas notion et progression',(){
    expect(knowledgeGraph.find('fraction-part')?.reviewed,isFalse);
  });
}
