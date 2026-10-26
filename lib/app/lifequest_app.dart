import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'theme.dart';
import '../features/home/home_page.dart';
import '../features/curiosity/shadow_page.dart';
import '../features/knowledge/knowledge_page.dart';
import '../features/school/school_page.dart';
import '../features/school/fractions_page.dart';
import '../features/concentration/concentration_page.dart';
import '../features/rewards/rewards_page.dart';
import '../features/parents/parents_page.dart';
import '../features/discovery/discovery_page.dart';
import '../features/profile/profile_page.dart';

final GoRouter lifeQuestRouter=GoRouter(initialLocation:'/',routes:[
  ShellRoute(builder:(context,state,child)=>LifeQuestShell(location:state.uri.path,child:child), routes:[
    GoRoute(path:'/',builder:(context,state)=>const HomePage()),
    GoRoute(path:'/school',builder:(context,state)=>const SchoolPage()),
    GoRoute(path:'/rewards',builder:(context,state)=>const RewardsPage()),
    GoRoute(path:'/focus',builder:(context,state)=>const ConcentrationPage()),
    GoRoute(path:'/parents',builder:(context,state)=>const ParentsPage()),
    GoRoute(path:'/discovery',builder:(context,state)=>const DiscoveryPage()),
    GoRoute(path:'/curiosity/shadow',builder:(context,state)=>const ShadowPage()),
    GoRoute(path:'/school/fractions',builder:(context,state)=>const FractionsPage()),
    GoRoute(path:'/knowledge/:id',builder:(context,state)=>KnowledgePage(id:state.pathParameters['id']!)),
    GoRoute(path:'/profile',builder:(context,state)=>const ProfilePage()),
  ]),
]);

class LifeQuestApp extends StatelessWidget {
  const LifeQuestApp({super.key});
  @override Widget build(BuildContext context)=>MaterialApp.router(
    title:'LifeQuest',debugShowCheckedModeBanner:false,theme:lifeQuestTheme(),
    routerConfig:lifeQuestRouter);
}

class LifeQuestShell extends StatelessWidget {
  final String location; final Widget child;
  const LifeQuestShell({super.key,required this.location,required this.child});
  static const destinations=[
    ('/',Icons.home_rounded,'Accueil'),
    ('/school',Icons.menu_book_rounded,'École'),
    ('/focus',Icons.psychology_alt_rounded,'Focus'),
    ('/rewards',Icons.stars_rounded,'Cadeaux'),
    ('/parents',Icons.family_restroom_rounded,'Parents'),
  ];
  @override Widget build(BuildContext context) {
    final index=location.startsWith('/school')?1:
      location.startsWith('/focus')?2:
      location.startsWith('/rewards')?3:
      location.startsWith('/parents')?4:0;
    return Scaffold(
      appBar:AppBar(toolbarHeight:60,title:Row(children:[
        Container(width:32,height:32,decoration:BoxDecoration(
          color:LqColors.purple,borderRadius:BorderRadius.circular(10)),
          child:const Icon(Icons.auto_awesome_rounded,size:18,color:Colors.white)),
        const SizedBox(width:10),const Text('LifeQuest',style:TextStyle(fontWeight:FontWeight.w900,letterSpacing:-0.5)),
      ]),actions:[IconButton(tooltip:'Profil démo',onPressed:()=>context.go('/profile'),
        icon:const CircleAvatar(radius:17,backgroundColor:LqColors.lavender,
          child:Icon(Icons.person_rounded,color:LqColors.purple))) ,const SizedBox(width:14)]),
      body:child,
      bottomNavigationBar:SafeArea(top:false,child:NavigationBar(height:74,
        backgroundColor:Colors.white,selectedIndex:index<0?0:index,
        labelBehavior:NavigationDestinationLabelBehavior.alwaysShow,
        onDestinationSelected:(i)=>context.go(destinations[i].$1),
        destinations:[for(final d in destinations) NavigationDestination(icon:Icon(d.$2),label:d.$3)])),
    );
  }
}
