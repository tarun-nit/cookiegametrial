import { useState, useCallback } from "react";

// Upgrade definitions
interface Upgrade {
  id: string;
  name: string;
  emoji: string;
  description: string;
  levels: {
    name: string;
    cost: number;
    effect: string;
  }[];
}

const UPGRADES: Upgrade[] = [
  {
    id: "oven",
    name: "Better Oven",
    emoji: "🔥",
    description: "Bake more cookies for less cost",
    levels: [
      { name: "Basic Oven", cost: 0, effect: "Base baking cost" },
      { name: "Improved Oven", cost: 50, effect: "-15% baking cost" },
      { name: "Professional Oven", cost: 150, effect: "-30% baking cost" },
      { name: "Industrial Oven", cost: 400, effect: "-45% baking cost" },
    ],
  },
  {
    id: "storefront",
    name: "Larger Storefront",
    emoji: "🏪",
    description: "Attract more customers each day",
    levels: [
      { name: "Small Shop", cost: 0, effect: "Base customer count" },
      { name: "Medium Shop", cost: 75, effect: "+20% customers" },
      { name: "Large Shop", cost: 200, effect: "+45% customers" },
      { name: "Mega Store", cost: 500, effect: "+75% customers" },
    ],
  },
  {
    id: "advertising",
    name: "Improved Advertising",
    emoji: "📢",
    description: "Get more value from your ad spend",
    levels: [
      { name: "Word of Mouth", cost: 0, effect: "Base ad effectiveness" },
      { name: "Flyers & Posters", cost: 60, effect: "+25% ad ROI" },
      { name: "Social Media", cost: 180, effect: "+55% ad ROI" },
      { name: "TV Commercials", cost: 450, effect: "+90% ad ROI" },
    ],
  },
  {
    id: "recipe",
    name: "Secret Recipe",
    emoji: "📜",
    description: "Customers willing to pay more",
    levels: [
      { name: "Standard Recipe", cost: 0, effect: "Base price tolerance" },
      { name: "Grandma's Recipe", cost: 100, effect: "+15% price tolerance" },
      { name: "Award Winning", cost: 300, effect: "+35% price tolerance" },
      { name: "Legendary Recipe", cost: 700, effect: "+60% price tolerance" },
    ],
  },
];

interface UpgradeState {
  [upgradeId: string]: number; // current level index
}

interface DayResult {
  day: number;
  cookiesBaked: number;
  pricePerCookie: number;
  adSpend: number;
  cookiesSold: number;
  revenue: number;
  expenses: number;
  profit: number;
  cashAfter: number;
}

type GameState = "menu" | "playing" | "dayResult" | "gameOver" | "upgrades";

const STARTING_CASH = 100;
const MAX_DAYS = 30;
const BASE_COST_PER_COOKIE = 0.5;

function getBakingCostMultiplier(ovenLevel: number): number {
  return [1.0, 0.85, 0.7, 0.55][ovenLevel] || 1.0;
}

function getCustomerMultiplier(storefrontLevel: number): number {
  return [1.0, 1.2, 1.45, 1.75][storefrontLevel] || 1.0;
}

function getAdMultiplier(adLevel: number): number {
  return [1.0, 1.25, 1.55, 1.9][adLevel] || 1.0;
}

function getPriceToleranceMultiplier(recipeLevel: number): number {
  return [1.0, 1.15, 1.35, 1.6][recipeLevel] || 1.0;
}

function calculateDemand(
  cookiesBaked: number,
  price: number,
  adSpend: number,
  upgrades: UpgradeState
): number {
  const storefrontMult = getCustomerMultiplier(upgrades.storefront);
  const adMult = getAdMultiplier(upgrades.advertising);
  const priceTolerance = getPriceToleranceMultiplier(upgrades.recipe);

  const baseCustomers = (15 + adSpend * 3 * adMult) * storefrontMult;
  const adjustedPrice = price / priceTolerance;
  const priceFactor = Math.max(0, 1.2 - adjustedPrice * 0.35);
  const randomFactor = 0.7 + Math.random() * 0.6;

  const demand = Math.floor(baseCustomers * priceFactor * randomFactor);
  return Math.min(cookiesBaked, Math.max(0, demand));
}

export default function ShopUpgradesGame() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(STARTING_CASH);
  const [cookiesBaked, setCookiesBaked] = useState(50);
  const [pricePerCookie, setPricePerCookie] = useState(1.5);
  const [adSpend, setAdSpend] = useState(10);
  const [upgrades, setUpgrades] = useState<UpgradeState>({
    oven: 0,
    storefront: 0,
    advertising: 0,
    recipe: 0,
  });
  const [lastResult, setLastResult] = useState<DayResult | null>(null);
  const [history, setHistory] = useState<DayResult[]>([]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setDay(1);
    setCash(STARTING_CASH);
    setCookiesBaked(50);
    setPricePerCookie(1.5);
    setAdSpend(10);
    setUpgrades({ oven: 0, storefront: 0, advertising: 0, recipe: 0 });
    setLastResult(null);
    setHistory([]);
  }, []);

  const purchaseUpgrade = (upgradeId: string) => {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId)!;
    const currentLevel = upgrades[upgradeId];
    const nextLevel = currentLevel + 1;

    if (nextLevel >= upgrade.levels.length) return;

    const cost = upgrade.levels[nextLevel].cost;
    if (cash >= cost) {
      setCash(cash - cost);
      setUpgrades({ ...upgrades, [upgradeId]: nextLevel });
    }
  };

  const getEffectiveBakingCost = () => {
    return BASE_COST_PER_COOKIE * getBakingCostMultiplier(upgrades.oven);
  };

  const endDay = useCallback(() => {
    const bakingCost = cookiesBaked * getEffectiveBakingCost();
    const totalExpenses = bakingCost + adSpend;

    if (totalExpenses > cash) return;

    const cookiesSold = calculateDemand(
      cookiesBaked,
      pricePerCookie,
      adSpend,
      upgrades
    );
    const revenue = cookiesSold * pricePerCookie;
    const profit = revenue - totalExpenses;
    const newCash = cash - totalExpenses + revenue;

    const result: DayResult = {
      day,
      cookiesBaked,
      pricePerCookie,
      adSpend,
      cookiesSold,
      revenue,
      expenses: totalExpenses,
      profit,
      cashAfter: newCash,
    };

    setLastResult(result);
    setCash(newCash);
    setHistory((prev) => [...prev, result]);

    if (day >= MAX_DAYS) {
      setGameState("gameOver");
    } else {
      setGameState("dayResult");
    }
  }, [cookiesBaked, pricePerCookie, adSpend, cash, day, upgrades]);

  const nextDay = useCallback(() => {
    setDay((d) => d + 1);
    setGameState("playing");
  }, []);

  const effectiveBakingCost = getEffectiveBakingCost();
  const totalCost = cookiesBaked * effectiveBakingCost + adSpend;
  const canAfford = totalCost <= cash;

  // Menu
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-7xl mb-6">🔥🏪📢📜</div>
          <h1 className="text-4xl font-bold text-amber-900 mb-3">
            Shop Upgrades Tycoon
          </h1>
          <p className="text-xl text-amber-700 mb-8">
            Upgrade your shop to earn more!
          </p>
          <button
            onClick={startGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl px-10 py-4 rounded-xl shadow-lg cursor-pointer"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Game Over
  if (gameState === "gameOver") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-amber-900 mb-6">Game Over!</h1>
          <div className="bg-white/80 rounded-2xl p-6 mb-6 shadow-lg">
            <p className="text-2xl font-bold text-amber-900">
              Final Cash: ${cash.toFixed(2)}
            </p>
            <p className="text-lg text-amber-700 mt-2">
              Profit: ${(cash - STARTING_CASH).toFixed(2)}
            </p>
          </div>
          <button
            onClick={startGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-3 rounded-xl cursor-pointer"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Upgrades Shop
  if (gameState === "upgrades") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-amber-900">🛠️ Upgrades</h1>
            <div className="text-right">
              <p className="text-sm text-amber-600">Cash</p>
              <p className="text-xl font-bold text-amber-900">
                ${cash.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {UPGRADES.map((upgrade) => {
              const currentLevel = upgrades[upgrade.id];
              const maxLevel = upgrade.levels.length - 1;
              const isMaxed = currentLevel >= maxLevel;
              const nextLevelCost = isMaxed
                ? 0
                : upgrade.levels[currentLevel + 1].cost;
              const canAffordUpgrade = cash >= nextLevelCost;

              return (
                <div
                  key={upgrade.id}
                  className="bg-white/80 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{upgrade.emoji}</span>
                      <div>
                        <h3 className="font-bold text-amber-900">
                          {upgrade.name}
                        </h3>
                        <p className="text-sm text-amber-600">
                          {upgrade.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="flex gap-1 mb-3">
                    {upgrade.levels.map((_, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-3 rounded-full ${
                          idx <= currentLevel ? "bg-amber-500" : "bg-amber-200"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Current: {upgrade.levels[currentLevel].name}
                      </p>
                      <p className="text-xs text-amber-600">
                        {upgrade.levels[currentLevel].effect}
                      </p>
                    </div>
                    {!isMaxed && (
                      <button
                        onClick={() => purchaseUpgrade(upgrade.id)}
                        disabled={!canAffordUpgrade}
                        className={`px-4 py-2 rounded-lg font-bold text-sm cursor-pointer ${
                          canAffordUpgrade
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Upgrade ${nextLevelCost}
                      </button>
                    )}
                    {isMaxed && (
                      <span className="text-green-600 font-bold text-sm">
                        ✅ MAX
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setGameState("playing")}
            className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg cursor-pointer"
          >
            ← Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Day Result
  if (gameState === "dayResult" && lastResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <h2 className="text-2xl font-bold text-amber-900 text-center mb-6">
            Day {lastResult.day} Results
          </h2>
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Cookies Sold</span>
                <span className="font-bold">{lastResult.cookiesSold}</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue</span>
                <span className="font-bold text-green-600">
                  +${lastResult.revenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expenses</span>
                <span className="font-bold text-red-600">
                  -${lastResult.expenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Profit</span>
                <span
                  className={`font-bold ${
                    lastResult.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {lastResult.profit >= 0 ? "+" : ""}$
                  {lastResult.profit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={nextDay}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-4 rounded-xl cursor-pointer"
          >
            Next Day →
          </button>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-amber-900">🍪 Upgrade Tycoon</h1>
            <p className="text-sm text-amber-700">Day {day} of {MAX_DAYS}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-600">Cash</p>
            <p className="text-2xl font-bold text-amber-900">${cash.toFixed(2)}</p>
          </div>
        </div>

        {/* Upgrades Button */}
        <button
          onClick={() => setGameState("upgrades")}
          className="w-full mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg cursor-pointer"
        >
          🛠️ Visit Upgrade Shop
        </button>

        {/* Current Upgrades */}
        <div className="bg-white/60 rounded-xl p-3 mb-4 shadow">
          <div className="grid grid-cols-4 gap-2 text-center">
            {UPGRADES.map((upgrade) => (
              <div key={upgrade.id}>
                <div className="text-xl">{upgrade.emoji}</div>
                <div className="text-xs text-amber-700">
                  Lv.{upgrades[upgrade.id]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Panel */}
        <div className="bg-white/80 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">
            Today's Decisions
          </h2>

          <div className="mb-4">
            <label className="text-sm font-medium text-amber-800">
              🍪 Cookies to Bake (${effectiveBakingCost.toFixed(2)}/each)
            </label>
            <input
              type="number"
              min="0"
              value={cookiesBaked}
              onChange={(e) =>
                setCookiesBaked(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-full mt-1 px-3 py-2 border-2 border-amber-300 rounded-lg text-center font-bold"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-amber-800">
              💲 Price per Cookie
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
                $
              </span>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={pricePerCookie}
                onChange={(e) =>
                  setPricePerCookie(
                    Math.max(0, parseFloat(e.target.value) || 0)
                  )
                }
                className="w-full mt-1 px-3 py-2 pl-7 border-2 border-amber-300 rounded-lg text-center font-bold"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-amber-800">
              📢 Advertising Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
                $
              </span>
              <input
                type="number"
                min="0"
                value={adSpend}
                onChange={(e) =>
                  setAdSpend(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-full mt-1 px-3 py-2 pl-7 border-2 border-amber-300 rounded-lg text-center font-bold"
              />
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex justify-between font-bold">
              <span>Total Cost</span>
              <span className={canAfford ? "text-amber-900" : "text-red-600"}>
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={endDay}
          disabled={!canAfford}
          className={`w-full font-bold text-lg px-8 py-4 rounded-xl shadow-lg cursor-pointer ${
            canAfford
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {canAfford ? "Open Shop!" : "Can't Afford!"}
        </button>
      </div>
    </div>
  );
}
