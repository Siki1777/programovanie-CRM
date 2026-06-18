import Link from "next/link";
import { NovaZakazkaForm } from "./NovaZakazkaForm";

export const metadata = { title: "Nová zákazka – CRM" };

export default function NovaZakazkaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-base md:text-sm text-gray-500">
        <Link href="/zakazky" className="hover:text-blue-600 transition-colors">
          Zákazky
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Nová zákazka</span>
      </div>

      <h1 className="text-3xl md:text-2xl font-bold text-gray-900">
        Nová zákazka
      </h1>
      <p className="text-xl md:text-sm text-gray-500">
        Zákazka bude automaticky zaradená do fázy <strong>Dopyt</strong>.
      </p>

      <NovaZakazkaForm />
    </div>
  );
}
