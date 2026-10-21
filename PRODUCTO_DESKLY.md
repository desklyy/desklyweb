# Deskly — Plataforma de IA Operativa para Empresas (Mini PC Appliance en Sede + Inferencia Soberana en España)

> **Documento de especificación, arquitectura y modelo de producto**  
> *Versión 2.0 — Mini PC Appliance en Sede + Inferencia Segura en Data Center España (ENS / RGPD)*

---

## 1. Resumen Ejecutivo y Visión

**Deskly** es una **plataforma integral de inteligencia artificial operativa para empresas** orientada a conectar todas las herramientas de trabajo en un único cerebro inteligente y permitir encontrar cualquier información o ejecutar tareas en **menos de 2 segundos**, con máxima privacidad, seguridad y viabilidad económica.

La arquitectura de Deskly se basa en un modelo **Appliance Híbrido Soberano**:
1. **Mini PC Servidor Físico en la Sede del Cliente (el "Cerebro Local")**:
   * Un hardware compacto, silencioso y de bajo consumo que se entrega directamente e instala en las oficinas/instalaciones de la empresa.
   * **Donde residen los datos críticos**: el motor RAG (documentación corporativa, fichas técnicas, normativas), los conectores con ERP/CRM, las bases de datos vectoriales y las credenciales/claves de acceso permanecen 100% dentro del Mini PC en la red local del cliente.
2. **Motor de Inferencia de Alta Capacidad en Data Center en España (Azure OpenAI Enterprise)**:
   * El Mini PC se conecta de forma cifrada mediante API corporativa privada a endpoints empresariales de Azure OpenAI alojados **en España** (Región Spain Central).
   * **Privacidad y Cumplimiento RGPD**: Cumplimiento estricto del RGPD europeo. La infraestructura subyacente del centro de datos cuenta con certificación ENS (Esquema Nacional de Seguridad) e ISO 27001 de Microsoft.
   * **Cero Reentrenamiento & Cero Retención**: Los prompts y respuestas no se almacenan ni se utilizan jamás para entrenar modelos de OpenAI ni de Microsoft.
   * **Optimización Drástica de Costes**: Elimina la necesidad de adquirir costosos servidores con GPUs de 15.000€-30.000€ y mantenimiento complejo, permitiendo una IA de máxima potencia a un coste accesible para pymes y medianas empresas.
3. **Interfaces de Usuario Flexibles**:
   * **Software de Chat Corporativo Privado**: Aplicación web y de escritorio accesible desde cualquier navegador dentro de la red corporativa.
   * **Terminal Físico de Voz Deskly**: Dispositivo de sobremesa con cancelación de ruido para despachos, mesas operativas, salas de reuniones o puestos con manos ocupadas.

---

## 2. Los Grandes Pilares Diferenciales

### Pilar I: Soberanía de Datos, Privacidad Blindada y Cumplimiento ENS
* **Tus datos nunca salen de tu control**: Los documentos confidenciales, procesos industriales, manuales, tarifas y bases de datos se almacenan y vectorizan localmente dentro del **Mini PC en la propia empresa**.
* **Centro de datos en España**: El procesamiento cognitivo de inferencia se ejecuta en centros de datos ubicados en territorio español, bajo estricto cumplimiento del **RGPD** y apoyándose en infraestructura con certificación ENS de Microsoft.
* **Garantía contractual de confidencialidad**: Conexión a través de endpoints empresariales dedicados (Enterprise SLA) que garantizan por contrato que ninguna consulta se almacena, ni se expone a terceros, ni se utiliza para reentrenar modelos.
* **Aislamiento de credenciales**: Las credenciales de acceso al ERP (SAP, Odoo, Navision), CRM y bases de datos SQL nunca viajan a la nube; se autentican y ejecutan directamente desde el Mini PC en la red interna.

### Pilar II: Reducción Drástica de Costes y Despliegue Plug & Play
* **Sin inversión astronómica en hardware**: Los despliegues tradicionales de modelos locales pesados requerían infraestructura de servidores GPU extremadamente cara, ruidosa y con alto consumo eléctrico.
* **Appliance Plug & Play**: El cliente recibe un Mini PC preconfigurado. Solo requiere conectarlo a la corriente y a la red local (Ethernet/Wi-Fi). En menos de 48 horas el sistema está sincronizado y operativo.
* **Costes predecibles y contenidos**: Tarifas pensadas para pymes y medianas empresas, evitando sorpresas de facturación y garantizando la máxima potencia de razonamiento del mercado.

### Pilar III: Conocimiento Unificado y Doble Capacidad (Búsqueda < 2s + Ejecución)
Deskly no se queda en dar respuestas conversacionales; unifica todas las herramientas y es un operador activo dentro de los sistemas:

```
┌─────────────────────────────────────────┐       ┌─────────────────────────────────────────┐
│     SOFTWARE DESKLY (CHAT PROPIO)       │       │       TERMINAL FÍSICO DE VOZ            │
│  (Acceso Web / PC / Oficinas / Equipos) │       │   (Sobremesa / Manos libres / Salas)    │
└────────────────────┬────────────────────┘       └────────────────────┬────────────────────┘
                     │ Consultas / Acciones                            │ Audio cifrado
                     │ (Texto)                                         │ (Voz bidireccional)
                     └─────────────────────────┬───────────────────────┘
                                               │ (Red Local / LAN Cifrada)
                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                       MINI PC SERVIDOR FÍSICO DESKLY (EN LA EMPRESA)                      │
│                                                                                           │
│   ┌─────────────────────────────────────┐       ┌─────────────────────────────────────┐   │
│   │         SISTEMA RAG INTERNO         │       │    ORQUESTADOR DE PERMISOS Y ROLES  │   │
│   │  (Documentos, Manuales, Fichas)     │       │     (Autenticación y Auditoría)     │   │
│   └──────────────────┬──────────────────┘       └──────────────────┬──────────────────┘   │
│                      │                                             │                      │
│                      ▼                                             ▼                      │
│   ┌───────────────────────────────────────────────────────────────────────────────────┐   │
│   │                    CAPA DE CONECTORES Y ACCIONES EN TIEMPO REAL                   │   │
│   │              (APIs, Bases de Datos SQL, ERP Odoo/SAP, CRM, Webhooks)              │   │
│   └─────────────────────────────────────┬─────────────────────────────────────────────┘   │
└─────────────────────────────────────────┼─────────────────────────────────────────────────┘
                                          │
                  ┌───────────────────────┴────────────────────────┐
                  │                                                │
                  ▼ (Llamada Cifrada TLS 1.3 / Endpoint Privado)   ▼ (Acceso LAN Local)
┌───────────────────────────────────────────────┐  ┌────────────────────────────────────────┐
│     INFERENCIA SEGURA EN ESPAÑA               │  │   HERRAMIENTAS VIVAS DE LA EMPRESA     │
│   (Data Center Azure España - Spain Central)  │  │ (ERP, CRM, SQL Server, Holded, etc.)   │
│   • Infraestructura con ENS Nivel Alto & RGPD │  └────────────────────────────────────────┘
│   • Cero retención y cero reentrenamiento     │
│   • Máxima velocidad de razonamiento (< 2s)   │
└───────────────────────────────────────────────┘
```

### Pilar IV: Servicio Llave en Mano y Personalización al 100%
* **Entendimiento de arriba a abajo del organigrama**:
  * Para la **Dirección General / C-Level**: control estratégico, auditoría completa, trazabilidad y blindaje de la propiedad intelectual.
  * Para los **Mandos Intermedios y Jefes de Equipo**: supervisión de flujos, reducción de incidencias y datos actualizados al segundo.
  * Para el **Personal Operativo** (almacén, taller, mostrador, compras): interfaces directas sin fricción (por chat o altavoz manos libres), sin pantallas complejas y con respuestas instantáneas.
* **Adaptación a la jerga y procesos internos**: afinado con las referencias, códigos de producto, manuales y hábitos propios de la empresa.
* **Integración sin fricción técnica**: El equipo de Deskly se encarga de parametrizar el Mini PC, los conectores y la base de conocimiento sin cargar de trabajo al departamento de IT del cliente.

---

## 3. Capacidades Operativas: Búsqueda y Ejecución

Tanto desde el **Chat de Software** como desde el **Terminal de Voz**, Deskly ofrece dos capacidades críticas:

### A. Capacidad de Búsqueda y Consulta (RAG Local + Datos Vivos)
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

## 4. Modalidades de Uso

1. **Modalidad Software / Chat (Para puestos con ordenador)**:
   * Empleados de administración, ventas, compras, dirección y gestión.
   * Interfaz web limpia, rápida y conversacional, accesible desde cualquier navegador dentro de la red corporativa.
   * Respuestas estructuradas, tablas comparativas, resúmenes y botones de confirmación de acciones.

2. **Modalidad Terminal Físico de Voz**:
   * Ideal para tareas directas por voz, dictado de notas y grabación/resumen de reuniones de equipo.
   * Puestos de trabajo donde se requiere agilidad manos libres (oficinas, salas de juntas, talleres o mostradores).
   * Sin necesidad de pantallas, móviles ni teclados: hablar con naturalidad y registrar acuerdos o tareas al vuelo.

---

## 5. Arquitectura Técnica Detallada

1. **El Mini PC Servidor Físico Deskly**:
   * **Ubicación**: Instalado físicamente en las instalaciones de la empresa (Plug & Play, Ethernet/Wi-Fi).
   * **Capa RAG & Almacenamiento Local**: Base de datos vectorial interna (Chroma / Qdrant) con embeddings locales o seguros para indexar contratos, fichas técnicas, normativas y manuales.
   * **Capa de Conectores Locales**: Módulos de conexión directa con ERP (Odoo, SAP, Navision, Holded) y bases de datos internas (PostgreSQL, MySQL, SQL Server) protegidos tras el firewall de la empresa.
   * **Módulo de Seguridad y RBAC**: Control de acceso granular basado en roles de usuario.
2. **Motor de Inferencia Soberano (Data Center España)**:
   * **Infraestructura**: Endpoint corporativo de Azure OpenAI alojado en la región **Spain Central** (Madrid, España).
   * **Seguridad de la Infraestructura**: Centro de datos con certificación ENS (Esquema Nacional de Seguridad) categoría Alta e ISO 27001 por parte de Microsoft.
   * **Privacidad**: Cumplimiento RGPD, SLA enterprise sin almacenamiento persistente de prompts y con prohibición explícita de reentrenamiento de modelos con datos de clientes.
   * **Latencia ultrabaja**: Al estar alojado en España, los tiempos de respuesta se sitúan sistemáticamente por debajo de 2 segundos.
3. **Terminal Físico de Voz**:
   * Matriz de micrófonos con cancelación de ruido ambiental.
   * Altavoz de alta nitidez para respuestas por voz sintetizada ultranatural.
   * Conectividad cifrada a la red local hacia el Mini PC Deskly.

---

## 6. Comparativa con Alternativas

| Característica | Asistentes Cloud Públicos Genéricos (ChatGPT / Copilot) | Servidores GPU On-Premise Tradicionales | Deskly (Appliance Híbrido Soberano) |
| :--- | :--- | :--- | :--- |
| **Residencia de Datos y APIs** | ❌ Servidores en EE.UU., datos expuestos | ✅ En la empresa pero con altísimo coste de hardware | ✅ **Datos, RAG y conectores en Mini PC en la empresa** |
| **Inferencia y Cumplimiento** | ❌ Nubes públicas genéricas | ⚠️ Modelos locales pequeños o limitados | ✅ **Data Center en España con certificación ENS y RGPD** |
| **Coste de Adquisición** | ⚠️ Suscripciones por usuario acumulativas | ❌ Servidores GPU de 15.000€-30.000€ + mantenimiento | ✅ **Mini PC compacto a bajo coste, accesible para pymes** |
| **Despliegue y Mantenimiento** | ❌ Sin integración con ERP local | ❌ Exige equipo especializado de sistemas e IT | ✅ **Plug & play en 48 horas, soporte gestionado** |
| **Integración ERP / CRM** | ❌ Inexistente o compleja con riesgos de seguridad | ⚠️ Requiere desarrollos largos a medida | ✅ **Conectores activos y ejecución de tareas directa** |
| **Terminal de Voz Físico** | ❌ No disponible | ❌ No disponible | ✅ **Terminal de voz para salas y puestos de trabajo** |

---

## 7. Sobre el Equipo

* **Origen**: Desarrollado en Sevilla, España.
* **Equipo directivo y fundador**:
  * **Alberto Bulnes Espinosa** — CEO ([LinkedIn](https://www.linkedin.com/in/alberto-bulnes-espinosa-724609292))
  * **Alejandro Ruiz Navarrete** — CTO ([LinkedIn](https://www.linkedin.com/in/alejandro-ruiz-navarrete-808698268/))
  * **Carlos Rubio Muriel** — CFO ([LinkedIn](https://www.linkedin.com/in/carlos-rubio-muriel-a23a10283))
  * **Noé Hidalgo Fernández** — COO ([LinkedIn](https://www.linkedin.com/in/no%C3%A9-hidalgo-fern%C3%A1ndez-67bb43231))
* **Contacto**: `contacto@desklyy.com`
* **Web**: [www.desklyy.com](https://www.desklyy.com/)

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
* **Asset oficial**: Almacenado localmente en [`assets/logo.jpg`](file:///c:/Users/noehi/Desktop/desklyweb/assets/logo.jpg).
