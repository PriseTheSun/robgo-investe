import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../../components/theme-toggle';

export default function PrivacidadePage() {
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
        <h1 className="text-4xl font-black mb-8 text-gray-900 dark:text-white">Privacidade e Dados</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
          <p>A RobGO respeita completamente a privacidade dos analistas e investidores que utilizam a nossa plataforma.</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Uso de Cookies</h3>
          <p>Utilizamos *cookies* e o *LocalStorage* do seu terminal exclusivamente para manter os temas na plataforma e aceites de regras ativos (como a pop-up vista na tela inicial), a fim de evitar loops aborrecidos. Zero dado financeiro pessoal cruzado ou enviado às sombras.</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Telemetria</h3>
          <p>O Google Gemini pode analisar logs de textos anônimos via SDK para otimização de IA, seguindo todas as políticas globais correspondentes de tráfego de Large Language Models.</p>
        </div>
      </main>
    </div>
  );
}
