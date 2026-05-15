import { useState } from "react";
import Modal from "../atoms/modal";
import CalendarFilters from "./calendarFilters";

const FilterGlyph = () => (
  <img
    src="/filter.svg"
    alt=""
    aria-hidden
    className="h-5 w-5 shrink-0 brightness-0 invert"
  />
);

const CalendarFiltersModal = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Filtros del calendario"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="
          fixed z-30 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
          bg-[#1F3664] shadow-[0_0_8px_0_rgba(0,0,0,0.45)]
          transition-colors hover:bg-[#162d4a] focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-[#1F5ACD] lg:hidden
          max-md:right-4 max-md:top-20
          md:left-[5.5rem] md:top-8
        "
      >
        <FilterGlyph />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Filtros"
        grayBackground
        placement="center"
        className="max-w-lg !max-h-[90vh] sm:max-w-xl"
      >
        <CalendarFilters
          {...props}
          showPageHeading={false}
          stackMaxHeightClass="max-h-none"
          className="!mb-0 !p-0"
        />
      </Modal>
    </>
  );
};

export default CalendarFiltersModal;
