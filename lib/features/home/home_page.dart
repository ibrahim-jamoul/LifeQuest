import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/services/demo_controller.dart';
import '../../core/widgets/lq_widgets.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});
  @override Widget build(BuildContext context,WidgetRef ref) {
    final data=ref.watch(demoProvider);
    return PageBody(children:[
      Row(children:[const Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
        Text('BONJOUR, EXPLORATEUR',style:TextStyle(letterSpacing:1.3,fontSize:11,
          color:LqColors.purple,fontWeight:FontWeight.w900)),
        SizedBox(height:7),Text('Et si on découvrait quelque chose ?',style:TextStyle(
          fontSize:27,fontWeight:FontWeight.w900,color:LqColors.ink,height:1.13))])),
        const SizedBox(width:8),const SizedBox(width:74,child:AssetArt('nova',height:74))]),
      const SizedBox(height:20),
      LqCard(color:LqColors.lavender,padding:const EdgeInsets.all(20),child:Column(
        crossAxisAlignment:CrossAxisAlignment.start,children:[
          const LqTag('LA CURIOSITÉ DU JOUR'),
          const AssetArt('shadow',height:158),
          Text('Pourquoi ton ombre change-t-elle de taille ?',style:Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height:9),const Text('Une question. Une expérience. Une découverte en 2 minutes.'),
          const SizedBox(height:18),LqAction('Je découvre',onPressed:()=>context.go('/curiosity/shadow')),
        ])),
      const SectionHeading('Choisis ton univers',subtitle:'Des activités courtes, un résultat concret.'),
      _WorldCard(title:'École',subtitle:'Comprendre les notions de 6e',color:LqColors.sun,
        icon:Icons.school_rounded,onTap:()=>context.go('/school')),
      _WorldCard(title:'Concentration',subtitle:'Un défi de mémoire de travail',color:LqColors.teal,
        icon:Icons.psychology_rounded,onTap:()=>context.go('/focus')),
      _WorldCard(title:'Cadeaux',subtitle:'${data.stars} étoiles • récompenses virtuelles',color:LqColors.coral,
        icon:Icons.stars_rounded,onTap:()=>context.go('/rewards')),
      _WorldCard(title:'Découverte',subtitle:'Un futur univers à explorer — indisponible',color:LqColors.blue,
        icon:Icons.explore_rounded,onTap:()=>context.go('/discovery')),
      _WorldCard(title:'Parents',subtitle:'Aperçu du suivi pédagogique local',color:LqColors.purple,
        icon:Icons.family_restroom_rounded,onTap:()=>context.go('/parents')),
      const SizedBox(height:9),const Center(child:Text('MODE DÉMONSTRATION • PROGRESSION LOCALE',
        style:TextStyle(letterSpacing:0.9,color:LqColors.muted,fontWeight:FontWeight.w800,fontSize:10))),
    ]);
  }
}

class _WorldCard extends StatelessWidget {
  final String title,subtitle; final Color color;final IconData icon;final VoidCallback onTap;
  const _WorldCard({required this.title,required this.subtitle,required this.color,
    required this.icon,required this.onTap});
  @override Widget build(BuildContext context)=>LqCard(onTap:onTap,child:Row(children:[
    Container(width:60,height:60,decoration:BoxDecoration(color:color.withValues(alpha:0.18),
      borderRadius:BorderRadius.circular(19)),child:Icon(icon,color:color==LqColors.sun?
        const Color(0xFFBD8321):color,size:32)),const SizedBox(width:14),
    Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
      Text(title,style:Theme.of(context).textTheme.titleMedium),const SizedBox(height:3),
      Text(subtitle,style:Theme.of(context).textTheme.bodySmall)])),
    const Icon(Icons.chevron_right_rounded,color:LqColors.muted)
  ]));
}
