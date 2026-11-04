# Kevin's Cookie Shop Tycoon - Feature Branches

This document describes three new features developed in parallel for Kevin's Cookie Shop Tycoon. Each feature is implemented as a standalone component in the `src/features/` directory and can be integrated into the main game independently.

---

## Feature 1: Cookie Varieties 🍪⭐🌾

**File:** `src/features/CookieVarieties.tsx`

### Description
Adds multiple cookie varieties that the player can choose to bake and sell. Each variety has different costs, base prices, and demand multipliers, adding strategic depth to the game.

### Cookie Types
| Cookie | Emoji | Cost | Base Price | Demand | Description |
|--------|-------|------|------------|--------|-------------|
| Chocolate Chip | 🍪 | $0.50 | $1.50 | 1.0x | Classic favorite - steady demand |
| Sugar Cookie | ⭐ | $0.40 | $1.25 | 0.9x | Simple and cheap to make |
| Oatmeal Raisin | 🌾 | $0.60 | $1.75 | 0.7x | Health-conscious customers love it |
| Double Chocolate | 🍫 | $0.80 | $2.50 | 1.2x | Premium cookie - high demand |
| Peanut Butter | 🥜 | $0.70 | $2.00 | 0.85x | Nutty and delicious |
| Macaron | 🌈 | $1.20 | $3.50 | 1.3x | Luxury item - very popular |

### Key Mechanics
- Players select which varieties to offer each day
- Each variety can have its own quantity and price
- Advertising budget is split across all selected varieties
- Higher starting cash ($150) to accommodate multiple varieties
- Demand is influenced by each variety's unique multiplier

### How to Integrate
1. Import the component: `import CookieVarietiesGame from './features/CookieVarieties'`
2. Add a game mode selector to the main menu
3. Replace the main game component with `CookieVarietiesGame` when this mode is selected

---

## Feature 2: Shop Upgrades 🔥🏪📢📜

**File:** `src/features/ShopUpgrades.tsx`

### Description
Adds a persistent upgrade system where players can invest cash to improve their shop. Upgrades provide permanent bonuses that carry across all remaining days.

### Upgrade Categories

#### 🔥 Better Oven
Reduces baking costs per cookie.
| Level | Name | Cost | Effect |
|-------|------|------|--------|
| 0 | Basic Oven | Free | Base baking cost |
| 1 | Improved Oven | $50 | -15% baking cost |
| 2 | Professional Oven | $150 | -30% baking cost |
| 3 | Industrial Oven | $400 | -45% baking cost |

#### 🏪 Larger Storefront
Increases daily customer count.
| Level | Name | Cost | Effect |
|-------|------|------|--------|
| 0 | Small Shop | Free | Base customer count |
| 1 | Medium Shop | $75 | +20% customers |
| 2 | Large Shop | $200 | +45% customers |
| 3 | Mega Store | $500 | +75% customers |

#### 📢 Improved Advertising
Increases the effectiveness of ad spending.
| Level | Name | Cost | Effect |
|-------|------|------|--------|
| 0 | Word of Mouth | Free | Base ad effectiveness |
| 1 | Flyers & Posters | $60 | +25% ad ROI |
| 2 | Social Media | $180 | +55% ad ROI |
| 3 | TV Commercials | $450 | +90% ad ROI |

#### 📜 Secret Recipe
Customers willing to pay higher prices.
| Level | Name | Cost | Effect |
|-------|------|------|--------|
| 0 | Standard Recipe | Free | Base price tolerance |
| 1 | Grandma's Recipe | $100 | +15% price tolerance |
| 2 | Award Winning | $300 | +35% price tolerance |
| 3 | Legendary Recipe | $700 | +60% price tolerance |

### Key Mechanics
- Dedicated "Upgrade Shop" screen accessible from the main game
- Upgrades cost increasing amounts per level
- Effects are multiplicative and stack together
- Visual level progress bars show upgrade status
- Strategic decision: invest now for long-term gains vs. save cash

### How to Integrate
1. Import the component: `import ShopUpgradesGame from './features/ShopUpgrades'`
2. Add upgrade state to the main game
3. Apply upgrade multipliers in the demand and cost calculations
4. Add an "Upgrade Shop" button to the main game screen

---

## Feature 3: Enhanced Visuals ✨🎉

**File:** `src/features/EnhancedVisuals.tsx`
**CSS:** `src/features/features.css`

### Description
Significantly improves the visual presentation and animations throughout the game without changing any gameplay mechanics. Same rules, same math, but much more polished and engaging.

### Visual Improvements

#### Menu Screen
- Animated floating cookie background
- Bouncing main cookie emoji
- Gradient backgrounds with depth
- Enhanced card styling with borders and shadows
- Larger, more prominent buttons with hover effects

#### Day Planning Screen
- Glass-morphism card effects (backdrop-blur)
- Gradient progress bar
- Enhanced input styling with focus rings
- Larger, more readable text
- Gradient buttons with scale hover effects

#### Customer Animation Scene
- **Enhanced shop building:**
  - Animated "OPEN" sign with pulse effect
  - Striped awning with text
  - Brick pattern on walls
  - Glowing windows with animated cookies
  - Detailed door with doorknob
  - Welcome mat
- **Improved customers:**
  - Larger emoji size (4xl-5xl)
  - Smoother walking animation with scale effects
  - Entry/exit scaling for depth perception
- **Particle effects:**
  - Floating celebration emojis (🍪💰✨🎉⭐)
  - Animated clouds with drift
  - Bouncing cookie above shop
  - Cash register "ping" effect every 3 sales
- **Enhanced counters:**
  - Larger, bordered display cards
  - Pulsing number animation
  - Gradient backgrounds

#### Day Results Screen
- Glass-morphism cards
- Larger, bolder typography
- Enhanced spacing and visual hierarchy
- Gradient buttons

#### Game Over Screen
- Celebration particle effects when profitable
- Floating emoji animations
- Card-based stat display with backgrounds
- Larger trophy/emoji display

### Animation Details
| Animation | Duration | Effect |
|-----------|----------|--------|
| Background cookies | 3-7s | Float and rotate |
| Clouds | 6s | Horizontal drift |
| Customer walk | 2s | Walk + scale in/out |
| Cookie bounce | 1s | Bounce with rotation |
| Cash ping | 0.8s | Scale up and fade |
| Celebration particles | 3s | Float up and fade |
| Shop sign | 3s | Pulse |
| Window cookies | 3s | Slow pulse |

### How to Integrate
1. Import the component: `import EnhancedVisualsGame from './features/EnhancedVisuals'`
2. Import the CSS: `import './features/features.css'`
3. Replace the main game component with `EnhancedVisualsGame`
4. No gameplay changes needed - it's a visual-only upgrade

---

## Integration Guide

### Option A: Replace Main Game
Simply swap out `App.tsx` with any of the feature components:

```tsx
// For Cookie Varieties
import CookieVarietiesGame from './features/CookieVarieties'
export default function App() { return <CookieVarietiesGame /> }

// For Shop Upgrades
import ShopUpgradesGame from './features/ShopUpgrades'
export default function App() { return <ShopUpgradesGame /> }

// For Enhanced Visuals
import EnhancedVisualsGame from './features/EnhancedVisuals'
import './features/features.css'
export default function App() { return <EnhancedVisualsGame /> }
```

### Option B: Add Mode Selector
Add a menu to the main game that lets players choose which version to play:

```tsx
const [mode, setMode] = useState<'original' | 'varieties' | 'upgrades' | 'visuals'>('original')

// In render:
switch(mode) {
  case 'varieties': return <CookieVarietiesGame />
  case 'upgrades': return <ShopUpgradesGame />
  case 'visuals': return <EnhancedVisualsGame />
  default: return <OriginalGame />
}
```

### Option C: Merge Features
Combine all three features into a single enhanced game:
1. Start with Enhanced Visuals as the base
2. Add Cookie Varieties selection to the day planning screen
3. Add Shop Upgrades as a persistent system
4. Merge the demand calculations to account for all modifiers

---

## File Structure

```
src/
├── App.tsx                    # Original game (unchanged)
├── main.tsx
├── index.css
└── features/
    ├── CookieVarieties.tsx    # Feature 1: Multiple cookie types
    ├── ShopUpgrades.tsx       # Feature 2: Upgrade system
    ├── EnhancedVisuals.tsx    # Feature 3: Visual improvements
    └── features.css           # Animation CSS for all features
```

---

## Testing Each Feature

Each feature can be tested independently by temporarily replacing the App component:

```bash
# In src/App.tsx, temporarily add:
import CookieVarietiesGame from './features/CookieVarieties'
export default function App() { return <CookieVarietiesGame /> }
```

Then run `npm run build` to verify it compiles correctly.

---

## Notes

- All features maintain the same core gameplay loop (30 days, start with $100, etc.)
- Features are designed to be composable and can be combined
- No external dependencies added - all use React + Tailwind CSS
- Animations use CSS keyframes for performance
- All features are responsive and work on mobile devices
