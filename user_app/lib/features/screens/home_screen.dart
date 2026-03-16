import 'package:flutter/material.dart';
import '../widgets/particle_network.dart';
import '../widgets/hero_section.dart';
import '../widgets/app_navbar.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Background Particles (like ParticleNetworkWrapper)
          const Positioned.fill(
            child: Opacity(
              opacity: 0.7,
              child: ParticleNetwork(particleCount: 35),
            ),
          ),

          // Main Content
          Column(
            children: [
              // ── Navbar: Logo left, hamburger right ──
              const AppNavbar(),

              // ── Hero Section fills remaining space ──
              const Expanded(
                child: HeroSection(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
