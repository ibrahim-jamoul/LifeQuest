import 'package:flame/game.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/widgets/lq_widgets.dart';
import '../../core/services/demo_controller.dart';
import 'shadow_game.dart';

class ShadowPage extends ConsumerStatefulWidget {
  const ShadowPage({super.key});
  @override ConsumerState<ShadowPage> createState()=>_ShadowPageState();
}
class _ShadowPageState extends ConsumerState<ShadowPage> {
  final ShadowGame game=ShadowGame();
  int stage=0;
  double angle=38;
  String? feedback;
  bool succeeded=false;
  void advance() => setState((){stage++;feedback=null;});
  @override Widget build(BuildContext context) {
    final done=ref.watch(demoProvider).hasCompleted('shadow');
    return PageBody(children:[
      Row(children:[const LqTag('SCIENCES'),const Spacer(),Text('Étape ${stage+1}/4',
        style:Theme.of(context).textTheme.bodySmall)]),
      const SizedBox(height:14),ProgressDots(count:4,active:stage),
      const SizedBox(height:18),Text('Le mystère de l’ombre',style:Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height:7),const Text('À quoi ressemble l’ombre quand la lumière change de hauteur ?'),
      const SizedBox(height:18),ClipRRect(borderRadius:BorderRadius.circular(20),
        child:SizedBox(height:245,child:GameWidget(game:game))),
      const SizedBox(height:7),const Text('Illustration schématique : longueurs visuelles plafonnées pour tenir à l’écran.',style:TextStyle(fontSize:11)),
      const SizedBox(height:14),
      if(stage==0)...[
        const SectionHeading('1. À ton avis ?'),
        const Text('Lorsque le Soleil est très bas dans le ciel, l’ombre est…'),
        const SizedBox(height:16),
        _answer('Plus longue',true),_answer('Plus courte',false),
        if(feedback!=null) FeedbackPanel(feedback!,positive:true),
        if(feedback!=null)LqAction('Expérimenter',onPressed:advance),
      ] else if(stage==1)...[
        const SectionHeading('2. Expérimente'),
        const Text('Déplace le curseur pour modifier la hauteur apparente de la source lumineuse.'),
        Slider(value:angle,min:15,max:80,divisions:13,label:'${angle.round()}°',
          onChanged:(v)=>setState((){angle=v;game.angleDegrees=v;})),
        Row(mainAxisAlignment:MainAxisAlignment.spaceBetween,children:[
          Text('Lumière basse',style:Theme.of(context).textTheme.bodySmall),
          Text('Lumière haute',style:Theme.of(context).textTheme.bodySmall)]),
        const FeedbackPanel('Sur un sol plat et avec une tige verticale, plus les rayons sont inclinés vers l’horizontale, plus l’ombre est longue. C’est un modèle simplifié.'),
        LqAction('Mettre à l’épreuve',onPressed:advance),
      ] else if(stage==2)...[
        const SectionHeading('3. À toi de transférer'),
        const Text('Deux lampes éclairent la même tige. Laquelle produit l’ombre la plus longue ?'),
        const SizedBox(height:12),_answer('Lampe A : 20°',true),_answer('Lampe B : 70°',false),
        if(feedback!=null)FeedbackPanel(feedback!,positive:succeeded),
        if(succeeded)LqAction('Voir mon bilan',onPressed:() async {
          await ref.read(demoProvider.notifier).finish('shadow');
          if(mounted) advance();
        }),
      ] else ...[
        const AssetArt('medal',height:140),
        Text('Tu as expliqué un phénomène !',style:Theme.of(context).textTheme.titleLarge),
        const FeedbackPanel('Tu as comparé des situations et appliqué une règle. La compréhension sera à confirmer plus tard avec une autre situation.'),
        LqCard(child:Column(children:[Text(done?'10 étoiles déjà attribuées au maximum pour cette expérience':'',
            style:Theme.of(context).textTheme.bodySmall),const Text('Envie d’en savoir plus ?'),
          TextButton(onPressed:()=>context.go('/knowledge/light-shadow'),
            child:const Text('Explorer les notions liées →'))])),
        LqAction('Terminer',onPressed:()=>context.go('/'),icon:Icons.check_rounded)
      ],
    ]);
  }
  Widget _answer(String title,bool correct) => Padding(padding:const EdgeInsets.only(bottom:10),
    child:OutlinedButton(onPressed:stage==2&&succeeded?null:()=>setState((){
      if(stage==2){succeeded=correct;feedback=correct
        ?'Exact. À 20°, les rayons sont plus proches de l’horizontale : l’ombre s’allonge.'
        :'Ce n’est pas cela. À 70°, la lumière descend davantage à la verticale et l’ombre raccourcit. Réessaie.';}
      else {feedback=correct?'Bonne intuition ! Vérifions-la ensemble.'
        :'Intéressant ! L’expérience va permettre de tester cette hypothèse.';}
    }),child:Align(alignment:Alignment.centerLeft,
      child:Padding(padding:const EdgeInsets.symmetric(vertical:7),child:Text(title)))));
}
