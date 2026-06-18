import Link from "next/link";

export default function PristupOdmietnutyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 p-8">
      <div className="text-7xl select-none">🔒</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Prístup odmietnutý</h1>
        <p className="text-gray-500 max-w-sm leading-relaxed">
          Na zobrazenie finančných údajov nemáš oprávnenie.
          Požiadaj správcu (Martina Nováka), aby ti ho udelil
          v&nbsp;časti&nbsp;Nastavenia.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
        >
          Späť na prehľad
        </Link>
        <Link
          href="/nastavenia"
          className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-colors"
        >
          ⚙️ Nastavenia
        </Link>
      </div>
    </div>
  );
}
