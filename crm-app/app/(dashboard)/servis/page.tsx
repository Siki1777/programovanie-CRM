export default function ServisPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Servis & Záruka</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Blížia sa revízie</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">—</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Po termíne</p>
          <p className="text-2xl font-bold text-red-700 mt-1">—</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Vybavené tento rok</p>
          <p className="text-2xl font-bold text-green-700 mt-1">—</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-2">Automatické oslovovanie klientov</h2>
        <p className="text-sm text-gray-500">
          Cron skript automaticky odošle správu zákazníkovi <strong>11 mesiacov</strong> po realizácii
          s ponukou ročnej revízie. Zachováva záruku zariadenia a generuje opakované tržby.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">🔧</p>
          <p className="text-sm">Žiadne servisné úlohy. Generujú sa automaticky alebo ručne z detailu zákazky.</p>
        </div>
      </div>
    </div>
  );
}
