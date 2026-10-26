import 'dart:math' as math;
import 'package:flutter/painting.dart';
import 'package:flame/game.dart';
import '../../core/models/learning.dart';

/// Flame owns the 2D demonstration. The domain formula is pure Dart and tested.
/// Presentation scale is capped: the real-world model has no such cap.
class ShadowGame extends FlameGame {
  double angleDegrees = 38;
  ShadowGame();
  @override void render(Canvas canvas) {
    super.render(canvas);
    final w=size.x,h=size.y;
    if(w<=0||h<=0)return;
    final sky=Paint()..color=const Color(0xFFE7F1FF);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(0,0,w,h),const Radius.circular(18)),sky);
    final horizon=h*0.77;
    canvas.drawRect(Rect.fromLTWH(0,horizon,w,h-horizon),Paint()..color=const Color(0xFFB8DDC6));
    final center=w*.58;
    const stickHeight=94.0;
    final scale=math.min(1.0,(h*.60)/stickHeight);
    final top=horizon-stickHeight*scale;
    final theta=angleDegrees*math.pi/180;
    final modelLength=shadowLength(stickHeight:1,angleDegrees:angleDegrees);
    final displayedLength=math.min(w*.47,stickHeight*scale*modelLength);
    // Sun above and left; shadow runs to the right.
    final sunDistance=math.min(118.0, (center-25)/math.cos(theta));
    final sunX=center-sunDistance*math.cos(theta);
    final sunY=top-sunDistance*math.sin(theta);
    final sun=Paint()..color=const Color(0xFFFFCA69);
    canvas.drawCircle(Offset(sunX,sunY),20,sun);
    final ray=Paint()..color=const Color(0xFFE7A947)..strokeWidth=2;
    canvas.drawLine(Offset(sunX,sunY),Offset(center,top),ray);
    canvas.drawLine(Offset(center,top),Offset(center+displayedLength,horizon),
      Paint()..color=const Color(0xFF8DB0A2)..strokeWidth=2);
    final shadow=Path()..moveTo(center,horizon)..lineTo(center+displayedLength,horizon-4)
      ..lineTo(center+displayedLength,horizon+4)..close();
    canvas.drawPath(shadow,Paint()..color=const Color(0xFF526D71));
    canvas.drawLine(Offset(center,horizon),Offset(center,top),
      Paint()..color=const Color(0xFF69516D)..strokeWidth=10..strokeCap=StrokeCap.round);
    canvas.drawCircle(Offset(center,top),7,Paint()..color=const Color(0xFFED9782));
    final text=TextPainter(text:TextSpan(text:'${angleDegrees.round()}°',style:const TextStyle(
      color:Color(0xFF243456),fontSize:16,fontWeight:FontWeight.bold)),textDirection:TextDirection.ltr)..layout();
    text.paint(canvas,Offset(17,h-35));
  }
}
