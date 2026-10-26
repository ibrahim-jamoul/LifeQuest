import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme.dart';
import '../../core/widgets/lq_widgets.dart';

class CatalogItem {
  final String id,subject,chapter,title,priority;
  const CatalogItem(this.id,this.subject,this.chapter,this.title,this.priority);
}
const subjectTitles={
  'MAT':'Mathématiques','FRA':'Français','HIS':'Histoire','GEO':'Géographie',
  'SCI':'Sciences & technologie','EMC':'Enseignement moral et civique',
  'LVE':'Langue vivante','ART':'Arts','EPS':'EPS','NUM':'Culture numérique'};

Future<List<CatalogItem>> loadCatalog() async {
  final raw=await rootBundle.loadString('assets/data/catalogue_6e.txt');
  return raw.split('\n').where((e)=>e.trim().isNotEmpty&&!e.startsWith('#')).map((line){
    final x=line.split('|');
    if(x.length!=5) throw const FormatException('Catalogue malformé');
    return CatalogItem(x[0],x[1],x[2],x[3],x[4]);
  }).toList(growable:false);
}

class SchoolPage extends StatefulWidget {
  const SchoolPage({super.key});
  @override State<SchoolPage> createState()=>_SchoolPageState();
}
class _SchoolPageState extends State<SchoolPage> {
  String selected='MAT';
  late final Future<List<CatalogItem>> catalogFuture=loadCatalog();
  final TextEditingController query=TextEditingController();
  @override void dispose(){query.dispose();super.dispose();}
  @override Widget build(BuildContext context)=>PageBody(children:[
    const LqTag('MONDE ÉCOLE',color:LqColors.teal),const SizedBox(height:12),
    Text('Apprendre, comprendre, essayer.',style:Theme.of(context).textTheme.headlineMedium),
    const SizedBox(height:7),const Text('Programme de 6e : catalogue éditorial non encore validé dans son intégralité.'),
    const SizedBox(height:17),TextField(controller:query,onChanged:(_)=>setState((){}),
      decoration:InputDecoration(prefixIcon:const Icon(Icons.search),hintText:'Rechercher une notion',
      border:OutlineInputBorder(borderRadius:BorderRadius.circular(18)))),
    const SectionHeading('Les matières'),
    SingleChildScrollView(scrollDirection:Axis.horizontal,child:Row(children:[
      for(final e in subjectTitles.entries)Padding(padding:const EdgeInsets.only(right:7),
        child:ChoiceChip(selected:selected==e.key,label:Text(e.value),
          onSelected:(_)=>setState(()=>selected=e.key)))
    ])),
    const SizedBox(height:13),FutureBuilder<List<CatalogItem>>(
      future:catalogFuture,builder:(context,snapshot){
        if(snapshot.hasError)return const FeedbackPanel('Le référentiel ne peut pas être chargé.',positive:false);
        if(!snapshot.hasData)return const Center(child:CircularProgressIndicator());
        final all=snapshot.data!;
        final filtered=all.where((e)=>e.subject==selected&&
          (query.text.isEmpty||e.title.toLowerCase().contains(query.text.toLowerCase()))).toList();
        final chapters=filtered.map((e)=>e.chapter).toSet();
        return Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
          LqCard(color:LqColors.lavender,child:Row(children:[
            const Icon(Icons.library_books_rounded,color:LqColors.purple,size:36),
            const SizedBox(width:13),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,
              children:[Text(subjectTitles[selected]!,style:Theme.of(context).textTheme.titleMedium),
              Text('${filtered.length} notions affichées • 1 activité pilote sur les fractions',
                style:Theme.of(context).textTheme.bodySmall)]))])),
          for(final chapter in chapters) LqCard(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
            Text(chapter,style:Theme.of(context).textTheme.titleMedium),
            const Divider(height:24),
            for(final item in filtered.where((e)=>e.chapter==chapter))ListTile(
              contentPadding:EdgeInsets.zero,dense:true,
              leading:Icon(item.id=='MAT-09'?Icons.play_circle_fill_rounded:Icons.lock_outline_rounded,
                color:item.id=='MAT-09'?LqColors.teal:LqColors.muted),
              title:Text(item.title),subtitle:Text('${item.id} • ${item.id=='MAT-09'?'Pilote disponible':'À produire'}'),
              onTap:item.id=='MAT-09'?()=>context.go('/school/fractions'):()=>showDialog<void>(context:context,
                builder:(ctx)=>AlertDialog(title:const Text('Notion à produire'),content:Text(
                  '${item.title} figure dans le référentiel, mais son cours et ses activités ne sont pas encore disponibles.'),
                  actions:[TextButton(onPressed:()=>Navigator.pop(ctx),child:const Text('Compris'))])),
            )])),
          if(filtered.isEmpty)const Text('Aucune notion pour cette recherche.'),
          const SizedBox(height:10),Text('Catalogue : ${all.length} références locales. Référencé ne signifie pas disponible ni maîtrisé.',
            style:Theme.of(context).textTheme.bodySmall),
        ]);
      }),
  ]);
}
