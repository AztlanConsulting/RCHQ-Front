const MexicoReferenceNotice = ({ show = false }) => {
  if (!show) return null;

  return (
    <p className="mb-5 rounded-md bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
      Estos días se toman como referencia en horario central de México porque
      afectan el cálculo de vacaciones y ausencias.
    </p>
  );
};

export default MexicoReferenceNotice;
