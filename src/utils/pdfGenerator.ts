import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from '../types';
import { formatCurrency, formatDate } from './calculations';

export function generatePDF(quotation: Quotation) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quote_number, pageWidth / 2, 27, { align: 'center' });

  if (quotation.company) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(quotation.company.name, 20, 45);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let yPos = 52;

    if (quotation.company.address) {
      doc.text(quotation.company.address, 20, yPos);
      yPos += 5;
    }

    const cityLine = [
      quotation.company.city,
      quotation.company.state,
      quotation.company.postal_code,
    ]
      .filter(Boolean)
      .join(', ');

    if (cityLine) {
      doc.text(cityLine, 20, yPos);
      yPos += 5;
    }

    if (quotation.company.email) {
      doc.text(`Email: ${quotation.company.email}`, 20, yPos);
      yPos += 5;
    }

    if (quotation.company.phone) {
      doc.text(`Phone: ${quotation.company.phone}`, 20, yPos);
    }
  }

  if (quotation.client) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', pageWidth - 20, 45, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let yPos = 52;

    doc.text(quotation.client.name, pageWidth - 20, yPos, { align: 'right' });
    yPos += 5;

    if (quotation.client.address) {
      doc.text(quotation.client.address, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }

    const clientCityLine = [
      quotation.client.city,
      quotation.client.state,
      quotation.client.postal_code,
    ]
      .filter(Boolean)
      .join(', ');

    if (clientCityLine) {
      doc.text(clientCityLine, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }

    if (quotation.client.email) {
      doc.text(quotation.client.email, pageWidth - 20, yPos, { align: 'right' });
    }
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 85, pageWidth - 20, 85);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue Date: ${formatDate(quotation.issue_date)}`, 20, 92);

  if (quotation.valid_until) {
    doc.text(`Valid Until: ${formatDate(quotation.valid_until)}`, 20, 98);
  }

  const tableData = (quotation.items || []).map((item) => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unit_price, quotation.currency),
    formatCurrency(item.total, quotation.currency),
  ]);

  autoTable(doc, {
    startY: 110,
    head: [['Description', 'Quantity', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  const summaryX = pageWidth - 80;
  let summaryY = finalY;

  doc.setFontSize(9);
  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(formatCurrency(quotation.subtotal, quotation.currency), pageWidth - 20, summaryY, {
    align: 'right',
  });
  summaryY += 7;

  if (quotation.tax_rate > 0) {
    doc.text(`Tax (${quotation.tax_rate}%):`, summaryX, summaryY);
    doc.text(formatCurrency(quotation.tax_amount, quotation.currency), pageWidth - 20, summaryY, {
      align: 'right',
    });
    summaryY += 7;
  }

  if (quotation.discount_value > 0) {
    const discountLabel =
      quotation.discount_type === 'percentage'
        ? `Discount (${quotation.discount_value}%):`
        : 'Discount:';
    doc.text(discountLabel, summaryX, summaryY);
    doc.text(
      `-${formatCurrency(quotation.discount_amount, quotation.currency)}`,
      pageWidth - 20,
      summaryY,
      { align: 'right' }
    );
    summaryY += 7;
  }

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(summaryX, summaryY, pageWidth - 20, summaryY);
  summaryY += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', summaryX, summaryY);
  doc.text(formatCurrency(quotation.total, quotation.currency), pageWidth - 20, summaryY, {
    align: 'right',
  });

  if (quotation.terms) {
    const termsY = summaryY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 20, termsY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const splitTerms = doc.splitTextToSize(quotation.terms, pageWidth - 40);
    doc.text(splitTerms, 20, termsY + 7);
  }

  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

  doc.save(`${quotation.quote_number}.pdf`);
}
