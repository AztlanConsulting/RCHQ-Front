import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterGroup from "../../components/atoms/filterGroup";

const opts = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("FilterGroup", () => {
  it("toggle agrega y quita valores", async () => {
    const user = userEvent.setup();
    const setValues = vi.fn();
    render(
      <FilterGroup
        label="Grupo"
        name="g"
        options={opts}
        values={["a"]}
        setValues={setValues}
      />,
    );
    await user.click(screen.getByLabelText("Beta"));
    expect(setValues).toHaveBeenCalledWith(["a", "b"]);
    setValues.mockClear();
    await user.click(screen.getByLabelText("Alpha"));
    expect(setValues).toHaveBeenCalledWith([]);
  });

  it("onChange reemplaza setValues", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterGroup
        label="X"
        name="x"
        options={opts}
        values={[]}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Alpha"));
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });
});
