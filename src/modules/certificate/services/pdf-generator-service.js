// import PDFDocument from 'pdfkit';

// export const generateCertificatePdfBuffer = (data) => {
//   return new Promise((resolve, reject) => {
//     const { studentName, courseTitle, certificateCode, issuedAt, templateImageBuffer } = data;

//     // If using a template image, margin must be 0 to cover the whole page
//     const doc = new PDFDocument({
//       size: 'A4',
//       layout: 'landscape',
//       margin: templateImageBuffer ? 0 : 40, 
//     });

//     const buffers = [];
//     doc.on('data', (chunk) => buffers.push(chunk));
//     doc.on('end', () => resolve(Buffer.concat(buffers)));
//     doc.on('error', (err) => reject(err));

//     const width = doc.page.width;
//     const height = doc.page.height;

//     const issueDateStr = issuedAt
//       ? new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
//       : new Date().toLocaleDateString();

//     if (templateImageBuffer) {
//       // --- MODE 1: ADMIN TEMPLATE BACKGROUND ---
//       doc.image(templateImageBuffer, 0, 0, { width, height });

//       doc.fillColor('#1e1b4b').fontSize(36).font('Helvetica-Bold')
//         .text(studentName || 'Valued Student', 0, 240, { align: 'center' });

//       doc.fillColor('#4338ca').fontSize(24).font('Helvetica')
//         .text(courseTitle, 0, 350, { align: 'center', width });

//       // Adjust these coordinates to match the blank spaces on the Canva PNG
//       doc.fillColor('#334155').fontSize(12).font('Helvetica')
//         .text(issueDateStr, 160, 420)
//         .text(certificateCode, 180, 440);

//     } else {
//       // --- MODE 2: SCRATCH GENERATION (FALLBACK) ---
//       doc.rect(20, 20, width - 40, height - 40).stroke('#6366f1');
//       doc.rect(25, 25, width - 50, height - 50).stroke('#4f46e5');

//       doc.fillColor('#6366f1').fontSize(14)
//         .text('NEXORA LEARNING PLATFORM', 0, 80, { align: 'center' });

//       doc.fillColor('#0f172a').fontSize(32)
//         .text('CERTIFICATE OF COMPLETION', 0, 110, { align: 'center' });

//       doc.fillColor('#64748b').fontSize(14)
//         .text('This is proudly presented to', 0, 175, { align: 'center' });

//       doc.fillColor('#1e1b4b').fontSize(28)
//         .text(studentName || 'Valued Student', 0, 205, { align: 'center' });

//       doc.fillColor('#64748b').fontSize(14)
//         .text('for successfully completing the course', 0, 255, { align: 'center' });

//       doc.fillColor('#4338ca').fontSize(22)
//         .text(courseTitle, 0, 285, { align: 'center' });

//       doc.fillColor('#334155').fontSize(11)
//         .text(`Issued Date: ${issueDateStr}`, 80, 420)
//         .text(`Certificate Code: ${certificateCode}`, 80, 440);

//       doc.fillColor('#0f172a').fontSize(12)
//         .text('Nexora Academic Board', width - 280, 420, { align: 'right' });
//     }

//     doc.end();
//   });
// };


import PDFDocument from 'pdfkit';

export const generateCertificatePdfBuffer = (data) => {
  return new Promise((resolve, reject) => {
    const { studentName, courseTitle, certificateCode, issuedAt, templateImageBuffer } = data;

    // A4 Landscape dimensions: 841.89 pt x 595.28 pt
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: templateImageBuffer ? 0 : 40, 
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    const width = doc.page.width;   // 841.89 pt
    const height = doc.page.height; // 595.28 pt

    const issueDateStr = issuedAt
      ? new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (templateImageBuffer) {
      // --- MODE 1: TEMPLATE BACKGROUND (certificate_template_2.png) ---
      doc.image(templateImageBuffer, 0, 0, { width, height });

      // 1. DYNAMIC STUDENT NAME
      const nameText = studentName || 'Valued Student';
      let nameFontSize = 32;
      doc.font('Helvetica-Bold').fontSize(nameFontSize);

      // Auto-scale font down if the student name exceeds available width
      const maxTextWidth = width - 140; // Leaves 70pt margin on left/right
      while (doc.widthOfString(nameText) > maxTextWidth && nameFontSize > 16) {
        nameFontSize -= 1;
        doc.fontSize(nameFontSize);
      }

      // Render Student Name centered between "presented to" & "completing the course"
      doc.fillColor('#1e1b4b').text(nameText, 0, 202, { 
        align: 'center', 
        width: width 
      });

      // 2. DYNAMIC COURSE TITLE
      const titleText = courseTitle || 'Course Title';
      let titleFontSize = 24;
      doc.font('Helvetica-Bold').fontSize(titleFontSize);

      // Auto-scale font down if course title is long
      while (doc.widthOfString(titleText) > maxTextWidth && titleFontSize > 14) {
        titleFontSize -= 1;
        doc.fontSize(titleFontSize);
      }

      // Render Course Title centered below "for successfully completing the course"
      doc.fillColor('#4338ca').text(titleText, 0, 305, { 
        align: 'center', 
        width: width 
      });

      // 3. ISSUED DATE & CERTIFICATE CODE (Aligned next to pre-printed labels)
      doc.font('Helvetica').fontSize(11).fillColor('#334155');

      // Fits directly after pre-printed "Issued Date:" label
      doc.text(issueDateStr, 150, 417);

      // Fits directly after pre-printed "Certificate Code:" label
      doc.text(certificateCode || '', 180, 440);

    } else {
      // --- MODE 2: SCRATCH GENERATION (FALLBACK) ---
      doc.rect(20, 20, width - 40, height - 40).stroke('#6366f1');
      doc.rect(25, 25, width - 50, height - 50).stroke('#4f46e5');

      doc.fillColor('#6366f1').fontSize(14)
        .text('NEXORA LEARNING PLATFORM', 0, 80, { align: 'center', width });

      doc.fillColor('#0f172a').fontSize(32)
        .text('CERTIFICATE OF COMPLETION', 0, 110, { align: 'center', width });

      doc.fillColor('#64748b').fontSize(14)
        .text('This is proudly presented to', 0, 175, { align: 'center', width });

      doc.fillColor('#1e1b4b').fontSize(28)
        .text(studentName || 'Valued Student', 0, 202, { align: 'center', width });

      doc.fillColor('#64748b').fontSize(14)
        .text('for successfully completing the course', 0, 255, { align: 'center', width });

      doc.fillColor('#4338ca').fontSize(22)
        .text(courseTitle || 'Course Title', 0, 305, { align: 'center', width });

      doc.fillColor('#334155').fontSize(11)
        .text(`Issued Date: ${issueDateStr}`, 80, 420)
        .text(`Certificate Code: ${certificateCode || ''}`, 80, 440);

      doc.fillColor('#0f172a').fontSize(12)
        .text('Nexora Academic Board', width - 280, 420, { align: 'right' });
    }

    doc.end();
  });
};