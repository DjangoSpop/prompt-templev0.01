'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PyramidGrid, SunDisk } from '@/components/pharaonic/PyramidGrid';
import { NefertitiIcon, NefertitiBackground } from '@/components/pharaonic/NefertitiIcon';
import { Library, Download, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

interface PharaohHeroProps {
  className?: string;
}

export function PharaohHero({ className = '' }: PharaohHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const pyramidsY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const sunY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section 
      ref={containerRef}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-desert-sand/20 via-background to-secondary/30 ${className}`}
    >
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: pyramidsY }}
      >
        <PyramidGrid animate={true} interactive={true} />
      </motion.div>

      {/* Sun Disk with parallax */}
      <motion.div
        className="top-20 right-20"
        style={{ y: sunY }}
      >
        <SunDisk animate={true} size={120} />
      </motion.div>

      {/* Nefertiti Background */}
      <NefertitiBackground opacity={0.05} />

      {/* Subtle papyrus texture overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23CBA135' fill-opacity='0.1'%3e%3cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      {/* Main Content */}
      <motion.div 
        className="relative z-10 text-center max-w-6xl mx-auto px-4"
        style={{ y: textY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <NefertitiIcon size="lg" className="text-pharaoh-gold mr-4" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-display font-display-bold bg-gradient-to-r from-lapis-blue via-nile-teal to-royal-gold bg-clip-text text-transparent">
              Prompt Temple
            </h1>
          </div>
          
          <motion.h2 
            className="text-4xl md:text-6xl font-display font-bold text-hieroglyph-stone mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Craft world‑class prompts
            <br />
            <span className="text-pharaoh-gold">in minutes.</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Ancient clarity, modern AI. Browse templates, optimize with DeepSeek, deploy anywhere.
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button 
            asChild
            size="lg"
            className="group relative overflow-hidden bg-gradient-to-r from-lapis-blue to-nile-teal hover:from-lapis-blue/90 hover:to-nile-teal/90 text-white font-semibold px-8 py-4 rounded-temple shadow-pyramid transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Link href="/template-manager">
              <Library className="w-5 h-5 mr-2" />
              Open Library
              <motion.div
                className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"
                style={{ zIndex: -1 }}
              />
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline"
            size="lg"
            className="group relative border-2 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white font-semibold px-8 py-4 rounded-temple shadow-nile transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Link href="/extension">
              <Download className="w-5 h-5 mr-2" />
              Install Extension
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-royal-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"
              />
            </Link>
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 text-center opacity-70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="space-y-1">
            <div className="text-2xl font-bold text-pharaoh-gold">10,000+</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Templates</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-nile-teal">50,000+</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Users</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-lapis-blue">1M+</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Prompts Generated</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full relative">
          <motion.div
            className="w-1 h-3 bg-pharaoh-gold rounded-full absolute left-1/2 top-2 transform -translate-x-1/2"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* How it Works Section Preview */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 pb-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Library, 
                title: 'Browse', 
                description: 'Explore curated templates' 
              },
              { 
                icon: Zap, 
                title: 'Build', 
                description: 'Customize with variables' 
              },
              { 
                icon: Download, 
                title: 'Optimize', 
                description: 'Enhance with DeepSeek' 
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pharaoh-gold/20 to-nile-teal/20 rounded-full flex items-center justify-center group-hover:shadow-pyramid transition-all duration-200">
                  <step.icon className="w-8 h-8 text-pharaoh-gold" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}