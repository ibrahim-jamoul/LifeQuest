import 'dart:math' as math;

/// Ideal model: level terrain, vertical stick of height h, parallel light rays.
/// Angles measured from the horizon, not from the vertical.
double shadowLength({required double stickHeight, required double angleDegrees}) {
  if (stickHeight <= 0 || angleDegrees <= 0 || angleDegrees > 90) {
    throw ArgumentError('Height > 0 and 0 < angle <= 90 required');
  }
  if (angleDegrees == 90) return 0;
  return stickHeight / math.tan(angleDegrees * math.pi / 180);
}

class Fraction {
  final int numerator;
  final int denominator;
  const Fraction(this.numerator, this.denominator)
      : assert(denominator > 0), assert(numerator >= 0), assert(numerator <= denominator);
  double get value => numerator / denominator;
  bool equivalentTo(Fraction other) => numerator * other.denominator == other.numerator * denominator;
  @override String toString() => '$numerator/$denominator';
}

enum LearningEvidence { discovered, consulted, completed, answered, transferPassed, recallPassed }

class LearningAttempt {
  final String contentId;
  final int contentVersion;
  final DateTime timestamp;
  final Set<LearningEvidence> evidence;
  const LearningAttempt({required this.contentId, required this.contentVersion,
    required this.timestamp, required this.evidence});
  bool get demonstratesTransfer => evidence.contains(LearningEvidence.transferPassed);
}
