import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

class AppNavbar extends StatelessWidget {
  final VoidCallback? onMenuTap;

  const AppNavbar({super.key, this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Logo
            Image.asset(
              'assets/images/DLOGO.png',
              height: 45,
              errorBuilder: (c, e, s) => const Icon(Icons.image, color: Colors.white),
            ),
            // Right side: theme toggle + hamburger
            Row(
              children: [
                // Dark mode icon (decorative)
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withOpacity(0.15)),
                    color: Colors.black.withOpacity(0.3),
                  ),
                  child: const Icon(LucideIcons.moon, size: 16, color: Colors.blueAccent),
                ),
                const SizedBox(width: 12),
                // Hamburger menu
                GestureDetector(
                  onTap: onMenuTap ?? () => _showDrawer(context),
                  child: const Icon(LucideIcons.menu, size: 28, color: Colors.white),
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 600.ms).slideY(begin: -0.5, end: 0);
  }

  void _showDrawer(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _NavDrawer(),
    );
  }
}

class _NavDrawer extends StatelessWidget {
  final List<Map<String, dynamic>> _navItems = const [
    {"name": "Home", "icon": LucideIcons.home},
    {"name": "Why DBI", "icon": LucideIcons.info},
    {"name": "Become a Part (DBI)", "icon": LucideIcons.userPlus},
    {"name": "Join Community", "icon": LucideIcons.users},
    {"name": "Mapping Plans", "icon": LucideIcons.map},
  ];

  final List<Map<String, dynamic>> _features = const [
    {"name": "Digital Directory", "desc": "India's largest business map", "icon": LucideIcons.building2},
    {"name": "Interactive Map", "desc": "Real-time discovery engine", "icon": LucideIcons.map},
    {"name": "Business Verification", "desc": "Trust-first ecosystem", "icon": LucideIcons.shieldCheck},
    {"name": "Analytics Dashboard", "desc": "Growth metrics at glance", "icon": LucideIcons.pieChart},
    {"name": "Smart Search", "desc": "AI-powered local search", "icon": LucideIcons.search},
  ];

  final List<Map<String, dynamic>> _solutions = const [
    {"name": "For MSMEs", "desc": "Scale your local brand", "icon": LucideIcons.rocket},
    {"name": "For Local Shops", "desc": "Go digital in seconds", "icon": LucideIcons.store},
    {"name": "For Service Providers", "desc": "Reach new customers", "icon": LucideIcons.heart},
    {"name": "Enterprise", "desc": "High-performance solutions", "icon": LucideIcons.briefcase},
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: const Color(0xFF0d1b2a),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          // Drawer handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Close button
          Align(
            alignment: Alignment.centerRight,
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: const Icon(LucideIcons.x, color: Colors.white, size: 24),
              ),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Features section
                  _sectionTitle("Features"),
                  ..._features.map((item) => _drawerItem(item)),
                  const SizedBox(height: 16),
                  // Solutions section
                  _sectionTitle("Solutions"),
                  ..._solutions.map((item) => _drawerItem(item)),
                  const SizedBox(height: 16),
                  Divider(color: Colors.white.withOpacity(0.1)),
                  const SizedBox(height: 8),
                  // Nav items
                  ..._navItems.map((item) => ListTile(
                    dense: true,
                    leading: Icon(item['icon'] as IconData, color: Colors.blueAccent, size: 18),
                    title: Text(
                      item['name'] as String,
                      style: const TextStyle(color: Colors.white70, fontSize: 15, fontWeight: FontWeight.w500),
                    ),
                    onTap: () => Navigator.pop(context),
                  )),
                  const SizedBox(height: 24),
                  // Action buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.blueAccent.withOpacity(0.5)),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text("Log In", style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueAccent,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text("Sign Up", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: Colors.blueAccent.withOpacity(0.6),
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 2,
        ),
      ),
    );
  }

  Widget _drawerItem(Map<String, dynamic> item) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        dense: true,
        leading: Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(item['icon'] as IconData, color: Colors.blueAccent, size: 16),
        ),
        title: Text(item['name'] as String, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
        subtitle: Text(item['desc'] as String, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 10)),
      ),
    );
  }
}
