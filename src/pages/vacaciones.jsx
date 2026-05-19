const Vacaciones = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-slate-800">
      <img src="/vacation.svg" alt="Vacaciones" className="w-24 h-24 mb-6 opacity-20 invert" />
      <h1 className="text-3xl font-bold mb-2">Vacaciones</h1>
      <p className="text-slate-500 text-center max-w-md">
        El módulo de vacaciones aún se encuentra en desarrollo. 
      </p>
    </div>
  );
};

export default Vacaciones;