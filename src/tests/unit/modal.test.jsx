import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "../../components/atoms/modal";

describe("Modal", () => {
  it("no renderiza cuando open es false", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="T">
        <p>Child</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza título, children y cierra con botón", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Detalle" grayBackground>
        <p>Inside</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Detalle")).toBeInTheDocument();
    expect(screen.getByText("Inside")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /close modal/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
