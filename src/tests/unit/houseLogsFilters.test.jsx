import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HouseLogsFilters from "../../components/molecules/houseLogsFilters";

describe("HouseLogsFilters", () => {
  it("sanitiza nombres completos y CURP en los buscadores", () => {
    const setResponsibleQuery = vi.fn();
    const setAffectedQuery = vi.fn();

    render(
      <HouseLogsFilters
        responsibleQuery=""
        setResponsibleQuery={setResponsibleQuery}
        affectedQuery=""
        setAffectedQuery={setAffectedQuery}
        filteredActionOptions={[]}
        selectedActionIds={[]}
        actionSearch=""
        setActionSearch={vi.fn()}
        selectedActionLabel="Todas las acciones"
        toggleActionValue={vi.fn()}
        clearActionSelection={vi.fn()}
        dateFilter=""
        setDateFilter={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText("Buscar por Nombre del responsable"),
      { target: { value: "Luis@ Martínez!" } },
    );
    fireEvent.change(
      screen.getByLabelText("Buscar por Nombre del afectado"),
      { target: { value: "COOC900101MDFABC01-?" } },
    );

    expect(setResponsibleQuery).toHaveBeenCalledWith("Luis Martínez");
    expect(setAffectedQuery).toHaveBeenCalledWith("COOC900101MDFABC01");
  });
});
