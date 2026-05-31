import { useNavigate } from "react-router-dom";

const Certificaciones = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/app/perfil")}
          aria-label="Regresar a mi perfil"
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-100"
        >
          <svg
            className="h-5 w-5 rotate-90 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Certificaciones</h1>
      </div>

      <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-800">
        <img
          src="/certificate.svg"
          alt=""
          aria-hidden="true"
          className="mb-6 h-24 w-24 opacity-20 invert"
        />
        <p className="max-w-md text-center text-slate-500">
          El módulo de certificaciones aún se encuentra en desarrollo.
        </p>
      </div>
    </div>
  );
};

export default Certificaciones;
