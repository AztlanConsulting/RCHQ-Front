import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmDeleteVacationModal from "../../components/molecules/confirmDeleteVacationModal";

const vacationEvent = {
    employeeName: "María López",
    curp: "LOPM900101MDFPPP09",
};

const renderModal = (props = {}) =>
    render(
        <ConfirmDeleteVacationModal
            event={vacationEvent}
            onCancel={vi.fn()}
            onConfirm={vi.fn()}
            {...props}
        />,
    );

describe("ConfirmDeleteVacationModal", () => {
    it("muestra nombre y CURP cuando se confirma desde un rol administrativo", () => {
        renderModal();

        expect(screen.getByText("María López")).toBeInTheDocument();
        expect(screen.getByText(/LOPM900101MDFPPP09/)).toBeInTheDocument();
    });

    it("no muestra nombre ni CURP cuando el trabajador elimina sus propias vacaciones", () => {
        renderModal({
            showEmployeeInfo: false,
        });

        expect(screen.queryByText("María López")).not.toBeInTheDocument();
        expect(screen.queryByText(/LOPM900101MDFPPP09/)).not.toBeInTheDocument();
        expect(
            screen.getByText(
                "Está a punto de eliminar la solicitud de vacaciones. Esta acción no se puede deshacer.",
            ),
        ).toBeInTheDocument();
    });
});
