import Link from "next/link";

const TABS = [
  { key: "dopyt",           label: "Dopyt",             ikona: "📋", num: 1, financna: false },
  { key: "obhliadka",       label: "Obhliadka",         ikona: "🔍", num: 2, financna: false },
  { key: "cenova_ponuka",   label: "Cen. ponuka",       ikona: "💶", num: 3, financna: true  },
  { key: "schvalenie_plan", label: "Schválenie & Plán", ikona: "📅", num: 4, financna: false },
  { key: "realizacia",      label: "Realizácia",        ikona: "🔧", num: 5, financna: false },
  { key: "servis",          label: "Servis & Záruka",   ikona: "⭐", num: 6, financna: false },
];

export function TabNav({
  activeTab,
  zakazkaId,
  vidiFinancie = false,
}: {
  activeTab: string;
  zakazkaId: string;
  vidiFinancie?: boolean;
}) {
  const viditelne = TABS.filter((t) => !t.financna || vidiFinancie);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max md:min-w-0 border-b border-gray-200">
          {viditelne.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <Link
                key={t.key}
                href={`/zakazky/${zakazkaId}?tab=${t.key}`}
                className={[
                  "flex items-center justify-center gap-2 px-4 py-4",
                  "border-b-[3px] transition-colors whitespace-nowrap",
                  "text-xl md:text-sm font-semibold",
                  "min-h-[60px] md:min-h-0",
                  "flex-1",
                  isActive
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                ].join(" ")}
              >
                <span className="text-xl md:text-base leading-none">{t.ikona}</span>
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden text-lg font-bold">{t.num}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="sm:hidden px-4 py-2 bg-blue-50 border-b border-blue-100">
        {viditelne.filter((t) => t.key === activeTab).map((t) => (
          <p key={t.key} className="text-sm font-semibold text-blue-700">
            {t.ikona} {t.label}
          </p>
        ))}
      </div>
    </div>
  );
}
