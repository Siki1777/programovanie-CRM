import Link from "next/link";
import { NovyZakaznikForm } from "./NovyZakaznikForm";

export default function NovyZakaznikPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/zakaznici" className="hover:text-blue-600 transition-colors">
          Zákazníci
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Nový zákazník</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">👤 Nový zákazník</h1>
        <NovyZakaznikForm />
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">💡 Tip</p>
        <p>
          Po vytvorení zákazníka ho môžeš hneď prepojiť so zákazkou cez{" "}
          <Link href="/zakazky/nova" className="underline font-semibold">
            + Nová zákazka
          </Link>
          , kde vyberieš jeho meno z dropdownu.
        </p>
      </div>
    </div>
  );
}
