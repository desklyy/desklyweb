'use client';

import React, { useState } from 'react';
import {
  Factory,
  Truck,
  ShoppingBag,
  Briefcase,
  Users,
  Database,
  Globe,
  HardDrive,
  ShieldCheck,
  Server,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  Lock,
  Cloud,
  Mail,
  HelpCircle,
  Plus,
  X
} from 'lucide-react';

export interface DepartmentStaff {
  name: string;
  workers: number;
}

export interface CuestionarioPayload {
  // Paso 1: Perfil Empresa (Baja fricción)
  companyName: string;
  industry: string;
  industryCustom?: string;
  companyDepartments?: DepartmentStaff[];
  companySize: string;

  // Paso 2: Ecosistema y Alojamiento
  erp: string;
  erpCustom?: string;
  erpHotspot: string; // Servidor Local vs Cloud vs Híbrido
  crm: string;
  crmCustom?: string;
  productivity: string;
  productivityCustom?: string;
  storage: string;
  storageCustom?: string;

  // Paso 3: Operativa y Volumen
  monthlyVolume: string;
  manualTasksDescription: string;

  // Paso 4: Soberanía y Contacto Final
  strictDataPrivacy: boolean | null;
  onPremiseReadiness: boolean | null;
  meetingGoal: string;
  meetingGoalCustom?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;

  submittedAt?: string;
}

const INITIAL_DATA: CuestionarioPayload = {
  companyName: '',
  industry: '',
  industryCustom: '',
  companyDepartments: [],
  companySize: '',

  erp: '',
  erpCustom: '',
  erpHotspot: '',
  crm: '',
  crmCustom: '',
  productivity: '',
  productivityCustom: '',
  storage: '',
  storageCustom: '',

  monthlyVolume: '',
  manualTasksDescription: '',

  strictDataPrivacy: null,
  onPremiseReadiness: null,
  meetingGoal: '',
  meetingGoalCustom: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

export default function Cuestionario({
  onComplete,
}: {
  onComplete?: (data: CuestionarioPayload) => Promise<void> | void;
}) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<CuestionarioPayload>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [customDeptInput, setCustomDeptInput] = useState<string>('');
  const [deptList, setDeptList] = useState<string[]>([
    'Ventas / Comercial',
    'Compras',
    'Almacén / Logística',
    'Administración / Finanzas',
    'Producción / Operaciones',
    'Recursos Humanos',
    'Atención al Cliente',
    'Dirección / Gerencia',
  ]);

  const toggleCompanyDept = (deptName: string) => {
    const current = formData.companyDepartments || [];
    const exists = current.find((d) => d.name === deptName);
    if (exists) {
      updateField('companyDepartments', current.filter((d) => d.name !== deptName));
    } else {
      updateField('companyDepartments', [...current, { name: deptName, workers: 0 }]);
    }
  };

  const updateDeptWorkers = (deptName: string, workers: number) => {
    const current = formData.companyDepartments || [];
    updateField('companyDepartments', current.map((d) => (d.name === deptName ? { ...d, workers } : d)));
  };

  const addCustomDept = () => {
    const trimmed = customDeptInput.trim();
    if (!trimmed) return;
    if (!deptList.includes(trimmed)) {
      setDeptList((prev) => [...prev, trimmed]);
    }
    const current = formData.companyDepartments || [];
    if (!current.some((d) => d.name === trimmed)) {
      updateField('companyDepartments', [...current, { name: trimmed, workers: 0 }]);
    }
    setCustomDeptInput('');
  };

  const totalSteps = 4;

  const updateField = <K extends keyof CuestionarioPayload>(
    key: K,
    val: CuestionarioPayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const addPainChip = (text: string) => {
    setFormData((prev) => {
      const current = prev.manualTasksDescription.trim();
      const bullet = `• ${text}`;
      if (current.includes(text)) {
        return {
          ...prev,
          manualTasksDescription: current.replace(bullet, '').replace(text, '').trim(),
        };
      }
      return {
        ...prev,
        manualTasksDescription: current.length > 0 ? `${current}\n${bullet}` : bullet,
      };
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.companyName.trim()) {
      alert('Por favor indica el nombre de la empresa para personalizar el diagnóstico.');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== totalSteps) {
      handleNext();
      return;
    }

    if (!formData.contactName || !formData.contactEmail || !formData.contactPhone) {
      alert('Por favor completa tus datos de contacto (nombre, email y teléfono).');
      return;
    }

    setIsSubmitting(true);
    const finalPayload: CuestionarioPayload = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };

    try {
      if (onComplete) {
        await onComplete(finalPayload);
      } else {
        await fetch('/api/cuestionario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactName: finalPayload.contactName,
            companyName: finalPayload.companyName,
            contactEmail: finalPayload.contactEmail,
            contactPhone: finalPayload.contactPhone,
            industry: finalPayload.industry || finalPayload.industryCustom || 'No especificado',
            companySize: finalPayload.companySize,
            companyDepartments: finalPayload.companyDepartments || [],
            companyDepartmentsFormatted: (finalPayload.companyDepartments || [])
              .map((d) => (d.workers > 0 ? `${d.name} (${d.workers} trab.)` : d.name))
              .join(', '),
            erp: finalPayload.erp || finalPayload.erpCustom || 'No especificado',
            erpHotspot: finalPayload.erpHotspot,
            crm: finalPayload.crm || finalPayload.crmCustom || 'No especificado',
            productivity: finalPayload.productivity || finalPayload.productivityCustom || 'No especificado',
            storage: finalPayload.storage || finalPayload.storageCustom || 'No especificado',
            monthlyVolume: finalPayload.monthlyVolume,
            manualTasks: finalPayload.manualTasksDescription,
            strictPrivacy: finalPayload.strictDataPrivacy,
            onPremise: finalPayload.onPremiseReadiness,
            goal: finalPayload.meetingGoal || finalPayload.meetingGoalCustom || 'No especificado',
          }),
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Error al enviar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-2xl mx-auto p-10 rounded-2xl bg-[#0D1627] border border-white/[0.08] text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-[#1658F5]/20 border border-[#1658F5]/40 text-[#1658F5] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1658F5]/10">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h3 className="text-2xl font-semibold text-white tracking-tight mb-2">
          ¡Diagnóstico recibido con éxito!
        </h3>
        <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed mb-6">
          Hemos analizado preliminarmente el stack de <strong>{formData.companyName}</strong>. Te contactaremos en menos de 24h para mostrarte la demo adaptada a tu operativa.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl bg-[#0D1627] border border-white/[0.08] shadow-2xl overflow-hidden relative">
        <div className="w-full h-1 bg-white/[0.04] relative">
          <div
            className="h-full bg-[#1658F5] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(22,88,245,0.7)]"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="px-6 sm:px-10 pt-8 pb-4 flex items-center justify-between border-b border-white/[0.06]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E8DFF]">Diagnóstico Operativo Deskly</span>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mt-0.5">
              {currentStep === 1 && 'Perfil de Empresa'}
              {currentStep === 2 && 'Ecosistema Tecnológico'}
              {currentStep === 3 && 'Operativa y Tareas Manuales'}
              {currentStep === 4 && 'Soberanía y Contacto'}
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 bg-[#121D33] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            Paso <span className="text-white font-bold">{currentStep}</span> de {totalSteps}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
          {/* PASO 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-100 block">
                  Nombre de la empresa <span className="text-[#1658F5]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Ej. Logística Navarro S.L."
                  className="w-full px-4 py-3 rounded-xl bg-[#121D33]/60 border border-white/[0.1] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#1658F5] focus:ring-1 focus:ring-[#1658F5]"
                />
              </div>

              {/* Sector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-100 block">Sector principal</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'Industria', icon: Factory },
                    { id: 'Logística', icon: Truck },
                    { id: 'Retail', icon: ShoppingBag },
                    { id: 'Servicios', icon: Briefcase },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => updateField('industry', s.id)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-sm transition-all ${
                        formData.industry === s.id
                          ? 'border-[#1658F5] bg-[#1658F5]/10 text-white ring-1 ring-[#1658F5]/50'
                          : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                      }`}
                    >
                      <s.icon className="w-4 h-4 text-slate-400" />
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Departamentos y equipo */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-100 block">Departamentos de la empresa</label>
                  <p className="text-xs text-slate-400 mt-0.5">Selecciona tus departamentos e indica los trabajadores en cada uno</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {deptList.map((dept) => {
                    const sel = (formData.companyDepartments || []).find((d) => d.name === dept);
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleCompanyDept(dept)}
                        className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                          sel
                            ? 'border-[#1658F5] bg-[#1658F5]/15 text-white ring-1 ring-[#1658F5]/50'
                            : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                        }`}
                      >
                        <span>{dept}</span>
                        {sel && sel.workers > 0 && (
                          <span className="text-[10px] font-bold bg-[#1658F5] text-white px-1.5 py-0.5 rounded-full">
                            {sel.workers}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDeptInput}
                    onChange={(e) => setCustomDeptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomDept();
                      }
                    }}
                    placeholder="Añadir otro departamento (ej. Calidad, I+D)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#121D33]/60 border border-white/[0.08] text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#1658F5]"
                  />
                  <button
                    type="button"
                    onClick={addCustomDept}
                    className="px-3.5 py-2 rounded-xl bg-[#1658F5]/15 hover:bg-[#1658F5]/25 border border-[#1658F5]/40 text-[#5E8DFF] text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>

                {(formData.companyDepartments || []).length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-slate-300 block">Número de trabajadores:</span>
                    <div className="space-y-2">
                      {(formData.companyDepartments || []).map((dept) => (
                        <div
                          key={dept.name}
                          className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#0D1627]/80 border border-white/[0.08]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rounded-full bg-[#1658F5] shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">{dept.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              min={1}
                              max={9999}
                              value={dept.workers || ''}
                              onChange={(e) => updateDeptWorkers(dept.name, parseInt(e.target.value, 10) || 0)}
                              placeholder="Nº pers."
                              className="w-20 sm:w-24 px-2.5 py-1.5 rounded-lg bg-[#121D33] border border-white/[0.12] text-xs sm:text-sm text-white text-center font-semibold focus:outline-none focus:border-[#1658F5]"
                            />
                            <span className="text-xs text-slate-400 hidden sm:inline">trabajadores</span>
                            <button
                              type="button"
                              onClick={() => toggleCompanyDept(dept.name)}
                              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/[0.05]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tamaño */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-100 block">Número de empleados</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['1-10', '11-50', '51-200', '+200'].map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => updateField('companySize', size)}
                      className={`p-3.5 rounded-xl border text-sm text-center font-medium transition-all ${
                        formData.companySize === size
                          ? 'border-[#1658F5] bg-[#1658F5]/10 text-white ring-1 ring-[#1658F5]/50'
                          : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-100 block">ERP Principal</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {['Sage', 'Odoo', 'SAP', 'Holded', 'Factusol', 'A medida'].map((erp) => (
                    <button
                      type="button"
                      key={erp}
                      onClick={() => updateField('erp', erp)}
                      className={`p-3 rounded-xl border text-sm text-left font-medium transition-all ${
                        formData.erp === erp
                          ? 'border-[#1658F5] bg-[#1658F5]/10 text-white ring-1 ring-[#1658F5]/50'
                          : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                      }`}
                    >
                      {erp}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="¿Otro ERP o base de datos? Indícalo..."
                  value={formData.erpCustom || ''}
                  onChange={(e) => updateField('erpCustom', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121D33]/60 border border-white/[0.08] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#1658F5]"
                />
              </div>

              {/* Alojamiento del ERP */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-100 block">¿Dónde está alojado vuestro ERP?</label>
                  <p className="text-xs text-slate-400 mt-0.5">Clave para determinar conexión LAN directa u online</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'Servidor Local (On-Premise)', label: 'Servidor en oficina / NAS', icon: Server },
                    { id: 'Cloud SaaS', label: 'Nube SaaS / VPS', icon: Cloud },
                    { id: 'Híbrido', label: 'Híbrido / Por revisar', icon: HelpCircle },
                  ].map((h) => (
                    <button
                      type="button"
                      key={h.id}
                      onClick={() => updateField('erpHotspot', h.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                        formData.erpHotspot === h.id
                          ? 'border-[#1658F5] bg-[#1658F5]/10 text-white ring-1 ring-[#1658F5]/50'
                          : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                      }`}
                    >
                      <h.icon className="w-4 h-4 text-slate-400" />
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRM Comercial */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-100 block">CRM Comercial</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {['HubSpot', 'Salesforce', 'Microsoft Dynamics', 'Pipedrive', 'El mismo ERP', 'Ninguno / Excel'].map((crm) => (
                    <button
                      type="button"
                      key={crm}
                      onClick={() => updateField('crm', crm)}
                      className={`p-3 rounded-xl border text-sm text-left font-medium transition-all ${
                        formData.crm === crm
                          ? 'border-[#1658F5] bg-[#1658F5]/10 text-white ring-1 ring-[#1658F5]/50'
                          : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                      }`}
                    >
                      {crm}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="¿Otro CRM? Indícalo..."
                  value={formData.crmCustom || ''}
                  onChange={(e) => updateField('crmCustom', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121D33]/60 border border-white/[0.08] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#1658F5]"
                />
              </div>

              {/* Ofimática y Almacenamiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-100 block">Correo / Ofimática</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Microsoft 365', 'Google Workspace', 'Otro'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => updateField('productivity', p)}
                        className={`p-2.5 rounded-xl border text-sm text-left font-medium transition-all ${
                          formData.productivity === p
                            ? 'border-[#1658F5] bg-[#1658F5]/10 text-white ring-1 ring-[#1658F5]/50'
                            : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="¿Otro correo? Indícalo..."
                    value={formData.productivityCustom || ''}
                    onChange={(e) => updateField('productivityCustom', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#121D33]/60 border border-white/[0.08] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#1658F5]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-100 block">Almacén de archivos</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['NAS Local / Red', 'SharePoint / Drive', 'Otro'].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => updateField('storage', s)}
                        className={`p-2.5 rounded-xl border text-sm text-left font-medium transition-all ${
                          formData.storage === s
                            ? 'border-[#1658F5] bg-[#1658F5]/10 text-white ring-1 ring-[#1658F5]/50'
                            : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="¿Otro almacén? Indícalo..."
                    value={formData.storageCustom || ''}
                    onChange={(e) => updateField('storageCustom', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#121D33]/60 border border-white/[0.08] text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#1658F5]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Volumen */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-100 block">Volumen mensual de pedidos / facturas</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['< 100 docs', '100 - 500 docs', '500 - 2.000', '> 2.000 docs'].map((vol) => (
                    <button
                      type="button"
                      key={vol}
                      onClick={() => updateField('monthlyVolume', vol)}
                      className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                        formData.monthlyVolume === vol
                          ? 'border-[#1658F5] bg-[#1658F5]/10 text-white ring-1 ring-[#1658F5]/50'
                          : 'border-white/[0.08] bg-[#121D33]/60 text-slate-300 hover:bg-[#1A2742]'
                      }`}
                    >
                      {vol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tareas manuales y chips guiados */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-slate-100 block">Tareas manuales que más tiempo consumen</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Picar pedidos y facturas en PDF al ERP a mano',
                    'Reclamar y casar albaranes con proveedores',
                    'Consultas de stock y tarifas desfasadas',
                    'Redactar ofertas comerciales repetitivas',
                  ].map((chip) => {
                    const active = formData.manualTasksDescription.includes(chip);
                    return (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => addPainChip(chip)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          active
                            ? 'bg-[#1658F5]/20 border-[#1658F5] text-[#5E8DFF]'
                            : 'bg-[#121D33] border-white/[0.08] text-slate-300 hover:border-[#1658F5]/50'
                        }`}
                      >
                        + {chip}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  rows={3}
                  value={formData.manualTasksDescription}
                  onChange={(e) => updateField('manualTasksDescription', e.target.value)}
                  placeholder="Escribe o amplía los puntos de dolor de tu operativa..."
                  className="w-full px-4 py-3 rounded-xl bg-[#121D33]/60 border border-white/[0.1] text-slate-100 text-sm focus:outline-none focus:border-[#1658F5] resize-none"
                />
              </div>
            </div>
          )}

          {/* PASO 4: CONTACTO AL FINAL (Máxima conversión) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#121D33]/90 border border-[#1658F5]/30 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5E8DFF]" />
                  <h3 className="text-sm font-semibold text-white">¿Dónde enviamos el informe y propuesta técnica?</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">Nombre y apellidos <span className="text-[#1658F5]">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => updateField('contactName', e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full px-3 py-2 rounded-xl bg-[#0D1627] border border-white/[0.1] text-slate-100 text-sm focus:outline-none focus:border-[#1658F5]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">Email corporativo <span className="text-[#1658F5]">*</span></label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                      placeholder="carlos@empresa.com"
                      className="w-full px-3 py-2 rounded-xl bg-[#0D1627] border border-white/[0.1] text-slate-100 text-sm focus:outline-none focus:border-[#1658F5]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 block">Teléfono / WhatsApp <span className="text-[#1658F5]">*</span></label>
                    <input
                      type="tel"
                      required
                      value={formData.contactPhone}
                      onChange={(e) => updateField('contactPhone', e.target.value)}
                      placeholder="612 34 56 78"
                      className="w-full px-3 py-2 rounded-xl bg-[#0D1627] border border-white/[0.1] text-slate-100 text-sm focus:outline-none focus:border-[#1658F5]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.1] text-slate-300 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : <div />}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1658F5] hover:bg-[#0F48D4] text-white text-sm font-semibold"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#1658F5] hover:bg-[#0F48D4] text-white text-sm font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Enviar diagnóstico
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
