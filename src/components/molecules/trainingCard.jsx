import Button from "../atoms/button";
import { formatCardDate } from "../../utils/calendarEventDetail";

const TrainingIcon = () => (
  <svg
    width="40"
    height="48"
    viewBox="0 0 40 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="40" height="48" rx="4" fill="#E5E7EB" />
    <path
      d="M8 7a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V7Z"
      fill="white"
    />
    <path
      d="M13 15.5h14M13 20h10"
      stroke="#D1D5DB"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="28" r="5.5" fill="#FDE68A" />
    <path
      d="m20 23.8 1.33 2.7 2.98.43-2.16 2.1.51 2.97L20 30.6 17.34 32l.5-2.97-2.15-2.1 2.98-.43L20 23.8Z"
      fill="#111827"
    />
    <path
      d="M16.5 33.5 15 40l5-2.7L25 40l-1.5-6.5"
      stroke="#111827"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

const TrainingCard = ({ training, onOpen, onRemove }) => (
  <div className="flex h-full w-full flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
    <Button
      onClick={() => onOpen(training)}
      aria-label={training.title}
      bgColor="bg-slate-100"
      hoverColor="hover:bg-slate-200"
      activeColor=""
      width="w-full"
      height="h-[140px]"
      className="!rounded-none"
    >
      <TrainingIcon />
    </Button>

    <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-3">
      <p className="line-clamp-2 text-sm font-semibold leading-tight text-slate-800">
        {training.title}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {formatCardDate(training.date || training.start)}
      </p>
      <p className="mt-2 text-xs font-semibold text-slate-400">
        Impartido por:
      </p>
      <p className="line-clamp-3 text-sm font-medium leading-snug text-slate-500">
        {training.trainer || "Sin información"}
      </p>

      {onRemove && (
        <div className="mt-auto flex justify-end pt-3">
          <Button
            onClick={onRemove}
            title="Quitar de esta capacitación"
            bgColor="bg-[#dd4344]"
            hoverColor="hover:bg-red-700"
            activeColor="active:bg-red-800"
            width="w-8"
            height="h-8"
            className="!rounded-lg"
          >
            <DeleteIcon />
          </Button>
        </div>
      )}
    </div>
  </div>
);

export default TrainingCard;
