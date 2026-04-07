import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../Components/Forms";
import { loginService } from "../Services/AuthService";

const LoginPage = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true);
      setError("");

      const data = await loginService(email, password);

      console.log("Login exitoso:", data);

      // Aquí puedes redirigir después
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(45,212,191,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.14),_transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/8 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200 backdrop-blur">
              Plataforma interna de acceso
            </span>

            <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
              Bienvenido a
              <span className="block bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-200 bg-clip-text text-transparent">
                IchanRH
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Accede a tu espacio de trabajo con una interfaz más clara, moderna
              y enfocada en el flujo diario del equipo.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-400">Módulo</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Recursos Humanos
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-400">Estado</p>
                <p className="mt-2 text-lg font-semibold text-emerald-300">
                  Operativo
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-sm text-slate-400">Seguridad</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Acceso protegido
                </p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-cyan-300/20 blur-3xl lg:block" />
            <div className="absolute -right-8 bottom-10 hidden h-28 w-28 rounded-full bg-amber-300/20 blur-3xl lg:block" />

            <div className="relative rounded-[32px] border border-white/10 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
                  Iniciar sesión
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  Continúa con tu cuenta
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Usa tu correo institucional para entrar al panel.
                </p>
              </div>

              {error && (
                <p className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              )}

              <Form onSubmit={handleLogin} loading={loading} />

              <p className="mt-6 text-center text-sm text-slate-500">
                Soporte interno disponible para incidencias de acceso.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
