/// A knowledge concept has stable identity independent of UI or age variant.
enum KnowledgeRelationType { prerequisite, deepen, related, application }

class KnowledgeNode {
  final String id;
  final String title;
  final String domain;
  final String summary;
  final String level;
  final int version;
  final bool reviewed;
  const KnowledgeNode({required this.id, required this.title, required this.domain,
    required this.summary, this.level = '6e', this.version = 1, this.reviewed = false});
}

class KnowledgeRelation {
  final String from;
  final String to;
  final KnowledgeRelationType type;
  const KnowledgeRelation(this.from, this.to, this.type);
}

class KnowledgeGraph {
  final List<KnowledgeNode> nodes;
  final List<KnowledgeRelation> relations;
  const KnowledgeGraph(this.nodes, this.relations);
  KnowledgeNode? find(String id) {
    for (final node in nodes) { if (node.id == id) return node; }
    return null;
  }
  List<KnowledgeNode> linked(String id) => relations
    .where((e) => e.from == id).map((e) => find(e.to))
    .whereType<KnowledgeNode>().toList(growable: false);
  bool get hasValidLinks => relations.every((r) => find(r.from) != null && find(r.to) != null);
}

const knowledgeGraph = KnowledgeGraph([
  KnowledgeNode(id:'light-shadow',title:'Lumière et ombres',domain:'Sciences',
    summary:'La direction des rayons lumineux influence la longueur des ombres.'),
  KnowledgeNode(id:'sun-motion',title:'La position apparente du Soleil',domain:'Sciences',
    summary:'Dans la journée, le Soleil semble changer de hauteur dans le ciel.'),
  KnowledgeNode(id:'sundial',title:'Le cadran solaire',domain:'Histoire et sciences',
    summary:'Une ombre peut servir d’indicateur du passage du temps.'),
  KnowledgeNode(id:'fraction-part',title:'Les fractions et le partage',domain:'Mathématiques',
    summary:'Une fraction désigne des parts égales d’un même tout.'),
  KnowledgeNode(id:'fraction-equivalence',title:'Les fractions équivalentes',domain:'Mathématiques',
    summary:'Deux fractions différentes peuvent désigner la même quantité.'),
  KnowledgeNode(id:'proportions',title:'Proportions et prix unitaires',domain:'Mathématiques',
    summary:'Comparer des quantités nécessite parfois de les ramener à une même unité.'),
], [
  KnowledgeRelation('light-shadow','sun-motion',KnowledgeRelationType.deepen),
  KnowledgeRelation('light-shadow','sundial',KnowledgeRelationType.application),
  KnowledgeRelation('fraction-part','fraction-equivalence',KnowledgeRelationType.deepen),
  KnowledgeRelation('fraction-equivalence','proportions',KnowledgeRelationType.application),
]);
