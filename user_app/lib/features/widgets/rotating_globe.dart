import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class RotatingGlobe extends StatefulWidget {
  final double size;

  const RotatingGlobe({super.key, this.size = 300});

  @override
  State<RotatingGlobe> createState() => _RotatingGlobeState();
}

class _RotatingGlobeState extends State<RotatingGlobe> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.blue.withOpacity(0.3),
                blurRadius: 40,
                spreadRadius: 5,
              ),
              BoxShadow(
                color: Colors.cyan.withOpacity(0.15),
                blurRadius: 60,
                spreadRadius: 10,
              ),
            ],
          ),
          child: ClipOval(
            child: Stack(
              children: [
                // Earth image that shifts horizontally to simulate rotation
                Positioned(
                  left: -widget.size * _controller.value,
                  child: Image.asset(
                    'assets/images/earth.jpg',
                    width: widget.size,
                    height: widget.size,
                    fit: BoxFit.fill,
                  ),
                ),
                Positioned(
                  left: widget.size - (widget.size * _controller.value) - 1, // -1 for sub-pixel overlap
                  child: Image.asset(
                    'assets/images/earth.jpg',
                    width: widget.size,
                    height: widget.size,
                    fit: BoxFit.fill,
                  ),
                ),
                // Atmospheric glow overlay
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        Colors.transparent,
                        Colors.blue.withOpacity(0.05),
                        Colors.blue.withOpacity(0.15),
                        Colors.black.withOpacity(0.3),
                      ],
                      stops: const [0.0, 0.6, 0.8, 1.0],
                    ),
                  ),
                ),
                // Specular highlight on top-left
                Positioned(
                  top: widget.size * 0.05,
                  left: widget.size * 0.15,
                  child: Container(
                    width: widget.size * 0.35,
                    height: widget.size * 0.25,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100),
                      gradient: RadialGradient(
                        colors: [
                          Colors.white.withOpacity(0.12),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
