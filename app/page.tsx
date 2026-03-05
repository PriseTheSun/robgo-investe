'use client';

import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
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
  DollarSign
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

// --- Types ---

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

export default function RobGOInveste() {
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<InvestorLevel>('INICIANTE');
  const [error, setError] = useState<string | null>(null);
  const [simulatingAsset, setSimulatingAsset] = useState<Asset | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(1000);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Atue como RobGO, um analista financeiro de IA. Liste os 10 melhores investimentos brasileiros (Ações e FIIs) para cada nível de investidor: INICIANTE, INTERMEDIARIO e AVANCADO. 
        Para cada ativo, forneça:
        1. Dados básicos (Ticker, Nome, Preço, Tipo, Variação).
        2. Justificativa e Análise de Risco.
        3. Dados de Dividendos: Valor por cota/ação no próximo pagamento e a data prevista.
        4. Histórico de Preços: 6 pontos representando os últimos 6 meses.
        Retorne um JSON com uma lista de 30 ativos.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              assets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ticker: { type: Type.STRING },
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    type: { type: Type.STRING, enum: ['ACAO', 'FII'] },
                    reason: { type: Type.STRING },
                    riskLevel: { type: Type.STRING, enum: ['BAIXO', 'MEDIO', 'ALTO'] },
                    riskAnalysis: { type: Type.STRING },
                    level: { type: Type.STRING, enum: ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'] },
                    change: { type: Type.NUMBER },
                    dividendPerShare: { type: Type.NUMBER, description: "Valor em reais do próximo dividendo por ação/cota" },
                    nextPaymentDate: { type: Type.STRING, description: "Data no formato DD/MM/AAAA" },
                    history: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          month: { type: Type.STRING },
                          price: { type: Type.NUMBER }
                        },
                        required: ['month', 'price']
                      }
                    }
                  },
                  required: ['ticker', 'name', 'price', 'type', 'reason', 'riskLevel', 'riskAnalysis', 'level', 'change', 'dividendPerShare', 'nextPaymentDate', 'history']
                }
              }
            },
            required: ['assets']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setMarketData({
        assets: data.assets || [],
        lastUpdate: new Date().toLocaleTimeString('pt-BR')
      });
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com a IA RobGO. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const filteredAssets = marketData?.assets.filter(asset => asset.level === selectedLevel) || [];

  const sharesCount = simulatingAsset ? Math.floor(investAmount / simulatingAsset.price) : 0;
  const totalDividends = simulatingAsset ? sharesCount * simulatingAsset.dividendPerShare : 0;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
              <BrainCircuit className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">RobGO Investe</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold">AI Financial Advisor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchRecommendations}
              disabled={loading}
              className="p-2.5 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-200">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">IA RobGO Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Level Selector Hero */}
        <section className="mb-12">
          <div className="bg-white rounded-[2.5rem] p-10 border border-black/5 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <UserCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Seu Perfil</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Qual seu nível de <span className="text-blue-600">experiência?</span></h2>
              <p className="text-gray-500 max-w-xl mb-10 text-lg leading-relaxed">
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

        {/* Assets Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              <h3 className="text-2xl font-bold text-gray-900">
                Top 10 para você
                {marketData && <span className="ml-3 text-sm font-medium text-gray-400">Refrescado às {marketData.lastUpdate}</span>}
              </h3>
            </div>
            {error && <div className="text-sm font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">{error}</div>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-[2rem] border border-black/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.ticker}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                    className="group bg-white rounded-[2rem] p-8 border border-black/5 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col relative overflow-hidden"
                  >
                    {/* Risk Badge */}
                    <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${
                      asset.riskLevel === 'BAIXO' ? 'bg-emerald-100 text-emerald-700' :
                      asset.riskLevel === 'MEDIO' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      Risco {asset.riskLevel}
                    </div>

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${
                          asset.type === 'ACAO' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {asset.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <h4 className="font-black text-xl text-gray-900 tracking-tight">{asset.ticker}</h4>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{asset.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <div className="text-3xl font-black text-gray-900">
                          R$ {asset.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Cotação RobGO</div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-black ${asset.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {asset.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(asset.change).toFixed(2)}%
                      </div>
                    </div>

                    <div className="space-y-4 flex-grow">
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-blue-700 font-black uppercase text-[10px] tracking-widest">
                          <Sparkles className="w-3.5 h-3.5" />
                          Por que investir?
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{asset.reason}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setSimulatingAsset(asset)}
                      className="mt-8 w-full py-4 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200 group-hover:shadow-blue-200"
                    >
                      Simular Carteira
                      <Calculator className="w-4 h-4 opacity-50" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Simulation Modal */}
      <AnimatePresence>
        {simulatingAsset && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSimulatingAsset(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSimulatingAsset(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full z-10"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              {/* Left Side: Controls */}
              <div className="p-10 md:w-1/2 border-r border-black/5">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                    {simulatingAsset.ticker.slice(0, 4)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{simulatingAsset.ticker}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase">{simulatingAsset.name}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                      Valor a Investir (R$)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="number" 
                        value={investAmount}
                        onChange={(e) => setInvestAmount(Number(e.target.value))}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-black/5 rounded-2xl font-black text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                      <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">Cotas/Ações</div>
                      <div className="text-2xl font-black text-blue-900">{sharesCount}</div>
                    </div>
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Próximo Provento</div>
                      <div className="text-2xl font-black text-emerald-900">R$ {totalDividends.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-3xl border border-black/5">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-bold text-gray-700">Agenda de Pagamento</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Data Prevista:</span>
                      <span className="text-sm font-black text-indigo-600">{simulatingAsset.nextPaymentDate}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Valor Unitário:</span>
                      <span className="text-sm font-black text-gray-900">R$ {simulatingAsset.dividendPerShare.toLocaleString('pt-BR', { minimumFractionDigits: 4 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Chart */}
              <div className="p-10 md:w-1/2 bg-gray-50/50 flex flex-col">
                <div className="mb-8">
                  <h4 className="text-lg font-black tracking-tight mb-1">Crescimento Histórico</h4>
                  <p className="text-xs text-gray-400 font-medium">Variação do preço nos últimos 6 meses</p>
                </div>

                <div className="flex-grow min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulatingAsset.history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                        dy={10}
                      />
                      <YAxis 
                        hide 
                        domain={['auto', 'auto']} 
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          fontWeight: 900,
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`R$ ${Number(value || 0).toFixed(2)}`, 'Preço']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2563EB" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#2563EB', strokeWidth: 3, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 p-6 bg-white rounded-3xl border border-black/5">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span className="text-sm font-black text-gray-900">Alerta de Risco RobGO</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    {simulatingAsset.riskAnalysis}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 border-t border-black/5 bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-blue-600" />
            <span className="font-black text-2xl tracking-tighter">RobGO Investe</span>
          </div>
          <div className="flex justify-center gap-10 text-xs font-black uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Termos</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Suporte</a>
          </div>
          <div className="text-[10px] text-gray-400 leading-relaxed text-center md:text-right font-medium">
            RobGO Investe é uma plataforma de inteligência artificial. 
            Investimentos envolvem riscos. Rentabilidade passada não é garantia de futuro.
            © 2024 RobGO Labs.
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
      className={`flex flex-col items-start gap-1 px-8 py-5 rounded-[2rem] transition-all duration-300 text-left min-w-[200px] ${
        active 
          ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-105' 
          : 'bg-white text-gray-500 hover:bg-blue-50 border border-black/5'
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
