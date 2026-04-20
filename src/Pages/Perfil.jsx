// src/Pages/Perfil.jsx
import { useState, useEffect } from "react";
import { getUserData, getReadableErrors } from "../Services/ProfileService";
import { getToken } from "../utils/authStorage";
import ProfileCard from "../Components/Organism/ProfileCard";

/**
 * STATUS_MAP
 * Centraliza los mensajes de retroalimentación por código HTTP
 * conforme al diagrama de actividades y la US.
 */
const STATUS_MAP = {
  401: {
    title: "Sin permisos",
    message: "No tienes permisos para ver esta información.",
    icon: "🔒",
  },
  404: {
    title: "Ruta no encontrada",
    message: "No se encontró la ruta para obtener el perfil.",
    icon: "🗺️",
  },
  501: {
    title: "Error del servidor",
    message: "Ocurrió un problema al obtener la información. Intenta más tarde.",
    icon: "⚠️",
  },
  default: {
    title: "Error inesperado",
    message: "Ocurrió un error inesperado al cargar tu perfil.",
    icon: "⚠️",
  },
};

/* ─── Skeleton de carga ─────────────────────────────────────── */
const ProfileSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm animate-pulse">
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 flex flex-col gap-5">
        <div className="h-6 w-40 bg-slate-200 rounded" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-[46px] bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-5">
        <div className="h-[180px] bg-slate-100 rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-[46px] bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Estado de error con botón de reintento ────────────────── */
const ProfileError = ({ status, messages, onRetry }) => {
  const info = STATUS_MAP[status] ?? STATUS_MAP.default;

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-12 text-center">
      <span className="text-5xl">{info.icon}</span>
      <h3 className="text-lg font-bold text-red-700">{info.title}</h3>
      <p className="text-sm text-red-600 max-w-sm">
        {messages.length > 0 ? messages.join(" ") : info.message}
      </p>

      {/* Botón de reintento — aplica en 404 y 501 (no en 401) */}
      {status !== 401 && (
        <button
          onClick={onRetry}
          className="mt-2 h-[42px] px-6 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold
                     hover:bg-[#16304f] active:bg-[#0f2540] transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

/* ─── Página principal ──────────────────────────────────────── */
const Perfil = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);   // { status, messages[] }

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const data  = await getUserData(token);

      // Mapeo 1:1 con el shape de mapProfile() del backend.
      // houseId y roleId son IDs numéricos por ahora (el backend
      // resolverá los nombres en una iteración futura).
      // picture llega null hasta que el backend lo implemente.
      const raw = data?.data ?? data;
      setUser({
        foto:           raw?.picture    ?? null,
        casaHogar:      raw?.houseId    ?? null,   // ID numérico por ahora
        puesto:         raw?.roleId     ?? null,   // ID numérico por ahora
        nombre:         raw?.name       ?? "",
        apellidos:      raw?.surname    ?? "",
        correo:         raw?.email      ?? "",
        rfc:            raw?.rfc        ?? "",
        curp:           raw?.curp       ?? "",
        nss:            raw?.nss        ?? "",
        cuentaBancaria: raw?.bankAccount ?? "",
        cumpleanos:     raw?.birthDate  ?? "",
      });
    } catch (err) {
      setError({
        status:   err?.status ?? "default",
        messages: getReadableErrors(err),
      });
    } finally {
      setLoading(false);
    }
  };

  // Llama a la API cuando monta el componente (paso 4 del flujo principal)
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>

      {/* ── Flujos alternativos según diagrama de actividades ── */}
      {loading && <ProfileSkeleton />}

      {!loading && error && (
        <ProfileError
          status={error.status}
          messages={error.messages}
          onRetry={fetchProfile}
        />
      )}

      {!loading && !error && user && (
        <ProfileCard user={user} />
      )}
    </div>
  );
};

export default Perfil;