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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <div style="background: #0D1627; padding: 24px 32px; border-radius: 10px 10px 0 0; border-bottom: 2px solid #1658F5;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="width: 42px; vertical-align: middle;">
                  <img src="https://www.desklyy.com/assets/logo.jpg" alt="Deskly" width="38" height="38" style="display: block; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
                </td>
                <td style="padding-left: 14px; vertical-align: middle;">
                  <div style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.01em;">Desk<span style="color: #1658F5;">ly</span></div>
                  <div style="color: #8FB0FF; font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Nueva solicitud de diagnóstico</div>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 10px 10px;">
            <h2 style="font-size: 15px; margin: 0 0 16px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
              Datos de la empresa
            </h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14.5px;">
              <tr>
                <td style="padding: 9px 0; color: #64748b; width: 140px; font-weight: 500;">Empresa:</td>
                <td style="padding: 9px 0; font-weight: 700; color: #0f172a;">${company}</td>
              </tr>
              <tr>
                <td style="padding: 9px 0; color: #64748b; font-weight: 500;">Contacto:</td>
                <td style="padding: 9px 0; color: #0f172a;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 9px 0; color: #64748b; font-weight: 500;">Email:</td>
                <td style="padding: 9px 0;"><a href="mailto:${email}" style="color: #1658F5; text-decoration: none; font-weight: 600;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 9px 0; color: #64748b; font-weight: 500;">Teléfono:</td>
                <td style="padding: 9px 0; color: #0f172a;">${phone || 'No especificado'}</td>
              </tr>
              <tr>
                <td style="padding: 9px 0; color: #64748b; font-weight: 500;">Sistemas a conectar:</td>
                <td style="padding: 9px 0; color: #1658F5; font-weight: 600;">${toolsFormatted}</td>
              </tr>
            </table>

            <h2 style="font-size: 15px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
              Consultas que generan pérdidas de tiempo
            </h2>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #1658F5; padding: 16px; border-radius: 6px; font-size: 14.5px; color: #334155; white-space: pre-wrap; line-height: 1.5;">
${bottlenecks ? bottlenecks : 'No se detallaron procesos concretos.'}
            </div>

            <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 12.5px; color: #94a3b8; text-align: center;">
              Puedes responder a este correo para escribir directamente a ${name} (${email}).
            </div>
          </div>
        </div>
      `
    };

    // 2. Email de confirmación para el usuario que solicitó el diagnóstico
    const userEmailPayload = {
      from: fromEmail,
      to: [email],
      reply_to: adminEmail,
      subject: `Solicitud de Diagnóstico Operativo — Deskly`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <div style="background: #0D1627; padding: 26px 32px; border-radius: 10px 10px 0 0; border-bottom: 2px solid #1658F5;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="width: 42px; vertical-align: middle;">
                  <img src="https://www.desklyy.com/assets/logo.jpg" alt="Deskly" width="38" height="38" style="display: block; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
                </td>
                <td style="padding-left: 14px; vertical-align: middle;">
                  <div style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.01em;">Desk<span style="color: #1658F5;">ly</span></div>
                  <div style="color: #8FB0FF; font-size: 11.5px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">Optimización del tiempo & Conexión segura</div>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #0f172a; margin-top: 0;">
              Hola <strong>${name}</strong>,
            </p>
            <p style="font-size: 15px; color: #334155; margin-bottom: 20px;">
              Hemos recibido tu solicitud de Diagnóstico Operativo para <strong>${company}</strong>.
            </p>
            <p style="font-size: 14.5px; color: #475569; margin-bottom: 24px;">
              En Deskly ayudamos a empresas a <strong>optimizar el tiempo de trabajo</strong> conectando de forma segura sus sistemas (como <strong>${toolsFormatted}</strong>) dentro de su propia red local, permitiendo resolver consultas en 2 segundos sin que los datos salgan jamás de la oficina.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <div style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em;">
                Próximos pasos
              </div>
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; font-size: 14px; color: #475569;">
                <tr>
                  <td style="width: 24px; vertical-align: top; padding: 6px 0; font-weight: 700; color: #1658F5;">1.</td>
                  <td style="padding: 6px 0;">Analizamos la compatibilidad con tus herramientas (<strong>${toolsFormatted}</strong>) y los cuellos de botella que nos has indicado.</td>
                </tr>
                <tr>
                  <td style="width: 24px; vertical-align: top; padding: 6px 0; font-weight: 700; color: #1658F5;">2.</td>
                  <td style="padding: 6px 0;">En menos de 24 horas laborables nos pondremos en contacto contigo para coordinar una breve sesión técnica de 30 minutos.</td>
                </tr>
                <tr>
                  <td style="width: 24px; vertical-align: top; padding: 6px 0; font-weight: 700; color: #1658F5;">3.</td>
                  <td style="padding: 6px 0;">Te mostraremos cómo unificar consultas y ahorrar horas a tu equipo con una demostración adaptada a vuestra operativa, sin compromiso.</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #64748b; margin-bottom: 28px;">
              Si deseas adelantarnos más detalles, puedes responder directamente a este correo o escribirnos a <a href="mailto:contacto@desklyy.com" style="color: #1658F5; text-decoration: underline;">contacto@desklyy.com</a>.
            </p>

            <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13.5px; color: #475569;">
              <strong>Equipo de Ingeniería Deskly</strong><br>
              <span style="color: #94a3b8; font-size: 13px;">Sevilla, España · <a href="https://www.desklyy.com" style="color: #1658F5; text-decoration: none;">www.desklyy.com</a></span>
            </div>
          </div>
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
