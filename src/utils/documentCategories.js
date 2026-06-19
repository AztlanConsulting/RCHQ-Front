export const UNCATEGORIZED_CATEGORY_ID = "sin_categoria";
export const OTHER_GROUP_LABEL = "Otros";

export const DOCUMENT_CATEGORIES = [
  {
    id: "verificacion_ingreso",
    title: "Verificación e ingreso",
    description:
      "Documentos para validar identidad, competencia y antecedentes antes de contratar",
    documentNames: [
      "Curriculum Vitae",
      "Acta de Nacimiento",
      "CURP",
      "INE",
      "Cédula Profesional",
      "Título o Comprobante de Último Nivel de Estudios",
      "Carta de No Antecedentes Penales Estatal",
      "Carta de No Antecedentes Penales Federal",
      "Licencia de Manejo",
      "Permiso de Trabajo (para extranjeros)",
      "Perfil del Puesto / Manual de Puesto",
      "Carta de Recomendación 1",
      "Carta de Recomendación 2",
      "Identificación de la Universidad",
      "Pruebas Psicométricas o Psicológicas",
      "Comprobante de Domicilio",
    ],
  },
  {
    id: "documentos_laborales",
    title: "Documentos laborales",
    description: "Lo que firma al ingresar: compromisos, reglas del juego",
    documentNames: [
      "Contrato",
      "Reglamento Interno de Trabajo Firmado",
      "Carta de Confidencialidad Firmada",
      "Código de Ética Firmado",
      "Manual de Inducción",
      "Aviso de Privacidad",
    ],
  },
  {
    id: "situacion_fiscal_bancaria",
    title: "Situación fiscal y bancaria",
    description: "Trámites fiscales y datos para pago",
    documentNames: [
      "Constancia de Situación Fiscal",
      "Número IMSS / NSS",
      "Cuenta Bancaria",
      "Hoja de Retención de INFONAVIT",
    ],
  },
  {
    id: "desempeno_capacitacion",
    title: "Desempeño y capacitación",
    description: "Seguimiento durante la relación laboral",
    documentNames: [
      "Evaluación de Desempeño",
      "Constancia de Capacitación o Certificación",
      "Acta Administrativa 1",
      "Acta Administrativa 2",
      "Acta Administrativa 3",
      "Comprobante de Domicilio Actualización Semestral",
    ],
  },
  {
    id: "salud_emergencias",
    title: "Salud y emergencias",
    description: "Información médica y contactos para casos de urgencia",
    documentNames: [
      "Certificado Médico",
      "Contacto de Emergencia 1",
      "Contacto de Emergencia 2",
    ],
  },
  {
    id: "voluntariado_servicio_social",
    title: "Voluntariado / servicio social",
    description:
      "Documentación específica para voluntarios y estudiantes en servicio social",
    documentNames: [
      "Carta Solicitud de la Escuela / Universidad (Servicio Social)",
      "Carta de Voluntariado",
      "Norma del Voluntario (Ley General de Voluntariado)",
      "Plan de Voluntariado",
      "Reportes Voluntarios / Servicio Social",
      "Carta de Acreditación de Horas",
    ],
  },
  {
    id: "salida_documentacion_final",
    title: "Salida / documentación final",
    description: "Cuando termina la relación laboral",
    documentNames: [
      "Carta de Renuncia",
      "Finiquito Firmado",
      "Carta de Despido",
      "Carta de Recepción de Equipo de Trabajo o Uniforme",
    ],
  },
];

export const UNCATEGORIZED_CATEGORY = {
  id: UNCATEGORIZED_CATEGORY_ID,
  title: "Sin categoría",
  description: "Documentos sin categoría asignada",
};

export const DOCUMENT_NAME_TO_CATEGORY = DOCUMENT_CATEGORIES.reduce(
  (map, category) => {
    category.documentNames.forEach((name) => {
      map[name] = category.id;
    });
    return map;
  },
  {},
);

export const getCategoryIdForDocumentName = (name) =>
  DOCUMENT_NAME_TO_CATEGORY[name] ?? UNCATEGORIZED_CATEGORY_ID;
