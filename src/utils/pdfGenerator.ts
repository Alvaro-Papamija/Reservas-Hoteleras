import jsPDF from 'jspdf';
import { Reserva } from '../types/hotel';
import { formatCOP, formatDateDMY } from './formatters';

export const generarComprobantePDF = (reserva: Reserva): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Primary palette: Elegant boutique warm amber/slate
  const primaryColor = [180, 83, 9]; // Amber 700
  const darkTextColor = [28, 25, 23]; // Stone 900
  const mutedTextColor = [120, 113, 108]; // Stone 500
  const lightBgColor = [250, 248, 245]; // Cream warm stone

  // --- HEADER: Hotel Branding ---
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(14, 12, pageWidth - 28, 30, 'F');

  // Decorative border
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(14, 12, 14, 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ALBORADA HOTEL BOUTIQUE', 20, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('NIT: 901.482.109-4 | RNT: 48291 | Popayán, Cauca - Colombia', 20, 28);
  doc.text('Tel: +57 (602) 839-4400 | reservas@alboradahotel.com | www.alboradahotel.com', 20, 34);

  // Voucher Title & Code Badge
  currentY = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('COMPROBANTE OFICIAL DE RESERVA', 14, currentY);

  // Voucher Code Box on the Right
  const codeBoxWidth = 65;
  const codeBoxX = pageWidth - 14 - codeBoxWidth;
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(codeBoxX, currentY - 7, codeBoxWidth, 14, 2, 2, 'F');
  doc.setDrawColor(217, 119, 6); // Amber 600
  doc.setLineWidth(0.4);
  doc.roundedRect(codeBoxX, currentY - 7, codeBoxWidth, 14, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('CÓDIGO DE RESERVA:', codeBoxX + 4, currentY - 1.5);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(28, 25, 23);
  doc.text(reserva.codigo, codeBoxX + 4, currentY + 4.5);

  // Status & Date info
  currentY = 62;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CO')} | Estado: ${reserva.estado}`, 14, currentY);

  // Separator Line
  currentY = 67;
  doc.setDrawColor(231, 229, 228);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  // --- SECTION 1: Datos del Huésped ---
  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('1. INFORMACIÓN DEL HUÉSPED PRINCIPAL', 14, currentY);

  currentY += 4;
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(14, currentY, pageWidth - 28, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('Nombre completo:', 18, currentY + 6);
  doc.text('Documento de identidad:', 18, currentY + 12);
  doc.text('Correo electrónico:', 18, currentY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(reserva.cliente_nombre, 65, currentY + 6);
  doc.text(reserva.cliente_documento, 65, currentY + 12);
  doc.text(reserva.cliente_correo, 65, currentY + 18);

  if (reserva.cliente_telefono) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text('Teléfono:', 120, currentY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(reserva.cliente_telefono, 140, currentY + 12);
  }

  // --- SECTION 2: Detalles de la Estancia ---
  currentY += 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('2. DETALLES DE LA ESTANCIA Y HABITACIÓN', 14, currentY);

  currentY += 4;
  doc.setFillColor(lightBgColor[0], lightBgColor[1], lightBgColor[2]);
  doc.rect(14, currentY, pageWidth - 28, 30, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('Habitación asignada:', 18, currentY + 6);
  doc.text('Fecha de Check-in:', 18, currentY + 12);
  doc.text('Fecha de Check-out:', 18, currentY + 18);
  doc.text('Ocupantes:', 18, currentY + 24);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`Hab. ${reserva.habitacion_numero} (${reserva.habitacion_tipo})`, 65, currentY + 6);
  doc.text(`${formatDateDMY(reserva.fecha_entrada)} (a partir de las 15:00 hrs)`, 65, currentY + 12);
  doc.text(`${formatDateDMY(reserva.fecha_salida)} (hasta las 12:00 hrs)`, 65, currentY + 18);
  doc.text(`${reserva.cantidad_huespedes} persona(s) · ${reserva.cantidad_noches} noche(s) de alojamiento`, 65, currentY + 24);

  // --- SECTION 3: Liquidación Financiera ---
  currentY += 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('3. DESGLOSE FINANCIERO', 14, currentY);

  // Table header
  currentY += 4;
  doc.setFillColor(38, 38, 38); // Dark bar
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('CONCEPTO', 18, currentY + 4.8);
  doc.text('CANTIDAD', 110, currentY + 4.8);
  doc.text('TARIFA UNITARIA', 135, currentY + 4.8);
  doc.text('TOTAL (COP)', pageWidth - 18, currentY + 4.8, { align: 'right' });

  // Table row
  currentY += 7;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, currentY, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`Noche(s) de hospedaje - Hab. ${reserva.habitacion_numero}`, 18, currentY + 5.5);
  doc.text(`${reserva.cantidad_noches} noche(s)`, 110, currentY + 5.5);
  doc.text(formatCOP(reserva.precio_noche), 135, currentY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCOP(reserva.total), pageWidth - 18, currentY + 5.5, { align: 'right' });

  // Total summary box
  currentY += 12;
  const totalBoxWidth = 85;
  const totalBoxX = pageWidth - 14 - totalBoxWidth;
  doc.setFillColor(245, 245, 244);
  doc.rect(totalBoxX, currentY, totalBoxWidth, 14, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.4);
  doc.rect(totalBoxX, currentY, totalBoxWidth, 14, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('TOTAL A PAGAR:', totalBoxX + 6, currentY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatCOP(reserva.total), pageWidth - 20, currentY + 9, { align: 'right' });

  // --- SECTION 4: Políticas y Condiciones ---
  currentY += 22;
  doc.setDrawColor(231, 229, 228);
  doc.setLineWidth(0.5);
  doc.line(14, currentY, pageWidth - 14, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('TÉRMINOS Y CONDICIONES DEL ALOJAMIENTO:', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  currentY += 4.5;
  doc.text('• Política de Cancelación (RN05): Puedes cancelar sin penalidad hasta 48 horas antes de la fecha de entrada (15:00 hrs).', 14, currentY);
  currentY += 4;
  doc.text('• Check-in: A partir de las 15:00 hrs. Check-out: Máximo hasta las 12:00 hrs.', 14, currentY);
  currentY += 4;
  doc.text('• Es obligatorio presentar documento de identidad original de todos los huéspedes al momento del registro.', 14, currentY);
  currentY += 4;
  doc.text('• Hotel 100% libre de humo. Desayuno buffet incluido servido de 07:00 a 10:30 hrs en el Claustro Principal.', 14, currentY);

  // Footer stamp
  currentY = 275;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(168, 162, 158);
  doc.text('Gracias por elegir Alborada Hotel Boutique. Te deseamos una estancia memorable y placentera.', pageWidth / 2, currentY, { align: 'center' });
  doc.text(`Comprobante generado electrónicamente · Código: ${reserva.codigo}`, pageWidth / 2, currentY + 4, { align: 'center' });

  // Save to file
  doc.save(`Comprobante-Reserva-${reserva.codigo}.pdf`);
};
