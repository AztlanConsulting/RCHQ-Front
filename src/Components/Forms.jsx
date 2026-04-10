import { useState } from "react";
import Button from "./Button";

const Form = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="nombre@empresa.com"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Contraseña
          </label>
          <span className="text-xs font-medium text-sky-700">
            Acceso seguro
          </span>
        </div>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Ingresa tu contraseña"
          value={form.password}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-500">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          Recordarme
        </label>
        <a
          href="#recuperar"
          className="font-medium text-sky-700 transition hover:text-sky-900"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
};

export default Form;
