# Deskly — Plataforma de IA Operativa 100% Privada y Segura para Empresas

> **Documento de especificación, arquitectura y modelo de producto**  
> *Versión 1.4 — Software con Chat Corporativo + Terminal Físico de Voz*

---

## 1. Resumen Ejecutivo y Visión

**Deskly** es una **plataforma integral de inteligencia artificial operativa para empresas** orientada a conectar todas las herramientas de trabajo en un único cerebro inteligente y permitir encontrar cualquier información o ejecutar tareas en **menos de 2 segundos**, con máxima privacidad y seguridad.

Se compone de dos interfaces de interacción adaptadas a cada puesto de trabajo:

1. **Software de Chat Corporativo Privado**:
   * Aplicación web y de escritorio con interfaz de chat intuitiva y privada.
   * Cualquier empleado desde su puesto informático puede consultar información de toda la empresa, verificar inventarios o solicitar tareas en menos de 2 segundos.
2. **Terminal Físico de Voz Deskly**:
   * Dispositivo de sobremesa con cancelación de ruido para mesas de oficina, salas de reuniones, despachos o puestos con manos ocupadas.
   * Permite interactuar mediante la voz, ejecutar tareas ágiles al instante y transcribir/resumir reuniones de equipo con total privacidad.
3. **Servidor Central Privado (el "Cerebro")**:
   * Conecta y unifica todas las herramientas que la empresa ya utiliza (ERP, CRM, bases de datos, manuales técnicos y ficheros).
   * Aloja el modelo de IA propio y el sistema **RAG** (Retrieval-Augmented Generation).

Todo ello bajo un principio innegociable: **100% privado y seguro**. La IA y la infraestructura le pertenecen por completo al cliente. Cero filtraciones y cero dependencia de terceros (OpenAI, Microsoft, Google, etc.).

---

## 2. Los Dos Grandes Pilares Diferenciales

### Pilar I: Soberanía, Privacidad Absoluta y Cero Dependencias
* **La IA le pertenece al cliente al 100%**: Los pesos del modelo, el motor semántico y la base de conocimiento son propiedad exclusiva de la empresa.
* **Cero fugas hacia terceros**: Nada de llamadas a APIs de OpenAI, Microsoft Copilot o Google Gemini. La información confidencial, procesos industriales, tarifas, inventarios y clientes jamás salen del entorno controlado del cliente.
* **Blindaje contra filtraciones**: Elimina el riesgo de espionaje corporativo, brechas de seguridad en nubes públicas o uso no consentido de datos para reentrenar modelos ajenos.
* **Independencia tecnológica**: La empresa no queda atada a cambios de precios, caídas globales de servicio, límites de cuotas ni cambios de términos de servicio de terceros.

### Pilar II: Conocimiento Unificado y Doble Capacidad (Búsqueda < 2s + Ejecución)
Deskly no se queda en dar respuestas conversacionales; unifica todas las herramientas y es un operador activo dentro de los sistemas:

```
┌─────────────────────────────────────────┐       ┌─────────────────────────────────────────┐
│     SOFTWARE DESKLY (CHAT PROPIO)       │       │       TERMINAL FÍSICO DE VOZ            │
│  (Acceso Web / PC / Oficinas / Equipos) │       │   (Sobremesa / Manos libres / Salas)    │
└────────────────────┬────────────────────┘       └────────────────────┬────────────────────┘
                     │ Consultas / Acciones                            │ Audio cifrado
                     │ (Texto)                                         │ (Voz bidireccional)
                     └─────────────────────────┬───────────────────────┘
                                               │
                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SERVIDOR CENTRAL DESKLY                                   │
│                               (On-Premise o Nube Privada)                                 │
│                                                                                           │
│   ┌───────────────────────────┐                 ┌─────────────────────────────────────┐   │
│   │   MOTOR DE IA PROPIO      │ ◄─────────────► │         SISTEMA RAG INTERNO         │   │
│   │   (Voz, Lenguaje, Razon.) │                 │  (Procedimientos, Manuales, Docs)   │   │
│   └─────────────┬─────────────┘                 └─────────────────────────────────────┘   │
│                 │                                                                         │
│                 ▼                                                                         │
│   ┌───────────────────────────────────────────────────────────────────────────────────┐   │
│   │                    CAPA DE CONECTORES Y ACCIONES EN TIEMPO REAL                   │   │
│   │                     (ERP, CRM, SGA/WMS, Bases de Datos, APIs)                     │   │
│   └─────────────────────────────────────┬─────────────────────────────────────────────┘   │
└─────────────────────────────────────────┼─────────────────────────────────────────────────┘
                                          ▼
               ┌─────────────────────────────────────────────────────┐
               │         HERRAMIENTAS ACTUALES DE LA EMPRESA         │
               │       (SAP, Odoo, Navision, Holded, CRM, etc.)      │
               └─────────────────────────────────────────────────────┘
```

### Pilar III: Más que un Producto, un Servicio de Personalización al 100%
Deskly no se vende como una herramienta cerrada o genérica que el cliente deba aprender a configurar solo:
* **Entendimiento de arriba a abajo del organigrama**:
  * Para la **Dirección General / C-Level**: control estratégico, auditoría, trazabilidad y blindaje de la propiedad intelectual.
  * Para los **Mandos Intermedios y Jefes de Equipo**: supervisión de flujos, reducción de incidencias y datos actualizados al segundo.
  * Para el **Personal Operativo de Primera Línea** (almacén, taller, mostrador, compras): interfaces directas sin fricción (por chat o altavoz manos libres), sin pantallas complejas y con respuestas instantáneas.
* **Adaptación a la operativa y jerga interna**:
  * El motor RAG y los conectores se afinan a medida con las referencias, acrónimos, manuales y hábitos propios de la empresa.
* **Conexión integral y derribo de silos**:
  * Conecta departamentos que habitualmente operan de forma aislada, mejorando la colaboración global y la velocidad de respuesta.
* **Ingeniería llave en mano**: El equipo de Deskly asume la integración completa con el ERP/CRM y la infraestructura del cliente.

---

## 3. Capacidades Operativas: Búsqueda y Ejecución

Tanto desde el **Chat de Software** como desde el **Altavoz Conversacional**, Deskly ofrece dos capacidades críticas:

### A. Capacidad de Búsqueda y Consulta (RAG + Datos Vivos)
Gracias al motor **RAG** (Retrieval-Augmented Generation) y la sincronización con las bases de datos:
* **Procedimientos y normativa interna**: *“¿Cuál es el protocolo de seguridad para la parada de emergencia en la línea 2?”*
* **Fichas técnicas y manuales**: *“¿Qué referencia de repuesto se necesita para la bomba hidráulica?”*
* **Consultas de negocio en tiempo real**: *“¿Cuánto stock disponible queda del producto X?”* o *“¿Cuál fue el último presupuesto emitido al cliente Gómez?”*
* **Ahorro masivo de tiempo**: El personal no pierde minutos buscando documentos en carpetas compartidas ni interrumpiendo a responsables.

### B. Capacidad de Ejecución (Acción en los Sistemas)
Deskly no solo lee y explica, **actúa y escribe** en el software de la empresa:
* **Registro de movimientos e inventario**: *“Anota salida de 5 unidades de la referencia B-12.”*
* **Gestión de incidencias y órdenes**: *“Crea una orden de reparación para la máquina 3 con prioridad alta.”*
* **Actualización en CRM / ERP**: *“Añade nota de seguimiento al cliente Pérez: reunión fijada para el martes.”*
* **Automatización operativa**: Dispara avisos o notificaciones automáticas a los responsables correspondientes.

---

## 4. Modalidades de Uso: Flexibilidad Total

1. **Modalidad Software / Chat (Para puestos con ordenador)**:
   * Empleados de administración, ventas, compras, dirección y gestión.
   * Interfaz web limpia, rápida y conversacional, accesible desde cualquier navegador dentro de la red corporativa.
   * Respuestas estructuradas, tablas comparativas, resúmenes y botones de confirmación de acciones.

2. **Modalidad Terminal Físico de Voz**:
   * Ideal para tareas directas por voz, dictado de notas y grabación/resumen de reuniones de equipo.
   * Puestos de trabajo donde se requiere agilidad manos libres (oficinas, salas de juntas, talleres o mostradores).
   * Sin necesidad de pantallas, móviles ni teclados: hablar con naturalidad y registrar acuerdos o tareas al vuelo.

---

## 5. Arquitectura Técnica y Despliegue

1. **El Servidor Central Deskly**:
   * **LLM Propio y Soberano**: Modelo afinado y optimizado para lenguaje natural y operaciones de negocio.
   * **Base Vectorial & RAG**: Indexa manuales, normativas, contratos, guías de calidad y procedimientos internos.
   * **Conectores ERP/CRM**: Módulos de conexión (APIs, bases de datos SQL, Webhooks) parametrizados con control de roles y permisos.
2. **Terminal Físico de Voz**:
   * Matriz de micrófonos con cancelación de ruido ambiente.
   * Altavoz de alta nitidez.
   * Conectividad cifrada directa a la red local hacia el servidor Deskly.
3. **Opciones de Alojamiento Blindado**:
   * **On-Premise**: Desplegado en un servidor local dentro del rack del cliente.
   * **Nube Privada Dedicada**: Desplegado en una instancia/VPC aislada exclusiva para el cliente (sin compartición con otros clientes ni APIs públicas).

---

## 6. Comparativa con Alternativas

| Característica | Asistentes Cloud Públicos (ChatGPT / Copilot) | Terminales Industriales Rígidos (Zebra / Vocollect) | Deskly |
| :--- | :--- | :--- | :--- |
| **Propiedad y Privacidad** | ❌ Pertenecen a OpenAI / Microsoft / Google | ⚠️ Soluciones cerradas pero no inteligentes | ✅ **100% propiedad del cliente, cero filtraciones** |
| **Interfaz de Acceso** | ❌ Solo web/móvil genérico | ⚠️ Dispositivos industriales muy aparatosos | ✅ **Chat de software propio + Terminal físico de voz** |
| **Conocimiento Interno (RAG)**| ⚠️ Limitado o expuesto a nubes públicas | ❌ Inexistente (solo comandos pregrabados) | ✅ **RAG completo con todos los manuales y procesos** |
| **Ejecución en ERP / CRM** | ❌ Difícil y con riesgos de seguridad | ⚠️ Tareas hiper-específicas de almacén | ✅ **Búsqueda y ejecución activa en el software actual** |
| **Costes y Dependencia** | ⚠️ Suscripción recurrente + tokens volátiles | ❌ Inversiones astronómicas solo para gigantes | ✅ **Diseñado y tarificado para pymes, sin dependencias** |

---

## 7. Sobre el Equipo

* **Origen**: Desarrollado en Sevilla, España.
* **Equipo fundador**:
  * **Alberto Bulnes Espinosa** ([LinkedIn](https://www.linkedin.com/in/alberto-bulnes-espinosa-724609292))
  * **Carlos Rubio Muriel** ([LinkedIn](https://www.linkedin.com/in/carlos-rubio-muriel-a23a10283))
  * **Noé Hidalgo Fernández** ([LinkedIn](https://www.linkedin.com/in/no%C3%A9-hidalgo-fern%C3%A1ndez-67bb43231))
* **Contacto**: `deskly@outlook.es`
* **Web**: [www.desklyy.es](https://www.desklyy.es/)

---

## 8. Identidad Visual y Marca

* **Isotipo**: Una **"D"** circular estilizada, moderna y sólida en azul eléctrico corporativo, simbolizando una oreja/escucha atenta, un terminal compacto y la inicial de la marca.
* **Logotipo tipográfico**: Combinación bicoloreada:
  * **"Desk"**: Blanco puro (`#FFFFFF`), sobrio y profesional.
  * **"ly"**: Azul eléctrico (`#1D68FE`), aportando dinamismo tecnológico.
* **Paleta Cromática Oficial**:
  * **Azul Eléctrico / Deskly Blue**: `#1D68FE` (identidad primaria, tecnología y agilidad).
  * **Fondo Dark Navy / Grafito Profundo**: `#0B0F19` a `#0F172A` (elegancia, seguridad y privacidad blindada).
  * **Blanco y Grises Fríos**: `#FFFFFF`, `#F8FAFC` y `#94A3B8` (legibilidad y contraste limpio).
* **Asset oficial**: Almacenado localmente en [`assets/logo.jpg`](file:///c:/Users/noehi/OneDrive/Escritorio/desklyweb/assets/logo.jpg).
