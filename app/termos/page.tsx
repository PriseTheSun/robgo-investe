import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../../components/theme-toggle';

export default function TermosPage() {
  return (
    <div className="min-h-screen text-[#1A1A1A] dark:text-gray-100 font-sans selection:bg-blue-100 py-10 px-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Home
        </Link>
        <ThemeToggle />
      </header>
      
      <main className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-blue-900/5">
        <h1 className="text-4xl font-black mb-8 text-gray-900 dark:text-white">Termos de Uso</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
          <p>Bem-vindo à RobGO Investe. Ao usar nosso serviço, você concorda em cumprir estes termos.</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">1. Informação para uso pessoal</h3>
          <p>Os dados do mercado apresentados não são garantias de retorno. Investimentos envolvem riscos. Nosso projeto utiliza as APIs em caráter informativo, sem responsabilidade sobre manobras de carteira efetuadas erroneamente pelos usuários.</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">2. Fonte de dados</h3>
          <p>As cotações simuladas são obtidas a partir de provedores externos como a Brapi e analisadas pelo Google Gemini.</p>
        </div>
      </main>
    </div>
  );
}
