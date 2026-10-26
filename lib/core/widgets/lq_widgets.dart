import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../app/theme.dart';

class PageBody extends StatelessWidget {
  final List<Widget> children;
  const PageBody({super.key,required this.children});
  @override Widget build(BuildContext context) => Center(child: ConstrainedBox(
    constraints:const BoxConstraints(maxWidth:640), child:ListView(
    padding:const EdgeInsets.fromLTRB(20,12,20,100),children:children)));
}

class SectionHeading extends StatelessWidget {
  final String title;
  final String? subtitle;
  const SectionHeading(this.title,{super.key,this.subtitle});
  @override Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(2,18,2,12),
    child: Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
      Text(title,style:Theme.of(context).textTheme.titleLarge),
      if(subtitle!=null) Padding(padding:const EdgeInsets.only(top:4),child:Text(subtitle!,style:Theme.of(context).textTheme.bodySmall))
    ]));
}

class LqCard extends StatelessWidget {
  final Widget child;
  final Color color;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  const LqCard({super.key,required this.child,this.color=Colors.white,
    this.padding=const EdgeInsets.all(20),this.onTap});
  @override Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom:12),
    child: Material(color:color,borderRadius:BorderRadius.circular(24),clipBehavior:Clip.antiAlias,
      child: InkWell(onTap:onTap,child:Padding(padding:padding,child:child))));
}

class LqTag extends StatelessWidget {
  final String title; final Color color;
  const LqTag(this.title,{super.key,this.color=LqColors.purple});
  @override Widget build(BuildContext context) => Container(
    padding:const EdgeInsets.symmetric(horizontal:11,vertical:6),
    decoration:BoxDecoration(color:color.withValues(alpha:0.12),borderRadius:BorderRadius.circular(12)),
    child:Text(title,style:TextStyle(color:color,fontSize:11,fontWeight:FontWeight.w800)));
}

class AssetArt extends StatelessWidget {
  final String name; final double height;
  const AssetArt(this.name,{super.key,this.height=150});
  @override Widget build(BuildContext context)=>SizedBox(height:height,
    child:SvgPicture.asset('assets/illustrations/$name.svg',fit:BoxFit.contain));
}

class LqAction extends StatelessWidget {
  final String label; final VoidCallback? onPressed; final IconData icon;
  const LqAction(this.label,{super.key,required this.onPressed,this.icon=Icons.arrow_forward_rounded});
  @override Widget build(BuildContext context) => FilledButton.icon(
    onPressed:onPressed, icon:Icon(icon,size:20),label:Text(label));
}

class FeedbackPanel extends StatelessWidget {
  final String message; final bool positive;
  const FeedbackPanel(this.message,{super.key,this.positive=true});
  @override Widget build(BuildContext context)=>Container(
    padding:const EdgeInsets.all(16),margin:const EdgeInsets.symmetric(vertical:12),
    decoration:BoxDecoration(color:positive?const Color(0xFFE3F5F0):const Color(0xFFFFEDE5),
      borderRadius:BorderRadius.circular(16)),
    child:Row(crossAxisAlignment:CrossAxisAlignment.start,children:[
      Icon(positive?Icons.lightbulb_rounded:Icons.tips_and_updates_rounded,
        color:positive?const Color(0xFF168571):const Color(0xFFBD6836)),
      const SizedBox(width:10),Expanded(child:Text(message,style:Theme.of(context).textTheme.bodyMedium))]));
}

class ProgressDots extends StatelessWidget {
  final int count;final int active;
  const ProgressDots({super.key,required this.count,required this.active});
  @override Widget build(BuildContext context)=>Row(children:List.generate(count,(i)=>Expanded(
    child:Container(margin:const EdgeInsets.only(right:5),height:6,
      decoration:BoxDecoration(borderRadius:BorderRadius.circular(20),
      color:i<=active?LqColors.purple:LqColors.lavender)))));
}
