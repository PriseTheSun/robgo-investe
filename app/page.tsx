'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldEllipsis,
  UserCircle2,
  BrainCircuit,
  X,
  Calculator,
  Calendar,
  DollarSign,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Trophy
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '../components/theme-toggle';

type InvestorLevel = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO';

interface HistoryPoint {
  month: string;
  price: number;
}

interface Asset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  type: 'ACAO' | 'FII';
  reason: string;
  riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO';
  riskAnalysis: string;
  level: InvestorLevel;
  dividendPerShare: number;
  nextPaymentDate: string;
  history: HistoryPoint[];
}

interface MarketData {
  assets: Asset[];
  lastUpdate: string;
}

interface StockQuote {
  symbol: string;
  name: string;
  close: number;
  change: number;
  changeValue?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  marketCap?: number;
  peRatio?: number | null;
  eps?: number | null;
  week52High?: number;
  week52Low?: number;
  previousClose?: number;
  open?: number;
  type: string;
  sector?: string;
  industry?: string;
  description?: string;
  ibovComparison?: number;
  dividendYield?: number;
  impliedDividend?: number;
}

const ITEMS_PER_PAGE = 9;

const POPULAR_STOCKS = [
  'PETR4', 'PETR3', 'VALE3', 'ITUB4', 'BBDC4', 'B3SA3', 'WEGE3', 'ABEV3',
  'MGLU3', 'LREN3', 'RAIL3', 'SBSP3', 'ENBR3', 'TOTS3', 'BBAS3', 'BRKM5',
  'CCRO3', 'CMIG4', 'CPLE6', 'CSAN3', 'CVCB3', 'CYRE3', 'DXCO3', 'ECOR3',
  'EGIE3', 'EMBR3', 'ENEV3', 'EQTL3', 'EZTC3', 'FLRY3', 'GFSA3', 'GGBR4',
  'GOAU4', 'HAPV3', 'HYPE3', 'IGTA3', 'IRBR3', 'ITSA4', 'JBSG3', 'KLBN11',
  'LAME4', 'LEVE3', 'LWSA3', 'MDIA3', 'MRFG3', 'MRVE3', 'MULT3', 'NTCO3',
  'PCAR3', 'PETZ3', 'POSI3', 'PRIO3', 'QUAL3', 'RADL3', 'RAPT4', 'RENT3',
  'SANB11', 'SAPR11', 'SEER3', 'SLCE3', 'SMTO3', 'SOMA3', 'SUZB3', 'TAEE11',
  'TIMP3', 'TNGU3', 'TRPL4', 'UGPA3', 'USIM5', 'VIVT3', 'VLID3', 'WEG3',
  'YDUQ3'
];

export default function RobGOInveste() {
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<InvestorLevel>('INICIANTE');
  const [error, setError] = useState<string | null>(null);
  const [simulatingAsset, setSimulatingAsset] = useState<Asset | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(1000);

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, Asset[]>>({});
  const [typeFilter, setTypeFilter] = useState<string>('TODOS');

  const generateRecommendations = (stocksData: StockQuote[]) => {
    const newRecommendations: Record<string, Asset[]> = {};

    stocksData.forEach(stock => {
      const price = stock.close || 100;
      const peRatio = stock.peRatio;
      const change = stock.change || 0;
      const marketCap = stock.marketCap || 0;

      let riskLevel: 'BAIXO' | 'MEDIO' | 'ALTO';
      let reason: string;

      if (peRatio && peRatio < 10 && change > -3 && change < 5) {
        riskLevel = 'BAIXO';
        reason = `P/L atrativo de ${peRatio.toFixed(1)} com fundamentals sólidos. Boa opção para iniciantes.`;
      } else if (peRatio && peRatio < 20 && Math.abs(change) < 8) {
        riskLevel = 'MEDIO';
        reason = `Equilíbrio entre valuation e crescimento. P/L de ${peRatio.toFixed(1)}.`;
      } else {
        riskLevel = 'ALTO';
        reason = `Alta volatilidade com variação de ${change.toFixed(1)}%. Potencial de ganho elevado.`;
      }

      const generateHistory = (basePrice: number, volatility: number) => {
        const months = ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev'];
        let currentPrice = basePrice * (1 - (volatility * 0.3));
        return months.map(month => {
          const change = (Math.random() - 0.4) * volatility;
          currentPrice = currentPrice * (1 + change);
          return { month, price: currentPrice };
        });
      };

      const volatility = riskLevel === 'BAIXO' ? 0.05 : riskLevel === 'MEDIO' ? 0.1 : 0.2;

      newRecommendations[stock.symbol] = [
        {
          ticker: stock.symbol,
          name: stock.name,
          price: stock.close,
          change: stock.change,
          type: 'ACAO',
          reason,
          riskLevel,
          riskAnalysis: riskLevel === 'BAIXO'
            ? 'Baixa volatilidade, fundamentals sólidos, ideal para longo prazo.'
            : riskLevel === 'MEDIO'
              ? 'Risco moderado, recomendado para investidores com experiência.'
              : 'Alta volatilidade, indicado apenas para investidores arrojados.',
          level: 'INICIANTE',
          dividendPerShare: (stock.eps || 1) * 0.3,
          nextPaymentDate: '15/04/2026',
          history: generateHistory(price, volatility)
        },
        {
          ticker: stock.symbol,
          name: stock.name,
          price: stock.close,
          change: stock.change,
          type: 'ACAO',
          reason: reason.replace('iniciantes', 'investidores intermediários').replace('iniciantes', 'experiência'),
          riskLevel: riskLevel === 'BAIXO' ? 'MEDIO' : (riskLevel === 'MEDIO' ? 'MEDIO' : 'ALTO'),
          riskAnalysis: 'Risco moderado-alto. Monitore vulnerabilidades.',
          level: 'INTERMEDIARIO',
          dividendPerShare: (stock.eps || 1) * 0.25,
          nextPaymentDate: '15/04/2026',
          history: generateHistory(price, volatility * 1.2)
        },
        {
          ticker: stock.symbol,
          name: stock.name,
          price: stock.close,
          change: stock.change,
          type: 'ACAO',
          reason: reason.replace('iniciantes', 'investidores avançados').replace('iniciantes', ' arrojados'),
          riskLevel: 'ALTO',
          riskAnalysis: 'Alta exposição a riscos. Potencial de retorno elevado.',
          level: 'AVANCADO',
          dividendPerShare: (stock.eps || 1) * 0.2,
          nextPaymentDate: '15/04/2026',
          history: generateHistory(price, volatility * 1.5)
        }
      ];
    });

    setRecommendations(newRecommendations);
  };

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stocks');
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedStocks: StockQuote[] = data.results.map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          close: stock.close || 0,
          change: stock.change || 0,
          changeValue: stock.changeValue || 0,
          dayHigh: stock.dayHigh || 0,
          dayLow: stock.dayLow || 0,
          volume: stock.volume || 0,
          marketCap: stock.marketCap || 0,
          peRatio: stock.peRatio || null,
          eps: stock.eps || null,
          week52High: stock.week52High || 0,
          week52Low: stock.week52Low || 0,
          previousClose: stock.previousClose || 0,
          open: stock.open || 0,
          type: stock.type || 'ACAO',
          sector: stock.sector || 'Outros',
          industry: stock.industry || 'Geral',
          description: stock.description || stock.symbol,
          ibovComparison: stock.ibovComparison || 0,
          dividendYield: stock.dividendYield || 0,
          impliedDividend: stock.impliedDividend || 0
        }));
        setStocks(formattedStocks);
        generateRecommendations(formattedStocks);
        setMarketData({
          assets: [],
          lastUpdate: new Date().toLocaleTimeString('pt-BR')
        });
      } else if (data.error) {
        setError('Erro ao carregar dados do mercado.');
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados do mercado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAnalysis = async (ticker: string, stockName: string) => {
    if (recommendations[ticker]) return recommendations[ticker];

    setLoadingAI(true);
    try {
      const mockRecommendations: Asset[] = [
        {
          ticker,
          name: stockName,
          price: stocks.find(s => s.symbol === ticker)?.close || 0,
          change: stocks.find(s => s.symbol === ticker)?.change || 0,
          type: 'ACAO',
          reason: 'Ativo sólido com bons fundamentals e perspectiva de crescimento. Recomendado para diversificação de portfólio.',
          riskLevel: 'BAIXO',
          riskAnalysis: 'Baixa volatilidade histórica, fundamentos sólidos e pembayaran consistente de dividendos.',
          level: 'INICIANTE',
          dividendPerShare: Math.random() * 2,
          nextPaymentDate: '15/04/2026',
          history: [
            { month: 'Set', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.95 },
            { month: 'Out', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.97 },
            { month: 'Nov', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.98 },
            { month: 'Dez', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 1.0 },
            { month: 'Jan', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 1.02 },
            { month: 'Fev', price: (stocks.find(s => s.symbol === ticker)?.close || 100) }
          ]
        },
        {
          ticker,
          name: stockName,
          price: stocks.find(s => s.symbol === ticker)?.close || 0,
          change: stocks.find(s => s.symbol === ticker)?.change || 0,
          type: 'ACAO',
          reason: 'Oportunidade de valorização moderada com equilíbrio entre risco e retorno.',
          riskLevel: 'MEDIO',
          riskAnalysis: 'Risco moderado devido à exposição setorial e volatilidade do mercado brasileiro.',
          level: 'INTERMEDIARIO',
          dividendPerShare: Math.random() * 2,
          nextPaymentDate: '15/04/2026',
          history: [
            { month: 'Set', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.90 },
            { month: 'Out', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.95 },
            { month: 'Nov', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.92 },
            { month: 'Dez', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 1.0 },
            { month: 'Jan', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 1.05 },
            { month: 'Fev', price: (stocks.find(s => s.symbol === ticker)?.close || 100) }
          ]
        },
        {
          ticker,
          name: stockName,
          price: stocks.find(s => s.symbol === ticker)?.close || 0,
          change: stocks.find(s => s.symbol === ticker)?.change || 0,
          type: 'ACAO',
          reason: 'Alto potencial de valorização para investidores arrojados com tolerance a volatilidade.',
          riskLevel: 'ALTO',
          riskAnalysis: 'Alto risco devido à volatilidade e exposição a fatores externos. Recomendado apenas para investidores experientes.',
          level: 'AVANCADO',
          dividendPerShare: Math.random() * 2,
          nextPaymentDate: '15/04/2026',
          history: [
            { month: 'Set', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.85 },
            { month: 'Out', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.80 },
            { month: 'Nov', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 0.90 },
            { month: 'Dez', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 1.0 },
            { month: 'Jan', price: (stocks.find(s => s.symbol === ticker)?.close || 100) * 1.10 },
            { month: 'Fev', price: (stocks.find(s => s.symbol === ticker)?.close || 100) }
          ]
        }
      ];

      setRecommendations(prev => ({
        ...prev,
        [ticker]: mockRecommendations
      }));

      return mockRecommendations;
    } catch (err) {
      console.error('Erro ao buscar análise da IA:', err);
      return [];
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const filteredStocks = useMemo(() => {
    let result = stocks;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(stock =>
        stock.symbol.toLowerCase().includes(term) ||
        stock.name.toLowerCase().includes(term)
      );
    }

    if (typeFilter !== 'TODOS') {
      result = result.filter(stock => stock.type === typeFilter);
    }

    if (riskFilter !== 'TODOS') {
      result = result.filter(stock => {
        const recs = recommendations[stock.symbol];
        if (!recs || recs.length === 0) return true;
        const relevantRec = recs.find((r: Asset) => r.level === selectedLevel);
        return relevantRec?.riskLevel === riskFilter;
      });
    }

    return result;
  }, [stocks, searchTerm, typeFilter, riskFilter, selectedLevel, recommendations]);

  const totalPages = Math.ceil(filteredStocks.length / ITEMS_PER_PAGE);
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStocks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStocks, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, riskFilter]);

  const handleStockClick = async (stock: StockQuote) => {
    setSelectedStock(stock.symbol);
    await fetchAIAnalysis(stock.symbol, stock.name);
  };

  const getStockRecommendation = (ticker: string): Asset | null => {
    const recs = recommendations[ticker];
    if (!recs || recs.length === 0) return null;
    return recs.find((r: Asset) => r.level === selectedLevel) || recs[0];
  };

  const getTop5Recommendations = (): Asset[] => {
    const allRecs: Asset[] = [];
    Object.values(recommendations).forEach((recs: Asset[]) => {
      const relevant = recs.find((r: Asset) => r.level === selectedLevel);
      if (relevant) allRecs.push(relevant);
    });
    return allRecs.slice(0, 5);
  };

  const sharesCount = simulatingAsset ? Math.floor(investAmount / simulatingAsset.price) : 0;
  const totalDividends = simulatingAsset ? sharesCount * simulatingAsset.dividendPerShare : 0;

  return (
    <div className="min-h-screen bg-transparent text-[#1A1A1A] dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 pt-0">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
              <BrainCircuit className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">RobGO Investe</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold">Consultor Financeiro</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-black/5 dark:border-white/5 shadow-2xl shadow-blue-900/5 dark:shadow-none relative overflow-hidden transition-colors duration-300">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <UserCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Seu Perfil</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white transition-colors duration-300">Qual seu nível de <span className="text-blue-600 dark:text-blue-400">experiência?</span></h2>
              <p className="text-gray-500 dark:text-gray-300 max-w-xl mb-10 text-lg leading-relaxed transition-colors duration-300">
                A RobGO analisa milhares de dados para encontrar os ativos ideais para o seu momento como investidor.
              </p>

              <div className="flex flex-wrap gap-4">
                <LevelButton
                  active={selectedLevel === 'INICIANTE'}
                  onClick={() => setSelectedLevel('INICIANTE')}
                  label="Iniciante"
                  desc="Segurança e Dividendos"
                  icon={<ShieldCheck className="w-5 h-5" />}
                />
                <LevelButton
                  active={selectedLevel === 'INTERMEDIARIO'}
                  onClick={() => setSelectedLevel('INTERMEDIARIO')}
                  label="Intermediário"
                  desc="Equilíbrio e Valor"
                  icon={<ShieldEllipsis className="w-5 h-5" />}
                />
                <LevelButton
                  active={selectedLevel === 'AVANCADO'}
                  onClick={() => setSelectedLevel('AVANCADO')}
                  label="Avançado"
                  desc="Crescimento e Risco"
                  icon={<ShieldAlert className="w-5 h-5" />}
                />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -mr-32 -mt-32 blur-[100px] opacity-60" />
          </div>
        </section>

        {getTop5Recommendations().length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Top 5 Recomendados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {getTop5Recommendations().map((asset, index) => (
                <motion.div
                  key={asset.ticker}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSimulatingAsset(asset)}
                  className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white cursor-pointer hover:scale-105 transition-transform shadow-xl shadow-blue-200 dark:shadow-none"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">#{index + 1}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${asset.riskLevel === 'BAIXO' ? 'bg-emerald-400 text-emerald-900' :
                      asset.riskLevel === 'MEDIO' ? 'bg-amber-400 text-amber-900' :
                        'bg-rose-400 text-rose-900'
                      }`}>
                      {asset.riskLevel}
                    </span>
                  </div>
                  <h4 className="font-black text-xl mb-1">{asset.ticker}</h4>
                  <p className="text-xs text-blue-100 mb-3 truncate">{asset.name}</p>
                  <div className="text-2xl font-black">R$ {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Ativos Disponíveis</h3>
                {marketData && <span className="text-sm font-medium text-gray-400">Atualizado às {marketData.lastUpdate}</span>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar ativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-black/5 dark:border-white/5 rounded-2xl text-sm text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-colors duration-300"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-black/5 dark:border-white/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-colors"
                >
                  <option value="TODOS">Todos os Riscos</option>
                  <option value="BAIXO">Risco Baixo</option>
                  <option value="MEDIO">Risco Médio</option>
                  <option value="ALTO">Risco Alto</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-black/5 dark:border-white/5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-colors"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="ON">Ações ON</option>
                  <option value="PN">Ações PN</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase text-sm animate-pulse">Carregando ações...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {paginatedStocks.map((stock, index) => {
                    const recommendation = getStockRecommendation(stock.symbol);
                    return (
                      <motion.div
                        key={stock.symbol}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                        onClick={() => handleStockClick(stock)}
                        className="group bg-white dark:bg-gray-800 rounded-[2rem] p-8 border border-black/5 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20 transition-all duration-500 flex flex-col relative overflow-hidden cursor-pointer"
                      >
                        {recommendation && (
                          <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${recommendation.riskLevel === 'BAIXO' ? 'bg-emerald-100 text-emerald-700' :
                            recommendation.riskLevel === 'MEDIO' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                            Risco {recommendation.riskLevel}
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-6 mt-2">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              {stock.symbol.slice(0, 4)}
                            </div>
                            <div>
                              <h4 className="font-black text-xl text-gray-900 dark:text-white tracking-tight">{stock.symbol}</h4>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[120px]">{stock.name}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white transition-colors duration-300">
                              R$ {stock.close.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Cotação Atual</div>
                          </div>
                          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-black ${stock.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {stock.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {Math.abs(stock.change).toFixed(2)}%
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">
                            {stock.sector}
                          </span>
                          <span className={`ml-2 text-[10px] font-bold px-2 py-1 rounded-lg ${(stock.ibovComparison || 0) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {(stock.ibovComparison || 0) >= 0 ? '+' : ''}{(stock.ibovComparison || 0).toFixed(2)}% vs Ibov
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-2">
                            <div className="text-[8px] font-bold text-gray-400 uppercase">P/L</div>
                            <div className="text-sm font-black text-gray-700 dark:text-gray-300">{stock.peRatio ? stock.peRatio.toFixed(1) : '-'}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-2">
                            <div className="text-[8px] font-bold text-gray-400 uppercase">Div.Yield</div>
                            <div className="text-sm font-black text-gray-700 dark:text-gray-300">{(stock.dividendYield || 0).toFixed(1)}%</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-2">
                            <div className="text-[8px] font-bold text-gray-400 uppercase">52 sem</div>
                            <div className="text-sm font-black text-gray-700 dark:text-gray-300">{(stock.week52High || 0).toFixed(0)}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-2">
                            <div className="text-[8px] font-bold text-gray-400 uppercase">Vol.</div>
                            <div className="text-sm font-black text-gray-700 dark:text-gray-300">{stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : '-'}</div>
                          </div>
                        </div>

                        {recommendation ? (
                          <div className="space-y-4 flex-grow">
                            <div className="bg-gray-50 dark:bg-gray-700/20 rounded-2xl p-5 border border-gray-100 dark:border-transparent">
                              <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-black uppercase text-[10px] tracking-widest">
                                <Sparkles className="w-3.5 h-3.5" />
                                Recomendado para você
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium line-clamp-3">{recommendation.reason}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-grow flex items-center justify-center">
                            <span className="text-xs text-gray-400 font-medium">Clique para analisar</span>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (recommendation) {
                              setSimulatingAsset(recommendation);
                            }
                          }}
                          disabled={!recommendation}
                          className="mt-8 w-full py-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-600 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none group-hover:shadow-blue-200 dark:group-hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Simular Carteira
                          <Calculator className="w-4 h-4 opacity-50" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 bg-white rounded-xl border border-black/5 hover:border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-bold text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 bg-white rounded-xl border border-black/5 hover:border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <AnimatePresence>
        {simulatingAsset && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center pointer-events-none p-0 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSimulatingAsset(null)}
              className="absolute inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm pointer-events-auto"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl max-h-[85vh] md:max-h-[90vh] md:max-w-3xl overflow-hidden flex flex-col pointer-events-auto shadow-2xl border border-transparent dark:border-gray-700 mx-auto"
            >
              <div className="flex-shrink-0 p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black text-sm">
                      {simulatingAsset.ticker.slice(0, 4)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">{simulatingAsset.ticker}</h3>
                      <p className="text-xs text-gray-400">{simulatingAsset.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSimulatingAsset(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white">R$ {simulatingAsset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Preço atual</div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-bold ${simulatingAsset.change >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                      {simulatingAsset.change >= 0 ? '+' : ''}{simulatingAsset.change.toFixed(2)}%
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Valor a Investir</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                      <input
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-transparent dark:border-gray-700/50">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Cotas</div>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400">{sharesCount}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-transparent dark:border-gray-700/50">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Provento</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">R$ {totalDividends.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulatingAsset.history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis hide domain={['auto', 'auto']} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`R$ ${Number(value || 0).toFixed(2)}`, 'Preço']}
                      />
                      <Line type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-transparent dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Análise de Risco</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{simulatingAsset.riskAnalysis}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-20 border-t border-black/5 dark:border-white/5 bg-white dark:bg-gray-900 py-16 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-blue-600" />
            <span className="font-black text-2xl tracking-tighter">RobGO Investe</span>
          </div>
          <div className="flex justify-center gap-10 text-xs font-black uppercase tracking-widest text-gray-400">
            <a href="/termos" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Termos</a>
            <a href="/privacidade" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacidade</a>
            <a href="/suporte" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Suporte</a>
          </div>
          <div className="text-[10px] text-gray-400 leading-relaxed text-center md:text-right font-medium">
            RobGO Investe é uma plataforma de inteligência artificial.
            Investimentos envolvem riscos. Rentabilidade passada não é garantia de futuro.
            © 2026 RobGO Labs.
          </div>
        </div>
      </footer>
    </div>
  );
}

function LevelButton({ active, onClick, label, desc, icon }: { active: boolean, onClick: () => void, label: string, desc: string, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-1 px-8 py-5 rounded-[2rem] transition-all duration-300 text-left min-w-[200px] ${active
        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 dark:shadow-none scale-105'
        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-black/5 dark:border-white/5'
        }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-lg font-black tracking-tight">{label}</span>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-blue-100' : 'text-gray-400'}`}>
        {desc}
      </span>
    </button>
  );
}
