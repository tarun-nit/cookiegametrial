import { useState } from 'react'
import CookieVarietiesGame from './features/CookieVarieties'
import ShopUpgradesGame from './features/ShopUpgrades'
import EnhancedVisualsGame from './features/EnhancedVisuals'
import './features/features.css'

type Feature = 'varieties' | 'upgrades' | 'visuals' | null

export default function TestHarness() {
  const [activeFeature, setActiveFeature] = useState<Feature>(null)

  if (activeFeature === 'varieties') {
    return (
      <div>
        <button
          onClick={() => setActiveFeature(null)}
          className="fixed top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold cursor-pointer"
        >
          ← Back to Test Menu
        </button>
        <CookieVarietiesGame />
      </div>
    )
  }

  if (activeFeature === 'upgrades') {
    return (
      <div>
        <button
          onClick={() => setActiveFeature(null)}
          className="fixed top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold cursor-pointer"
        >
          ← Back to Test Menu
        </button>
        <ShopUpgradesGame />
      </div>
    )
  }

  if (activeFeature === 'visuals') {
    return (
      <div>
        <button
          onClick={() => setActiveFeature(null)}
          className="fixed top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold cursor-pointer"
        >
          ← Back to Test Menu
        </button>
        <EnhancedVisualsGame />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🧪 Feature Test Harness
          </h1>
          <p className="text-xl text-gray-300">
            Click any feature to test it independently
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cookie Varieties */}
          <button
            onClick={() => setActiveFeature('varieties')}
            className="bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="text-6xl mb-4">🍪⭐🌾</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Feature 1: Cookie Varieties
            </h2>
            <p className="text-amber-100 text-sm">
              Multiple cookie types with different costs, prices, and demand
            </p>
            <div className="mt-4 text-xs text-amber-200">
              <div>• 6 cookie varieties</div>
              <div>• Strategic selection</div>
              <div>• Independent pricing</div>
            </div>
          </button>

          {/* Shop Upgrades */}
          <button
            onClick={() => setActiveFeature('upgrades')}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="text-6xl mb-4">🔥🏪📢</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Feature 2: Shop Upgrades
            </h2>
            <p className="text-purple-100 text-sm">
              Upgrade system with 4 categories and multiple levels
            </p>
            <div className="mt-4 text-xs text-purple-200">
              <div>• 4 upgrade types</div>
              <div>• 4 levels each</div>
              <div>• Permanent bonuses</div>
            </div>
          </button>

          {/* Enhanced Visuals */}
          <button
            onClick={() => setActiveFeature('visuals')}
            className="bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="text-6xl mb-4">✨🎉🌟</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Feature 3: Enhanced Visuals
            </h2>
            <p className="text-pink-100 text-sm">
              Improved animations and visual effects throughout
            </p>
            <div className="mt-4 text-xs text-pink-200">
              <div>• Particle effects</div>
              <div>• Enhanced animations</div>
              <div>• Same gameplay</div>
            </div>
          </button>
        </div>

        <div className="mt-12 bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-3">📋 Instructions</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• Click any feature card to test it</li>
            <li>• Use the red "Back to Test Menu" button to return here</li>
            <li>• Each feature works independently</li>
            <li>• Main game (App.tsx) remains unchanged</li>
          </ul>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Features are in <code className="bg-gray-800 px-2 py-1 rounded">src/features/</code></p>
          <p className="mt-2">See <code className="bg-gray-800 px-2 py-1 rounded">FEATURES.md</code> for integration instructions</p>
        </div>
      </div>
    </div>
  )
}
