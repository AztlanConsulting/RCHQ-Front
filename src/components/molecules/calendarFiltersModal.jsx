import Modal from "../atoms/modal";
import CalendarFilters from "./calendarFilters";

const CalendarFiltersModal = ({ open, onClose, ...filterProps }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Filtros"
    grayBackground
    placement="center"
    scrollable
    className="max-w-lg !max-h-[90dvh] sm:max-w-xl"
  >
    <CalendarFilters
      {...filterProps}
      showPageHeading={false}
      stackMaxHeightClass="max-h-none overflow-visible"
      className="!mb-0 !min-h-0 !p-0"
      employeeDropdownInline
    />
  </Modal>
);

export default CalendarFiltersModal;
