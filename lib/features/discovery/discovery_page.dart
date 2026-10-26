import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/lq_widgets.dart';

class DiscoveryPage extends StatelessWidget {
  const DiscoveryPage({super.key});
  @override Widget build(BuildContext context)=>PageBody(children:[
    const LqTag('PROCHAINE ÉTAPE',color:LqColors.blue),const AssetArt('discovery',height:260),
    Text('Le monde Découverte se prépare',style:Theme.of(context).textTheme.headlineMedium),
    const SizedBox(height:10),const Text('Plus tard, des environnements interactifs construits avec Flame permettront d’explorer des phénomènes et de mener des expériences immersives.'),
    const SizedBox(height:12),const FeedbackPanel('Ce monde n’est pas encore accessible. Aucune mission Découverte n’est incluse dans ce MVP.',positive:false),
    const SizedBox(height:14),LqAction('Revenir à l’accueil',onPressed:()=>context.go('/'),icon:Icons.home_rounded)
  ]);
}
