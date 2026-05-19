import Modal from "../atoms/modal";
import CalendarFilters from "./calendarFilters";

const CalendarFiltersModal = ({ open, onClose, ...filterProps }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Filtros"
    grayBackground
    placement="center"
    className="max-w-lg !max-h-[90vh] sm:max-w-xl"
  >
    <CalendarFilters
      {...filterProps}
      showPageHeading={false}
      stackMaxHeightClass="max-h-none"
      className="!mb-0 !p-0"
    />
  </Modal>
);

export default CalendarFiltersModal;
