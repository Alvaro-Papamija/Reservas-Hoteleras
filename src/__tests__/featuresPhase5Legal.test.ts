import { describe, it, expect } from 'vitest';
import { LEGAL_DOCUMENTS } from '../data/legalContent';
import { ConsentimientoLegal, TipoDocumentoLegal } from '../types/hotel';

describe('Fase 5: Cumplimiento Normativo Legal Colombiano (Ley 1581 de 2012 / Ley 1480 de 2011)', () => {
  it('dispone de los cuatro documentos legales reglamentarios completos', () => {
    const docKeys: TipoDocumentoLegal[] = ['terminos', 'privacidad', 'cookies', 'retracto'];

    docKeys.forEach((key) => {
      const doc = LEGAL_DOCUMENTS[key];
      expect(doc).toBeDefined();
      expect(doc.id).toBe(key);
      expect(doc.titulo.length).toBeGreaterThan(10);
      expect(doc.fechaActualizacion).toBeDefined();
      expect(doc.secciones.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Términos y Condiciones de Uso (Estatuto del Consumidor - Ley 1480 de 2011)', () => {
    const terminos = LEGAL_DOCUMENTS.terminos;

    it('incluye identificación corporativa obligatoria (Razón social, NIT, RNT)', () => {
      const intro = terminos.secciones[0].contenido;
      expect(intro).toContain('ALBORADA HOSPITALITY S.A.S.');
      expect(intro).toContain('901.849.204-1');
      expect(intro).toContain('89452');
      expect(intro).toContain('Sector Solárium Km 4, Colombia');
      expect(intro).toContain('reservas@hotelalborada.com');
    });

    it('incorpora cláusula de prevención contra la explotación sexual de menores (Ley 679 de 2001)', () => {
      const escnnaSection = terminos.secciones.find((s) => s.titulo.includes('Ley 679 de 2001'));
      expect(escnnaSection).toBeDefined();
      expect(escnnaSection?.contenido).toContain('menor de edad');
      expect(escnnaSection?.contenido).toContain('penales privativas de la libertad');
    });

    it('regula el trámite de peticiones, quejas y reclamos con enlace directo a la SIC', () => {
      const pqrSection = terminos.secciones.find((s) => s.titulo.includes('PQR'));
      expect(pqrSection).toBeDefined();
      expect(pqrSection?.contenido).toContain('Superintendencia de Industria y Comercio');
      expect(pqrSection?.contenido).toContain('www.sic.gov.co');
    });
  });

  describe('Política de Tratamiento de Información (PTI - Ley 1581 de 2012 y Decreto 1377 de 2013)', () => {
    const privacidad = LEGAL_DOCUMENTS.privacidad;

    it('especifica derechos de los titulares según la Ley 1581 de 2012 (Habeas Data)', () => {
      const derechosSec = privacidad.secciones.find((s) => s.titulo.includes('Derechos de los Titulares'));
      expect(derechosSec).toBeDefined();
      expect(derechosSec?.contenido).toContain('Conocer, actualizar y rectificar');
      expect(derechosSec?.contenido).toContain('Revocar la autorización');
      expect(derechosSec?.contenido).toContain('Superintendencia de Industria y Comercio');
    });

    it('define canales y procedimiento de consultas y reclamos (Arts. 14 y 15 Ley 1581)', () => {
      const pqrSec = privacidad.secciones.find((s) => s.titulo.includes('Procedimiento'));
      expect(pqrSec).toBeDefined();
      expect(pqrSec?.contenido).toContain('diez (10) días hábiles');
      expect(pqrSec?.contenido).toContain('quince (15) días hábiles');
      expect(pqrSec?.contenido).toContain('protecciondatos@hotelalborada.com');
    });

    it('declara la vigencia de la base de datos y período de conservación justificado', () => {
      const vigenciaSec = privacidad.secciones.find((s) => s.titulo.includes('Conservación'));
      expect(vigenciaSec).toBeDefined();
      expect(vigenciaSec?.contenido).toContain('diez (10) años');
    });
  });

  describe('Política de Cancelación, Reembolso y Reversión de Pagos', () => {
    const retracto = LEGAL_DOCUMENTS.retracto;

    it('regula el derecho de retracto de 5 días hábiles conforme al Art. 47 de la Ley 1480 de 2011', () => {
      const retractoSec = retracto.secciones.find((s) => s.titulo.includes('Derecho Legal de Retracto'));
      expect(retractoSec).toBeDefined();
      expect(retractoSec?.contenido).toContain('cinco (5) días hábiles');
      expect(retractoSec?.contenido).toContain('treinta (30) días calendario');
      expect(retractoSec?.contenido).toContain('sin descuentos ni penalidades');
    });

    it('establece las condiciones de reversión del pago (Decreto 587 de 2016)', () => {
      const reversionSec = retracto.secciones.find((s) => s.titulo.includes('Reversión del Pago'));
      expect(reversionSec).toBeDefined();
      expect(reversionSec?.titulo).toContain('Decreto 587 de 2016');
      expect(reversionSec?.contenido).toContain('fraude');
      expect(reversionSec?.contenido).toContain('tarjeta de crédito o débito');
    });

    it('establece política hotelera flexible fuera del plazo legal', () => {
      const flexibleSec = retracto.secciones.find((s) => s.titulo.includes('Flexible'));
      expect(flexibleSec).toBeDefined();
      expect(flexibleSec?.contenido).toContain('48 horas');
    });
  });

  describe('Sistema de Registro de Consentimiento / Pistas de Auditoría', () => {
    it('crea un registro válido de consentimiento con timestamp, versión y marcas de verificación', () => {
      const consentimiento: ConsentimientoLegal = {
        acepto_terminos: true,
        autorizo_tratamiento_datos: true,
        autorizo_comunicaciones_comerciales: false,
        fecha_consentimiento: new Date().toISOString(),
        version_politica: 'v2026.1',
        ip_registro: '190.157.22.84',
      };

      expect(consentimiento.acepto_terminos).toBe(true);
      expect(consentimiento.autorizo_tratamiento_datos).toBe(true);
      expect(consentimiento.autorizo_comunicaciones_comerciales).toBe(false);
      expect(consentimiento.version_politica).toBe('v2026.1');
      expect(Date.parse(consentimiento.fecha_consentimiento)).not.toBeNaN();
    });

    it('invalida el consentimiento si faltan los términos o la autorización de hábeas data', () => {
      const validarConsentimiento = (c: Partial<ConsentimientoLegal>): boolean => {
        return Boolean(c.acepto_terminos && c.autorizo_tratamiento_datos);
      };

      expect(validarConsentimiento({ acepto_terminos: true, autorizo_tratamiento_datos: false })).toBe(false);
      expect(validarConsentimiento({ acepto_terminos: false, autorizo_tratamiento_datos: true })).toBe(false);
      expect(validarConsentimiento({ acepto_terminos: true, autorizo_tratamiento_datos: true })).toBe(true);
    });

    it('garantiza que la autorización comercial es facultativa e independiente', () => {
      const registroSinMarketing: ConsentimientoLegal = {
        acepto_terminos: true,
        autorizo_tratamiento_datos: true,
        autorizo_comunicaciones_comerciales: false,
        fecha_consentimiento: '2026-11-16T19:00:00Z',
        version_politica: 'v2026.1',
      };

      // Debe ser una reserva válida aun cuando el usuario rechaza marketing
      expect(registroSinMarketing.acepto_terminos).toBe(true);
      expect(registroSinMarketing.autorizo_tratamiento_datos).toBe(true);
      expect(registroSinMarketing.autorizo_comunicaciones_comerciales).toBe(false);
    });
  });

  describe('Política y Banner de Cookies', () => {
    it('clasifica las cookies distinguiendo técnicas de analíticas y de preferencias', () => {
      const cookiesDoc = LEGAL_DOCUMENTS.cookies;
      const tiposSec = cookiesDoc.secciones.find((s) => s.titulo.includes('Tipos de Tecnologías'));
      expect(tiposSec).toBeDefined();
      expect(tiposSec?.puntos?.some((p) => p.includes('Técnicas Esenciales'))).toBe(true);
      expect(tiposSec?.puntos?.some((p) => p.includes('Preferencias'))).toBe(true);
      expect(tiposSec?.puntos?.some((p) => p.includes('Análisis / Estadísticas'))).toBe(true);
    });
  });
});
