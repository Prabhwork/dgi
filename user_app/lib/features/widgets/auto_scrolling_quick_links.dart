import 'dart:async';
import 'package:flutter/material.dart';

class AutoScrollingQuickLinks extends StatefulWidget {
  final List<Widget> children;

  const AutoScrollingQuickLinks({super.key, required this.children});

  @override
  State<AutoScrollingQuickLinks> createState() => _AutoScrollingQuickLinksState();
}

class _AutoScrollingQuickLinksState extends State<AutoScrollingQuickLinks> {
  late ScrollController _scrollController;
  Timer? _timer;
  double _scrollPosition = 0;
  final double _scrollStep = 0.4;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _startScrolling();
    });
  }

  void _startScrolling() {
    _timer = Timer.periodic(const Duration(milliseconds: 20), (timer) {
      if (_scrollController.hasClients && _scrollController.position.maxScrollExtent > 0) {
        _scrollPosition += _scrollStep;
        
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
    // Group children into a single widget Block for perfectly uniform scrolling
    final Widget linksBlock = Row(
      mainAxisSize: MainAxisSize.min,
      children: widget.children.map((child) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24), // Wide uniform spacing
          child: child,
        );
      }).toList(),
    );

    // Dynamic list of blocks for infinite effect
    final tripledBlocks = [linksBlock, linksBlock, linksBlock];

    return SizedBox(
      height: 44,
      child: ListView.builder(
        controller: _scrollController,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: tripledBlocks.length,
        itemBuilder: (context, index) {
          return tripledBlocks[index];
        },
      ),
    );
  }
}
