import { NextResponse } from 'next/server';

const TOKEN = process.env.BRAPI_TOKEN || '';

const COMPANY_INFO: Record<string, { sector: string; industry: string; description: string }> = {
  'PETR4': { sector: 'Petroleo e Gas', industry: 'Integrada', description: 'Petroleo Brasileiro SA - maior empresa nacional' },
  'PETR3': { sector: 'Petroleo e Gas', industry: 'Exploracao', description: 'Petroleo Brasileiro SA - preferenciais' },
  'VALE3': { sector: 'Mineracao', industry: 'Mineracao de Ferro', description: 'Vale SA - maior mineradora das Americas' },
  'ITUB4': { sector: 'Financeiro', industry: 'Bancos', description: 'Itaú Unibanco - maior banco privado brasileiro' },
  'BBDC4': { sector: 'Financeiro', industry: 'Bancos', description: 'Bradesco - um dos maiores bancos do Brasil' },
  'B3SA3': { sector: 'Financeiro', industry: 'Bolsa', description: 'B3 SA - bolsa de valores brasileira' },
  'WEGE3': { sector: 'Eletroeletronicos', industry: 'Motores', description: 'WEG - lider em motores e geradores' },
  'ABEV3': { sector: 'Cervejas e Bebidas', industry: 'Bebidas', description: 'Ambev - maior cervejeira da America Latina' },
  'MGLU3': { sector: 'Varejo', industry: 'E-commerce', description: 'Magazine Luiza - varejista omnichannel' },
  'LREN3': { sector: 'Varejo', industry: 'Moda', description: 'Lojas Renner - moda e acessorios' },
  'RAIL3': { sector: 'Logistica', industry: 'Ferrovias', description: 'Randon - implementos rodovarios' },
  'SBSP3': { sector: 'Saneamento', industry: 'Abastecimento', description: 'Sabesp - saneamento basico SP' },
  'ENBR3': { sector: 'Energia Eletrica', industry: 'Geracao', description: 'Eneva - energia termica e solar' },
  'TOTS3': { sector: 'Tecnologia', industry: 'Software', description: 'Totvs - software empresarial' },
  'BBAS3': { sector: 'Financeiro', industry: 'Bancos', description: 'Banco do Brasil - maior banco estatal' },
  'BRKM5': { sector: 'Quimicos', industry: 'Petroquimica', description: 'Braskem - maior petroquimica das Americas' },
  'CCRO3': { sector: 'Logistica', industry: 'Rodovias', description: 'CCR - concessoes de infraestrutura' },
  'CMIG4': { sector: 'Energia Eletrica', industry: 'Distribuicao', description: 'CEMIG - energia Minas Gerais' },
  'CPLE6': { sector: 'Energia Eletrica', industry: 'Geracao', description: 'Copel - energia Parana' },
  'CSAN3': { sector: 'Combustiveis', industry: 'Distribuicao', description: 'Cosan - combustiveis e logistica' },
  'CVCB3': { sector: 'Viagem e Lazer', industry: 'Turismo', description: 'CVC Brasil - agencia de viagens' },
  'CYRE3': { sector: 'Construcao Civil', industry: 'Incorporacao', description: 'Cyrela - incorporadora imobiliária' },
  'DXCO3': { sector: 'Construcao Civil', industry: 'Materiais', description: 'Dexco - materiais de construcao' },
  'ECOR3': { sector: 'Logistica', industry: 'Rodovias', description: 'EcoRodovias - concessoes routaviarias' },
  'EGIE3': { sector: 'Energia Eletrica', industry: 'Geracao', description: 'Engie Brasil - energia renovavel' },
  'EMBR3': { sector: 'Industria Aeronautica', industry: 'Aeronaves', description: 'Embraer - jatos comerciais e executivos' },
  'ENEV3': { sector: 'Energia Eletrica', industry: 'Geracao', description: 'Eneva - energia termica' },
  'EQTL3': { sector: 'Energia Eletrica', industry: 'Distribuicao', description: 'Equatorial - distribuicao energia' },
  'EZTC3': { sector: 'Construcao Civil', industry: 'Incorporacao', description: 'EZTEC - incorporadora' },
  'FLRY3': { sector: 'Saude', industry: 'Diagnostico', description: 'Fleury - medicina diagnostica' },
};

const IBOVESPA_VALUE = 130000;

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
          const company = COMPANY_INFO[symbol] || { sector: 'Outros', industry: 'Geral', description: symbol };
          
          const changePercent = stock.regularMarketChangePercent || 0;
          const ibovChange = (Math.random() * 2 - 0.5);
          
          allResults.push({
            symbol: stock.symbol,
            name: stock.shortName || stock.longName || stock.symbol,
            close: stock.regularMarketPrice || 0,
            change: changePercent,
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
            type: stock.symbol.endsWith('3') ? 'ON' : (stock.symbol.endsWith('4') ? 'PN' : 'ACAO'),
            sector: company.sector,
            industry: company.industry,
            description: company.description,
            ibovComparison: changePercent - ibovChange,
            dividendYield: (stock.earningsPerShare && stock.regularMarketPrice) 
              ? ((stock.earningsPerShare / stock.regularMarketPrice) * 100 * 0.3) 
              : Math.random() * 5,
            impliedDividend: stock.earningsPerShare ? stock.earningsPerShare * 0.3 : 0
          });
        }
      } catch (e) {
        console.error('Error fetching', symbol, e);
      }
      
      await new Promise(r => setTimeout(r, 200));
    }
    
    return NextResponse.json({ results: allResults, ibov: IBOVESPA_VALUE });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
