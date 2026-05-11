import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PhotoUploader from "../../components/atoms/photoUploader";

// URL.createObjectURL no existe en jsdom
globalThis.URL.createObjectURL = vi.fn(() => "blob:fake-url");
globalThis.URL.revokeObjectURL = vi.fn();

const makeFile = (name = "foto.jpg", type = "image/jpeg") =>
  new File(["contenido"], name, { type });

describe("PhotoUploader — renderizado base", () => {
  it("muestra el label por defecto", () => {
    render(<PhotoUploader onFileChange={vi.fn()} />);
    expect(screen.getByText("Foto del usuario")).toBeInTheDocument();
  });

  it("muestra un label personalizado", () => {
    render(<PhotoUploader label="Avatar del perfil" onFileChange={vi.fn()} />);
    expect(screen.getByText("Avatar del perfil")).toBeInTheDocument();
  });

  it("muestra el uploadLabel dentro del área", () => {
    render(<PhotoUploader onFileChange={vi.fn()} uploadLabel="Cargar imagen" />);
    expect(screen.getByText("Cargar imagen")).toBeInTheDocument();
  });

  it("el área tiene role=button y aria-label", () => {
    render(<PhotoUploader onFileChange={vi.fn()} uploadLabel="Subir foto" />);
    expect(screen.getByRole("button", { name: "Subir foto" })).toBeInTheDocument();
  });

  it("no muestra preview ni botón de eliminar sin archivo", () => {
    render(<PhotoUploader onFileChange={vi.fn()} />);
    expect(screen.queryByAltText("Vista previa")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Eliminar foto")).not.toBeInTheDocument();
  });
});

describe("PhotoUploader — con archivo (preview)", () => {
  it("muestra la imagen de preview cuando file tiene valor", () => {
    const file = makeFile();
    render(<PhotoUploader file={file} onFileChange={vi.fn()} />);
    expect(screen.getByAltText("Vista previa")).toBeInTheDocument();
  });

  it("muestra el botón de eliminar cuando hay preview", () => {
    const file = makeFile();
    render(<PhotoUploader file={file} onFileChange={vi.fn()} />);
    expect(screen.getByLabelText("Eliminar foto")).toBeInTheDocument();
  });

  it("llama a onFileChange(null) al hacer click en eliminar", () => {
    const onFileChange = vi.fn();
    const file = makeFile();
    render(<PhotoUploader file={file} onFileChange={onFileChange} />);
    fireEvent.click(screen.getByLabelText("Eliminar foto"));
    expect(onFileChange).toHaveBeenCalledWith(null);
  });

  it("no muestra el uploadLabel cuando hay preview", () => {
    const file = makeFile();
    render(
      <PhotoUploader
        file={file}
        onFileChange={vi.fn()}
        uploadLabel="Subir fotografía"
      />,
    );
    expect(screen.queryByText("Subir fotografía")).not.toBeInTheDocument();
  });
});

describe("PhotoUploader — interacción con input", () => {
  it("llama a onFileChange con el archivo seleccionado", () => {
    const onFileChange = vi.fn();
    render(<PhotoUploader onFileChange={onFileChange} />);

    const input = document.querySelector('input[type="file"]');
    const file = makeFile("nueva.jpg");
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileChange).toHaveBeenCalledWith(file);
  });

  it("activa el input al presionar Enter en el área", () => {
    const onFileChange = vi.fn();
    render(<PhotoUploader onFileChange={onFileChange} uploadLabel="Subir" />);

    const clickSpy = vi.spyOn(
      document.querySelector('input[type="file"]'),
      "click",
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Subir" }), {
      key: "Enter",
    });

    expect(clickSpy).toHaveBeenCalled();
  });
});