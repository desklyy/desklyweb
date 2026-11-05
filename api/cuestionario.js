export default async function handler(req, res) {
  // Cabeceras CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      industry,
      companySize,
      erp,
      erpHotspot,
      crm,
      productivity,
      storage,
      monthlyVolume,
      departments,
      manualTasks,
      strictPrivacy,
      onPremise,
      goal
    } = body || {};

    if (!companyName || !contactName || !contactEmail) {
      return res.status(400).json({ error: 'Empresa, persona de contacto y email son obligatorios.' });
    }

    const apiKey = process.env.RESEND_API_KEY;

    // Modo simulación si falta la clave en local
    if (!apiKey) {
      console.warn('RESEND_API_KEY no configurada. Simulando envío del Cuestionario Cliente.');
      return res.status(200).json({
        success: true,
        simulated: true,
        message: 'Cuestionario procesado en modo simulación.'
      });
    }

    const fromEmail = 'Deskly <noreply@desklyy.com>';
    const adminEmail = 'contacto@desklyy.com';

    const deptsFormatted = Array.isArray(departments) && departments.length > 0
      ? departments.join(', ')
      : 'No especificados';

    // 1. Email para el equipo de Deskly (contacto@desklyy.com)
    const adminEmailPayload = {
      from: fromEmail,
      to: [adminEmail],
      reply_to: contactEmail,
      subject: `[Cuestionario Cliente] ${companyName} — ${contactName}`,
      html: `
        <div style="background-color: #0D1627; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table align="center" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%; background: #121D33; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <tr>
              <td style="padding: 32px 32px 28px;">
                <!-- Header -->
                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; width: 100%;">
                  <tr>
                    <td style="vertical-align: middle;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: middle;">
                            <img src="https://desklyy.com/assets/logo.jpg" alt="Deskly" width="28" height="28" style="display: block; border-radius: 6px;">
                          </td>
                          <td style="padding-left: 10px; vertical-align: middle; font-size: 19px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em;">
                            Desk<span style="color: #1658F5;">ly</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="text-align: right; vertical-align: middle;">
                      <span style="background: rgba(22,88,245,0.15); color: #5E8DFF; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 9999px; letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid rgba(22,88,245,0.4);">
                        Cuestionario Cliente
                      </span>
                    </td>
                  </tr>
                </table>

                <div style="font-size: 16px; font-weight: 600; color: #FFFFFF; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                  ${companyName} — Datos del Cuestionario
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13.5px;">
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8; width: 150px;">Empresa:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #FFFFFF;">${companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Contacto:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #FFFFFF;">${contactName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Email:</td>
                    <td style="padding: 7px 0;"><a href="mailto:${contactEmail}" style="color: #5E8DFF; text-decoration: none; font-weight: 500;">${contactEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Teléfono / WhatsApp:</td>
                    <td style="padding: 7px 0; color: #34D399; font-weight: 600;">${contactPhone || 'No especificado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Sector / Plantilla:</td>
                    <td style="padding: 7px 0; color: #E2E8F0;">${industry || 'N/A'} · ${companySize || 'N/A'} empleados</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">ERP Principal:</td>
                    <td style="padding: 7px 0; color: #5E8DFF; font-weight: 600;">${erp || 'N/A'} <span style="color:#94A3B8; font-weight: normal;">(${erpHotspot || 'Alojamiento no definido'})</span></td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">CRM Comercial:</td>
                    <td style="padding: 7px 0; color: #E2E8F0;">${crm || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Correo / Ofimática:</td>
                    <td style="padding: 7px 0; color: #E2E8F0;">${productivity || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Almacén Archivos:</td>
                    <td style="padding: 7px 0; color: #E2E8F0;">${storage || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Volumen Operaciones:</td>
                    <td style="padding: 7px 0; color: #E2E8F0;">${monthlyVolume || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Departamentos con carga:</td>
                    <td style="padding: 7px 0; color: #E2E8F0;">${deptsFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Privacidad Crítica:</td>
                    <td style="padding: 7px 0; color: ${strictPrivacy ? '#34D399' : '#CBD5E1'}; font-weight: 600;">${strictPrivacy ? 'SÍ (Exige IA local/privada)' : 'No estricta'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Mini PC On-Premise:</td>
                    <td style="padding: 7px 0; color: ${onPremise ? '#34D399' : '#CBD5E1'}; font-weight: 600;">${onPremise ? 'SÍ (Disponen de red y espacio)' : 'Dudoso / Requiere IT'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Objetivo de la reunión:</td>
                    <td style="padding: 7px 0; color: #FFFFFF; font-weight: 600;">${goal || 'N/A'}</td>
                  </tr>
                </table>

                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94A3B8; margin-bottom: 8px;">
                  Tareas manuales descritas:
                </div>
                <div style="background: #0D1627; border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid #1658F5; padding: 14px 16px; border-radius: 8px; font-size: 13.5px; color: #E2E8F0; white-space: pre-wrap; line-height: 1.6; margin-bottom: 20px;">
${manualTasks ? manualTasks : 'No se especificaron detalles.'}
                </div>

                <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748B; text-align: center;">
                  Pulsa "Responder" para contestar directamente a ${contactName} (${contactEmail}).
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
    };

    // 2. Email de agradecimiento y confirmación para el cliente
    const userEmailPayload = {
      from: fromEmail,
      to: [contactEmail],
      reply_to: adminEmail,
      subject: `Hemos recibido tu cuestionario — Deskly`,
      html: `
        <div style="background-color: #0D1627; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table align="center" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; width: 100%; background: #121D33; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <tr>
              <td style="padding: 36px 32px 30px;">
                <!-- Logo & Brand Header -->
                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td style="width: 32px; vertical-align: middle;">
                      <img src="https://desklyy.com/assets/logo.jpg" alt="Deskly" width="28" height="28" style="display: block; border-radius: 6px;">
                    </td>
                    <td style="padding-left: 10px; vertical-align: middle; font-size: 19px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em;">
                      Desk<span style="color: #1658F5;">ly</span>
                    </td>
                  </tr>
                </table>

                <!-- Body -->
                <p style="font-size: 16px; color: #FFFFFF; margin: 0 0 16px; font-weight: 600;">
                  Hola ${contactName},
                </p>
                <p style="font-size: 14.5px; color: #CBD5E1; margin: 0 0 16px; line-height: 1.6;">
                  Muchas gracias por completar el cuestionario para <strong>${companyName}</strong>.
                </p>
                <p style="font-size: 14.5px; color: #CBD5E1; margin: 0 0 16px; line-height: 1.6;">
                  Nuestro equipo técnico ya está revisando vuestro stack tecnológico (ERP, alojamiento y operativa) para preparar la demo adaptada a vuestros sistemas.
                </p>
                <p style="font-size: 14.5px; color: #CBD5E1; margin: 0 0 24px; line-height: 1.6;">
                  En menos de <strong>24 horas laborables</strong> nos pondremos en contacto contigo por teléfono o email para mostrarte cómo Deskly automatiza vuestros flujos con privacidad total.
                </p>

                <!-- Box Soberanía del Dato -->
                <div style="background: rgba(22, 88, 245, 0.08); border: 1px solid rgba(22, 88, 245, 0.3); border-radius: 10px; padding: 14px 16px; margin-bottom: 24px;">
                  <div style="font-size: 13px; font-weight: 600; color: #5E8DFF; margin-bottom: 4px;">
                    🔒 Privacidad y Confidencialidad
                  </div>
                  <div style="font-size: 12.5px; color: #94A3B8; line-height: 1.5;">
                    Toda la información facilitada es tratada bajo estricta confidencialidad y nunca se transfiere a modelos o IAs públicas.
                  </div>
                </div>

                <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 28px; line-height: 1.6;">
                  Si deseas aportar algún detalle antes de la llamada, puedes escribirnos directamente a <a href="mailto:contacto@desklyy.com" style="color: #5E8DFF; text-decoration: underline;">contacto@desklyy.com</a>.
                </p>

                <!-- Signature -->
                <div style="padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 13.5px; color: #FFFFFF; line-height: 1.5;">
                  <strong>Equipo Deskly</strong><br>
                  <span style="color: #64748B; font-size: 12.5px;">IA Operativa On-Premise · <a href="https://desklyy.com" style="color: #5E8DFF; text-decoration: none;">desklyy.com</a></span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
    };

    const sendMail = async (payload) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error en Resend');
      }
      return data;
    };

    // Envío en paralelo
    const [adminResult, userResult] = await Promise.allSettled([
      sendMail(adminEmailPayload),
      sendMail(userEmailPayload)
    ]);

    if (adminResult.status === 'rejected') {
      console.error('Error enviando a contacto@desklyy.com:', adminResult.reason);
      return res.status(500).json({ error: 'Error al notificar al equipo Deskly.' });
    }

    if (userResult.status === 'rejected') {
      console.warn('Aviso: Falló envío de confirmación al cliente:', userResult.reason);
    }

    return res.status(200).json({
      success: true,
      adminEmailId: adminResult.value?.id,
      userEmailId: userResult.status === 'fulfilled' ? userResult.value?.id : null
    });

  } catch (error) {
    console.error('Error en /api/cuestionario:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}

