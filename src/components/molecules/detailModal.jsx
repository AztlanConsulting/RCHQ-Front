/**
 * DetailModal — modal genérico de solo lectura
 *
 * Props:
 *  - isOpen:   boolean para mostrar/ocultar
 *  - onClose:  función para cerrar
 *  - avatar:   JSX (ej. <EmployeeAvatar ... />)
 *  - title:    string — nombre principal (ej. nombre del empleado)
 *  - subtitle: string — línea secundaria (ej. casa hogar, puesto)
 *  - fields:   Array de { label, value } — cuadrícula de datos
 *  - action:   JSX opcional — botón/link extra (ej. "Ver PDF")
 */
import Button from "../atoms/button";

const DetailModal = ({ isOpen, onClose, avatar, title, subtitle, fields = [], action }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header: avatar + título */}
        {(avatar || title) && (
          <div className="flex items-center gap-4">
            {avatar}
            <div>
              {title    && <p className="font-bold text-[#121212] text-base">{title}</p>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        )}

        <hr className="border-gray-100" />

        {/* Campos clave-valor */}
        {fields.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-sm font-medium text-[#121212]">
                  {value || "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Acción extra (PDF, link, etc.) */}
        {action && (
          <>
            <hr className="border-gray-100" />
            {action}
          </>
        )}

        <hr className="border-gray-100" />

        {/* Cerrar */}
        <div className="flex justify-end">
          <Button
            text="Cerrar"
            onClick={onClose}
            bgColor="bg-[#24375e]"
            hoverColor="hover:bg-[#162d4a]"
            activeColor="active:bg-[#0f2035]"
            textColor="text-white"
            width="w-28"
            height="h-[40px]"
            textSize="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default DetailModal;