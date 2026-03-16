import 'dart:async';
import 'package:flutter/material.dart';

class AutoScrollingCategoryStrip extends StatefulWidget {
  final List<Map<String, String>> categories;

  const AutoScrollingCategoryStrip({super.key, required this.categories});

  @override
  State<AutoScrollingCategoryStrip> createState() => _AutoScrollingCategoryStripState();
}

class _AutoScrollingCategoryStripState extends State<AutoScrollingCategoryStrip> {
  late ScrollController _scrollController;
  Timer? _timer;
  double _scrollPosition = 0;
  final double _scrollStep = 0.5; // Controls the speed of auto-scroll

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startScrolling();
    });
  }

  void _startScrolling() {
    _timer = Timer.periodic(const Duration(milliseconds: 20), (timer) {
      if (_scrollController.hasClients && _scrollController.position.maxScrollExtent > 0) {
        _scrollPosition += _scrollStep;
        
        // Seamless transition: when reaching 2/3 of the tripled list, 
        // jump back to 1/3 point (visually identical)
        final threshold = _scrollController.position.maxScrollExtent * (2 / 3);
        if (_scrollPosition >= threshold) {
          _scrollPosition = _scrollController.position.maxScrollExtent * (1 / 3);
          _scrollController.jumpTo(_scrollPosition);
        } else {
          _scrollController.jumpTo(_scrollPosition);
        }
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Triple the list for even smoother infinite loop
    final tripleCategories = [...widget.categories, ...widget.categories, ...widget.categories];

    return SizedBox(
      height: 180, // Increased height
      child: ListView.builder(
        controller: _scrollController,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: tripleCategories.length,
        itemBuilder: (context, index) {
          final cat = tripleCategories[index];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Container(
              width: 150, // Increased width significantly
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                border: Border.all(color: Colors.white.withOpacity(0.15)),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 90, // Increased icon size
                    height: 90, // Increased icon size
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.3), width: 3),
                      image: DecorationImage(
                        image: AssetImage(cat['img']!),
                        fit: BoxFit.cover,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blueAccent.withOpacity(0.15),
                          blurRadius: 20,
                          spreadRadius: 3,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    cat['name']!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14, // Increased font size
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                    ),
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
