import { useState, useCallback, useEffect, useRef } from "react";

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

type GameState = "menu" | "playing" | "animating" | "dayResult" | "gameOver";

const CUSTOMER_EMOJIS = ["🧑", "👩", "👨", "👧", "👦", "🧓", "👴", "👵", "🧒", "👱"];

function calculateDemand(
  cookiesBaked: number,
  price: number,
  adSpend: number
): number {
  const baseCustomers = 15 + adSpend * 3;
  const priceFactor = Math.max(0, 1.2 - price * 0.35);
  const randomFactor = 0.7 + Math.random() * 0.6;
  const demand = Math.floor(baseCustomers * priceFactor * randomFactor);
  return Math.min(cookiesBaked, Math.max(0, demand));
}

interface CustomerData {
  id: number;
  emoji: string;
  side: "left" | "right";
  delay: number;
  speed: number;
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
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [cookiesSoldAnim, setCookiesSoldAnim] = useState(0);
  const [totalCookiesSold, setTotalCookiesSold] = useState(0);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setDay(1);
    setCash(STARTING_CASH);
    setCookiesBaked(50);
    setPricePerCookie(1.5);
    setAdSpend(10);
    setLastResult(null);
    setHistory([]);
    setCustomers([]);
    setCookiesSoldAnim(0);
    setTotalCookiesSold(0);
  }, []);

  const endDay = useCallback(() => {
    const bakingCost = cookiesBaked * COST_PER_COOKIE;
    const totalExpenses = bakingCost + adSpend;

    if (totalExpenses > cash) return;

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
    setTotalCookiesSold(cookiesSold);

    // Generate customers for animation
    const numVisualCustomers = Math.min(cookiesSold, 20); // Cap visual customers at 20
    const newCustomers: CustomerData[] = [];
    for (let i = 0; i < numVisualCustomers; i++) {
      newCustomers.push({
        id: i,
        emoji: CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)],
        side: Math.random() > 0.5 ? "left" : "right",
        delay: i * 250 + Math.random() * 150,
        speed: 1.8 + Math.random() * 0.7,
      });
    }
    setCustomers(newCustomers);
    setCookiesSoldAnim(0);
    setGameState("animating");

    // Animate cookie counter - spread across the animation duration
    const totalAnimDuration = numVisualCustomers * 250 + 2200;
    const incrementTime = totalAnimDuration / (cookiesSold + 1);
    for (let i = 0; i <= cookiesSold; i++) {
      const timeout = setTimeout(() => {
        setCookiesSoldAnim(i);
      }, i * incrementTime + 300);
      animTimeoutRef.current.push(timeout);
    }

    // After animation, show results
    const endTimeout = setTimeout(() => {
      if (day >= MAX_DAYS) {
        setGameState("gameOver");
      } else {
        setGameState("dayResult");
      }
    }, totalAnimDuration + 500);
    animTimeoutRef.current.push(endTimeout);
  }, [cookiesBaked, pricePerCookie, adSpend, cash, day]);

  const skipAnimation = useCallback(() => {
    // Clear all pending timeouts
    animTimeoutRef.current.forEach(clearTimeout);
    animTimeoutRef.current = [];
    // Set final values
    if (lastResult) {
      setCookiesSoldAnim(lastResult.cookiesSold);
    }
    // Transition to results after a brief moment
    setTimeout(() => {
      if (day >= MAX_DAYS) {
        setGameState("gameOver");
      } else {
        setGameState("dayResult");
      }
    }, 300);
  }, [lastResult, day]);

  useEffect(() => {
    return () => {
      animTimeoutRef.current.forEach(clearTimeout);
    };
  }, []);

  const nextDay = useCallback(() => {
    setDay((d) => d + 1);
    setGameState("playing");
    setCustomers([]);
    setCookiesSoldAnim(0);
  }, []);

  const maxCookiesAffordable = Math.floor(
    (cash - adSpend) / COST_PER_COOKIE
  );
  const totalCost = cookiesBaked * COST_PER_COOKIE + adSpend;
  const canAfford = totalCost <= cash && cookiesBaked >= 0 && cookiesBaked <= maxCookiesAffordable;

  // Menu Screen
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-7xl mb-6 animate-bounce">🍪</div>
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
    const totalCookiesSoldAll = history.reduce((sum, r) => sum + r.cookiesSold, 0);

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
                  {totalCookiesSoldAll}
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

  // Animating Screen - Customers arriving
  if (gameState === "animating" && lastResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 flex flex-col items-center justify-end p-4 overflow-hidden relative">
        {/* Sky elements */}
        <div className="absolute top-8 left-10 text-4xl opacity-60 animate-pulse">☁️</div>
        <div className="absolute top-16 right-20 text-3xl opacity-40 animate-pulse" style={{ animationDelay: "1s" }}>☁️</div>
        <div className="absolute top-6 right-40 text-2xl opacity-50 animate-pulse" style={{ animationDelay: "0.5s" }}>☁️</div>
        <div className="absolute top-20 left-1/3 text-3xl opacity-30 animate-pulse" style={{ animationDelay: "1.5s" }}>☁️</div>

        {/* Day & Stats Header */}
        <div className="text-center mb-4 z-10">
          <h2 className="text-xl font-bold text-amber-900">Day {day}</h2>
          <p className="text-amber-700 text-sm">Shop is open!</p>
        </div>

        {/* Cookie counter */}
        <div className="bg-white/90 backdrop-blur rounded-xl px-6 py-3 shadow-lg mb-4 z-10">
          <p className="text-center text-amber-900 font-bold">
            🍪 Cookies Sold: <span className="text-2xl text-green-600">{cookiesSoldAnim}</span> / {lastResult.cookiesSold}
          </p>
        </div>

        {/* Full-width scene area */}
        <div className="relative w-full flex-1 max-h-80 flex items-end justify-center">
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-400 to-green-200" />
          <div className="absolute bottom-16 left-0 right-0 h-4 bg-amber-300/50" />

          {/* Shop Building - centered */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-44 md:w-52 z-10">
            {/* Roof */}
            <div className="w-full h-10 bg-red-600 rounded-t-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-red-500 to-red-700" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-800 rounded-full border-2 border-red-900" />
            </div>
            {/* Awning */}
            <div className="w-full h-7 bg-gradient-to-b from-red-400 to-red-500 flex items-center justify-center shadow-md">
              <div className="flex w-full">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? "bg-red-500" : "bg-white/80"}`} />
                ))}
              </div>
              <span className="absolute text-[10px] font-bold text-white drop-shadow">KEVIN'S COOKIES</span>
            </div>
            {/* Shop body */}
            <div className="w-full h-36 bg-amber-100 border-x-2 border-b-2 border-amber-300 relative overflow-hidden">
              {/* Brick pattern */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border-b border-amber-600 h-6" />
                ))}
              </div>
              {/* Windows */}
              <div className="absolute top-4 left-3 w-11 h-11 bg-sky-100 border-2 border-amber-500 rounded-sm flex items-center justify-center shadow-inner">
                <span className="text-base">🍪</span>
              </div>
              <div className="absolute top-4 right-3 w-11 h-11 bg-sky-100 border-2 border-amber-500 rounded-sm flex items-center justify-center shadow-inner">
                <span className="text-base">🍪</span>
              </div>
              {/* Door */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-24 bg-amber-700 border-2 border-amber-800 rounded-t-lg flex flex-col items-center">
                <div className="mt-1 text-[7px] text-amber-200 font-bold tracking-wider">OPEN</div>
                <div className="flex-1" />
                <div className="absolute top-10 right-2 w-2.5 h-2.5 bg-yellow-400 rounded-full shadow-sm" />
              </div>
              {/* Welcome mat */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-3 bg-amber-800 rounded-sm" />
            </div>
          </div>

          {/* Customers walking in - positioned in full viewport */}
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={`absolute bottom-16 text-3xl md:text-4xl z-20 ${
                customer.side === "left" ? "customer-walk-left" : "customer-walk-right"
              }`}
              style={{
                animationDelay: `${customer.delay}ms`,
                animationDuration: `${customer.speed}s`,
                ...(customer.side === "left"
                  ? { left: "5%" }
                  : { right: "5%" }),
              }}
            >
              {customer.emoji}
            </div>
          ))}

          {/* Floating cookie when sold */}
          {cookiesSoldAnim > 0 && (
            <div className="absolute bottom-52 left-1/2 -translate-x-1/2 text-3xl z-30 animate-bounce pointer-events-none">
              🍪
            </div>
          )}

          {/* Cash register sound effect indicator */}
          {cookiesSoldAnim > 0 && cookiesSoldAnim % 5 === 0 && (
            <div className="absolute bottom-56 left-1/2 -translate-x-1/2 text-sm font-bold text-green-600 z-30 animate-ping">
              💰
            </div>
          )}
        </div>

        {/* Revenue counter */}
        <div className="mt-4 mb-3 bg-white/90 backdrop-blur rounded-xl px-6 py-3 shadow-lg z-10">
          <p className="text-center text-amber-900 font-bold">
            💰 Revenue: <span className="text-green-600">${(cookiesSoldAnim * lastResult.pricePerCookie).toFixed(2)}</span>
          </p>
        </div>

        {/* Skip button */}
        <button
          onClick={skipAnimation}
          className="mb-4 text-sm text-amber-600 hover:text-amber-800 underline cursor-pointer z-10 transition-colors"
        >
          Skip animation →
        </button>
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCookiesBaked(Math.max(0, cookiesBaked - 10))}
                className="bg-amber-200 hover:bg-amber-300 text-amber-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max={Math.max(0, maxCookiesAffordable)}
                value={cookiesBaked}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setCookiesBaked(Math.max(0, val));
                }}
                className="flex-1 text-center text-xl font-bold text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
              <button
                onClick={() => setCookiesBaked(Math.min(maxCookiesAffordable, cookiesBaked + 10))}
                className="bg-amber-200 hover:bg-amber-300 text-amber-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              Baking cost: ${(cookiesBaked * COST_PER_COOKIE).toFixed(2)} • Max you can afford: {Math.max(0, maxCookiesAffordable)}
            </p>
          </div>

          {/* Price per Cookie */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-amber-800 mb-2">
              💲 Price per Cookie
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPricePerCookie(Math.max(0.25, +(pricePerCookie - 0.25).toFixed(2)))}
                className="bg-amber-200 hover:bg-amber-300 text-amber-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                −
              </button>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-xl">$</span>
                <input
                  type="number"
                  min="0.25"
                  max="10"
                  step="0.25"
                  value={pricePerCookie}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setPricePerCookie(Math.max(0, +val.toFixed(2)));
                  }}
                  className="w-full text-center text-xl font-bold text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-lg px-8 py-2 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <button
                onClick={() => setPricePerCookie(Math.min(10, +(pricePerCookie + 0.25).toFixed(2)))}
                className="bg-amber-200 hover:bg-amber-300 text-amber-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAdSpend(Math.max(0, adSpend - 5))}
                className="bg-amber-200 hover:bg-amber-300 text-amber-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                −
              </button>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-xl">$</span>
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, Math.floor(cash - cookiesBaked * COST_PER_COOKIE))}
                  value={adSpend}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setAdSpend(Math.max(0, val));
                  }}
                  className="w-full text-center text-xl font-bold text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-lg px-8 py-2 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <button
                onClick={() => setAdSpend(Math.min(Math.floor(cash - cookiesBaked * COST_PER_COOKIE), adSpend + 5))}
                className="bg-amber-200 hover:bg-amber-300 text-amber-800 font-bold w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">
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
