import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/models/knowledge.dart';
import '../../core/widgets/lq_widgets.dart';

class KnowledgePage extends StatelessWidget {
  final String id;
  const KnowledgePage({super.key,required this.id});
  @override Widget build(BuildContext context){
    final node=knowledgeGraph.find(id);
    if(node==null)return const PageBody(children:[Text('Connaissance introuvable.')]);
    final links=knowledgeGraph.linked(id);
    return PageBody(children:[
      LqTag(node.domain.toUpperCase()),const SizedBox(height:15),
      Text(node.title,style:Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height:12),LqCard(color:LqColors.lavender,child:Text(node.summary)),
      const FeedbackPanel('Fiche exploratoire non validée par un comité pédagogique. Ce résumé n’équivaut pas à une leçon complète.'),
      const SectionHeading('Connaissances reliées'),
      for(final link in links)LqCard(onTap:()=>context.go('/knowledge/${link.id}'),
        child:Row(children:[const Icon(Icons.hub_outlined,color:LqColors.teal),
          const SizedBox(width:10),Expanded(child:Text(link.title)),const Icon(Icons.chevron_right)])),
      if(links.isEmpty)const Text('Aucun approfondissement publié pour le moment.'),
      const SizedBox(height:18),LqAction('Retour aux expériences',onPressed:()=>context.go('/')),
    ]);
  }
}
