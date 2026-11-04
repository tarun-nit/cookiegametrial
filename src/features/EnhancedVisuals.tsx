import { useState, useCallback, useEffect, useRef } from "react";

// Game constants (same as original)
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

interface CustomerData {
  id: number;
  emoji: string;
  side: "left" | "right";
  delay: number;
  speed: number;
  hasCookie: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  delay: number;
}

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

export default function EnhancedVisualsGame() {
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
  const [particles, setParticles] = useState<Particle[]>([]);
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
    setParticles([]);
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

    // Generate customers with enhanced variety
    const numVisualCustomers = Math.min(cookiesSold, 25);
    const newCustomers: CustomerData[] = [];
    for (let i = 0; i < numVisualCustomers; i++) {
      newCustomers.push({
        id: i,
        emoji: CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)],
        side: Math.random() > 0.5 ? "left" : "right",
        delay: i * 200 + Math.random() * 100,
        speed: 1.5 + Math.random() * 0.8,
        hasCookie: true,
      });
    }
    setCustomers(newCustomers);
    setCookiesSoldAnim(0);
    setGameState("animating");

    // Generate celebration particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: i,
        x: 30 + Math.random() * 40,
        y: 20 + Math.random() * 30,
        emoji: ["🍪", "💰", "✨", "🎉", "⭐"][Math.floor(Math.random() * 5)],
        delay: Math.random() * 2000,
      });
    }
    setParticles(newParticles);

    // Animate cookie counter
    const totalAnimDuration = numVisualCustomers * 200 + 2000;
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
    animTimeoutRef.current.forEach(clearTimeout);
    animTimeoutRef.current = [];
    if (lastResult) {
      setCookiesSoldAnim(lastResult.cookiesSold);
    }
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
    setParticles([]);
  }, []);

  const maxCookiesAffordable = Math.floor(
    (cash - adSpend) / COST_PER_COOKIE
  );
  const totalCost = cookiesBaked * COST_PER_COOKIE + adSpend;
  const canAfford = totalCost <= cash && cookiesBaked >= 0 && cookiesBaked <= maxCookiesAffordable;

  // Menu Screen with enhanced visuals
  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background cookies */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              🍪
            </div>
          ))}
        </div>

        <div className="max-w-lg w-full text-center relative z-10">
          <div className="text-8xl mb-6 animate-bounce-slow">🍪</div>
          <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-3 drop-shadow-lg">
            Kevin's Cookie Shop
          </h1>
          <h2 className="text-3xl font-semibold text-amber-700 mb-8">
            Tycoon
          </h2>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 mb-8 shadow-2xl text-left space-y-4 border-2 border-amber-200">
            <h3 className="font-bold text-amber-900 text-xl text-center mb-4">
              How to Play
            </h3>
            <p className="text-amber-800 flex items-start gap-2">
              <span className="text-2xl">🏪</span>
              <span>You start with <strong>${STARTING_CASH}</strong> and run your cookie shop for <strong>{MAX_DAYS} days</strong>.</span>
            </p>
            <p className="text-amber-800 flex items-start gap-2">
              <span className="text-2xl">📋</span>
              <span>Each day, decide how many cookies to bake, set your price, and choose an advertising budget.</span>
            </p>
            <p className="text-amber-800 flex items-start gap-2">
              <span className="text-2xl">💡</span>
              <span>Lower prices attract more customers. Advertising increases foot traffic.</span>
            </p>
            <p className="text-amber-800 flex items-start gap-2">
              <span className="text-2xl">🎯</span>
              <span>Your goal: maximize your total cash by day {MAX_DAYS}!</span>
            </p>
          </div>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-2xl px-12 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 cursor-pointer"
          >
            Start Baking! 🧁
          </button>
        </div>
      </div>
    );
  }

  // Game Over Screen with enhanced visuals
  if (gameState === "gameOver") {
    const totalRevenue = history.reduce((sum, r) => sum + r.revenue, 0);
    const totalExpenses = history.reduce((sum, r) => sum + r.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const totalCookiesSoldAll = history.reduce((sum, r) => sum + r.cookiesSold, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Celebration particles */}
        {cash > STARTING_CASH && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute text-3xl animate-float-up"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              >
                {["🎉", "✨", "🌟", "💫"][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        )}

        <div className="max-w-lg w-full text-center relative z-10">
          <div className="text-8xl mb-4 animate-bounce-slow">
            {cash > STARTING_CASH ? "🏆" : cash > 0 ? "🍪" : "😢"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2 drop-shadow-lg">
            {cash > STARTING_CASH
              ? "Amazing Run!"
              : cash > 0
              ? "Shop Closed!"
              : "Bankrupt!"}
          </h1>
          <p className="text-xl text-amber-700 mb-6">
            {MAX_DAYS} days of cookie selling are over.
          </p>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 mb-6 shadow-2xl border-2 border-amber-200">
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-600">Final Cash</p>
                <p className="text-3xl font-bold text-amber-900">
                  ${cash.toFixed(2)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-600">Total Profit</p>
                <p
                  className={`text-3xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-600">Total Revenue</p>
                <p className="text-2xl font-bold text-amber-900">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-600">Cookies Sold</p>
                <p className="text-2xl font-bold text-amber-900">
                  {totalCookiesSoldAll}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xl px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
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
            <h2 className="text-3xl font-bold text-amber-900">
              Day {lastResult.day} Results
            </h2>
            <p className="text-amber-700">
              {MAX_DAYS - lastResult.day} days remaining
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl mb-6 border-2 border-amber-200">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-amber-700">🍪 Cookies Baked</span>
                <span className="font-semibold text-amber-900 text-lg">
                  {lastResult.cookiesBaked}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-amber-700">✅ Cookies Sold</span>
                <span className="font-semibold text-amber-900 text-lg">
                  {lastResult.cookiesSold}
                </span>
              </div>
              {unsold > 0 && (
                <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                  <span className="text-amber-700">🗑️ Unsold (wasted)</span>
                  <span className="font-semibold text-orange-600 text-lg">
                    {unsold}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-amber-700">💰 Revenue</span>
                <span className="font-semibold text-green-600 text-lg">
                  +${lastResult.revenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                <span className="text-amber-700">💸 Expenses</span>
                <span className="font-semibold text-red-600 text-lg">
                  -${lastResult.expenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-bold text-amber-900">
                  📊 Profit
                </span>
                <span
                  className={`text-xl font-bold ${lastResult.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {lastResult.profit >= 0 ? "+" : ""}${lastResult.profit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-amber-200">
                <span className="text-xl font-bold text-amber-900">
                  💵 Cash on Hand
                </span>
                <span className="text-xl font-bold text-amber-900">
                  ${lastResult.cashAfter.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={nextDay}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xl px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            Next Day →
          </button>
        </div>
      </div>
    );
  }

  // Animating Screen - Enhanced with particles and effects
  if (gameState === "animating" && lastResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-100 to-amber-50 flex flex-col items-center justify-end p-4 overflow-hidden relative">
        {/* Animated clouds */}
        <div className="absolute top-8 left-10 text-5xl opacity-70 animate-float-slow">☁️</div>
        <div className="absolute top-16 right-20 text-4xl opacity-50 animate-float-slow" style={{ animationDelay: "1s" }}>☁️</div>
        <div className="absolute top-6 right-40 text-3xl opacity-60 animate-float-slow" style={{ animationDelay: "0.5s" }}>☁️</div>
        <div className="absolute top-20 left-1/3 text-4xl opacity-40 animate-float-slow" style={{ animationDelay: "1.5s" }}>☁️</div>

        {/* Celebration particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-3xl animate-float-up pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}ms`,
            }}
          >
            {particle.emoji}
          </div>
        ))}

        {/* Day & Stats Header */}
        <div className="text-center mb-4 z-10">
          <h2 className="text-2xl font-bold text-amber-900 drop-shadow">Day {day}</h2>
          <p className="text-amber-700 text-sm">Shop is open!</p>
        </div>

        {/* Cookie counter with glow effect */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-4 shadow-2xl mb-4 z-10 border-2 border-amber-300">
          <p className="text-center text-amber-900 font-bold text-lg">
            🍪 Cookies Sold: <span className="text-3xl text-green-600 animate-pulse">{cookiesSoldAnim}</span> / {lastResult.cookiesSold}
          </p>
        </div>

        {/* Full-width scene area */}
        <div className="relative w-full flex-1 max-h-96 flex items-end justify-center">
          {/* Ground with gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-500 to-green-300" />
          <div className="absolute bottom-20 left-0 right-0 h-4 bg-amber-400/60" />

          {/* Enhanced Shop Building */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-52 md:w-60 z-10">
            {/* Animated sign */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 px-4 py-1 rounded-full shadow-lg animate-pulse-slow">
              <span className="text-xs font-bold text-amber-900">OPEN!</span>
            </div>
            
            {/* Roof with pattern */}
            <div className="w-full h-12 bg-gradient-to-b from-red-500 to-red-700 rounded-t-xl relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="absolute w-2 h-full bg-red-900" style={{ left: `${i * 12.5}%` }} />
                ))}
              </div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-800 rounded-full border-3 border-red-900 shadow-inner" />
            </div>
            
            {/* Striped awning */}
            <div className="w-full h-8 bg-gradient-to-b from-red-400 to-red-500 flex items-center justify-center shadow-md relative">
              <div className="flex w-full h-full">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? "bg-red-500" : "bg-white/90"}`} />
                ))}
              </div>
              <span className="absolute text-xs font-bold text-white drop-shadow-lg tracking-wider">KEVIN'S COOKIES</span>
            </div>
            
            {/* Shop body with brick pattern */}
            <div className="w-full h-40 bg-amber-100 border-x-2 border-b-2 border-amber-300 relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 opacity-10">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border-b border-amber-600 h-5" />
                ))}
              </div>
              
              {/* Windows with glow */}
              <div className="absolute top-4 left-3 w-12 h-12 bg-gradient-to-br from-sky-100 to-sky-200 border-2 border-amber-500 rounded-sm flex items-center justify-center shadow-inner">
                <span className="text-xl animate-pulse-slow">🍪</span>
              </div>
              <div className="absolute top-4 right-3 w-12 h-12 bg-gradient-to-br from-sky-100 to-sky-200 border-2 border-amber-500 rounded-sm flex items-center justify-center shadow-inner">
                <span className="text-xl animate-pulse-slow" style={{ animationDelay: "0.5s" }}>🍪</span>
              </div>
              
              {/* Door with details */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-26 bg-gradient-to-b from-amber-700 to-amber-800 border-2 border-amber-900 rounded-t-lg flex flex-col items-center shadow-lg">
                <div className="mt-1 text-[8px] text-amber-200 font-bold tracking-wider">OPEN</div>
                <div className="flex-1" />
                <div className="absolute top-12 right-2 w-3 h-3 bg-yellow-400 rounded-full shadow-md animate-pulse" />
              </div>
              
              {/* Welcome mat */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-amber-900 rounded-sm shadow" />
            </div>
          </div>

          {/* Enhanced Customers */}
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={`absolute bottom-20 text-4xl md:text-5xl z-20 ${
                customer.side === "left" ? "customer-walk-left-enhanced" : "customer-walk-right-enhanced"
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

          {/* Floating cookie with enhanced animation */}
          {cookiesSoldAnim > 0 && (
            <div className="absolute bottom-60 left-1/2 -translate-x-1/2 text-4xl z-30 animate-bounce-enhanced pointer-events-none drop-shadow-lg">
              🍪
            </div>
          )}

          {/* Cash register effect */}
          {cookiesSoldAnim > 0 && cookiesSoldAnim % 3 === 0 && (
            <div className="absolute bottom-64 left-1/2 -translate-x-1/2 text-2xl z-30 animate-ping-fast pointer-events-none">
              💰
            </div>
          )}
        </div>

        {/* Revenue counter with enhanced styling */}
        <div className="mt-4 mb-3 bg-white/95 backdrop-blur-md rounded-2xl px-8 py-4 shadow-2xl z-10 border-2 border-amber-300">
          <p className="text-center text-amber-900 font-bold text-lg">
            💰 Revenue: <span className="text-2xl text-green-600">${(cookiesSoldAnim * lastResult.pricePerCookie).toFixed(2)}</span>
          </p>
        </div>

        {/* Skip button */}
        <button
          onClick={skipAnimation}
          className="mb-4 text-sm text-amber-600 hover:text-amber-800 underline cursor-pointer z-10 transition-colors font-semibold"
        >
          Skip animation →
        </button>
      </div>
    );
  }

  // Playing Screen with enhanced visuals
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-amber-900 drop-shadow">🍪 Kevin's Cookie Shop</h1>
            <p className="text-sm text-amber-700">Day {day} of {MAX_DAYS}</p>
          </div>
          <div className="text-right bg-amber-100 rounded-xl px-4 py-2">
            <p className="text-xs text-amber-600">Cash</p>
            <p className="text-3xl font-bold text-amber-900">${cash.toFixed(2)}</p>
          </div>
        </div>

        {/* Enhanced Progress bar */}
        <div className="w-full bg-amber-200 rounded-full h-3 mb-6 shadow-inner">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-300 shadow-lg"
            style={{ width: `${(day / MAX_DAYS) * 100}%` }}
          />
        </div>

        {/* Decision Panel with enhanced styling */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-2xl mb-6 border-2 border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-5">
            Today's Decisions
          </h2>

          {/* Cookies to Bake */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-800 mb-2">
              🍪 Cookies to Bake
              <span className="text-amber-500 ml-2">
                (${COST_PER_COOKIE.toFixed(2)} each)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCookiesBaked(Math.max(0, cookiesBaked - 10))}
                className="bg-gradient-to-br from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-800 font-bold w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md hover:shadow-lg"
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
                className="flex-1 text-center text-2xl font-bold text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-xl px-3 py-3 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200 shadow-inner"
              />
              <button
                onClick={() => setCookiesBaked(Math.min(maxCookiesAffordable, cookiesBaked + 10))}
                className="bg-gradient-to-br from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-800 font-bold w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md hover:shadow-lg"
              >
                +
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              Baking cost: ${(cookiesBaked * COST_PER_COOKIE).toFixed(2)} • Max you can afford: {Math.max(0, maxCookiesAffordable)}
            </p>
          </div>

          {/* Price per Cookie */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-800 mb-2">
              💲 Price per Cookie
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPricePerCookie(Math.max(0.25, +(pricePerCookie - 0.25).toFixed(2)))}
                className="bg-gradient-to-br from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-800 font-bold w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md hover:shadow-lg"
              >
                −
              </button>
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 text-2xl">$</span>
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
                  className="w-full text-center text-2xl font-bold text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-xl px-10 py-3 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200 shadow-inner"
                />
              </div>
              <button
                onClick={() => setPricePerCookie(Math.min(10, +(pricePerCookie + 0.25).toFixed(2)))}
                className="bg-gradient-to-br from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-800 font-bold w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md hover:shadow-lg"
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-800 mb-2">
              📢 Advertising Budget
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAdSpend(Math.max(0, adSpend - 5))}
                className="bg-gradient-to-br from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-800 font-bold w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md hover:shadow-lg"
              >
                −
              </button>
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 text-2xl">$</span>
                <input
                  type="number"
                  min="0"
                  max={Math.max(0, Math.floor(cash - cookiesBaked * COST_PER_COOKIE))}
                  value={adSpend}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setAdSpend(Math.max(0, val));
                  }}
                  className="w-full text-center text-2xl font-bold text-amber-900 bg-amber-50 border-2 border-amber-300 rounded-xl px-10 py-3 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-200 shadow-inner"
                />
              </div>
              <button
                onClick={() => setAdSpend(Math.min(Math.floor(cash - cookiesBaked * COST_PER_COOKIE), adSpend + 5))}
                className="bg-gradient-to-br from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-amber-800 font-bold w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md hover:shadow-lg"
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

          {/* Cost Summary with enhanced styling */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200 shadow-inner">
            <h3 className="text-sm font-bold text-amber-900 mb-3">
              Cost Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">
                  Baking ({cookiesBaked} × ${COST_PER_COOKIE.toFixed(2)})
                </span>
                <span className="text-amber-900 font-semibold">
                  ${(cookiesBaked * COST_PER_COOKIE).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Advertising</span>
                <span className="text-amber-900 font-semibold">${adSpend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t-2 border-amber-300 pt-2 mt-2">
                <span className="text-amber-900">Total Cost</span>
                <span className={canAfford ? "text-amber-900" : "text-red-600"}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Open Shop Button with enhanced styling */}
        <button
          onClick={endDay}
          disabled={!canAfford}
          className={`w-full font-bold text-xl px-8 py-5 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer ${
            canAfford
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-2xl transform hover:scale-[1.02]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {canAfford ? "Open Shop for the Day! 🏪" : "Can't Afford This! 😰"}
        </button>

        {!canAfford && (
          <p className="text-center text-red-600 text-sm mt-2 font-semibold">
            Reduce cookies or advertising to fit your budget.
          </p>
        )}

        {/* Enhanced History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-amber-900 mb-2">
              Recent History
            </h3>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-amber-200">
              <div className="space-y-2">
                {history
                  .slice(-5)
                  .reverse()
                  .map((r) => (
                    <div
                      key={r.day}
                      className="flex justify-between items-center text-sm border-b border-amber-100 last:border-0 pb-2"
                    >
                      <span className="text-amber-700 font-semibold">Day {r.day}</span>
                      <span className="text-amber-700">
                        {r.cookiesSold} sold
                      </span>
                      <span
                        className={`font-bold ${r.profit >= 0 ? "text-green-600" : "text-red-600"}`}
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
