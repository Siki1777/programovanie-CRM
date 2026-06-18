import { TECHNOLOGIE } from "@/types";

export default function ReportyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reporty</h1>

      {/* Filtrovanie obdobia */}
      <div className="flex flex-wrap gap-2">
        {["Tento mesiac", "Minulý mesiac", "Tento kvartál", "Tento rok", "Vlastné"].map((o) => (
          <button
            key={o}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {o}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Tržby celkom</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">— €</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Náklady celkom</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">— €</p>
        </div>
        <div className="bg-white rounded-xl border border-green-300 p-5 shadow-sm bg-green-50">
          <p className="text-xs text-green-700 uppercase tracking-wide">Čistý zisk</p>
          <p className="text-3xl font-bold text-green-800 mt-1">— €</p>
        </div>
      </div>

      {/* Divízie */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4">Zisk podľa divízie (technológia)</h2>
        <div className="space-y-3">
          {TECHNOLOGIE.map((t) => (
            <div key={t.key} className="flex items-center gap-3">
              <span className="text-xl w-6">{t.ikona}</span>
              <span className="text-sm text-gray-700 w-40">{t.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "0%" }} />
              </div>
              <span className="text-sm text-gray-500 w-16 text-right">— €</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
