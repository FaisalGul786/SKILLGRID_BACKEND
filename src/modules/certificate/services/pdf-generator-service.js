import PDFDocument from 'pdfkit';

export const generateCertificatePdfBuffer = (data) => {
  return new Promise((resolve, reject) => {
    const { studentName, courseTitle, certificateCode, issuedAt } = data;

    // Landscape orientation (841.89 x 595.28 pt -> A4 Landscape)
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 40,
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const width = doc.page.width;
    const height = doc.page.height;

    // Outer & Inner Borders
    doc.rect(20, 20, width - 40, height - 40).stroke('#6366f1');
    doc.rect(25, 25, width - 50, height - 50).stroke('#4f46e5');

    // Header Kicker
    doc
      .fillColor('#6366f1')
      .fontSize(14)
      .text('NEXORA LEARNING PLATFORM', 0, 80, { align: 'center' });

    // Main Title
    doc
      .fillColor('#0f172a')
      .fontSize(32)
      .text('CERTIFICATE OF COMPLETION', 0, 110, { align: 'center' });

    // Subtitle
    doc
      .fillColor('#64748b')
      .fontSize(14)
      .text('This is proudly presented to', 0, 175, { align: 'center' });

    // Student Name
    doc
      .fillColor('#1e1b4b')
      .fontSize(28)
      .text(studentName || 'Valued Student', 0, 205, { align: 'center' });

    // Course completion text
    doc
      .fillColor('#64748b')
      .fontSize(14)
      .text('for successfully completing the course', 0, 255, { align: 'center' });

    // Course Title
    doc
      .fillColor('#4338ca')
      .fontSize(22)
      .text(courseTitle, 0, 285, { align: 'center' });

    // Date & Signature Metadata
    const issueDateStr = issuedAt
      ? new Date(issuedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString();

    doc
      .fillColor('#334155')
      .fontSize(11)
      .text(`Issued Date: ${issueDateStr}`, 80, 420)
      .text(`Certificate Code: ${certificateCode}`, 80, 440);

    doc
      .fillColor('#0f172a')
      .fontSize(12)
      .text('Nexora Academic Board', width - 280, 420, { align: 'right' });

    doc.end();
  });
};