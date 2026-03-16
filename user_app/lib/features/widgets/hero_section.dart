import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'rotating_globe.dart';
import 'auto_scrolling_category_strip.dart';
import 'auto_scrolling_quick_links.dart';

class HeroSection extends StatelessWidget {
  const HeroSection({super.key});

  final List<Map<String, String>> _allCategories = const [
    {"name": "Logistics", "img": "assets/images/cat-logistics.jpg"},
    {"name": "Automobile", "img": "assets/images/cat-automobile.jpg"},
    {"name": "Real Estate", "img": "assets/images/cat-realestate.jpg"},
    {"name": "Tech", "img": "assets/images/cat-tech.jpg"},
    {"name": "Salon", "img": "assets/images/cat-salon.jpg"},
    {"name": "Restaurant", "img": "assets/images/cat-restaurant.jpg"},
    {"name": "Beauty & Spa", "img": "assets/images/cat-beautyspa.jpg"},
  ];

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          const SizedBox(height: 16),

          // ── Search Bar + Map Button ──
          _buildSearchBar(context).animate().fadeIn(duration: 600.ms, delay: 300.ms).slideY(begin: -0.2, end: 0),

          const SizedBox(height: 12),

          // ── Quick Links Row ──
          _buildQuickLinks(context).animate().fadeIn(duration: 600.ms, delay: 400.ms),

          const SizedBox(height: 40),

          // ── Rotating Globe with Text Overlay ──
          _buildGlobeSection(context, screenWidth),

          const SizedBox(height: 32),

          // ── Category Cards Strip ──
          AutoScrollingCategoryStrip(categories: _allCategories)
              .animate()
              .fadeIn(delay: 1500.ms)
              .slideY(begin: 0.2, end: 0),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          // Search input
          Expanded(
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.4),
                border: Border.all(color: Colors.white.withOpacity(0.2)),
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(10)),
              ),
              child: Row(
                children: [
                  const SizedBox(width: 14),
                  Expanded(
                    child: TextField(
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: "Search location...",
                        hintStyle: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 14),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                  Icon(LucideIcons.search, color: Colors.white.withOpacity(0.6), size: 18),
                  const SizedBox(width: 12),
                ],
              ),
            ),
          ),
          // Map button
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 18),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor,
              borderRadius: const BorderRadius.horizontal(right: Radius.circular(10)),
              boxShadow: [
                BoxShadow(color: Theme.of(context).primaryColor.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4)),
              ],
            ),
            child: Row(
              children: const [
                Icon(LucideIcons.mapPin, color: Colors.white, size: 16),
                SizedBox(width: 6),
                Text("Map", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickLinks(BuildContext context) {
    return AutoScrollingQuickLinks(
      children: [
        // DBI for Business
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("DBI for Business", style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(width: 4),
            Icon(LucideIcons.chevronDown, size: 14, color: Colors.white.withOpacity(0.6)),
          ],
        ),
        // Write a Review
        Text("Write a Review", style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13, fontWeight: FontWeight.w600)),
        // Claim business badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Text(
            "claim business just 1/- a day",
            style: TextStyle(color: Colors.cyanAccent, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.5),
          ),
        ),
      ],
    );
  }

  Widget _buildGlobeSection(BuildContext context, double screenWidth) {
    final globeSize = screenWidth * 0.78;

    return Stack(
      alignment: Alignment.center,
      children: [
        // Globe
        SizedBox(
          width: globeSize,
          height: globeSize,
          child: RotatingGlobe(size: globeSize),
        ),

        // Text overlay on top of globe
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "PRE LAUNCH",
              style: GoogleFonts.spaceGrotesk(
                fontSize: 32,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -1,
                shadows: [
                  const Shadow(color: Colors.blueAccent, blurRadius: 30),
                  const Shadow(color: Colors.black, blurRadius: 8, offset: Offset(0, 2)),
                ],
              ),
            ).animate().fadeIn(duration: 800.ms, delay: 500.ms).slideY(begin: 0.2, end: 0),

            const SizedBox(height: 6),

            Text(
              "Prepared To Be Amazed!!",
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF00d4ff),
                shadows: [const Shadow(color: Colors.cyan, blurRadius: 15)],
              ),
            ).animate().fadeIn(delay: 800.ms),

            const SizedBox(height: 12),

            SizedBox(
              width: 240,
              child: Text(
                "Digital Book Of India is on its way to make your way of living more easier..stay tuned.",
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFFfacc15),
                  height: 1.5,
                  shadows: [const Shadow(color: Colors.black, blurRadius: 6, offset: Offset(0, 1))],
                ),
              ),
            ).animate().fadeIn(delay: 1200.ms).slideY(begin: 0.1, end: 0),
          ],
        ),
      ],
    ).animate().fadeIn(duration: 400.ms);
  }
}

