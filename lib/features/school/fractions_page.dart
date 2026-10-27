import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/models/learning.dart';
import '../../core/services/demo_controller.dart';
import '../../core/widgets/lq_widgets.dart';

class FractionsPage extends ConsumerStatefulWidget {
  const FractionsPage({super.key});
  @override ConsumerState<FractionsPage> createState()=>_FractionsPageState();
}
class _FractionsPageState extends ConsumerState<FractionsPage> {
  int stage=0,numerator=1,denominator=2;
  String? feedback;
  bool solved=false;
  Future<void> advance() async {
    if(stage==0) await ref.read(demoProvider.notifier).consult('fraction-part');
    if(mounted)setState((){stage++;feedback=null;});
  }
  @override Widget build(BuildContext context){
    final fraction=Fraction(numerator,denominator);
    return PageBody(children:[
      const LqTag('MATHÉMATIQUES • MAT-09'),const SizedBox(height:12),
      Text('Les fractions : le secret du partage',style:Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height:12),ProgressDots(count:4,active:stage),
      const SizedBox(height:18),
      if(stage==0)...[
        const AssetArt('fractions',height:150),
        const SectionHeading('1. Comprendre la leçon'),
        const Text('On partage une même quantité en parts égales. Le dénominateur indique le nombre de parts ; le numérateur indique combien de parts on prend.'),
        const SizedBox(height:10),const FeedbackPanel('Par exemple, 1/2 signifie une part parmi deux parts égales. 2/4 représente la même quantité.'),
        const LqCard(color:Color(0xFFFFF1DD),child:Row(children:[
          Icon(Icons.videocam_off_outlined),SizedBox(width:12),
          Expanded(child:Text('Vidéo pédagogique non disponible dans cette démonstration. Le cours écrit constitue l’alternative explicite.'))])),
        const SizedBox(height:12),LqAction('J’ai compris le cours écrit',onPressed:advance),
      ] else if(stage==1)...[
        const SectionHeading('2. Manipule des fractions'),
        const Text('Modifie le nombre de parts égales, puis celles que tu sélectionnes.'),
        const SizedBox(height:24),Text('$numerator / $denominator',textAlign:TextAlign.center,
          style:Theme.of(context).textTheme.headlineLarge),
        const SizedBox(height:12),FractionBar(fraction:fraction),
        const SizedBox(height:16),_counter('Nombre total de parts',denominator,2,8,(v)=>setState((){
          denominator=v;if(numerator>v)numerator=v;})),
        _counter('Parts sélectionnées',numerator,0,denominator,(v)=>setState(()=>numerator=v)),
        const FeedbackPanel('Observe : la valeur est le rapport des parts sélectionnées sur les parts égales du tout.'),
        LqAction('Tester ma compréhension',onPressed:advance),
      ] else if(stage==2)...[
        const SectionHeading('3. Une nouvelle situation'),
        const Text('Deux amis ont le même gâteau. Emma mange 1/2, Noé mange 2/4. Qui a mangé le plus ?'),
        const SizedBox(height:18),const FractionBar(fraction:Fraction(1,2)),
        const SizedBox(height:10),const FractionBar(fraction:Fraction(2,4),color:LqColors.coral),
        const SizedBox(height:16),_option('Emma a mangé plus',false),
        _option('Noé a mangé plus',false),_option('Ils ont mangé autant',true),
        if(feedback!=null)FeedbackPanel(feedback!,positive:solved),
        if(solved)LqAction('Terminer l’activité',onPressed:() async {
          await ref.read(demoProvider.notifier).finish('fractions');
          if(mounted)advance();
        }),
      ] else ...[
        const AssetArt('medal',height:144),
        Text('Mission fraction réussie',style:Theme.of(context).textTheme.titleLarge),
        const FeedbackPanel('Une équivalence de fractions a été reconnue dans une autre situation. Une révision différée sera nécessaire pour estimer la maîtrise.'),
        LqCard(child:TextButton.icon(onPressed:()=>context.go('/knowledge/fraction-part'),
          icon:const Icon(Icons.hub_rounded),label:const Text('Découvrir des notions associées'))),
        LqAction('Retour à l’École',onPressed:()=>context.go('/school'))
      ]
    ]);
  }
  Widget _counter(String title,int value,int min,int max,ValueChanged<int> onChanged)=>Row(children:[
    Expanded(child:Text(title)),IconButton.filledTonal(tooltip:'Diminuer $title',onPressed:value>min?()=>onChanged(value-1):null,
      icon:const Icon(Icons.remove)),Padding(padding:const EdgeInsets.symmetric(horizontal:12),child:Text('$value')),
    IconButton.filledTonal(tooltip:'Augmenter $title',onPressed:value<max?()=>onChanged(value+1):null,
      icon:const Icon(Icons.add))]);
  Widget _option(String title,bool correct)=>Padding(padding:const EdgeInsets.only(bottom:8),
    child:OutlinedButton(onPressed:solved?null:()=>setState((){
      solved=correct;feedback=correct?'Exact : 1/2 = 2/4. Le nombre de parts est différent, pas la proportion.'
        :'Observe les bandes : elles montrent la même moitié. Essaie une autre réponse.';
    }),child:Align(alignment:Alignment.centerLeft,child:Padding(
      padding:const EdgeInsets.symmetric(vertical:8),child:Text(title)))));
}

class FractionBar extends StatelessWidget {
  final Fraction fraction; final Color color;
  const FractionBar({super.key,required this.fraction,this.color=LqColors.teal});
  @override Widget build(BuildContext context)=>Semantics(label:'Fraction ${fraction.numerator} sur ${fraction.denominator}',
    child:SizedBox(height:70,child:CustomPaint(painter:_FractionPainter(fraction,color))));
}
class _FractionPainter extends CustomPainter {
  final Fraction f;final Color color;
  _FractionPainter(this.f,this.color);
  @override void paint(Canvas canvas,Size size){
    final step=size.width/f.denominator;
    for(var i=0;i<f.denominator;i++){
      final rect=Rect.fromLTWH(i*step+2,4,step-4,size.height-8);
      canvas.drawRRect(RRect.fromRectAndRadius(rect,const Radius.circular(7)),
        Paint()..color=i<f.numerator?color:const Color(0xFFE7E7EE));
    }
  }
  @override bool shouldRepaint(covariant _FractionPainter old)=>old.f.numerator!=f.numerator ||
    old.f.denominator!=f.denominator || old.color!=color;
}
