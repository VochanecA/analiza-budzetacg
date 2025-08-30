'use client';

import { Bot, DollarSign, PieChart, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import Link from 'next/link';

export default function QuickAnalysisPage() {
  return (
    <div className="min-h-screen py-8 px-4 md:px-16 bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-100">
      
      {/* Header */}
      <header className="mb-8 flex items-center gap-3">
        <Bot className="h-8 w-8 text-blue-500" />
        <h1 className="text-2xl md:text-3xl font-bold">
          Fiskalna analiza Crne Gore
        </h1>
      </header>

      <section className="space-y-6">
        {/* Glavna analiza */}
        <p className="text-base md:text-lg leading-relaxed">
          <strong>Stopa realizacije prihoda</strong> je solidna (prosječno 220,5 miliona € mjesečno), ali <strong>rashodi rastu brže</strong> (11,6% u odnosu na 7,6% rast prihoda). Ovo pokazuje da problem nije u naplati poreza, već u kontroli državne potrošnje.
        </p>

        {/* Analiza prihoda */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 space-y-3">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-indigo-600">
            <DollarSign className="h-6 w-6 text-green-500" />
            Analiza Prihoda
          </h2>
          <p className="text-base md:text-lg leading-relaxed">
            <strong>Poreski prihodi</strong> čine <strong>81%</strong> ukupnih budžetskih prihoda (1,07 milijardi €), što pokazuje dobru poresku efikasnost. Međutim, postoji visoka <strong>zavisnost od PDV-a i akciza</strong>, što Crnu Goru čini osjetljivom na potrošačke trendove.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            <strong>Sezonalni obrasci</strong> su jasno vidljivi - najveći prihodi su u januaru i junu, što odražava sezonsku turističku aktivnost i akcize na gorivo.
          </p>
        </div>

        {/* Analiza rashoda */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 space-y-3">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-red-600">
            <PieChart className="h-6 w-6 text-red-500" />
            Analiza Rashoda
          </h2>
          <p className="text-base md:text-lg leading-relaxed">
            <strong>Struktura rashoda</strong> je zabrinjavajuća - rashodi rastu brže od prihoda. Najveći rast je u februaru i martu, što može ukazivati na sezonske plate u javnom sektoru ili dodatne socijalne transfere.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            <strong>Investicioni kapacitet</strong> je ograničen jer se većina budžeta troši na tekuće rashode, a mali suficit u aprilu (35,8 miliona €) nije dovoljan za veće kapitalne projekte.
          </p>
        </div>

        {/* Fiskalna održivost i rizici */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 space-y-3">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-yellow-600">
            <TrendingDown className="h-6 w-6 text-yellow-500" />
            Fiskalna Održivost i Rizici
          </h2>
          <p className="text-base md:text-lg leading-relaxed">
            <strong>Kratkoročni rizici:</strong> Deficit od 107 miliona € za samo 6 mjeseci ukazuje da će <strong>godišnji deficit vjerovatno premašiti 3% BDP-a</strong>, što krši Maastrichtske kriterijume.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            <strong>Strukturni problem:</strong> Rast rashoda je <strong>trajna prijetnja</strong> fiskalnoj stabilnosti, posebno uz demografsko starenje i rastuće troškove zdravstva i penzija.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            <strong>Regionalni kontekst:</strong> Crna Gora ima <strong>veći fiskalni pritisak</strong> nego neke zemlje regiona, što je zabrinjavajuće s obzirom na manju ekonomiju.
          </p>
        </div>

        {/* Preporuke */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 space-y-3">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-green-600">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Preporuke za Donosioce Odluka
          </h2>
          <ol className="list-decimal list-inside text-base md:text-lg leading-relaxed space-y-1">
            <li>Hitna kontrola rashoda - smanjenje tekućih troškova državne uprave</li>
            <li>Diverzifikacija prihoda - smanjenje zavisnosti od PDV-a kroz bolju naplatu poreza na dobit</li>
            <li>Strukturne reforme - reforma penzionog sistema i zdravstvenog osiguranja</li>
            <li>Povećanje investicionog kapaciteta - privlačenje EU fondova za kapitalne projekte</li>
            <li>Unapređenje fiskalnih pravila - jasnija ograničenja za budžetski deficit</li>
          </ol>
        </div>

        {/* Zaključak */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 space-y-3">
          <h2 className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-purple-600">
            <Zap className="h-6 w-6 text-purple-500" />
            Zaključak
          </h2>
          <p className="text-base md:text-lg leading-relaxed">
            Crna Gora se suočava sa <strong>ozbiljnim fiskalnim izazovima</strong> koji zahtijevaju hitne mere. Bez smanjenja rashoda i strukturnih reformi, zemlja će teško ispuniti kriterijume za EU pristupanje i održati fiskalnu stabilnost.
          </p>
        </div>

        {/* Return home button */}
        <div className="mt-8 flex justify-center">
          <Link href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Vrati se nazad
          </Link>
        </div>
      </section>
    </div>
  );
}
