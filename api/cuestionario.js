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
      first_name,
      last_name,
      contactName,
      contactEmail,
      contactPhone,
      industry,
      companySize,
      companyDepartments,
      companyDepartmentsFormatted,
      companyProceduresFormatted,
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

    const trimmedFirst = typeof first_name === 'string' ? first_name.trim() : '';
    const trimmedLast = typeof last_name === 'string' ? last_name.trim() : '';
    const trimmedContact = typeof contactName === 'string' ? contactName.trim() : '';

    let resolvedFirstName = trimmedFirst;
    let resolvedLastName = trimmedLast;

    if (!resolvedFirstName && trimmedContact) {
      const spaceIdx = trimmedContact.indexOf(' ');
      if (spaceIdx > 0) {
        resolvedFirstName = trimmedContact.slice(0, spaceIdx).trim();
        resolvedLastName = resolvedLastName || trimmedContact.slice(spaceIdx + 1).trim();
      } else {
        resolvedFirstName = trimmedContact;
      }
    }

    const resolvedFullName = [resolvedFirstName, resolvedLastName].filter(Boolean).join(' ') || trimmedContact;

    if (!companyName || !resolvedFirstName || !contactEmail) {
      return res.status(400).json({ error: 'Empresa, nombre de contacto y email son obligatorios.' });
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

    const companyDeptsFormatted = companyDepartmentsFormatted || (
      Array.isArray(companyDepartments) && companyDepartments.length > 0
        ? companyDepartments.map(d => typeof d === 'object' && d.name ? `${d.name} (${d.workers || 0} personas)` : d).join(', ')
        : 'No especificados'
    );

    const companyProceduresSummary = companyProceduresFormatted || (
      Array.isArray(companyDepartments) && companyDepartments.some(d => typeof d === 'object' && d?.procedures && String(d.procedures).trim())
        ? companyDepartments.map(d => {
            if (typeof d !== 'object' || !d?.name) return String(d || '');
            const workersLabel = d.workers ? ` (${d.workers} trab.)` : '';
            const proc = d.procedures && String(d.procedures).trim() ? String(d.procedures).trim() : 'Sin procedimientos especificados';
            return `• ${d.name}${workersLabel}: ${proc}`;
          }).filter(Boolean).join('\n')
        : 'No especificados'
    );

    // 1. Email para el equipo de Deskly (contacto@desklyy.com)
    const adminEmailPayload = {
      from: fromEmail,
      to: [adminEmail],
      reply_to: contactEmail,
      subject: `[Cuestionario Cliente] ${companyName} — ${resolvedFullName}`,
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
                    <td style="padding: 7px 0; color: #94A3B8;">Nombre:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #FFFFFF;">${resolvedFirstName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Apellidos:</td>
                    <td style="padding: 7px 0; font-weight: 600; color: #FFFFFF;">${resolvedLastName || 'No especificado'}</td>
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
                    <td style="padding: 7px 0; color: #94A3B8;">Departamentos y equipo:</td>
                    <td style="padding: 7px 0; color: #5E8DFF; font-weight: 600;">${companyDeptsFormatted}</td>
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
                    <td style="padding: 7px 0; color: #94A3B8;">Privacidad Crítica:</td>
                    <td style="padding: 7px 0; color: ${strictPrivacy ? '#34D399' : '#CBD5E1'}; font-weight: 600;">${strictPrivacy ? 'SÍ (Exige IA local/privada)' : 'No estricta'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px 0; color: #94A3B8;">Mini PC On-Premise:</td>
                    <td style="padding: 7px 0; color: ${onPremise ? '#34D399' : '#CBD5E1'}; font-weight: 600;">${onPremise ? 'SÍ (Disponen de red y espacio)' : 'Dudoso / Requiere IT'}</td>
                  </tr>
                </table>

                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94A3B8; margin-bottom: 8px;">
                  Procedimientos por departamento:
                </div>
                <div style="background: #0D1627; border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid #5E8DFF; padding: 14px 16px; border-radius: 8px; font-size: 13.5px; color: #E2E8F0; white-space: pre-wrap; line-height: 1.6; margin-bottom: 20px;">
${companyProceduresSummary}
                </div>

                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94A3B8; margin-bottom: 8px;">
                  Tareas manuales descritas:
                </div>
                <div style="background: #0D1627; border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid #1658F5; padding: 14px 16px; border-radius: 8px; font-size: 13.5px; color: #E2E8F0; white-space: pre-wrap; line-height: 1.6; margin-bottom: 20px;">
${manualTasks ? manualTasks : 'No se especificaron detalles.'}
                </div>

                <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748B; text-align: center;">
                  Pulsa "Responder" para contestar directamente a ${resolvedFullName} (${contactEmail}).
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
      html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación Deskly</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">

  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        
        <!-- Contenedor Principal -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0;">
          
          <!-- Encabezado -->
          <tr>
            <td style="padding: 30px; border-bottom: 1px solid #F1F5F9;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="vertical-align: middle;">
                    <img src="https://desklyy.com/assets/logo.jpg" alt="Deskly" width="24" height="24" style="display: block; border: none;">
                  </td>
                  <td valign="middle" style="vertical-align: middle; padding-left: 8px;">
                    <span style="color: #0F172A; font-size: 18px; font-weight: 700;">Desk<span style="color: #1658F5;">ly</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding: 30px;">
              
              <p style="color: #0F172A; font-size: 16px; font-weight: 600; margin: 0 0 16px;">
                Hola ${resolvedFirstName || resolvedFullName},
              </p>
              
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Muchas gracias por completar el cuestionario para <strong>${companyName}</strong>.
              </p>
              
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Nuestro equipo técnico ya está revisando vuestro stack tecnológico (ERP, alojamiento y operativa).
              </p>
              
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                En menos de <strong>24 horas laborables</strong> nos pondremos en contacto contigo por teléfono o email para concertar la reunión.
              </p>

              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Toda la información facilitada es tratada bajo estricta confidencialidad y nunca se transfiere a modelos o IAs públicas.
              </p>

              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
                Si deseas aportar algún detalle antes de la reunión, puedes escribirnos directamente a <a href="mailto:contacto@desklyy.com" style="color: #1658F5; text-decoration: underline;">contacto@desklyy.com</a>.
              </p>

              <!-- Firma -->
              <div style="padding-top: 20px; border-top: 1px solid #F1F5F9; color: #0F172A; font-size: 14px; line-height: 1.5;">
                <strong style="font-weight: 600;">Equipo Deskly</strong><br>
                <span style="color: #64748B; font-size: 13px;"><a href="https://desklyy.com" style="color: #1658F5; text-decoration: none;">desklyy.com</a></span>
              </div>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
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

    const syncToCrm = async () => {
      const crmWebhookUrl =
        process.env.CRM_WEBHOOK_URL || 'https://crm.desklyy.com/api/webhooks/leads';
      const crmWebhookSecret = process.env.CRM_WEBHOOK_SECRET;
      if (!crmWebhookSecret) {
        console.warn('CRM_WEBHOOK_SECRET no configurado. Se omite sincronización con Deskly CRM.');
        return { synced: false, skipped: true };
      }

      const isSpecified = (val) =>
        typeof val === 'string' &&
        val.trim() !== '' &&
        !['No especificado', 'No especificados', 'No especificadas', 'ERP no especificado'].includes(val.trim());

      const companyCustomFields = {};
      if (isSpecified(companyDeptsFormatted)) {
        companyCustomFields.departamentos_empresa = companyDeptsFormatted;
      }
      if (isSpecified(companyProceduresSummary)) {
        companyCustomFields.procedimientos_por_departamento = companyProceduresSummary;
      }
      if (isSpecified(erp)) companyCustomFields.erp_principal = erp.trim();
      if (isSpecified(erpHotspot)) companyCustomFields.alojamiento_erp = erpHotspot.trim();
      if (isSpecified(crm)) companyCustomFields.crm_actual = crm.trim();
      if (isSpecified(productivity)) companyCustomFields.correo_ofimatica = productivity.trim();
      if (isSpecified(storage)) companyCustomFields.almacen_archivos = storage.trim();
      if (typeof strictPrivacy === 'boolean') companyCustomFields.privacidad_estricta = strictPrivacy;
      if (typeof onPremise === 'boolean') companyCustomFields.red_local_minipc = onPremise;

      const dealCustomFields = {
        cuestionario_completado: true,
      };
      if (isSpecified(monthlyVolume)) dealCustomFields.volumen_mensual = monthlyVolume.trim();
      if (isSpecified(manualTasks)) dealCustomFields.tareas_manuales = manualTasks.trim();

      const crmPayload = {
        mode: 'questionnaire',
        lead_source: 'cuestionario',
        email: String(contactEmail).trim(),
        first_name: resolvedFirstName,
        last_name: resolvedLastName || undefined,
        full_name: resolvedFullName,
        phone: isSpecified(contactPhone) ? contactPhone.trim() : undefined,
        company_name: String(companyName).trim(),
        industry: isSpecified(industry) ? industry.trim() : undefined,
        company_size: isSpecified(companySize) ? companySize.trim() : undefined,
        company_custom_fields: companyCustomFields,
        deal_custom_fields: dealCustomFields,
      };

      const crmRes = await fetch(crmWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': crmWebhookSecret,
        },
        body: JSON.stringify(crmPayload),
      });

      const crmData = await crmRes.json().catch(() => ({}));
      if (!crmRes.ok) {
        throw new Error(crmData.error || `HTTP ${crmRes.status} en CRM`);
      }

      return { synced: true, data: crmData.result || crmData };
    };

    // Envío en paralelo (emails + sincronización CRM)
    const [adminResult, userResult, crmResult] = await Promise.allSettled([
      sendMail(adminEmailPayload),
      sendMail(userEmailPayload),
      syncToCrm()
    ]);

    if (adminResult.status === 'rejected') {
      console.error('Error enviando a contacto@desklyy.com:', adminResult.reason);
      return res.status(500).json({ error: 'Error al notificar al equipo Deskly.' });
    }

    if (userResult.status === 'rejected') {
      console.warn('Aviso: Falló envío de confirmación al cliente:', userResult.reason);
    }

    if (crmResult.status === 'rejected') {
      console.error('Aviso: Falló sincronización del cuestionario con el CRM:', crmResult.reason);
    }

    return res.status(200).json({
      success: true,
      adminEmailId: adminResult.value?.id,
      userEmailId: userResult.status === 'fulfilled' ? userResult.value?.id : null,
      crmSynced: crmResult.status === 'fulfilled' && crmResult.value?.synced === true
    });

  } catch (error) {
    console.error('Error en /api/cuestionario:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
  }
}

