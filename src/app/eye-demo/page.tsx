"use client";

import Eyehorus from '@/components/pharaonic/Eyehorus';

export default function EyeBlinkingDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian-900 via-midnight-900 to-obsidian-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold bg-gradient-to-r from-royal-gold-300 via-royal-gold-400 to-royal-gold-300 bg-clip-text text-transparent mb-4">
            Eye of Horus - Blinking Animation
          </h1>
          <p className="text-desert-sand-400 text-lg">
            Natural, lifelike eye animation powered by Framer Motion
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* 1. Basic Blinking */}
          <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif text-royal-gold-400 mb-4">Basic Blinking</h3>
            <div className="flex justify-center mb-4">
              <Eyehorus size={100} animated={true} />
            </div>
            <p className="text-desert-sand-300 text-sm">
              Simple blinking with default settings
            </p>
          </div>

          {/* 2. Slow Motion */}
          <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif text-royal-gold-400 mb-4">Slow Motion</h3>
            <div className="flex justify-center mb-4">
              <Eyehorus
                size={100}
                animated={true}
                speedMultiplier={2}
                glowIntensity="medium"
              />
            </div>
            <p className="text-desert-sand-300 text-sm">
              2x slower for detailed observation
            </p>
          </div>

          {/* 3. Fast Motion */}
          <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif text-royal-gold-400 mb-4">Fast Motion</h3>
            <div className="flex justify-center mb-4">
              <Eyehorus
                size={100}
                animated={true}
                speedMultiplier={0.5}
                glowIntensity="high"
              />
            </div>
            <p className="text-desert-sand-300 text-sm">
              2x faster for active feel
            </p>
          </div>

          {/* 4. With High Glow */}
          <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif text-royal-gold-400 mb-4">High Glow</h3>
            <div className="flex justify-center mb-4">
              <Eyehorus
                size={100}
                animated={true}
                glowIntensity="high"
                glow={true}
              />
            </div>
            <p className="text-desert-sand-300 text-sm">
              Maximum glow intensity
            </p>
          </div>

          {/* 5. With Label */}
          <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif text-royal-gold-400 mb-4">With Label</h3>
            <div className="flex justify-center mb-4">
              <Eyehorus
                size={100}
                animated={true}
                showLabel={true}
                labelText="PromptTemple"
                glowIntensity="medium"
              />
            </div>
            <p className="text-desert-sand-300 text-sm">
              With brand label
            </p>
          </div>

          {/* 6. Small Size */}
          <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif text-royal-gold-400 mb-4">Small Icon</h3>
            <div className="flex justify-center mb-4">
              <Eyehorus
                size={48}
                animated={true}
                glowIntensity="medium"
              />
            </div>
            <p className="text-desert-sand-300 text-sm">
              Compact size for navigation
            </p>
          </div>
        </div>

        {/* Large Display */}
        <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-xl p-16 text-center mb-12">
          <h3 className="text-2xl font-serif text-royal-gold-400 mb-6">
            Hero Display
          </h3>
          <div className="flex justify-center mb-6">
            <Eyehorus
              size={200}
              animated={true}
              glowIntensity="high"
              speedMultiplier={1.5}
            />
          </div>
          <p className="text-desert-sand-300 text-base">
            Large display with slow, deliberate blinking
          </p>
        </div>

        {/* Static vs Animated Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-obsidian-800/50 backdrop-blur-sm border border-desert-sand-500/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif text-desert-sand-400 mb-4">
              Static (No Animation)
            </h3>
            <div className="flex justify-center mb-4">
              <Eyehorus
                size={100}
                animated={false}
                glowIntensity="medium"
              />
            </div>
            <p className="text-desert-sand-300 text-sm">
              Traditional static icon
            </p>
          </div>

          <div className="bg-obsidian-800/50 backdrop-blur-sm border border-royal-gold-500/20 rounded-xl p-8 text-center">
            <h3 className="text-xl font-serif text-royal-gold-400 mb-4">
              Animated (Blinking)
            </h3>
            <div className="flex justify-center mb-4">
              <Eyehorus
                size={100}
                animated={true}
                glowIntensity="medium"
              />
            </div>
            <p className="text-desert-sand-300 text-sm">
              Enhanced with natural blinking
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-16 bg-obsidian-800/30 backdrop-blur-sm border border-royal-gold-500/10 rounded-xl p-8">
          <h2 className="text-3xl font-serif text-royal-gold-400 mb-6 text-center">
            Animation Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-royal-gold-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="text-royal-gold-300 font-semibold mb-1">
                    Natural Blinking
                  </h4>
                  <p className="text-desert-sand-400 text-sm">
                    Random intervals (2-6 seconds) for lifelike behavior
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-royal-gold-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="text-royal-gold-300 font-semibold mb-1">
                    Smooth Transitions
                  </h4>
                  <p className="text-desert-sand-400 text-sm">
                    Fast close (80ms), slow open (120ms) using Framer Motion easing
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-royal-gold-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="text-royal-gold-300 font-semibold mb-1">
                    Iris Movement
                  </h4>
                  <p className="text-desert-sand-400 text-sm">
                    Subtle eye tracking (±2px horizontal, ±1px vertical)
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-royal-gold-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="text-royal-gold-300 font-semibold mb-1">
                    Breathing Effect
                  </h4>
                  <p className="text-desert-sand-400 text-sm">
                    Iris scale and opacity pulse for organic feel
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-royal-gold-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="text-royal-gold-300 font-semibold mb-1">
                    Orbital Rings
                  </h4>
                  <p className="text-desert-sand-400 text-sm">
                    Slow rotating rings with clockwise/counter-clockwise motion
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-royal-gold-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="text-royal-gold-300 font-semibold mb-1">
                    Optimized Performance
                  </h4>
                  <p className="text-desert-sand-400 text-sm">
                    Proper cleanup, efficient animations, shared gradients
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Code Example */}
        <div className="mt-8 bg-obsidian-900/50 border border-royal-gold-500/10 rounded-xl p-6">
          <h3 className="text-xl font-serif text-royal-gold-400 mb-4">
            Quick Usage
          </h3>
          <pre className="bg-obsidian-950 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-desert-sand-200">
              {`import Eyehorus from '@/components/pharaonic/Eyehorus';

// Enable blinking with animated prop
<Eyehorus animated={true} />

// With customization
<Eyehorus
  size={120}
  animated={true}
  glowIntensity="high"
  speedMultiplier={2}
/>`}
            </code>
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-desert-sand-400 text-sm">
          <p>
            Powered by Framer Motion • Built for user engagement and retention
          </p>
        </div>
      </div>
    </div>
  );
}
