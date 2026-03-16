import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class ParticleNetwork extends StatefulWidget {
  final int particleCount;
  final double connectionDistance;
  
  const ParticleNetwork({
    super.key,
    this.particleCount = 50,
    this.connectionDistance = 100.0,
  });

  @override
  State<ParticleNetwork> createState() => _ParticleNetworkState();
}

class _ParticleNetworkState extends State<ParticleNetwork> with SingleTickerProviderStateMixin {
  late List<_Particle> _particles;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _particles = List.generate(
      widget.particleCount,
      (index) => _Particle(
        x: Random().nextDouble(),
        y: Random().nextDouble(),
        velocity: Offset(
          (Random().nextDouble() - 0.5) * 0.5,
          (Random().nextDouble() - 0.5) * 0.5,
        ),
      ),
    );

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..addListener(() {
        _updateParticles();
        setState(() {});
      })
      ..repeat();
  }

  void _updateParticles() {
    for (var particle in _particles) {
      particle.x += particle.velocity.dx * 0.01;
      particle.y += particle.velocity.dy * 0.01;

      // Wrap around edges
      if (particle.x < 0) particle.x = 1;
      if (particle.x > 1) particle.x = 0;
      if (particle.y < 0) particle.y = 1;
      if (particle.y > 1) particle.y = 0;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _ParticlePainter(_particles, widget.connectionDistance),
      size: Size.infinite,
    ).animate().fadeIn(duration: 1.seconds);
  }
}

class _Particle {
  double x;
  double y;
  Offset velocity;

  _Particle({required this.x, required this.y, required this.velocity});
}

class _ParticlePainter extends CustomPainter {
  final List<_Particle> particles;
  final double connectionDistance;

  _ParticlePainter(this.particles, this.connectionDistance);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.3)
      ..strokeWidth = 1.0;

    // Draw lines between close particles
    for (int i = 0; i < particles.length; i++) {
      for (int j = i + 1; j < particles.length; j++) {
        final p1 = Offset(particles[i].x * size.width, particles[i].y * size.height);
        final p2 = Offset(particles[j].x * size.width, particles[j].y * size.height);
        
        final distance = (p1 - p2).distance;
        if (distance < connectionDistance) {
          paint.color = Colors.white.withOpacity((1 - (distance / connectionDistance)) * 0.3);
          canvas.drawLine(p1, p2, paint);
        }
      }
    }

    // Draw particles
    final particlePaint = Paint()..color = Colors.white.withOpacity(0.5);
    for (var particle in particles) {
      canvas.drawCircle(
        Offset(particle.x * size.width, particle.y * size.height),
        2.0,
        particlePaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _ParticlePainter oldDelegate) => true;
}
