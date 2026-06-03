import { NextResponse } from 'next/server';

interface PriceData {
  gold: number | null;
  silver: number | null;
  goldChange: number | null;
  silverChange: number | null;
  goldChangePct: number | null;
  silverChangePct: number | null;
  source: string;
  timestamp: string;
}

async function fetchFromMetalsLive(): Promise<PriceData | null> {
  try {
    const res = await fetch('https://metals-api.com/api/latest?access_key=free&base=USD&symbols=XAU,XAG', {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    const gold = data.rates?.XAU ? 1 / data.rates.XAU : null;
    const silver = data.rates?.XAG ? 1 / data.rates.XAG : null;
    return { gold, silver, goldChange: null, silverChange: null, goldChangePct: null, silverChangePct: null, source: 'metals-api', timestamp: new Date().toISOString() };
  } catch { return null; }
}

async function fetchFromGoldAPI(): Promise<PriceData | null> {
  try {
    const [goldRes, silverRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU', { next: { revalidate: 60 } }),
      fetch('https://api.gold-api.com/price/XAG', { next: { revalidate: 60 } }),
    ]);
    if (!goldRes.ok || !silverRes.ok) return null;
    const goldData = await goldRes.json();
    const silverData = await silverRes.json();
    const gold = goldData.price ?? goldData.ask ?? null;
    const silver = silverData.price ?? silverData.ask ?? null;
    if (!gold || !silver) return null;
    const goldPrev = goldData.prev_close_price ?? goldData.previousClose ?? null;
    const silverPrev = silverData.prev_close_price ?? silverData.previousClose ?? null;
    const goldChange = goldPrev ? parseFloat((gold - goldPrev).toFixed(2)) : null;
    const silverChange = silverPrev ? parseFloat((silver - silverPrev).toFixed(3)) : null;
    const goldChangePct = goldPrev ? parseFloat(((goldChange! / goldPrev) * 100).toFixed(2)) : null;
    const silverChangePct = silverPrev ? parseFloat(((silverChange! / silverPrev) * 100).toFixed(2)) : null;
    return { gold, silver, goldChange, silverChange, goldChangePct, silverChangePct, source: 'gold-api.com', timestamp: new Date().toISOString() };
  } catch { return null; }
}

async function fetchFromFrankfurter(): Promise<PriceData | null> {
  // Frankfurter only does fiat, but we can use it as fallback signal
  return null;
}

export async function GET() {
  // Try sources in order
  const data = await fetchFromGoldAPI() ?? await fetchFromMetalsLive();

  if (!data) {
    // Return last known approximate values as fallback so app doesn't break
    return NextResponse.json({
      gold: 4539,
      silver: 75.28,
      goldChange: null,
      silverChange: null,
      goldChangePct: null,
      silverChangePct: null,
      source: 'fallback',
      timestamp: new Date().toISOString(),
      error: 'Canlı veri alınamadı — lütfen fiyatı manuel girin',
    }, { status: 200 });
  }

  return NextResponse.json(data);
}
