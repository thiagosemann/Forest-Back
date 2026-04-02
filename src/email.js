const nodemailer = require('nodemailer');
require('dotenv').config();

// Transportador de e-mails (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Formata data no padrão brasileiro
function formatDate(date) {
  date.setHours(date.getHours() - 3); // Ajuste de fuso
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${dd}/${mm}/${yyyy} às ${hh}:${min}:${ss}`;
}

// Corpo de e-mail: Máquina ligada
function criarCorpoEmailLigar(nomeMaquina, apartamento, predio, inicio) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #45a049;">Máquina Ligada!</h2>
      <p><strong>Nome da Máquina:</strong> ${nomeMaquina}</p>
      <p><strong>Apartamento:</strong> ${apartamento}</p>
      <p><strong>Prédio:</strong> ${predio}</p>
      <p><strong>Início:</strong> ${inicio}</p>
      <p style="margin-top: 20px;">A máquina foi ligada com sucesso. Se esta ação não foi realizada por você, por favor, entre em contato conosco.</p>
      <p>Atenciosamente,<br/>Equipe de Suporte</p>
    </div>
  `;
}

// Extrai o base64 puro (o banco pode salvar com ou sem prefixo data:...)
function parseBase64(raw) {
  if (!raw) return null;
  const match = raw.match(/^data:[^;]+;base64,(.+)$/);
  return match ? match[1] : raw;
}

// Detecta o tipo MIME a partir do prefixo data:
function detectMimeType(raw, fallback) {
  if (!raw) return fallback;
  const match = raw.match(/^data:([^;]+);base64,/);
  return match ? match[1] : fallback;
}

// HTML do e-mail com formulário dos hóspedes
function criarCorpoEmailForest(hospedes) {
  const apartamento = hospedes[0]?.apartamento_name || '-';
  const logoUrl = process.env.FOREST_LOGO_URL || '';
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Forest" style="max-height: 50px; margin-bottom: 8px;" />`
    : `<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 2px;">FOREST</h1>`;

  const listaHospedes = hospedes.map(h => `
    <tr>
      <td style="padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; font-weight: 600;">${h.name}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 13px; color: #555;">${h.cpfFormatado}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 13px; color: #555;">${h.telefoneFormatado}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 13px; color: #1b5e20;">${h.checkin}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 13px; color: #c62828;">${h.checkout}</td>
    </tr>`).join('');

  return `
  <div style="background-color: #eaeaea; padding: 30px 0; font-family: 'Segoe UI', Arial, Helvetica, sans-serif;">
    <table align="center" width="640" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 640px; width: 100%;">

      <!-- Header -->
      <tr>
        <td style="background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%); padding: 32px 30px; text-align: center;">
          ${logoHtml}
          <p style="margin: 8px 0 0; color: #a5d6a7; font-size: 14px; letter-spacing: 0.5px;">Registro de Hóspedes</p>
        </td>
      </tr>

      <!-- Resumo -->
      <tr>
        <td style="padding: 20px 30px; background-color: #f5f5f5; border-bottom: 2px solid #1b5e20;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size: 15px; color: #333;">
                <strong style="color: #1b5e20;">Apartamento:</strong> ${apartamento}
              </td>
              <td style="font-size: 15px; color: #333; text-align: right;">
                <strong style="color: #1b5e20;">Total:</strong> ${hospedes.length} hóspede(s)
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Tabela de hóspedes -->
      <tr>
        <td style="padding: 20px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr style="background-color: #1b5e20;">
              <td style="padding: 10px 16px; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Nome</td>
              <td style="padding: 10px 16px; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">CPF</td>
              <td style="padding: 10px 16px; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Telefone</td>
              <td style="padding: 10px 16px; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Entrada</td>
              <td style="padding: 10px 16px; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Saída</td>
            </tr>
            ${listaHospedes}
          </table>
          <p style="margin: 16px 0 0; font-size: 12px; color: #888; text-align: center;">As fotos e documentos dos hóspedes estão em anexo neste e-mail.</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 18px 30px; text-align: center; border-top: 2px solid #e8e8e8; background-color: #f5f5f5;">
          <p style="margin: 0; font-size: 11px; color: #aaa; letter-spacing: 0.3px;">E-mail gerado automaticamente pelo sistema Forest</p>
        </td>
      </tr>
    </table>
  </div>`;
}

// Envia um único e-mail com as fotos e documentos dos hóspedes em anexo
async function envioEmailForest(listaHospedes) {
  const { formatarData, formatarCPF, formatarTelefone } = require('./WhatsApp/whats_Utilidades');

  const hospedes = listaHospedes.map(obj => ({
    ...obj,
    cpfFormatado: formatarCPF(obj.cpf),
    telefoneFormatado: formatarTelefone(obj.telefone_hospede),
    checkin: formatarData(obj.dataEntrada),
    checkout: formatarData(obj.dataSaida),
  }));

  const apartamento = hospedes[0]?.apartamento_name || '';
  const html = criarCorpoEmailForest(hospedes);

  // Monta os anexos com as imagens dos hóspedes
  const attachments = [];
  hospedes.forEach((h, i) => {
    // Foto do hóspede (imagem)
    const fotoRaw = parseBase64(h.imagemBase64);
    if (fotoRaw) {
      const mimeType = detectMimeType(h.imagemBase64, 'image/jpeg');
      const ext = mimeType.split('/')[1] || 'jpeg';
      attachments.push({
        filename: `foto_${h.name || 'hospede_' + (i + 1)}.${ext}`,
        content: Buffer.from(fotoRaw, 'base64'),
        contentType: mimeType,
      });
    }

    // Documento do hóspede (PDF)
    const docRaw = parseBase64(h.documentBase64);
    if (docRaw) {
      const mimeType = detectMimeType(h.documentBase64, 'application/pdf');
      const ext = mimeType === 'application/pdf' ? 'pdf' : (mimeType.split('/')[1] || 'pdf');
      attachments.push({
        filename: `documento_${h.name || 'hospede_' + (i + 1)}.${ext}`,
        content: Buffer.from(docRaw, 'base64'),
        contentType: mimeType,
      });
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "tgsemann@gmail.com",
    subject: `Forest - ${hospedes.length} hóspede(s) | Apto ${apartamento}`,
    html,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[INFO] E-mail Forest enviado com sucesso');
  } catch (err) {
    console.error('[ERRO] Falha ao enviar e-mail Forest:', err.message);
  }
}

module.exports = {
  criarCorpoEmailLigar,
  criarCorpoEmailForest,
  envioEmailForest
};
