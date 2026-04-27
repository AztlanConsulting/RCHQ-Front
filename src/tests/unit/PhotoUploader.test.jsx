// tests/unit/PhotoUploader.test.jsx
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PhotoUploader from "../../Components/Atoms/PhotoUploader";

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
    // Arrange
    const props = makeProps({ label: "Fotografía del empleado" });

    // Act
    render(<PhotoUploader {...props} />);

    // Assert
    expect(screen.getByText("Fotografía del empleado")).toBeInTheDocument();
  });

  it("muestra el estado inicial vacío (ícono y texto) cuando no hay archivo", () => {
    // Arrange
    const props = makeProps({ file: null });

    // Act
    render(<PhotoUploader {...props} />);

    // Assert
    expect(screen.getByText("Subir fotografía")).toBeInTheDocument();
    expect(screen.queryByAltText("Vista previa")).not.toBeInTheDocument();
  });

  it("configura el input oculto con los atributos correctos", () => {
    // Arrange
    const props = makeProps({ accept: "image/png, image/jpeg" });

    // Act
    render(<PhotoUploader {...props} />);
    const fileInput = document.querySelector('input[type="file"]');

    // Assert
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("accept", "image/png, image/jpeg");
    expect(fileInput).toHaveClass("hidden");
  });
});

describe("PhotoUploader — vista previa de imagen", () => {
  it("renderiza la imagen y el botón de eliminar cuando recibe un archivo", () => {
    // Arrange
    const mockFile = new File(["(⌐□_□)"], "chucknorris.png", {
      type: "image/png",
    });
    const props = makeProps({ file: mockFile });

    // Act
    render(<PhotoUploader {...props} />);

    // Assert
    expect(screen.getByAltText("Vista previa")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Eliminar foto" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Subir Fotografía")).not.toBeInTheDocument();
  });
});

describe("PhotoUploader — interacción del usuario", () => {
  it("simula el click en el input oculto al hacer click en el contenedor principal", () => {
    // Arrange
    const props = makeProps();
    render(<PhotoUploader {...props} />);
    const container = screen.getByRole("button", {
      name: "Subir fotografía",
    });
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    // Act
    fireEvent.click(container);

    // Assert
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("simula el click en el input oculto al presionar 'Enter' en el contenedor", () => {
    // Arrange
    const props = makeProps();
    render(<PhotoUploader {...props} />);
    const container = screen.getByRole("button", {
      name: "Subir fotografía",
    });
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    // Act
    fireEvent.keyDown(container, { key: "Enter", code: "Enter" });

    // Assert
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("llama a onFileChange con el archivo seleccionado cuando el usuario sube algo", () => {
    // Arrange
    const onFileChange = vi.fn();
    const props = makeProps({ onFileChange });
    render(<PhotoUploader {...props} />);
    const fileInput = document.querySelector('input[type="file"]');
    const mockFile = new File(["hello"], "foto.jpg", {
      type: "image/jpeg",
    });

    // Act
    fireEvent.change(fileInput, {
      target: { files: [mockFile] },
    });

    // Assert
    expect(onFileChange).toHaveBeenCalledTimes(1);
    expect(onFileChange).toHaveBeenCalledWith(mockFile);
  });

  it("llama a onFileChange con null cuando el usuario hace click en eliminar", () => {
    // Arrange
    const mockFile = new File(["dummy"], "foto.png", { type: "image/png" });
    const onFileChange = vi.fn();
    const props = makeProps({ file: mockFile, onFileChange });
    render(<PhotoUploader {...props} />);
    const removeButton = screen.getByRole("button", {
      name: "Eliminar foto",
    });

    // Act
    fireEvent.click(removeButton);

    // Assert
    expect(onFileChange).toHaveBeenCalledTimes(1);
    expect(onFileChange).toHaveBeenCalledWith(null);
  });
});
