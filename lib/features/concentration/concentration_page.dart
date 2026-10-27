import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/theme.dart';
import '../../core/services/demo_controller.dart';
import '../../core/widgets/lq_widgets.dart';

class ConcentrationPage extends ConsumerStatefulWidget {
  const ConcentrationPage({super.key});
  @override ConsumerState<ConcentrationPage> createState()=>_ConcentrationPageState();
}
class _ConcentrationPageState extends ConsumerState<ConcentrationPage> {
  int difficulty=3,phase=0;
  List<int> answers=[];
  bool? good;
  List<int> get sequence => difficulty==3?[0,2,1]:[2,0,3,1];
  static const colors=[LqColors.purple,LqColors.sun,LqColors.teal,LqColors.coral];
  static const icons=[Icons.change_history_rounded,Icons.circle,Icons.crop_square_rounded,Icons.star_rounded];
  Widget symbol(int i,{VoidCallback? onTap}) => Semantics(label:'Symbole ${i+1}',button:onTap!=null,
    child:Padding(padding:const EdgeInsets.all(4),child:Material(color:colors[i].withValues(alpha:0.17),
      borderRadius:BorderRadius.circular(19),child:InkWell(onTap:onTap,
      borderRadius:BorderRadius.circular(19),child:SizedBox(width:63,height:65,
      child:Icon(icons[i],color:colors[i],size:38))))));
  void respond(int index) async {
    if(good==true)return;
    final next=[...answers,index];
    final valid=next.last==sequence[next.length-1];
    if(!valid){setState((){good=false;answers=[];});return;}
    if(next.length==sequence.length){
      setState((){answers=next;good=true;});
      await ref.read(demoProvider.notifier).focus('memory-$difficulty');
    }else{setState((){answers=next;good=null;});}
  }
  @override Widget build(BuildContext context){
    final completed=ref.watch(demoProvider).focusCompleted;
    return PageBody(children:[
      const LqTag('MONDE CONCENTRATION',color:LqColors.teal),const SizedBox(height:14),
      Text('La séquence secrète',style:Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height:8),const Text('Observe une suite de symboles, mémorise-la puis reconstruis-la dans le bon ordre.'),
      const AssetArt('focus',height:170),
      if(phase==0)...[
        const SectionHeading('Choisir une difficulté'),
        RadioGroup<int>(groupValue:difficulty,onChanged:(v){if(v!=null)setState(()=>difficulty=v);},
          child:const Column(children:[
            RadioListTile<int>(value:3,title:Text('Explorateur — 3 symboles')),
            RadioListTile<int>(value:4,title:Text('Chercheur — 4 symboles'))])),
        const FeedbackPanel('Cette activité travaille la mémorisation d’une courte séquence. Elle ne prétend pas améliorer l’intelligence générale.'),
        LqAction('Commencer',onPressed:()=>setState((){phase=1;answers=[];good=null;})),
      ] else if(phase==1)...[
        const SectionHeading('1. Regarde et mémorise'),
        Center(child:Wrap(alignment:WrapAlignment.center,children:[for(final i in sequence)symbol(i)])),
        const SizedBox(height:12),LqAction('J’ai mémorisé',onPressed:()=>setState(()=>phase=2)),
      ] else ...[
        const SectionHeading('2. Reproduis la suite'),
        Text('${answers.length} / ${sequence.length} symboles'),
        const SizedBox(height:12),
        Wrap(children:[for(int i=0;i<4;i++)symbol(i,onTap:good==true?null:()=>respond(i))]),
        if(good==false)const FeedbackPanel('L’ordre n’était pas correct. La séquence recommence : tu peux la revoir.',positive:false),
        if(good==true)const FeedbackPanel('Bravo ! Tu as reproduit la séquence. Un exercice réussi n’est pas une preuve de bénéfice cognitif durable.'),
        if(good!=true)LqCard(child:TextButton(onPressed:()=>setState((){phase=1;answers=[];good=null;}),
          child:const Text('Revoir la séquence'))),
        if(good==true)...[
          LqCard(color:LqColors.lavender,child:Text(completed.contains('memory-$difficulty')
            ?'Mission terminée. 5 étoiles au premier succès uniquement.':'Mission terminée.',
            style:Theme.of(context).textTheme.titleMedium)),
          LqAction('Recommencer',onPressed:()=>setState((){phase=0;good=null;answers=[];})),
        ],
      ],
    ]);
  }
}
