import Link from "next/link";
import { getSession } from "@/lib/session";
import { Avatar } from "@/components/Avatar";

const NAV_ITEMS = [
  { href: "/dashboard",     label: "Prehľad",        ikona: "📊", financna: false },
  { href: "/zakazky",       label: "Zákazky",         ikona: "📋", financna: false },
  { href: "/zakaznici",     label: "Zákazníci",       ikona: "👥", financna: false },
  { href: "/cenove-ponuky", label: "Cenové ponuky",   ikona: "💶", financna: true  },
  { href: "/naklady",       label: "Náklady",         ikona: "🧾", financna: true  },
  { href: "/kalendar",      label: "Kalendár",        ikona: "📅", financna: false },
  { href: "/servis",        label: "Servis & Záruka", ikona: "🔧", financna: false },
  { href: "/reporty",       label: "Reporty",         ikona: "📈", financna: true  },
  { href: "/nastavenia",    label: "Nastavenia",      ikona: "⚙️", financna: false },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const vidiFinancie = session?.vidiFinancie ?? false;

  const navItems = NAV_ITEMS.filter((item) => !item.financna || vidiFinancie);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">

        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-blue-700 leading-tight">
            CRM<br />
            <span className="text-sm font-normal text-gray-500">Inštalačná firma</span>
          </h2>
        </div>

        {/* Navigácia */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span className="text-base w-5 text-center">{item.ikona}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Aktuálny používateľ */}
        <div className="p-4 border-t border-gray-200">
          {session ? (
            <Link
              href="/nastavenia"
              className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl p-1.5 -m-1.5 transition-colors group"
            >
              <Avatar
                meno={session.meno}
                priezvisko={session.priezvisko}
                email={session.email}
                fotoUrl={session.fotoUrl}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate leading-tight">
                  {session.meno} {session.priezvisko}
                </p>
                <p className="text-xs text-gray-400 leading-tight">
                  {vidiFinancie ? "💶 Admin" : "Technik"}
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-gray-500 text-sm flex-shrink-0">›</span>
            </Link>
          ) : (
            <Link
              href="/nastavenia"
              className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
            >
              <span className="text-base">👤</span>
              Vybrať profil →
            </Link>
          )}
        </div>

      </aside>
      <main className="flex-1 p-8 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
