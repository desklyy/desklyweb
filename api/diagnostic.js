export default async function handler(req, res) {
  // Configuración de cabeceras CORS
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
    const { name, company, email, phone, tools, bottlenecks } = body || {};

    if (!name || !company || !email) {
      return res.status(400).json({ error: 'Nombre, empresa y email son campos requeridos.' });
    }

    const apiKey = process.env.RESEND_API_KEY;

    // Modo simulación si aún no hay clave configurada en desarrollo
    if (!apiKey) {
      console.warn('RESEND_API_KEY no configurada. Simulando envío corporativo a Deskly y al usuario.');
      return res.status(200).json({
        success: true,
        simulated: true,
        message: 'Solicitud procesada en modo simulación (configura RESEND_API_KEY en Vercel).'
      });
    }

    const toolsFormatted = Array.isArray(tools) && tools.length > 0
      ? tools.join(', ')
      : (tools || 'No especificado');

    const fromEmail = process.env.RESEND_FROM || 'Deskly <noreply@desklyy.com>';
    const adminEmail = process.env.RESEND_TO || 'contacto@desklyy.com';

    // 1. Email para el equipo de Deskly (contacto@desklyy.com)
    const adminEmailPayload = {
      from: fromEmail,
      to: [adminEmail],
      reply_to: email,
      subject: `[Diagnóstico Operativo] ${company} — ${name}`,
      html: `
        <div style="background-color: #f8fafc; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table align="center" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%; background: #ffffff; border-radius: 10px; border: 1px solid #e9edf2; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <tr>
              <td style="padding: 36px 36px 30px;">
                <!-- Header -->
                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; width: 100%;">
                  <tr>
                    <td style="vertical-align: middle;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 32px; vertical-align: middle;">
                            <img src="https://www.desklyy.com/assets/logo.jpg" alt="Deskly" width="28" height="28" style="display: block; border-radius: 6px;">
                          </td>
                          <td style="padding-left: 10px; vertical-align: middle; font-size: 18px; font-weight: 700; color: #0D1627; letter-spacing: -0.02em;">
                            Desk<span style="color: #1658F5;">ly</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="text-align: right; vertical-align: middle;">
                      <span style="background: rgba(22,88,245,0.08); color: #1658F5; font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.04em; text-transform: uppercase;">Nuevo diagnóstico</span>
                    </td>
                  </tr>
                </table>

                <div style="font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
                  Solicitud de ${company}
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                  <tr>
                    <td style="padding: 7px 0; color: #64748b; width: 140px;">Empresa:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">${company}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #64748b;">Contacto:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #0f172a;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #64748b;">Email:</td>
                    <td style="padding: 7px 0;"><a href="mailto:${email}" style="color: #1658F5; text-decoration: none; font-weight: 500;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #64748b;">Teléfono:</td>
                    <td style="padding: 7px 0; color: #0f172a;">${phone || 'No especificado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #64748b;">Herramientas:</td>
                    <td style="padding: 7px 0; color: #1658F5; font-weight: 600;">${toolsFormatted}</td>
                  </tr>
                </table>

                <div style="font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 8px;">
                  Detalle del caso:
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #1658F5; padding: 14px 16px; border-radius: 6px; font-size: 13.5px; color: #334155; white-space: pre-wrap; line-height: 1.5; margin-bottom: 20px;">
${bottlenecks ? bottlenecks : 'No se especificaron detalles.'}
                </div>

                <div style="padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center;">
                  Puedes responder a este correo para escribir directamente a ${name} (${email}).
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
    };

    // 2. Email de confirmación para el usuario que solicitó el diagnóstico
    const userEmailPayload = {
      from: fromEmail,
      to: [email],
      reply_to: adminEmail,
      subject: `Solicitud de diagnóstico operativo — Deskly`,
      html: `
        <div style="background-color: #f8fafc; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table align="center" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px; width: 100%; background: #ffffff; border-radius: 10px; border: 1px solid #e9edf2; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <tr>
              <td style="padding: 36px 36px 30px;">
                <!-- Logo & Brand Header -->
                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 26px;">
                  <tr>
                    <td style="width: 32px; vertical-align: middle;">
                      <img src="https://www.desklyy.com/assets/logo.jpg" alt="Deskly" width="28" height="28" style="display: block; border-radius: 6px;">
                    </td>
                    <td style="padding-left: 10px; vertical-align: middle; font-size: 18px; font-weight: 700; color: #0D1627; letter-spacing: -0.02em;">
                      Desk<span style="color: #1658F5;">ly</span>
                    </td>
                  </tr>
                </table>

                <!-- Body -->
                <p style="font-size: 15px; color: #0f172a; margin: 0 0 16px; font-weight: 600;">
                  Hola ${name},
                </p>
                <p style="font-size: 14.5px; color: #334155; margin: 0 0 16px; line-height: 1.6;">
                  Hemos recibido correctamente tu solicitud de diagnóstico operativo para <strong>${company}</strong>.
                </p>
                <p style="font-size: 14.5px; color: #334155; margin: 0 0 16px; line-height: 1.6;">
                  Revisaremos las herramientas y la información que nos has indicado. En las próximas 24 horas laborables nos pondremos en contacto contigo para agendar una breve sesión técnica de 30 minutos y mostrarte cómo se adaptaría Deskly a vuestros procesos.
                </p>
                <p style="font-size: 14.5px; color: #334155; margin: 0 0 28px; line-height: 1.6;">
                  Si deseas aportar algún dato adicional antes de la llamada, puedes escribirnos directamente a <a href="mailto:contacto@desklyy.com" style="color: #1658F5; text-decoration: underline;">contacto@desklyy.com</a>.
                </p>

                <!-- Signature -->
                <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 13.5px; color: #0f172a; line-height: 1.5;">
                  <strong>Deskly</strong><br>
                  <span style="color: #64748b; font-size: 12.5px;">Sevilla, España · <a href="https://www.desklyy.com" style="color: #1658F5; text-decoration: none;">www.desklyy.com</a></span>
                </div>

                <!-- Footer notice -->
                <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #f8fafc; font-size: 11.5px; color: #94a3b8; line-height: 1.5;">
                  Este es un correo automático enviado desde una dirección desatendida. Para cualquier consulta escríbenos a <a href="mailto:contacto@desklyy.com" style="color: #64748b; text-decoration: underline;">contacto@desklyy.com</a>.
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
    };

    // Función auxiliar para llamar a la API de Resend
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

    // Envío en paralelo de ambos correos
    const [adminResult, userResult] = await Promise.allSettled([
      sendMail(adminEmailPayload),
      sendMail(userEmailPayload)
    ]);

    if (adminResult.status === 'rejected') {
      console.error('Error al enviar email a admin:', adminResult.reason);
      return res.status(500).json({ error: 'Error al notificar al equipo.' });
    }

    if (userResult.status === 'rejected') {
      console.warn('Aviso: Falló el email al usuario (revisa si el dominio está verificado en Resend):', userResult.reason);
    }

    return res.status(200).json({
      success: true,
      adminEmailId: adminResult.value?.id,
      userEmailId: userResult.status === 'fulfilled' ? userResult.value?.id : null
    });

  } catch (error) {
    console.error('Error en /api/diagnostic:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}
