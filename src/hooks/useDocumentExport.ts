import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { AbonoRecibo, VentaContrato, Cuota } from '../types/models';
import { formatCurrency, formatDate } from '../utils/formatters';

export function useDocumentExport() {
  const exportReciboPDF = async (recibo: AbonoRecibo, contrato?: VentaContrato) => {
    const doc = new jsPDF();

    // Header Branding
    doc.setFillColor(15, 23, 42); // Navy background
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PROYECTOS SAN MIGUEL', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Ecosistema Inmobiliario AMSAsystem - Nicaragua', 14, 28);
    doc.text(`Fecha Emisión: ${formatDate(recibo.fecha_pago)}`, 140, 28);

    // Document Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`COMPROBANTE OFICIAL DE PAGO: ${recibo.numero_recibo}`, 14, 55);

    // Receipt Information Table
    const tableData = [
      ['Código de Recibo:', recibo.codigo_recibo || 'N/A'],
      ['Tipo de Pago:', recibo.tipo_pago],
      ['Método de Pago:', recibo.metodo_pago],
      ['Referencia / N° Transacción:', recibo.referencia || 'N/A'],
      ['Cuenta Destino:', recibo.cuenta_destino || 'Caja Central'],
      ['Proyecto / Lotificación:', contrato?.lotificacion_nombre || 'Lotificación La Campana'],
      ['Lote Asociado:', contrato?.lote_identificador || 'N/A'],
      ['Monto Abonado:', formatCurrency(recibo.monto_abonado, 'USD')],
    ];

    autoTable(doc, {
      startY: 65,
      head: [['Concepto', 'Detalle']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    // Signature Note
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Documento generado digitalmente por San Miguel Móvil (AMSAsystem).', 14, finalY + 20);
    doc.text('Válido como constancia oficial de abono a su contrato de compraventa.', 14, finalY + 26);

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const fileName = `Recibo_${recibo.numero_recibo}.pdf`;

    try {
      // Save locally via Capacitor Filesystem
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Documents,
        recursive: true,
      });

      // Try native share dialog
      if (await Share.canShare().then(res => res.value).catch(() => false)) {
        await Share.share({
          title: `Recibo de Pago ${recibo.numero_recibo}`,
          text: `Adjunto recibo por abono de ${formatCurrency(recibo.monto_abonado)} en Proyectos San Miguel.`,
          url: savedFile.uri,
          dialogTitle: 'Compartir Recibo de Pago',
        });
      } else {
        // Web download fallback
        doc.save(fileName);
      }
    } catch {
      // Web fallback
      doc.save(fileName);
    }
  };

  const exportEstadoCuentaPDF = async (contrato: VentaContrato, cuotas: Cuota[]) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADO DE CUENTA FORMAL', 14, 20);
    doc.setFontSize(10);
    doc.text(`${contrato.lotificacion_nombre} | ${contrato.lote_identificador}`, 14, 30);
    doc.text(`Fecha: ${formatDate(new Date().toISOString())}`, 140, 30);

    // Summary block
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(`Precio Final: ${formatCurrency(contrato.precio_final)}`, 14, 55);
    doc.text(`Total Abonado: ${formatCurrency(contrato.total_abonado)}`, 80, 55);
    doc.text(`Saldo Restante: ${formatCurrency(contrato.saldo_restante)}`, 140, 55);

    // Table of quotas
    const rows = cuotas.slice(0, 40).map(c => [
      `Cuota #${c.numero_cuota}`,
      formatDate(c.fecha_vencimiento),
      formatCurrency(c.monto_total),
      formatCurrency(c.saldo_restante),
      c.estado
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['N°', 'Vencimiento', 'Monto', 'Saldo', 'Estado']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    const fileName = `Estado_Cuenta_${contrato.id_venta}.pdf`;
    doc.save(fileName);
  };

  return {
    exportReciboPDF,
    exportEstadoCuentaPDF,
  };
}
