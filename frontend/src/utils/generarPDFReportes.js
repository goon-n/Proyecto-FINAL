// src/utils/generarPDFReportes.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarPDFReportes = (reportes, filtros = {}) => {
  const doc = new jsPDF(); // ← VERTICAL (portrait)
  
  // ========== ENCABEZADO ==========
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('Historial de Reportes de Accesorios', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.setTextColor(100);
  const fechaActual = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generado: ${fechaActual}`, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });
  
  // Filtros aplicados
  let yPos = 35;
  if (filtros.estado && filtros.estado !== 'todos') {
    doc.setFontSize(9);
    doc.text(`Filtro aplicado: ${filtros.estado.toUpperCase()}`, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 6;
  }
  
  // ========== TABLA DE REPORTES ==========
  const tableData = reportes.map(reporte => [
    `#${reporte.id}`,
    reporte.accesorio_nombre,
    reporte.cantidad.toString(),
    getMotivoTexto(reporte.motivo),
    reporte.descripcion.length > 35 
      ? reporte.descripcion.substring(0, 35) + '...' 
      : reporte.descripcion,
    reporte.reportado_por_username,
    new Date(reporte.fecha_reporte).toLocaleDateString('es-AR'),
    getEstadoTexto(reporte.estado),
    reporte.confirmado_por_username || '-'
  ]);
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [['ID', 'Accesorio', 'Cant.', 'Motivo', 'Descripción', 'Reportado por', 'Fecha', 'Estado', 'Conf. por']],
    body: tableData,
    styles: { 
      fontSize: 7,
      cellPadding: 2,
      halign: 'center',
      valign: 'middle',
      lineColor: [220, 220, 220],
      lineWidth: 0.3
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },   // ID
      1: { cellWidth: 32, halign: 'left' },     // Accesorio
      2: { cellWidth: 12, halign: 'center' },   // Cantidad
      3: { cellWidth: 22, halign: 'center' },   // Motivo
      4: { cellWidth: 40, halign: 'left' },     // Descripción
      5: { cellWidth: 20, halign: 'center' },   // Reportado por
      6: { cellWidth: 20, halign: 'center' },   // Fecha
      7: { cellWidth: 22, halign: 'center' },   // Estado
      8: { cellWidth: 20, halign: 'center' }    // Confirmado por
    },
    didParseCell: function(data) {
      if (data.column.index === 7 && data.section === 'body') {
        const estado = reportes[data.row.index]?.estado;
        if (estado === 'confirmado') {
          data.cell.styles.textColor = [34, 197, 94]; // Verde
          data.cell.styles.fontStyle = 'bold';
        } else if (estado === 'rechazado') {
          data.cell.styles.textColor = [239, 68, 68]; // Rojo
          data.cell.styles.fontStyle = 'bold';
        } else if (estado === 'pendiente') {
          data.cell.styles.textColor = [234, 179, 8]; // Amarillo
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 10, right: 10, bottom: 20 },
    pageBreak: 'auto',
    showHead: 'everyPage',
    tableWidth: 'auto'
  });
  
  // ========== PIE DE PÁGINA ==========
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    
    // Línea de separación
    doc.setDrawColor(200);
    doc.line(10, doc.internal.pageSize.getHeight() - 15, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.getHeight() - 15);
    
    // Número de página centrado
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // ========== GUARDAR PDF ==========
  const fecha = new Date();
  const nombreArchivo = `reportes_${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}_${fecha.getHours().toString().padStart(2, '0')}-${fecha.getMinutes().toString().padStart(2, '0')}-${fecha.getSeconds().toString().padStart(2, '0')}.pdf`;
  doc.save(nombreArchivo);
};

// Funciones auxiliares
const getMotivoTexto = (motivo) => {
  const motivos = {
    faltante: 'Faltante',
    roto: 'Roto/Dañado',
    extraviado: 'Extraviado',
    otro: 'Otro'
  };
  return motivos[motivo] || motivo;
};

const getEstadoTexto = (estado) => {
  const estados = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    rechazado: 'Rechazado'
  };
  return estados[estado] || estado;
};