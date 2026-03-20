# Eye of Horus - Blinking Animation Guide

## Overview

The Eye of Horus component now features a natural, Framer Motion-powered blinking animation designed to increase user engagement and retention. The animation includes:

- **Natural blinking** with randomized intervals (2-6 seconds)
- **Subtle iris movement** for lifelike behavior
- **Smooth animations** using Framer Motion's physics-based easing
- **Optimized performance** with proper cleanup

## Quick Start

To enable the blinking animation, simply add the `animated` prop to the `Eyehorus` component:

```tsx
import Eyehorus from '@/components/pharaonic/Eyehorus';

// Basic blinking eye
<Eyehorus animated={true} />

// With custom size and glow
<Eyehorus
  size={120}
  animated={true}
  glow={true}
  glowIntensity="high"
/>

// With label
<Eyehorus
  animated={true}
  showLabel={true}
  labelText="PromptTemple"
/>
```

## Animation Features

### 1. Natural Blinking
- Random intervals between 2-6 seconds
- Fast closing (80ms) with ease-in easing
- Slower opening (120ms) with ease-out easing
- Continuous operation with proper cleanup

### 2. Iris Tracking
- Subtle random eye movement (±2px horizontal, ±1px vertical)
- Smooth transitions using Framer Motion's animate()
- Breathing effect on iris scale and opacity
- Highlights pulse for added realism

### 3. Orbital Animations (when animated)
- Slow clockwise outer ring (8s rotation)
- Counter-clockwise inner ring (12s rotation)
- Pulsing outer glow effect

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animated` | boolean | `false` | Enable blinking and other animations |
| `speedMultiplier` | number | `1` | Control animation speed (higher = slower) |
| `size` | number | `120` | Icon size in pixels |
| `glow` | boolean | `true` | Enable glow effects |
| `glowIntensity` | `'low' \| 'medium' \| 'high'` | `'medium'` | Glow effect intensity |
| `showLabel` | boolean | `false` | Show text label below icon |
| `labelText` | string | `'PromptTemple'` | Text for label |
| `variant` | string \| number | `'1'` | Gradient variant for multiple instances |
| `className` | string | `''` | Additional CSS classes |

## Usage Examples

### Homepage Hero Section
```tsx
<Eyehorus
  size={64}
  variant="hero"
  glow={true}
  glowIntensity="high"
  animated={true}
  speedMultiplier={2}
  showLabel={false}
/>
```

### Sidebar Navigation
```tsx
<Eyehorus
  size={48}
  variant="sidebar"
  glow={true}
  glowIntensity="high"
  showLabel={false}
  animated={true}
/>
```

### Collapsed Sidebar
```tsx
<Eyehorus
  size={42}
  variant="sidebar-collapsed"
  glow={true}
  glowIntensity="medium"
  showLabel={false}
  animated={true}
/>
```

### With Logo Label
```tsx
<Eyehorus
  size={100}
  animated={true}
  showLabel={true}
  labelText="PromptTemple"
  glowIntensity="high"
/>
```

### Slow Motion (for accessibility/demonstration)
```tsx
<Eyehorus
  size={120}
  animated={true}
  speedMultiplier={2} // 2x slower
/>
```

## Performance Considerations

### Optimizations Built In

1. **Proper Cleanup**: All intervals and timeouts are cleared on component unmount
2. **Efficient Animations**: Framer Motion's optimized animation engine
3. **Shared Gradient IDs**: Multiple instances don't create duplicate gradients
4. **CSS for Simple Animations**: Orbit rings use CSS keyframes where appropriate

### Best Practices

- Use `animated={false}` for static instances where blinking might be distracting
- Adjust `speedMultiplier` for different contexts (slower for detailed work areas, faster for promotional areas)
- Keep multiple instances minimized if performance is a concern (use same `variant` prop to share gradients)

## Where to Use

✅ **Recommended for animation**:
- Homepage hero section
- Sidebar navigation (both expanded and collapsed)
- Loading screens
- Empty states
- Feature highlights
- Onboarding experiences

⚠️ **Use with caution**:
- Dense information displays (might be distracting)
- Error states (blinking might be misinterpreted)
- Settings pages (where users expect static elements)

## Customization

### Adjusting Blink Speed

To make the eye blink faster/slower, you can modify the internals in `src/components/pharaonic/Eyehorus.tsx`:

```tsx
// In BlinkingEye component, line 18:
const nextBlinkTime = Math.random() * 4000 + 2000; // 2-6 seconds
// Faster: Math.random() * 2000 + 1000 (1-3 seconds)
// Slower: Math.random() * 6000 + 3000 (3-9 seconds)
```

### Adjusting Iris Movement

Modify the tracking component to make the eye look around more or less:

```tsx
// In IrisTracking component, lines 68-69:
const targetX = (Math.random() - 0.5) * 4; // ±2px
const targetY = (Math.random() - 0.5) * 2; // ±1px
// More movement: multiply by larger values
// Less movement: multiply by smaller values
```

## Accessibility

- The animated eye respects the user's `prefers-reduced-motion` setting through Framer Motion's built-in support
- Animation can be disabled by setting `animated={false}`
- Consider offering a user preference to disable animations for accessibility

## Troubleshooting

### Animation Not Working
- Verify `animated={true}` prop is set
- Check that Framer Motion is installed (should be in package.json)
- Ensure no CSS overrides are blocking animations
- Check browser console for JavaScript errors

### Performance Issues
- Reduce number of animated instances on a single page
- Use the same `variant` prop for multiple instances to share gradient definitions
- Consider disabling animations on mobile devices if needed

### Framer Motion Imports
Ensure the component has all necessary imports:
```tsx
import { motion, useAnimation, useMotionValue, useTransform, animate } from "framer-motion";
```

## Future Enhancements

Potential additions:
- Mouse tracking (iris follows cursor)
- Emotional states (happy, curious, focused)
- Interactive blinking (click to blink)
- Sound effects for blinking
- More complex Egyptian-inspired animations

## Credits

Built with:
- **Framer Motion** for physics-based animations
- **React** for component architecture
- **SVG** for crisp, scalable graphics
