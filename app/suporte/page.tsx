import Link from 'next/link';
import { ArrowLeft, Headphones } from 'lucide-react';
import { ThemeToggle } from '../../components/theme-toggle';

export default function SuportePage() {
  return (
    <div className="min-h-screen text-[#1A1A1A] dark:text-gray-100 font-sans selection:bg-blue-100 py-10 px-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-16">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar para Home
        </Link>
        <ThemeToggle />
      </header>
      
      <main className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-blue-900/5 text-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
          <Headphones className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">Central de Suporte</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-10">
          Encontrou algo errado nas cotações da brapi ou sentiu o RobGO oscilando muito no painel? Nossa equipe resolve!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
            Abrir Chamado Interno
          </a>
          <a href="#" className="px-8 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold transition-colors">
            Documentação da API
          </a>
        </div>
      </main>
    </div>
  );
}
