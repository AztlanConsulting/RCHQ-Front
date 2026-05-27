import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PhotoUploader from "../../components/atoms/photoUploader";

beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(
    () => "blob:http://localhost/mock-url",
  );
  globalThis.URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
  vi.restoreAllMocks();
});

const makeProps = (overrides = {}) => ({
  file: null,
  onFileChange: vi.fn(),
  label: "Foto de perfil",
  ...overrides,
});

describe("PhotoUploader — renderizado base", () => {
  it("muestra el label con el texto recibido", () => {
    const props = makeProps({ label: "Fotografía del empleado" });

    render(<PhotoUploader {...props} />);

    expect(screen.getByText("Fotografía del empleado")).toBeInTheDocument();
  });

  it("muestra el estado inicial vacío (ícono y texto) cuando no hay archivo", () => {
    const props = makeProps({ file: null });

    render(<PhotoUploader {...props} />);

    expect(screen.getByText("Subir fotografía")).toBeInTheDocument();
    expect(screen.queryByAltText("Vista previa")).not.toBeInTheDocument();
  });

  it("configura el input oculto con los atributos correctos", () => {
    const props = makeProps({ accept: "image/png, image/jpeg" });

    render(<PhotoUploader {...props} />);
    const fileInput = document.querySelector('input[type="file"]');

    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("accept", "image/png, image/jpeg");
    expect(fileInput).toHaveClass("hidden");
  });
});

describe("PhotoUploader — vista previa de imagen", () => {
  it("renderiza la imagen y el botón de eliminar cuando recibe un archivo", () => {
    const mockFile = new File(["(⌐□_□)"], "chucknorris.png", {
      type: "image/png",
    });
    const props = makeProps({ file: mockFile });

    render(<PhotoUploader {...props} />);

    expect(screen.getByAltText("Vista previa")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Eliminar foto" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Subir Fotografía")).not.toBeInTheDocument();
  });
});

describe("PhotoUploader — interacción del usuario", () => {
  it("simula el click en el input oculto al hacer click en el contenedor principal", () => {
    const props = makeProps();
    render(<PhotoUploader {...props} />);
    const container = screen.getByRole("button", {
      name: "Subir fotografía",
    });
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    fireEvent.click(container);

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("simula el click en el input oculto al presionar 'Enter' en el contenedor", () => {
    const props = makeProps();
    render(<PhotoUploader {...props} />);
    const container = screen.getByRole("button", {
      name: "Subir fotografía",
    });
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    fireEvent.keyDown(container, { key: "Enter", code: "Enter" });

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("llama a onFileChange con el archivo seleccionado cuando el usuario sube algo", () => {
    const onFileChange = vi.fn();
    const props = makeProps({ onFileChange });
    render(<PhotoUploader {...props} />);
    const fileInput = document.querySelector('input[type="file"]');
    const mockFile = new File(["hello"], "foto.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(fileInput, {
      target: { files: [mockFile] },
    });

    expect(onFileChange).toHaveBeenCalledTimes(1);
    expect(onFileChange).toHaveBeenCalledWith(mockFile);
  });

  it("llama a onFileChange con null cuando el usuario hace click en eliminar", () => {
    const mockFile = new File(["dummy"], "foto.png", { type: "image/png" });
    const onFileChange = vi.fn();
    const props = makeProps({ file: mockFile, onFileChange });
    render(<PhotoUploader {...props} />);
    const removeButton = screen.getByRole("button", {
      name: "Eliminar foto",
    });

    fireEvent.click(removeButton);

    expect(onFileChange).toHaveBeenCalledTimes(1);
    expect(onFileChange).toHaveBeenCalledWith(null);
  });
});
