import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/theme.dart';
import '../../core/services/demo_controller.dart';
import '../../core/widgets/lq_widgets.dart';

class ParentsPage extends ConsumerWidget {
  const ParentsPage({super.key});
  @override Widget build(BuildContext context,WidgetRef ref){
    final data=ref.watch(demoProvider);
    return PageBody(children:[
      const LqTag('ESPACE PARENTS • DÉMONSTRATION'),const SizedBox(height:13),
      Text('Comprendre sa progression',style:Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height:8),const FeedbackPanel('Aperçu local sans données personnelles. Cet écran n’est PAS un espace parent sécurisé : authentification et autorisations seront obligatoires en production.',positive:false),
      const SizedBox(height:10),Wrap(spacing:9,runSpacing:9,children:[
        _Metric('Expériences terminées','${data.completed.length}',Icons.check_circle_outline),
        _Metric('Notions consultées','${data.consulted.length}',Icons.auto_stories_outlined),
        _Metric('Mémoire : réussites','${data.focusCompleted.length}',Icons.psychology_alt_outlined),
        _Metric('Étoiles virtuelles','${data.stars}',Icons.stars_outlined),
      ]),
      const SectionHeading('Ce qui a été exploré'),
      if(data.completed.isEmpty)const LqCard(child:Text('Aucune expérience terminée pour le moment.')),
      if(data.completed.contains('shadow'))const LqCard(child:ListTile(
        title:Text('Lumière et ombres'),subtitle:Text('Expérience terminée avec une question de transfert. Maîtrise non démontrée.'),
        leading:Icon(Icons.wb_sunny_outlined,color:LqColors.sun))),
      if(data.completed.contains('fractions'))const LqCard(child:ListTile(
        title:Text('Fractions et partage'),subtitle:Text('Équivalence observée dans une situation nouvelle. Rappel différé non effectué.'),
        leading:Icon(Icons.data_usage_rounded,color:LqColors.teal))),
      const SectionHeading('Idée à faire ensemble'),
      const LqCard(color:LqColors.lavender,child:Text('Observez l’ombre d’un même objet à différents moments d’une journée ensoleillée. Que constatez-vous ? Quelles autres variables interviennent ?')),
      const SectionHeading('Interpréter les résultats'),
      const Text('« Terminé » signifie que l’activité est achevée. Sans mesure différée, il serait incorrect d’affirmer que la notion est maîtrisée.'),
    ]);
  }
}
class _Metric extends StatelessWidget {
  final String label,value;final IconData icon;
  const _Metric(this.label,this.value,this.icon);
  @override Widget build(BuildContext context)=>SizedBox(width:156,child:LqCard(child:Column(
    crossAxisAlignment:CrossAxisAlignment.start,children:[
      Icon(icon,color:LqColors.purple),const SizedBox(height:8),
      Text(value,style:Theme.of(context).textTheme.headlineMedium),
      Text(label,style:Theme.of(context).textTheme.bodySmall)])));
}
