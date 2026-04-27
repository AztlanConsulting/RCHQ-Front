// tests/frontend/ProfileService.test.js
import { getUserData, getReadableErrors } from "../../Services/ProfileService";

const API_URL = "http://localhost:3000";

// ─── Mock global fetch ───────────────────────────────────────────────────────
const mockFetch = (status, body) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok:     status >= 200 && status < 300,
    status,
    json:   jest.fn().mockResolvedValue(body),
  });
};

const TOKEN = "mock-jwt-token";

const PROFILE_RESPONSE = {
  success: true,
  data: {
    houseName:   "Casa Hogar Querétaro",
    roleName:    "Coordinador",
    name:        "Juan",
    surname:     "Pérez",
    email:       "juan@casa.org",
    rfc:         "PERJ900101ABC",
    curp:        "PERJ900101HDFRZN01",
    nss:         "12345678901",
    bankAccount: "012345678901234567",
    birthDate:   "1990-01-01T00:00:00.000Z",
    picture:     "https://cdn.example.com/foto.jpg",
  },
};

// ─── getUserData ─────────────────────────────────────────────────────────────
describe("ProfileService — getUserData", () => {
  afterEach(() => jest.resetAllMocks());

  describe("Flujo exitoso — 200", () => {
    it("hace fetch a la ruta correcta con el token", async () => {
      mockFetch(200, PROFILE_RESPONSE);

      await getUserData(TOKEN);

      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/auth/profile`,
        expect.objectContaining({
          method:  "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${TOKEN}`,
          }),
        })
      );
    });

    it("retorna el body del response cuando es exitoso", async () => {
      mockFetch(200, PROFILE_RESPONSE);

      const result = await getUserData(TOKEN);

      expect(result).toEqual(PROFILE_RESPONSE);
    });
  });

  describe("Flujo - error 401 (sin permisos)", () => {
    it("lanza un error con status 401", async () => {
      mockFetch(401, { message: "No autorizado" });

      await expect(getUserData(TOKEN)).rejects.toMatchObject({
        status:  401,
        message: "No autorizado",
      });
    });

    it("usa el mensaje de fallback cuando el body no trae message", async () => {
      mockFetch(401, {});

      const err = await getUserData(TOKEN).catch((e) => e);

      expect(err.message).toBe("No tienes permisos para ver esta información.");
    });
  });

  describe("Flujo - error 404 (ruta no encontrada)", () => {
    it("lanza un error con status 404", async () => {
      mockFetch(404, { message: "Not found" });

      const err = await getUserData(TOKEN).catch((e) => e);

      expect(err.status).toBe(404);
    });

    it("usa el mensaje de fallback 404 cuando no hay message", async () => {
      mockFetch(404, {});

      const err = await getUserData(TOKEN).catch((e) => e);

      expect(err.message).toBe("Ruta no encontrada.");
    });
  });

  describe("Flujo - error 501 (error del servidor)", () => {
    it("lanza un error con status 501", async () => {
      mockFetch(501, {});

      const err = await getUserData(TOKEN).catch((e) => e);

      expect(err.status).toBe(501);
      expect(err.message).toBe("Ocurrió un problema al obtener la información.");
    });
  });

  describe("Flujo - status desconocido", () => {
    it("usa mensaje genérico para status no mapeado", async () => {
      mockFetch(503, {});

      const err = await getUserData(TOKEN).catch((e) => e);

      expect(err.message).toBe("Error desconocido.");
    });
  });

  describe("Flujo - error de red", () => {
    it("propaga el error cuando fetch falla por red", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network Error"));

      await expect(getUserData(TOKEN)).rejects.toThrow("Network Error");
    });
  });
});

// ─── getReadableErrors ───────────────────────────────────────────────────────
describe("ProfileService — getReadableErrors", () => {
  it("retorna mensajes del array errors cuando existe y tiene items", () => {
    const err = {
      errors:  [{ message: "Campo inválido" }, { message: "Otro error" }],
      message: "Error general",
    };

    expect(getReadableErrors(err)).toEqual(["Campo inválido", "Otro error"]);
  });

  it("retorna el message del error cuando no hay array errors", () => {
    const err = { message: "Sin permisos" };

    expect(getReadableErrors(err)).toEqual(["Sin permisos"]);
  });

  it("retorna el mensaje genérico cuando no hay nada", () => {
    expect(getReadableErrors({})).toEqual(["Ocurrió un error inesperado"]);
    expect(getReadableErrors(null)).toEqual(["Ocurrió un error inesperado"]);
  });

  it("ignora arrays de errors vacíos y cae al message", () => {
    const err = { errors: [], message: "Algo salió mal" };

    expect(getReadableErrors(err)).toEqual(["Algo salió mal"]);
  });
});