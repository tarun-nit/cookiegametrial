import { useState, useCallback } from "react";

// Game constants
const STARTING_CASH = 100;
const MAX_DAYS = 30;
const COST_PER_COOKIE = 0.5;

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

type GameState = "menu" | "playing" | "dayResult" | "gameOver";

function calculateDemand(
  cookiesBaked: number,
  price: number,
  adSpend: number
): number {
  // Base customers influenced by advertising
  const baseCustomers = 15 + adSpend * 3;

  // Price sensitivity: lower price = more demand
  // At $1.00 price factor is ~1.0, at $3.00 it drops significantly
  const priceFactor = Math.max(0, 1.2 - price * 0.35);

  // Random daily variation (weather, competition, etc.)
  const randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3

  const demand = Math.floor(baseCustomers * priceFactor * randomFactor);
  return Math.min(cookiesBaked, Math.max(0, demand));
}

function App() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(STARTING_CASH);
  const [cookiesBaked, setCookiesBaked] = useState(50);
  const [pricePerCookie, setPricePerCookie] = useState(1.5);
  const [adSpend, setAdSpend] = useState(10);
  const [lastResult, setLastResult] = useState<DayResult | null>(null);
  const [history, setHistory] = useState<DayResult[]>([]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setDay(1);
    setCash(STARTING_CASH);
    setCookiesBaked(50);
    setPricePerCookie(1.5);
    setAdSpend(10);
    setLastResult(null);
    setHistory([]);
  }, []);

  const endDay = useCallback(() => {
    const bakingCost = cookiesBaked * COST_PER_COOKIE;
    const totalExpenses = bakingCost + adSpend;

    if (totalExpenses > cash) return; // Can't afford it

    const cookiesSold = calculateDemand(cookiesBaked, pricePerCookie, adSpend);
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
  }, [cookiesBaked, pricePerCookie, adSpend, cash, day]);

  const nextDay = useCallback(() => {
    setDay((d) => d + 1);
    setGameState("playing");
  }, []);

  const maxCookiesAffordable = Math.floor(
    (cash - adSpend) / COST_PER_COOKIE
  );
  const totalCost = cookiesBaked * COST_PER_COOKIE + adSpend;
  const canAfford = totalCost <= cash;

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-7xl mb-6">🍪</div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-3">
            Kevin's Cookie Shop
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-amber-700 mb-8">
            Tycoon
          </h2>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-8 shadow-lg text-left space-y-3">
            <h3 className="font-bold text-amber-900 text-lg text-center mb-4">
              How to Play
            </h3>
            <p className="text-amber-800">
              🏪 You start with <strong>${STARTING_CASH}</strong> and run your
              cookie shop for <strong>{MAX_DAYS} days</strong>.
            </p>
            <p className="text-amber-800">
              📋 Each day, decide how many cookies to bake (
              <strong>${COST_PER_COOKIE.toFixed(2)}</strong>/cookie), set your
              price, and choose an advertising budget.
            </p>
            <p className="text-amber-800">
              💡 Lower prices attract more customers. Advertising increases
              foot traffic.
            </p>
            <p className="text-amber-800">
              🎯 Your goal: maximize your total cash by day {MAX_DAYS}!
            </p>
          </div>
          <button
            onClick={startGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
          >
            Start Baking! 🧁
          </button>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === "gameOver") {
    const totalRevenue = history.reduce((sum, r) => sum + r.revenue, 0);
    const totalExpenses = history.reduce((sum, r) => sum + r.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const totalCookiesSold = history.reduce((sum, r) => sum + r.cookiesSold, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-7xl mb-4">
            {cash > STARTING_CASH ? "🏆" : cash > 0 ? "🍪" : "😢"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">
            {cash > STARTING_CASH
              ? "Amazing Run!"
              : cash > 0
              ? "Shop Closed!"
              : "Bankrupt!"}
          </h1>
          <p className="text-amber-700 mb-6">
            {MAX_DAYS} days of cookie selling are over.
          </p>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6 shadow-lg">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-amber-600">Final Cash</p>
                <p className="text-2xl font-bold text-amber-900">
                  ${cash.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-amber-600">Total Profit</p>
                <p
                  className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-amber-600">Total Revenue</p>
                <p className="text-xl font-bold text-amber-900">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-amber-600">Cookies Sold</p>
                <p className="text-xl font-bold text-amber-900">
                  {totalCookiesSold}
                </p>
              </div>
              <div>
                <p className="text-sm text-amber-600">Total Expenses</p>
                <p className="text-xl font-bold text-red-600">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-amber-600">Starting Cash</p>
                <p className="text-xl font-bold text-amber-900">
                  ${STARTING_CASH.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
          >
            Play Again 🔄
          </button>
        </div>
      </div>
    );
  }

  // Day Result Screen
  if (gameState === "dayResult" && lastResult) {
    const unsold = lastResult.cookiesBaked - lastResult.cookiesSold;
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900">
              Day {lastResult.day} Results
            </h2>
            <p className="text-amber-700">
              {MAX_DAYS - lastResult.day} days remaining
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-amber-700">🍪 Cookies Baked</span>
                <span className="font-semibold text-amber-900">
                  {lastResult.cookiesBaked}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-amber-700">✅ Cookies Sold</span>
                <span className="font-semibold text-amber-900">
                  {lastResult.cookiesSold}
                </span>
              </div>
              {unsold > 0 && (
                <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                  <span className="text-amber-700">🗑️ Unsold (wasted)</span>
                  <span className="font-semibold text-orange-600">
                    {unsold}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-amber-700">💰 Revenue</span>
                <span className="font-semibold text-green-600">
                  +${lastResult.revenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-amber-700">💸 Expenses</span>
                <span className="font-semibold text-red-600">
                  -${lastResult.expenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-amber-900">
                  📊 Profit
                </span>
                <span
                  className={`text-lg font-bold ${lastResult.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {lastResult.profit >= 0 ? "+" : ""}${lastResult.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                <span className="text-lg font-bold text-amber-900">
                  💵 Cash on Hand
                </span>
                <span className="text-lg font-bold text-amber-900">
                  ${lastResult.cashAfter.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={nextDay}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            Next Day →
          </button>
        </div>
      </div>
    );
  }

  // Playing Screen (Day Planning)
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-amber-900">🍪 Kevin's Cookie Shop</h1>
            <p className="text-sm text-amber-700">Day {day} of {MAX_DAYS}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-amber-600">Cash</p>
            <p className="text-2xl font-bold text-amber-900">${cash.toFixed(2)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-amber-200 rounded-full h-2 mb-6">
          <div
            className="bg-amber-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(day / MAX_DAYS) * 100}%` }}
          />
        </div>

        {/* Decision Panel */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-5">
            Today's Decisions
          </h2>

          {/* Cookies to Bake */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-amber-800 mb-2">
              🍪 Cookies to Bake
              <span className="text-amber-500 ml-2">
                (${COST_PER_COOKIE.toFixed(2)} each)
              </span>
            </label>
            <input
              type="range"
              min="0"
              max={Math.max(0, maxCookiesAffordable)}
              value={Math.min(cookiesBaked, Math.max(0, maxCookiesAffordable))}
              onChange={(e) => setCookiesBaked(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-amber-500">0</span>
              <span className="text-sm font-semibold text-amber-900">
                {cookiesBaked} cookies
              </span>
              <span className="text-xs text-amber-500">
                {Math.max(0, maxCookiesAffordable)}
              </span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Baking cost: ${(cookiesBaked * COST_PER_COOKIE).toFixed(2)}
            </p>
          </div>

          {/* Price per Cookie */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-amber-800 mb-2">
              💲 Price per Cookie
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.25"
              value={pricePerCookie}
              onChange={(e) => setPricePerCookie(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-amber-500">$0.50</span>
              <span className="text-sm font-semibold text-amber-900">
                ${pricePerCookie.toFixed(2)}
              </span>
              <span className="text-xs text-amber-500">$5.00</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {pricePerCookie <= 1.5
                ? "🟢 Great value — customers love it!"
                : pricePerCookie <= 2.5
                  ? "🟡 Fair price — moderate demand"
                  : pricePerCookie <= 3.5
                    ? "🟠 Pricey — fewer buyers"
                    : "🔴 Expensive — very few buyers"}
            </p>
          </div>

          {/* Advertising */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-amber-800 mb-2">
              📢 Advertising Budget
            </label>
            <input
              type="range"
              min="0"
              max={Math.max(0, Math.floor(cash - cookiesBaked * COST_PER_COOKIE))}
              value={Math.min(adSpend, Math.max(0, Math.floor(cash - cookiesBaked * COST_PER_COOKIE)))}
              onChange={(e) => setAdSpend(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-amber-500">$0</span>
              <span className="text-sm font-semibold text-amber-900">
                ${adSpend}
              </span>
              <span className="text-xs text-amber-500">
                ${Math.max(0, Math.floor(cash - cookiesBaked * COST_PER_COOKIE))}
              </span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              {adSpend === 0
                ? "📭 No ads — only walk-in customers"
                : adSpend <= 10
                  ? "📰 Small ads — some extra customers"
                  : adSpend <= 25
                    ? "📺 Good reach — more foot traffic"
                    : "🌟 Heavy advertising — lots of customers!"}
            </p>
          </div>

          {/* Cost Summary */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h3 className="text-sm font-bold text-amber-900 mb-2">
              Cost Summary
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">
                  Baking ({cookiesBaked} × ${COST_PER_COOKIE.toFixed(2)})
                </span>
                <span className="text-amber-900">
                  ${(cookiesBaked * COST_PER_COOKIE).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Advertising</span>
                <span className="text-amber-900">${adSpend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-amber-200 pt-1 mt-1">
                <span className="text-amber-900">Total Cost</span>
                <span className={canAfford ? "text-amber-900" : "text-red-600"}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Open Shop Button */}
        <button
          onClick={endDay}
          disabled={!canAfford}
          className={`w-full font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-all duration-200 cursor-pointer ${
            canAfford
              ? "bg-amber-600 hover:bg-amber-700 text-white hover:shadow-xl transform hover:scale-[1.02]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {canAfford ? "Open Shop for the Day! 🏪" : "Can't Afford This! 😰"}
        </button>

        {!canAfford && (
          <p className="text-center text-red-600 text-sm mt-2">
            Reduce cookies or advertising to fit your budget.
          </p>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-amber-900 mb-2">
              Recent History
            </h3>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4 shadow">
              <div className="space-y-2">
                {history
                  .slice(-5)
                  .reverse()
                  .map((r) => (
                    <div
                      key={r.day}
                      className="flex justify-between items-center text-sm border-b border-amber-100 last:border-0 pb-1"
                    >
                      <span className="text-amber-700">Day {r.day}</span>
                      <span className="text-amber-700">
                        {r.cookiesSold} sold
                      </span>
                      <span
                        className={`font-semibold ${r.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {r.profit >= 0 ? "+" : ""}${r.profit.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
