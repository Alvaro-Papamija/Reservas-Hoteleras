import { TipoDocumentoLegal } from '../types/hotel';

export interface DocumentoLegalData {
  id: TipoDocumentoLegal;
  titulo: string;
  subtitulo: string;
  fechaActualizacion: string;
  secciones: {
    titulo: string;
    contenido: string;
    puntos?: string[];
  }[];
}

export const LEGAL_DOCUMENTS: Record<TipoDocumentoLegal, DocumentoLegalData> = {
  terminos: {
    id: 'terminos',
    titulo: 'Términos y Condiciones de Uso y Contratación Turística',
    subtitulo: 'Regulación del contrato de hospedaje y uso de la plataforma digital conforme a la Ley 1480 de 2011 y Ley 2068 de 2020.',
    fechaActualizacion: 'Noviembre de 2026',
    secciones: [
      {
        titulo: '1. Identificación del Proveedor y Operador Turístico',
        contenido:
          'En cumplimiento del Artículo 50 de la Ley 1480 de 2011 (Estatuto del Consumidor), se informa que este sitio web es operado por ALBORADA HOSPITALITY S.A.S., sociedad comercial legalmente constituida en Colombia, identificada con NIT 901.849.204-1, con Registro Nacional de Turismo (RNT) No. 89452 expedido por el Ministerio de Comercio, Industria y Turismo, domicilio en Sector Solárium Km 4, Colombia, teléfono de atención +57 (605) 650 9000 y correo electrónico reservas@hotelalborada.com.',
      },
      {
        titulo: '2. Objeto y Capacidad para Contratar',
        contenido:
          'Los presentes términos regulan la navegación, cotización y celebración electrónica del contrato de hospedaje para las 30 suites de Alborada Hotel Boutique. La realización de reservas exige ser mayor de 18 años y gozar de plena capacidad civil para obligarse conforme a las leyes colombianas.',
      },
      {
        titulo: '3. Precios, Moneda y Transparencia de Tarifas',
        contenido:
          'Todas las tarifas se cotizan y liquidan en Pesos Colombianos (COP). Salvo indicación expresa, las tarifas comprenden el alojamiento, los impuestos aplicables al sector hotelero y el desayuno artesanal de cortesía. Cualquier consumo adicional en restaurante o servicios extraordinarios será facturado por separado al check-out.',
      },
      {
        titulo: '4. Horarios de Check-in y Check-out',
        contenido:
          'El ingreso oficial (Check-in) opera a partir de las 3:00 PM y la entrega de habitación (Check-out) a las 12:00 PM (mediodía). Es obligatorio presentar documento de identidad original (Cédula de Ciudadanía, Cédula de Extranjería o Pasaporte) para el diligenciamiento de la Tarjeta de Registro Hotelero (TRH) según el Decreto 2590 de 2009 y la Ley 2068 de 2020.',
      },
      {
        titulo: '5. Prevención de la Explotación Sexual de Menores (Ley 679 de 2001 y Ley 1336 de 2009)',
        contenido:
          'ALBORADA HOSPITALITY S.A.S. rechaza, previene y denuncia la explotación y el abuso sexual de niños, niñas y adolescentes. Todo menor de edad debe ingresar acompañado de sus padres o tutores legales acreditando parentesco con Registro Civil de Nacimiento original o autorización notariada. La infracción de estas normas conlleva consecuencias penales privativas de la libertad.',
      },
      {
        titulo: '6. Peticiones, Quejas y Reclamos (PQR)',
        contenido:
          'Las PQR podrán radicarse mediante el correo pqr@hotelalborada.com o a través de nuestros canales de recepción. El término legal de respuesta será de máximo quince (15) días hábiles conforme al CPACA. Los consumidores podrán acudir en cualquier momento ante la Superintendencia de Industria y Comercio (SIC) a través de www.sic.gov.co.',
      },
    ],
  },

  privacidad: {
    id: 'privacidad',
    titulo: 'Política de Tratamiento de Datos Personales (PTI)',
    subtitulo: 'Aprobada en cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013 (Decreto 1074 de 2015).',
    fechaActualizacion: 'Noviembre de 2026',
    secciones: [
      {
        titulo: '1. Responsable del Tratamiento',
        contenido:
          'ALBORADA HOSPITALITY S.A.S. (NIT 901.849.204-1, RNT 89452), con domicilio en Sector Solárium Km 4, Colombia, correo electrónico de protección de datos: protecciondatos@hotelalborada.com y teléfono +57 (605) 650 9000, actúa como Responsable del Tratamiento de los datos personales de sus huéspedes y usuarios.',
      },
      {
        titulo: '2. Tratamiento y Finalidades Declaradas',
        contenido:
          'Los datos personales recopilados (nombres, apellidos, documento de identidad, teléfono, correo electrónico, fechas de viaje y requerimientos) se tratarán con las siguientes finalidades legítimas:',
        puntos: [
          'Gestión, expedición, liquidación y confirmación de reservas hoteleras.',
          'Facturación electrónica y cumplimiento de obligaciones tributarias ante la DIAN.',
          'Diligenciamiento obligatorio de la Tarjeta de Registro Hotelero (TRH) y reporte al SIRE de Migración Colombia (Ley 2068 de 2020 y Decreto 2590 de 2009).',
          'Envío de comprobantes oficiales en PDF, instrucciones de llegada y alertas operacionales.',
          'Atención y trámite de consultas, peticiones, quejas y reclamos (PQR).',
          'Envío facultativo de promociones, cupones y encuestas de satisfacción, únicamente cuando medie autorización expresa.',
        ],
      },
      {
        titulo: '3. Derechos de los Titulares (Art. 8, Ley 1581 de 2012)',
        contenido:
          'El titular de los datos personales tiene derecho a: a) Conocer, actualizar y rectificar sus datos; b) Solicitar prueba de la autorización otorgada; c) Ser informado del uso dado a sus datos; d) Presentar quejas ante la Superintendencia de Industria y Comercio (SIC); e) Revocar la autorización o solicitar la supresión de datos cuando no exista deber legal o contractual de conservarlos; f) Acceder gratuitamente a sus datos.',
      },
      {
        titulo: '4. Procedimiento para Consultas y Reclamos',
        contenido:
          'Los titulares pueden ejercer sus derechos remitiendo comunicación escrita a protecciondatos@hotelalborada.com. Las consultas serán resueltas en un plazo máximo de diez (10) días hábiles (prorrogable por 5 días hábiles). Los reclamos de corrección, supresión o revocatoria serán atendidos en máximo quince (15) días hábiles (prorrogable por 8 días hábiles adicionales).',
      },
      {
        titulo: '5. Seguridad y Periodo de Conservación',
        contenido:
          'El Responsable aplica medidas de seguridad técnicas, lógicas y administrativas para evitar la pérdida, adulteración o acceso no autorizado. Los registros de autorización y datos de reserva se conservarán durante la relación contractual y por un periodo adicional de diez (10) años, justificado en los plazos legales de prescripción comercial, contable y tributaria en Colombia.',
      },
    ],
  },

  cookies: {
    id: 'cookies',
    titulo: 'Política de Cookies y Tecnologías de Rastreo',
    subtitulo: 'Lineamientos sobre el uso de almacenamiento local y cookies técnicas bajo la normativa de la SIC.',
    fechaActualizacion: 'Noviembre de 2026',
    secciones: [
      {
        titulo: '1. Uso de Cookies y Almacenamiento Local en esta Web',
        contenido:
          'Este sitio web utiliza cookies propias de sesión y mecanismos de almacenamiento local (`localStorage`) para mantener el estado de su reserva, autenticación y preferencias. En Colombia, las cookies estrictamente necesarias para la ejecución técnica del servicio solicitado no requieren autorización previa separada.',
      },
      {
        titulo: '2. Tipos de Tecnologías Empleadas',
        contenido: 'Clasificación de tecnologías activas en Alborada Hotel Boutique:',
        puntos: [
          'Cookies Técnicas Esenciales: Imprescindibles para la autenticación, seguridad contra ataques CSRF/XSS, selección de fechas y liquidación del total de reserva.',
          'Cookies de Preferencias: Guardan su selección de idioma, rol activo y estado de lectura de notificaciones.',
          'Cookies de Análisis / Estadísticas: Empleadas para medir tráfico agregado y rendimiento sin perfilamiento comercial intrusivo.',
        ],
      },
      {
        titulo: '3. Administración y Bloqueo',
        contenido:
          'Usted puede rechazar las cookies no esenciales mediante nuestro banner de configuración inicial o ajustar las preferencias de privacidad directamente en las opciones de su navegador (Chrome, Edge, Firefox, Safari). La desactivación de cookies técnicas esenciales puede impedir el funcionamiento del motor de reservas.',
      },
    ],
  },

  retracto: {
    id: 'retracto',
    titulo: 'Política de Cancelación, Reembolso y Derecho de Retracto',
    subtitulo: 'Regulación imperativa del Artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor) y políticas hoteleras.',
    fechaActualizacion: 'Noviembre de 2026',
    secciones: [
      {
        titulo: '1. Derecho Legal de Retracto (Art. 47, Ley 1480 de 2011)',
        contenido:
          'En las reservas celebradas a través de este portal de comercio electrónico, el consumidor tiene derecho a retractarse dentro de los cinco (5) días hábiles siguientes a la fecha de confirmación de la reserva. Al ejercerse en plazo legal, Alborada Hotel Boutique reintegrará la totalidad del dinero pagado sin descuentos ni penalidades en un término máximo de treinta (30) días calendario.',
      },
      {
        titulo: '2. Excepción Legal al Derecho de Retracto',
        contenido:
          'De conformidad con el numeral 4 del Artículo 47 de la Ley 1480 de 2011, el derecho de retracto NO aplicará cuando la prestación del servicio de hospedaje comience a ejecutarse antes de que venza el plazo de cinco (5) días hábiles (reservas de última hora o check-in inmediato).',
      },
      {
        titulo: '3. Política Hotelera de Cancelación Flexible (Hasta 48 Horas)',
        contenido:
          'Para mayor comodidad de nuestros viajeros, fuera del plazo legal de retracto el hotel ofrece cancelación voluntaria gratuita hasta 48 horas antes de la hora oficial de check-in (3:00 PM del día de llegada). Las cancelaciones efectuadas con menos de 48 horas de anticipación o la inasistencia injustificada (No-Show) conllevarán el cobro de la primera noche de estancia como penalidad legal de bloqueo de inventario conforme a la Ley 2068 de 2020.',
      },
      {
        titulo: '4. Reversión del Pago (Art. 51, Ley 1480 de 2011 y Decreto 587 de 2016)',
        contenido:
          'Tratándose de pagos electrónicos con tarjeta de crédito o débito, el consumidor podrá solicitar la reversión en caso de fraude, operación no solicitada o servicio no prestado, radicando su queja dentro de los cinco (5) días hábiles siguientes a la fecha en que tuvo conocimiento del suceso.',
      },
    ],
  },
};
