import { describe, it, expect } from "vitest";
import { DOCUMENT_CATEGORIES } from "../../utils/documentCategories";
import {
  buildGroupedSelectOptions,
  flattenGroupedOptions,
  getAllDisplayCategories,
  groupDocumentsByCategory,
} from "../../utils/documentGrouping";

const allDocumentTypes = DOCUMENT_CATEGORIES.flatMap((category) =>
  category.documentNames.map((name, index) => ({
    value: `${category.id}-${index}`,
    label: name,
  })),
);

describe("groupDocumentsByCategory", () => {
  it("agrupa documentos por categoría según su nombre", () => {
    const grouped = groupDocumentsByCategory([
      { documentId: "1", name: "Curriculum Vitae", url: "/cv.pdf" },
      { documentId: "2", name: "Contrato", url: "/contrato.pdf" },
    ]);

    expect(grouped.verificacion_ingreso).toHaveLength(1);
    expect(grouped.verificacion_ingreso[0].name).toBe("Curriculum Vitae");
    expect(grouped.documentos_laborales).toHaveLength(1);
    expect(grouped.documentos_laborales[0].name).toBe("Contrato");
  });

  it("inicializa todas las categorías vacías", () => {
    const grouped = groupDocumentsByCategory([]);

    DOCUMENT_CATEGORIES.forEach((category) => {
      expect(grouped[category.id]).toEqual([]);
    });
  });

  it("envía documentos desconocidos a sin_categoria", () => {
    const grouped = groupDocumentsByCategory([
      { documentId: "x", name: "Documento Nuevo", url: "/nuevo.pdf" },
    ]);

    expect(grouped.sin_categoria).toHaveLength(1);
    expect(grouped.sin_categoria[0].name).toBe("Documento Nuevo");
  });
});

describe("buildGroupedSelectOptions", () => {
  it("agrupa opciones por título de categoría", () => {
    const grouped = buildGroupedSelectOptions([
      { value: "cv", label: "Curriculum Vitae" },
      { value: "contrato", label: "Contrato" },
      { value: "nss", label: "Número IMSS / NSS" },
    ]);

    expect(grouped).toHaveLength(3);
    expect(grouped[0].label).toBe("Verificación e ingreso");
    expect(grouped[0].options).toEqual([
      { value: "cv", label: "Curriculum Vitae" },
    ]);
    expect(grouped[1].label).toBe("Documentos laborales");
    expect(grouped[2].label).toBe("Situación fiscal y bancaria");
  });

  it("cubre los 45 tipos del catálogo", () => {
    const grouped = buildGroupedSelectOptions(allDocumentTypes);
    const flat = flattenGroupedOptions(grouped);

    expect(flat).toHaveLength(45);
    expect(grouped.some((group) => group.label === "Otros")).toBe(false);
  });

  it("pone tipos sin categoría en Otros", () => {
    const grouped = buildGroupedSelectOptions([
      { value: "nuevo", label: "Documento Nuevo" },
    ]);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].label).toBe("Otros");
    expect(grouped[0].options[0].label).toBe("Documento Nuevo");
  });
});

describe("flattenGroupedOptions", () => {
  it("devuelve una lista plana de opciones", () => {
    const grouped = [
      {
        label: "Verificación e ingreso",
        options: [{ value: "cv", label: "Curriculum Vitae" }],
      },
      {
        label: "Documentos laborales",
        options: [{ value: "contrato", label: "Contrato" }],
      },
    ];

    expect(flattenGroupedOptions(grouped)).toEqual([
      { value: "cv", label: "Curriculum Vitae" },
      { value: "contrato", label: "Contrato" },
    ]);
  });
});

describe("getAllDisplayCategories", () => {
  it("incluye las 7 categorías más sin categoría", () => {
    expect(getAllDisplayCategories()).toHaveLength(8);
  });
});
