import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/services/demo_controller.dart';
import '../../core/widgets/lq_widgets.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});
  @override Widget build(BuildContext context,WidgetRef ref)=>PageBody(children:[
    Text('Profil de démonstration',style:Theme.of(context).textTheme.headlineMedium),
    const SizedBox(height:16),const AssetArt('medal',height:170),
    const LqCard(child:Text('Profil fictif « Explorateur ». Aucune inscription ni information personnelle d’un mineur n’est requise.')),
    const SectionHeading('Données locales'),
    const Text('La progression reste sur cet appareil. Elle n’est pas synchronisée avec Supabase et peut être effacée à tout moment.'),
    const SizedBox(height:16),OutlinedButton.icon(icon:const Icon(Icons.delete_outline_rounded),
      label:const Text('Réinitialiser la démonstration'),onPressed:() async {
        final confirm=await showDialog<bool>(context:context,builder:(ctx)=>AlertDialog(
          title:const Text('Réinitialiser les données ?'),
          content:const Text('Toutes les réussites et étoiles locales de cette démonstration seront supprimées.'),
          actions:[TextButton(onPressed:()=>Navigator.of(ctx).pop(false),child:const Text('Annuler')),
            FilledButton(onPressed:()=>Navigator.of(ctx).pop(true),child:const Text('Effacer'))]));
        if(confirm==true){await ref.read(demoProvider.notifier).reset();}
      }),
  ]);
}
