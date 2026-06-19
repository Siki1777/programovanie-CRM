import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Prihlásenie – CRM" };

export default async function LoginPage() {
  // Ak je už prihlásený, presmeruj na dashboard
  const cookieStore = await cookies();
  if (cookieStore.get("crm_kolega_id")?.value) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full max-w-md">

      {/* Logo / Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <span className="text-white text-3xl font-black">C</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">CRM</h1>
        <p className="text-gray-500 text-sm mt-1">Inštalačná firma – interný systém</p>
      </div>

      {/* Prihlasovacia karta */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Prihlásenie</h2>
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-6">
        Ak nemáš heslo, kontaktuj správcu systému.
      </p>

    </div>
  );
}
