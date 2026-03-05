import { NextResponse } from 'next/server';

const TOKEN = 'nrwKfiBPPpuVf5YWPY9Fkr';

export async function GET() {
  const symbols = [
    'PETR4', 'PETR3', 'VALE3', 'ITUB4', 'BBDC4', 'B3SA3', 
    'WEGE3', 'ABEV3', 'MGLU3', 'LREN3', 'RAIL3', 'SBSP3',
    'ENBR3', 'TOTS3', 'BBAS3', 'BRKM5', 'CCRO3', 'CMIG4',
    'CPLE6', 'CSAN3', 'CVCB3', 'CYRE3', 'DXCO3', 'ECOR3',
    'EGIE3', 'EMBR3', 'ENEV3', 'EQTL3', 'EZTC3', 'FLRY3'
  ];

  try {
    const allResults = [];
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://brapi.dev/api/quote/${symbol}?token=${TOKEN}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        
        const data = await response.json();
        
        if (data.results && data.results[0]) {
          const stock = data.results[0];
          allResults.push({
            symbol: stock.symbol,
            name: stock.shortName || stock.longName || stock.symbol,
            close: stock.regularMarketPrice || 0,
            change: stock.regularMarketChangePercent || 0,
            changeValue: stock.regularMarketChange || 0,
            dayHigh: stock.regularMarketDayHigh || 0,
            dayLow: stock.regularMarketDayLow || 0,
            volume: stock.regularMarketVolume || 0,
            marketCap: stock.marketCap || 0,
            peRatio: stock.priceEarnings || null,
            eps: stock.earningsPerShare || null,
            week52High: stock.fiftyTwoWeekHigh || 0,
            week52Low: stock.fiftyTwoWeekLow || 0,
            previousClose: stock.regularMarketPreviousClose || 0,
            open: stock.regularMarketOpen || 0,
            type: stock.symbol.endsWith('3') ? 'ON' : (stock.symbol.endsWith('4') ? 'PN' : 'ACAO')
          });
        }
      } catch (e) {
        console.error('Error fetching', symbol, e);
      }
      
      await new Promise(r => setTimeout(r, 200));
    }
    
    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
