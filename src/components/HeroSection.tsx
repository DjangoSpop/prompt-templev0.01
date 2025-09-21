'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Download, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function HeroSection() {
  const { scrollY } = useScroll();
  const pyramidY = useTransform(scrollY, [0, 800], [0, -100]);
  const sunY = useTransform(scrollY, [0, 800], [0, -200]);
  const [nefertitiVisible, setNefertitiVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setNefertitiVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-sand-50 via-desert-sand-100 to-desert-sand-200 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-60">
        {/* Sun Disk */}
        <motion.div 
          style={{ y: sunY }}
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-royal-gold-400 to-royal-gold-600 rounded-full shadow-pyramid-lg"
        />
        
        {/* Pyramids */}
        <motion.div 
          style={{ y: pyramidY }}
          className="absolute bottom-0 left-10 w-0 h-0 border-l-[100px] border-r-[100px] border-b-[120px] border-l-transparent border-r-transparent border-b-royal-gold-600 opacity-20"
        />
        <motion.div 
          style={{ y: pyramidY }}
          className="absolute bottom-0 left-40 w-0 h-0 border-l-[80px] border-r-[80px] border-b-[100px] border-l-transparent border-r-transparent border-b-royal-gold-500 opacity-30"
        />
        <motion.div 
          style={{ y: pyramidY }}
          className="absolute bottom-0 left-64 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[80px] border-l-transparent border-r-transparent border-b-royal-gold-400 opacity-40"
        />
        
        {/* Nefertiti Silhouette */}
        {nefertitiVisible && (
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-1/4 right-1/4 w-48 h-48 opacity-20"
            viewBox="0 0 200 200"
            fill="none"
          >
            <path
              d="M100 20C115 20 130 35 130 60C130 80 120 90 115 95L120 110L125 130C130 140 135 150 130 160L100 180L70 160C65 150 70 140 75 130L80 110L85 95C80 90 70 80 70 60C70 35 85 20 100 20Z"
              stroke="#1E3A8A"
              strokeWidth="2"
              className="animate-nefertiti-draw"
            />
          </motion.svg>
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className="text-7xl font-display font-display-bold text-lapis-blue-900 mb-6 leading-tight">
            Craft world-class prompts in{' '}
            <span className="bg-gradient-to-r from-royal-gold-500 to-royal-gold-700 bg-clip-text text-transparent">
              minutes
            </span>
          </h1>
          
          <p className="text-2xl text-obsidian-700 mb-12 leading-relaxed max-w-3xl mx-auto">
            Ancient clarity, modern AI. Browse templates, optimize with DeepSeek, deploy anywhere.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/library">
              <Button 
                size="lg" 
                className="bg-lapis-blue-600 hover:bg-lapis-blue-700 text-white px-8 py-4 text-lg shadow-pyramid transform hover:scale-105 transition-all duration-200"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Open Library
              </Button>
            </Link>
            
            <Link href="/extension">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-royal-gold-500 text-royal-gold-700 hover:bg-royal-gold-500 hover:text-white px-8 py-4 text-lg transform hover:scale-105 transition-all duration-200"
              >
                <Download className="mr-2 h-5 w-5" />
                Install Extension
              </Button>
            </Link>
          </div>

          {/* Proof Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-8 mb-16 text-obsidian-600"
          >
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">10,000+</span>
              <span>Active Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 fill-royal-gold-500 text-royal-gold-500" />
              <span className="font-semibold">4.9/5</span>
              <span>User Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">1M+</span>
              <span>Prompts Generated</span>
            </div>
          </motion.div>
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-display font-display-bold text-lapis-blue-900 text-center mb-12">
            How it works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Browse */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-temple hover:shadow-pyramid transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-lapis-blue-500 to-lapis-blue-700 rounded-pyramid flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-lapis-blue-900 mb-4">Browse</h3>
              <p className="text-obsidian-700 mb-4">
                Explore our curated collection of professional prompt templates across domains
              </p>
              <div className="text-sm text-nile-teal-600 font-medium">500+ Templates Available</div>
            </Card>

            {/* Build */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-temple hover:shadow-pyramid transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-nile-teal-500 to-nile-teal-700 rounded-pyramid flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-lapis-blue-900 mb-4">Build</h3>
              <p className="text-obsidian-700 mb-4">
                Customize templates with our 3-pane builder and real-time preview
              </p>
              <div className="text-sm text-nile-teal-600 font-medium">Live Variable Injection</div>
            </Card>

            {/* Optimize */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-temple hover:shadow-pyramid transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-royal-gold-500 to-royal-gold-700 rounded-pyramid flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-lapis-blue-900 mb-4">Optimize</h3>
              <p className="text-obsidian-700 mb-4">
                Run through our DeepSeek-powered optimization pipeline for perfect results
              </p>
              <div className="text-sm text-nile-teal-600 font-medium">AI-Powered Enhancement</div>
            </Card>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center space-x-2 text-nile-teal-700 font-medium mb-4">
            <Star className="h-4 w-4 fill-royal-gold-500 text-royal-gold-500" />
            <span>Join the Temple today</span>
            <Star className="h-4 w-4 fill-royal-gold-500 text-royal-gold-500" />
          </div>
          
          <Link href="/auth/signup">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-lapis-blue-600 to-nile-teal-600 hover:from-lapis-blue-700 hover:to-nile-teal-700 text-white px-12 py-4 text-lg shadow-pyramid-lg transform hover:scale-105 transition-all duration-300"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
