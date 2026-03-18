import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  // All Next.js frontend images loaded synchronously before app start
  final List<String> _imageAssets = [
    'assets/images/earth.jpg',
    'assets/images/DLOGO.png',
    'assets/images/DLOGO1.png',
    'assets/images/cat-automobile.jpg',
    'assets/images/cat-beautyspa.jpg',
    'assets/images/cat-cabs.jpg',
    'assets/images/cat-hospitals.jpg',
    'assets/images/cat-hotels.jpg',
    'assets/images/cat-logistics.jpg',
    'assets/images/cat-railway.jpg',
    'assets/images/cat-realestate.jpg',
    'assets/images/cat-restaurant.jpg',
    'assets/images/cat-salon.jpg',
    'assets/images/cat-schools.jpg',
    'assets/images/cat-tech.jpg',
    'assets/images/contractor.jpg',
    'assets/images/logo1.png',
    'assets/images/logo2.png',
    'assets/images/logo3.png',
    'assets/images/logo4.jpeg',
    'assets/images/logo5.jpeg',
    'assets/images/logo6.jpeg',
    'assets/images/logo7.jpeg',
    'assets/images/map.jpg',
    'assets/images/earth.jpg',
  ];

  @override
  void initState() {
    super.initState();
    _loadAssetsAndNavigate();
  }

  Future<void> _loadAssetsAndNavigate() async {
    // Allows frame to render before starting heavy caching
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final futures = _imageAssets.map((path) {
        return precacheImage(AssetImage(path), context).catchError((_) {
          // Ignore individual image precache failures
          debugPrint('Failed to precache: $path');
        });
      });
      await Future.wait(futures);
      
      // Small delay for smoother transition
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Navigate to Home screen seamlessly with no flicker or missing images
      if (mounted) {
        context.go('/home');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/images/DLOGO1.png', width: 250, errorBuilder: (c, e, s) => const Icon(Icons.error, color: Colors.red)),
            const SizedBox(height: 40),
            const CircularProgressIndicator(strokeWidth: 2),
          ],
        ),
      ),
    );
  }
}
