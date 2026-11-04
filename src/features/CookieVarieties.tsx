import { useState, useCallback } from "react";

// Cookie variety definitions
interface CookieVariety {
  id: string;
  name: string;
  emoji: string;
  costPerCookie: number;
  basePrice: number;
  demandMultiplier: number; // How popular this cookie is
  description: string;
}

const COOKIE_VARIETIES: CookieVariety[] = [
  {
    id: "chocolate",
    name: "Chocolate Chip",
    emoji: "🍪",
    costPerCookie: 0.5,
    basePrice: 1.5,
    demandMultiplier: 1.0,
    description: "Classic favorite - steady demand",
  },
  {
    id: "sugar",
    name: "Sugar Cookie",
    emoji: "⭐",
    costPerCookie: 0.4,
    basePrice: 1.25,
    demandMultiplier: 0.9,
    description: "Simple and cheap to make",
  },
  {
    id: "oatmeal",
    name: "Oatmeal Raisin",
    emoji: "🌾",
    costPerCookie: 0.6,
    basePrice: 1.75,
    demandMultiplier: 0.7,
    description: "Health-conscious customers love it",
  },
  {
    id: "doubleChoc",
    name: "Double Chocolate",
    emoji: "🍫",
    costPerCookie: 0.8,
    basePrice: 2.5,
    demandMultiplier: 1.2,
    description: "Premium cookie - high demand",
  },
  {
    id: "peanut",
    name: "Peanut Butter",
    emoji: "🥜",
    costPerCookie: 0.7,
    basePrice: 2.0,
    demandMultiplier: 0.85,
    description: "Nutty and delicious",
  },
  {
    id: "macaron",
    name: "Macaron",
    emoji: "🌈",
    costPerCookie: 1.2,
    basePrice: 3.5,
    demandMultiplier: 1.3,
    description: "Luxury item - very popular",
  },
];

interface DayResult {
  day: number;
  selections: {
    varietyId: string;
    quantity: number;
    price: number;
  }[];
  adSpend: number;
  sales: {
    varietyId: string;
    sold: number;
    revenue: number;
  }[];
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  cashAfter: number;
}

type GameState = "menu" | "playing" | "dayResult" | "gameOver";

const STARTING_CASH = 150; // Higher starting cash for variety game
const MAX_DAYS = 30;

function calculateDemandForVariety(
  variety: CookieVariety,
  quantity: number,
  price: number,
  adSpend: number
): number {
  const baseCustomers = 10 + adSpend * 2;
  const priceFactor = Math.max(0, 1.3 - (price / variety.basePrice) * 0.5);
  const randomFactor = 0.7 + Math.random() * 0.6;
  const demand = Math.floor(
    baseCustomers * priceFactor * randomFactor * variety.demandMultiplier
  );
  return Math.min(quantity, Math.max(0, demand));
}

export default function CookieVarietiesGame() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(STARTING_CASH);
  const [selections, setSelections] = useState<
    { varietyId: string; quantity: number; price: number }[]
  >([]);
  const [adSpend, setAdSpend] = useState(10);
  const [lastResult, setLastResult] = useState<DayResult | null>(null);
  const [history, setHistory] = useState<DayResult[]>([]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setDay(1);
    setCash(STARTING_CASH);
    setSelections([]);
    setAdSpend(10);
    setLastResult(null);
    setHistory([]);
  }, []);

  const addVariety = (varietyId: string) => {
    if (!selections.find((s) => s.varietyId === varietyId)) {
      const variety = COOKIE_VARIETIES.find((v) => v.id === varietyId)!;
      setSelections([
        ...selections,
        { varietyId, quantity: 20, price: variety.basePrice },
      ]);
    }
  };

  const removeVariety = (varietyId: string) => {
    setSelections(selections.filter((s) => s.varietyId !== varietyId));
  };

  const updateSelection = (
    varietyId: string,
    field: "quantity" | "price",
    value: number
  ) => {
    setSelections(
      selections.map((s) => (s.varietyId === varietyId ? { ...s, [field]: value } : s))
    );
  };

  const getTotalCost = () => {
    return selections.reduce((total, sel) => {
      const variety = COOKIE_VARIETIES.find((v) => v.id === sel.varietyId)!;
      return total + sel.quantity * variety.costPerCookie;
    }, adSpend);
  };

  const endDay = useCallback(() => {
    const totalCost = getTotalCost();
    if (totalCost > cash) return;

    const sales: DayResult["sales"] = [];
    let totalRevenue = 0;

    selections.forEach((sel) => {
      const variety = COOKIE_VARIETIES.find((v) => v.id === sel.varietyId)!;
      const sold = calculateDemandForVariety(
        variety,
        sel.quantity,
        sel.price,
        adSpend / selections.length // Split ad budget across varieties
      );
      const revenue = sold * sel.price;
      totalRevenue += revenue;
      sales.push({ varietyId: sel.varietyId, sold, revenue });
    });

    const profit = totalRevenue - totalCost;
    const newCash = cash - totalCost + totalRevenue;

    const result: DayResult = {
      day,
      selections: [...selections],
      adSpend,
      sales,
      totalRevenue,
      totalExpenses: totalCost,
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
  }, [selections, adSpend, cash, day]);

  const nextDay = useCallback(() => {
    setDay((d) => d + 1);
    setGameState("playing");
  }, []);

  const totalCost = getTotalCost();
  const canAfford = totalCost <= cash;

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-7xl mb-6">🍪⭐🌾🍫🥜🌈</div>
          <h1 className="text-4xl font-bold text-amber-900 mb-3">
            Cookie Varieties Tycoon
          </h1>
          <p className="text-xl text-amber-700 mb-8">
            Manage multiple cookie types!
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

  if (gameState === "dayResult" && lastResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <h2 className="text-2xl font-bold text-amber-900 text-center mb-6">
            Day {lastResult.day} Results
          </h2>
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg mb-6">
            <div className="space-y-3">
              {lastResult.sales.map((sale) => {
                const variety = COOKIE_VARIETIES.find(
                  (v) => v.id === sale.varietyId
                )!;
                const sel = lastResult.selections.find(
                  (s) => s.varietyId === sale.varietyId
                )!;
                return (
                  <div
                    key={sale.varietyId}
                    className="flex justify-between items-center border-b border-amber-100 pb-2"
                  >
                    <span>
                      {variety.emoji} {variety.name}
                    </span>
                    <span className="text-amber-700">
                      {sale.sold}/{sel.quantity} sold
                    </span>
                    <span className="font-semibold text-green-600">
                      ${sale.revenue.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-3 border-t-2 border-amber-200">
                <span className="text-lg font-bold">Total Revenue</span>
                <span className="text-lg font-bold text-green-600">
                  ${lastResult.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Profit</span>
                <span
                  className={`text-lg font-bold ${
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-amber-900">
              🍪 Cookie Varieties
            </h1>
            <p className="text-sm text-amber-700">
              Day {day} of {MAX_DAYS}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-600">Cash</p>
            <p className="text-2xl font-bold text-amber-900">
              ${cash.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Available Varieties */}
        <div className="bg-white/80 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-4">
            Available Cookie Types
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COOKIE_VARIETIES.map((variety) => {
              const isSelected = selections.find(
                (s) => s.varietyId === variety.id
              );
              return (
                <button
                  key={variety.id}
                  onClick={() =>
                    isSelected
                      ? removeVariety(variety.id)
                      : addVariety(variety.id)
                  }
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-amber-500 bg-amber-100"
                      : "border-amber-200 bg-white hover:border-amber-400"
                  }`}
                >
                  <div className="text-3xl mb-2">{variety.emoji}</div>
                  <div className="font-bold text-sm text-amber-900">
                    {variety.name}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    Cost: ${variety.costPerCookie.toFixed(2)}
                  </div>
                  <div className="text-xs text-amber-600">
                    Base: ${variety.basePrice.toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Varieties Configuration */}
        {selections.length > 0 && (
          <div className="bg-white/80 rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-lg font-bold text-amber-900 mb-4">
              Your Selections
            </h2>
            <div className="space-y-4">
              {selections.map((sel) => {
                const variety = COOKIE_VARIETIES.find(
                  (v) => v.id === sel.varietyId
                )!;
                return (
                  <div
                    key={sel.varietyId}
                    className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{variety.emoji}</span>
                        <span className="font-bold text-amber-900">
                          {variety.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeVariety(sel.varietyId)}
                        className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-amber-700">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={sel.quantity}
                          onChange={(e) =>
                            updateSelection(
                              sel.varietyId,
                              "quantity",
                              Math.max(0, parseInt(e.target.value) || 0)
                            )
                          }
                          className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg text-center font-bold"
                        />
                        <p className="text-xs text-amber-600 mt-1">
                          Cost: ${(sel.quantity * variety.costPerCookie).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-amber-700">
                          Price per cookie
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
                            $
                          </span>
                          <input
                            type="number"
                            min="0.25"
                            step="0.25"
                            value={sel.price}
                            onChange={(e) =>
                              updateSelection(
                                sel.varietyId,
                                "price",
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )
                            }
                            className="w-full px-3 py-2 pl-7 border-2 border-amber-300 rounded-lg text-center font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Advertising */}
        <div className="bg-white/80 rounded-2xl p-6 shadow-lg mb-6">
          <label className="block text-sm font-medium text-amber-800 mb-2">
            📢 Advertising Budget
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-xl">
              $
            </span>
            <input
              type="number"
              min="0"
              value={adSpend}
              onChange={(e) => setAdSpend(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-3 pl-8 border-2 border-amber-300 rounded-lg text-center text-xl font-bold"
            />
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
          <div className="flex justify-between font-bold text-lg">
            <span>Total Cost</span>
            <span className={canAfford ? "text-amber-900" : "text-red-600"}>
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Open Shop Button */}
        <button
          onClick={endDay}
          disabled={!canAfford || selections.length === 0}
          className={`w-full font-bold text-lg px-8 py-4 rounded-xl shadow-lg cursor-pointer ${
            canAfford && selections.length > 0
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {selections.length === 0
            ? "Select at least one cookie type"
            : canAfford
            ? "Open Shop!"
            : "Can't Afford!"}
        </button>
      </div>
    </div>
  );
}
