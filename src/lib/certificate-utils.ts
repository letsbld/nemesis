import { CertificateData } from '@/types/user.types';

export function generateCertificateNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);
  
  return `CERT-${year}-${month}-${day}-${random}`;
}

export async function generateQRCode(data: string): Promise<string> {
  if (typeof window !== 'undefined' && (window as any).QRCode) {
    try {
      const QRCode = (window as any).QRCode;
      return await QRCode.toDataURL(data, {
        width: 120,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
    } catch (error) {
      console.error('QR generation failed:', error);
      return generateFallbackQR(data);
    }
  }
  return generateFallbackQR(data);
}

function generateFallbackQR(data: string): string {
  const lines = data.split('\n').slice(0, 4);
  const svgContent = `
    <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" fill="#ffffff" stroke="#000000" stroke-width="2"/>
      <text x="60" y="20" font-family="Arial" font-size="8" fill="#000000" text-anchor="middle">CERTIFICATE</text>
      ${lines.map((line, i) => `
        <text x="60" y="${35 + i * 15}" font-family="Arial" font-size="6" fill="#000000" text-anchor="middle">${line.substring(0, 20)}</text>
      `).join('')}
      <text x="60" y="100" font-family="Arial" font-size="6" fill="#666666" text-anchor="middle">VERIFICATION QR</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

export function generateCertificateHTML(cert: CertificateData): string {
  const { certificateNumber, employeeInfo, score, totalQuestions, percentage, completedDate, qrCodeDataURL } = cert;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - ${certificateNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .certificate { background: white; padding: 60px 40px; border: 8px solid #4f46e5; border-radius: 20px; max-width: 800px; margin: 0 auto; box-shadow: 0 20px 40px rgba(0,0,0,0.1); position: relative; }
        .cert-header h1 { font-size: 2.5em; margin: 0; color: #1e40af; text-transform: uppercase; letter-spacing: 2px; }
        .cert-header h2 { font-size: 1.5em; margin: 10px 0; color: #4f46e5; }
        .cert-name { font-size: 2.8em; font-weight: bold; color: #1f2937; margin: 30px 0; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; }
        .cert-info { font-size: 1.1em; color: #4b5563; margin: 10px 0; }
        .cert-score { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 15px; margin: 30px 0; font-size: 1.4em; font-weight: bold; }
        .cert-topic { font-size: 1.3em; color: #4f46e5; font-weight: bold; margin: 20px 0; }
        .cert-date { font-size: 1.1em; color: #6b7280; margin-top: 30px; }
        .cert-number { position: absolute; top: 20px; right: 20px; background: #f3f4f6; padding: 10px 15px; border-radius: 8px; font-size: 0.9em; font-weight: bold; color: #374151; border: 2px solid #e5e7eb; }
        .qr-section { display: flex; justify-content: space-between; align-items: center; margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 15px; border: 2px solid #e5e7eb; }
        .qr-info { text-align: left; flex: 1; }
        .qr-info h3 { margin: 0 0 10px 0; color: #1f2937; }
        .qr-info p { margin: 5px 0; color: #6b7280; }
        .qr-code { flex: 0 0 auto; margin-left: 20px; }
        .qr-code img { width: 120px; height: 120px; border: 2px solid #e5e7eb; border-radius: 10px; }
        .verification-info { font-size: 0.9em; color: #6b7280; margin-top: 10px; }
        .verification-info p { margin: 2px 0; }
        .security-features { margin-top: 20px; padding: 15px; background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 10px; font-size: 0.9em; color: #0c4a6e; }
        @media print { body { background: white; padding: 0; } .certificate { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="cert-number">Certificate #: ${certificateNumber}</div>
        <div class="cert-header">
            <h1>🏆 CERTIFICATE OF COMPLETION</h1>
            <h2>Security Training Program</h2>
        </div>
        <div class="cert-name">${employeeInfo.first_name} ${employeeInfo.last_name}</div>
        <p class="cert-info">Employee ID: ${employeeInfo.employee_id}</p>
        <p class="cert-info">Department: ${employeeInfo.department}</p>
        ${employeeInfo.position ? `<p class="cert-info">Position: ${employeeInfo.position}</p>` : ''}
        <div class="cert-topic">Cybersecurity Awareness Training</div>
        <div class="cert-score">Score: ${score}/${totalQuestions} (${percentage}%)</div>
        <div class="qr-section">
            <div class="qr-info">
                <h3>🔐 Certificate Verification</h3>
                <p style="font-weight: bold; color: #374151;">Certificate Number: ${certificateNumber}</p>
                <p>Scan QR code to verify authenticity</p>
                <div class="verification-info">
                    <p>• Unique certificate number</p>
                    <p>• Employee verification</p>
                    <p>• Completion date tracking</p>
                </div>
            </div>
            <div class="qr-code"><img src="${qrCodeDataURL}" alt="QR Code" /></div>
        </div>
        <div class="security-features">
            <strong>🛡️ Security Features:</strong> This certificate includes a unique QR code and certificate number for verification. 
            The certificate can be verified through our secure portal using the certificate number above.
        </div>
        <div class="cert-date">
            Completed on: ${completedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>
</body>
</html>`;
}

export function openCertificate(html: string): Window | null {
  const certificateWindow = window.open('', '_blank', 'width=900,height=700');
  
  if (!certificateWindow) return null;
  
  certificateWindow.document.write(html);
  certificateWindow.document.close();
  
  setTimeout(() => {
    const downloadBtn = certificateWindow.document.createElement('button');
    downloadBtn.innerHTML = '📥 Download Certificate';
    downloadBtn.style.cssText = 'position: fixed; top: 20px; left: 20px; background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    
    downloadBtn.onclick = function() {
      const content = certificateWindow.document.documentElement.outerHTML;
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };
    
    certificateWindow.document.body.appendChild(downloadBtn);
  }, 1000);
  
  return certificateWindow;
}
