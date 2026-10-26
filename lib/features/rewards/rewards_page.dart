import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/theme.dart';
import '../../core/services/demo_controller.dart';
import '../../core/widgets/lq_widgets.dart';

class RewardsPage extends ConsumerWidget {
  const RewardsPage({super.key});
  @override Widget build(BuildContext context,WidgetRef ref){
    final state=ref.watch(demoProvider);
    const items=[('badge-curious','Badge Curiosité',15,Icons.lightbulb_outline),
      ('badge-reason','Badge Raisonnement',20,Icons.psychology_outlined),
      ('badge-explorer','Badge Explorateur',25,Icons.explore_outlined)];
    return PageBody(children:[
      const LqTag('MONDE CADEAUX',color:LqColors.coral),const SizedBox(height:13),
      Text('Les étoiles de tes découvertes',style:Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height:12),LqCard(color:const Color(0xFFFFEDD0),child:Row(children:[
        const Icon(Icons.stars_rounded,color:Color(0xFFB87825),size:56),const SizedBox(width:15),
        Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
          Text('${state.stars} étoiles',style:Theme.of(context).textTheme.headlineMedium),
          const Text('Solde local simulé')])])),
      const FeedbackPanel('Les étoiles récompensent les expériences terminées. Aucun achat réel, cadeau physique ou paiement n’est proposé.'),
      const SectionHeading('Collection virtuelle'),
      for(final item in items)LqCard(child:Row(children:[
        Icon(item.$4,size:40,color:LqColors.purple),const SizedBox(width:14),
        Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
          Text(item.$2,style:Theme.of(context).textTheme.titleMedium),
          Text('${item.$3} étoiles • Usage décoratif',style:Theme.of(context).textTheme.bodySmall)])),
        state.inventory.contains(item.$1)
          ?const Icon(Icons.check_circle_rounded,color:LqColors.teal)
          :TextButton(onPressed:state.stars>=item.$3
            ?()=>ref.read(demoProvider.notifier).redeem(item.$1,item.$3):null,child:const Text('Échanger')),
      ])),
      const SectionHeading('Historique des étoiles'),
      if(state.transactions.isEmpty)const LqCard(child:Text('Termine une activité pour voir apparaître ta première transaction.')),
      for(final transaction in state.transactions.reversed)LqCard(child:Row(children:[
        Expanded(child:Text(transaction.reason)),Text('${transaction.delta>0?'+':''}${transaction.delta}',
          style:TextStyle(color:transaction.delta>0?LqColors.teal:LqColors.coral,fontWeight:FontWeight.w800))])),
    ]);
  }
}
