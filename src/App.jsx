import React, { useState, useEffect } from 'react';
import { 
  Camera, Save, Zap, WifiOff, MapPin, Activity, 
  Printer, ShieldAlert, Home, FileText, CheckCircle2, 
  ChevronRight, ChevronLeft, Eye, LayoutList, Trash2, Plus, Image as ImageIcon,
  AlertTriangle, XCircle, FileCheck
} from 'lucide-react';
import localforage from 'localforage';
import './index.css';

const STEPS = [
  { id: 1, label: 'Datos del Nodo', icon: FileText },
  { id: 2, label: 'Acometida y Red', icon: Zap },
  { id: 3, label: 'Transformador', icon: Activity },
  { id: 4, label: 'Tableros y Circuitos', icon: ShieldAlert },
  { id: 5, label: 'Estructura y Respaldo', icon: Home },
  { id: 6, label: 'Fotos y Dictamen', icon: Camera }
];

const DEFAULT_PHOTO_CATEGORIES = [
  'Fachada y Acceso al Inmueble',
  'Poste / Transformador de la Zona',
  'Acometida Eléctrica Principal',
  'Tableros Eléctricos y Breakers',
  'Área Propuesta para Planta Eléctrica',
  'Área Techo para Paneles Solares',
  'Otras Evidencias Técnicas'
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('form');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const [formData, setFormData] = useState({
    proposalTitle: 'PROPUESTA DE RESPALDO',
    inspectorName: '',
    date: new Date().toISOString().split('T')[0],
    nodeId: '',
    address: '',
    mapsUrl: '',

    // 1. Servicio Eléctrico & Acometida
    serviceStatus: 'optimo',
    hasMeter: false,
    acometidaCondition: 'Buenas',
    wireGauge: '',
    dualCircuitNeeded: false,
    loadShedding: '',

    // 2. Transformador
    transformerCondition: 'Óptimo',
    transformerType: 'Poste',
    transformerCapacity: '',
    transformerDistance: '',
    transformerVoltage: '',
    phaseType: 'Monofasico',
    isShared: false,
    subscriberCount: '',
    ubt: '',
    hasLightningRod: false,
    hasAntiFraud: false,
    transformerNotes: '',

    // 3. Tableros e Infraestructura
    panelCount: '',
    panelTypes: '',
    circuitsPerPanel: '',
    mainPanelCondition: 'Buenas',
    totalCircuits: '',
    circuitsCondition: false,
    conduitsCondition: false,
    conductorsCondition: false,
    outletsCondition: false,
    outlets110Count: '',
    outlets220Count: '',

    // 4. Vivienda y Respaldo
    wallType: 'Bloque de cámara',
    hasFriso: false,
    roofType: '',
    spaceForGenerator: false,
    generatorNotes: '',
    spaceForSolar: false,
    solarNotes: '',
    housingNotes: '',

    // 5. Dictamen
    finalStatus: 'APTO',
  });

  const [photos, setPhotos] = useState({});

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    localforage.getItem('airtek_energia_form_clean').then(val => {
      if (val) setFormData(val);
    });

    localforage.getItem('airtek_energia_photos_clean').then(val => {
      if (val) setPhotos(val);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    const newFormData = { ...formData, [name]: newValue };
    setFormData(newFormData);
    localforage.setItem('airtek_energia_form_clean', newFormData);
  };

  const setStatus = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    localforage.setItem('airtek_energia_form_clean', newFormData);
  };

  const toggleCheck = (field) => {
    const newFormData = { ...formData, [field]: !formData[field] };
    setFormData(newFormData);
    localforage.setItem('airtek_energia_form_clean', newFormData);
  };

  const handlePhotoUpload = (category, files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => {
          const catList = prev[category] || [];
          const updated = { ...prev, [category]: [...catList, reader.result] };
          localforage.setItem('airtek_energia_photos_clean', updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (category, index) => {
    setPhotos(prev => {
      const catList = [...(prev[category] || [])];
      catList.splice(index, 1);
      const updated = { ...prev, [category]: catList };
      localforage.setItem('airtek_energia_photos_clean', updated);
      return updated;
    });
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    alert(isOffline ? 'Inspección guardada localmente en la memoria del celular.' : 'Inspección enviada exitosamente.');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progressPercent = Math.round((currentStep / STEPS.length) * 100);

  return (
    <>
      {isOffline && (
        <div className="offline-banner no-print">
          <WifiOff size={16} /> Modo Sin Conexión - Los datos y fotos se guardan en el celular
        </div>
      )}
      
      <div className="app-container">
        
        {/* ENCABEZADO */}
        <header className="header no-print">
          <div className="header-brand">
            <div className="logo-container">
              <img src="/airtek-logo.png" alt="Airtek Logo" className="logo-img" />
            </div>
            <div className="header-text">
              <h1>Inspección Técnica de Nodos</h1>
              <p className="subtitle">GERENCIA OPERATIVA DE ENERGÍA</p>
            </div>
          </div>

          <div className="view-toggle-bar">
            <button 
              className={`view-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              <LayoutList size={16} /> Formulario Guiado
            </button>
            <button 
              className={`view-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <Eye size={16} /> Vista Previa Ficha Técnica
            </button>
          </div>
        </header>

        {/* VISTA FORMULARIO */}
        {activeTab === 'form' && (
          <div className="form-flow-wrapper no-print">
            
            {/* STEPPER */}
            <div className="stepper-card">
              <div className="progress-info">
                <span className="step-count">Paso {currentStep} de {STEPS.length}: <strong>{STEPS[currentStep - 1].label}</strong></span>
                <span className="progress-percentage">{progressPercent}% Completado</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>

              <div className="steps-nav">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`step-nav-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      title={step.label}
                    >
                      <div className="step-icon">
                        <Icon size={18} />
                      </div>
                      <span className="step-text">{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSave}>

              {/* PASO 1 */}
              {currentStep === 1 && (
                <div className="glass-card animate-fade">
                  <div className="card-header-badge">
                    <FileText size={22} className="card-icon" />
                    <div>
                      <h2>1. Datos Generales de la Inspección</h2>
                      <p>Identificación del nodo, inspector y ubicación geográfica</p>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Título / Identificador del Nodo *</label>
                      <input type="text" name="nodeId" value={formData.nodeId} onChange={handleChange} placeholder="Ej: NODO-AIRTEK" required />
                    </div>
                    <div className="form-group">
                      <label>Inspector Responsable *</label>
                      <input type="text" name="inspectorName" value={formData.inspectorName} onChange={handleChange} placeholder="Nombre y Apellido del Técnico" required />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Fecha de Inspección *</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Enlace Google Maps / Coordenadas</label>
                      <input type="text" name="mapsUrl" value={formData.mapsUrl} onChange={handleChange} placeholder="Ej: https://maps.google.com/..." />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Dirección Completa del Inmueble *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Ej: Calle principal, Casa #4, Sector..." required></textarea>
                  </div>
                </div>
              )}

              {/* PASO 2 */}
              {currentStep === 2 && (
                <div className="glass-card animate-fade">
                  <div className="card-header-badge">
                    <Zap size={22} className="card-icon warning" />
                    <div>
                      <h2>2. Servicio Eléctrico y Acometida Principal</h2>
                      <p>Calidad de la red comercial y acometida de entrada</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Estatus General del Servicio Eléctrico</label>
                    <div className="traffic-light">
                      <button type="button" onClick={() => setStatus('serviceStatus', 'optimo')} className={`traffic-btn ${formData.serviceStatus === 'optimo' ? 'selected optimo' : ''}`}>Óptimo</button>
                      <button type="button" onClick={() => setStatus('serviceStatus', 'regular')} className={`traffic-btn ${formData.serviceStatus === 'regular' ? 'selected regular' : ''}`}>Regular</button>
                      <button type="button" onClick={() => setStatus('serviceStatus', 'critico')} className={`traffic-btn ${formData.serviceStatus === 'critico' ? 'selected critico' : ''}`}>Crítico</button>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Condición de la Acometida</label>
                      <select name="acometidaCondition" value={formData.acometidaCondition} onChange={handleChange}>
                        <option value="Buenas">Buenas Condiciones</option>
                        <option value="Regular">Requiere Adecuación</option>
                        <option value="Crítico">Deteriorado / Reemplazar</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Calibre del Conductor (Acometida)</label>
                      <input type="text" name="wireGauge" value={formData.wireGauge} onChange={handleChange} placeholder="Ej: 2 AWG / 1/0 MCM" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Racionamiento Eléctrico en la Zona</label>
                    <input type="text" name="loadShedding" value={formData.loadShedding} onChange={handleChange} placeholder="Ej: 4 horas diarias / Sin racionamiento" />
                  </div>

                  <div className="toggles-grid">
                    <div className={`custom-toggle-card ${formData.hasMeter ? 'active' : ''}`} onClick={() => toggleCheck('hasMeter')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Medidor Eléctrico Presente</span>
                    </div>

                    <div className={`custom-toggle-card ${formData.dualCircuitNeeded ? 'active' : ''}`} onClick={() => toggleCheck('dualCircuitNeeded')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Amerita Alimentación Doble Circuito</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3 */}
              {currentStep === 3 && (
                <div className="glass-card animate-fade">
                  <div className="card-header-badge">
                    <Activity size={22} className="card-icon secondary" />
                    <div>
                      <h2>3. Transformador de la Zona</h2>
                      <p>Especificaciones técnicas de la fuente primaria</p>
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Tipo de Transformador</label>
                      <select name="transformerType" value={formData.transformerType} onChange={handleChange}>
                        <option value="Poste">En Poste</option>
                        <option value="Pedestal">En Pedestal (Pad-Mounted)</option>
                        <option value="Subterráneo">Subterráneo / Caseta</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Capacidad (KVA)</label>
                      <input type="text" name="transformerCapacity" value={formData.transformerCapacity} onChange={handleChange} placeholder="Ej: 37.5, 50, 75 KVA" />
                    </div>
                    <div className="form-group">
                      <label>Voltaje Medido (V)</label>
                      <input type="text" name="transformerVoltage" value={formData.transformerVoltage} onChange={handleChange} placeholder="Ej: 110/220V" />
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label>Sistema / Fases</label>
                      <select name="phaseType" value={formData.phaseType} onChange={handleChange}>
                        <option value="Monofasico">Monofásico</option>
                        <option value="Trifasico">Trifásico</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Distancia al Inmueble (m)</label>
                      <input type="text" name="transformerDistance" value={formData.transformerDistance} onChange={handleChange} placeholder="Ej: 15m" />
                    </div>
                    <div className="form-group">
                      <label>Código UBT</label>
                      <input type="text" name="ubt" value={formData.ubt} onChange={handleChange} placeholder="Ej: UBT-042" />
                    </div>
                  </div>

                  <div className="toggles-grid">
                    <div className={`custom-toggle-card ${formData.isShared ? 'active' : ''}`} onClick={() => toggleCheck('isShared')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Transformador Compartido</span>
                    </div>
                    <div className={`custom-toggle-card ${formData.hasLightningRod ? 'active' : ''}`} onClick={() => toggleCheck('hasLightningRod')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Cuenta con Pararrayo</span>
                    </div>
                    <div className={`custom-toggle-card ${formData.hasAntiFraud ? 'active' : ''}`} onClick={() => toggleCheck('hasAntiFraud')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Sistema Antifraude Presente</span>
                    </div>
                  </div>

                  {formData.isShared && (
                    <div className="form-group" style={{marginTop: '1rem'}}>
                      <label>Cantidad Estimada de Suscriptores</label>
                      <input type="text" name="subscriberCount" value={formData.subscriberCount} onChange={handleChange} placeholder="Ej: 8 usuarios" />
                    </div>
                  )}

                  <div className="form-group" style={{marginTop: '1rem'}}>
                    <label>Observaciones del Transformador</label>
                    <textarea name="transformerNotes" value={formData.transformerNotes} onChange={handleChange} placeholder="Ej: Fuga de aceite observada, sobrecarga aparente..."></textarea>
                  </div>
                </div>
              )}

              {/* PASO 4 */}
              {currentStep === 4 && (
                <div className="glass-card animate-fade">
                  <div className="card-header-badge">
                    <ShieldAlert size={22} className="card-icon primary" />
                    <div>
                      <h2>4. Tableros e Infraestructura Eléctrica</h2>
                      <p>Evaluación de tableros, breakers, circuitos y tomas</p>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Cantidad Total de Tableros</label>
                      <input type="number" name="panelCount" value={formData.panelCount} onChange={handleChange} placeholder="Ej: 1, 2, 3..." />
                    </div>
                    <div className="form-group">
                      <label>Condición General de Tableros</label>
                      <select name="mainPanelCondition" value={formData.mainPanelCondition} onChange={handleChange}>
                        <option value="Buenas">En Buenas Condiciones</option>
                        <option value="Requiere Mantenimiento">Requiere Mantenimiento</option>
                        <option value="Obsoleto/Reemplazar">Obsoleto / Reemplazar</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tipo de Tablero(s)</label>
                    <input type="text" name="panelTypes" value={formData.panelTypes} onChange={handleChange} placeholder="Ej: Tablero Principal: Empotrado (Metal) | Tablero 2: Superficial" />
                  </div>

                  <div className="form-group">
                    <label>Desglose de Circuitos por Tablero</label>
                    <textarea name="circuitsPerPanel" value={formData.circuitsPerPanel} onChange={handleChange} placeholder="Ej: Tablero 1: 8 circuitos (Breakers 20A) | Tablero 2: 4 circuitos (Breakers 40A)"></textarea>
                  </div>

                  <div className="toggles-grid">
                    <div className={`custom-toggle-card ${formData.circuitsCondition ? 'active' : ''}`} onClick={() => toggleCheck('circuitsCondition')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Circuitos Internos Aprobados</span>
                    </div>
                    <div className={`custom-toggle-card ${formData.conduitsCondition ? 'active' : ''}`} onClick={() => toggleCheck('conduitsCondition')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Canalizaciones en Buen Estado</span>
                    </div>
                    <div className={`custom-toggle-card ${formData.conductorsCondition ? 'active' : ''}`} onClick={() => toggleCheck('conductorsCondition')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Conductores Eléctricos Aprobados</span>
                    </div>
                    <div className={`custom-toggle-card ${formData.outletsCondition ? 'active' : ''}`} onClick={() => toggleCheck('outletsCondition')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Tomas Corrientes en Buen Estado</span>
                    </div>
                  </div>

                  <div className="grid-2" style={{marginTop: '1.25rem'}}>
                    <div className="form-group">
                      <label>Cantidad Puntos 110V</label>
                      <input type="number" name="outlets110Count" value={formData.outlets110Count} onChange={handleChange} placeholder="Ej: 10" />
                    </div>
                    <div className="form-group">
                      <label>Cantidad Puntos 220V</label>
                      <input type="number" name="outlets220Count" value={formData.outlets220Count} onChange={handleChange} placeholder="Ej: 4" />
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 5 */}
              {currentStep === 5 && (
                <div className="glass-card animate-fade">
                  <div className="card-header-badge">
                    <Home size={22} className="card-icon success" />
                    <div>
                      <h2>5. Condiciones del Inmueble y Respaldo</h2>
                      <p>Espacios físicos para bancos de baterías, generador y paneles</p>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label>Tipo de Paredes</label>
                      <select name="wallType" value={formData.wallType} onChange={handleChange}>
                        <option value="Vaciada">Concreto Vaciado</option>
                        <option value="Bloque de cámara">Bloque de Cámara (Cemento)</option>
                        <option value="Bloque de arcilla">Bloque de Arcilla</option>
                        <option value="Drywall/Liviana">Pared Liviana / Drywall</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tipo de Placa / Techo</label>
                      <input type="text" name="roofType" value={formData.roofType} onChange={handleChange} placeholder="Ej: Placa de concreto / Acerolit / Machimbrado" />
                    </div>
                  </div>

                  <div className="toggles-grid">
                    <div className={`custom-toggle-card ${formData.hasFriso ? 'active' : ''}`} onClick={() => toggleCheck('hasFriso')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Paredes con Friso</span>
                    </div>
                    <div className={`custom-toggle-card ${formData.spaceForGenerator ? 'active' : ''}`} onClick={() => toggleCheck('spaceForGenerator')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Área para Planta Eléctrica</span>
                    </div>
                    <div className={`custom-toggle-card ${formData.spaceForSolar ? 'active' : ''}`} onClick={() => toggleCheck('spaceForSolar')}>
                      <div className="toggle-switch"><div className="toggle-slider"></div></div>
                      <span className="toggle-label">Área Techo Paneles Solares</span>
                    </div>
                  </div>

                  {formData.spaceForGenerator && (
                    <div className="form-group" style={{marginTop: '1rem'}}>
                      <label>Detalles del Área de Planta Eléctrica</label>
                      <input type="text" name="generatorNotes" value={formData.generatorNotes} onChange={handleChange} placeholder="Ej: Patio posterior libre (12m²) con ventilación..." />
                    </div>
                  )}

                  {formData.spaceForSolar && (
                    <div className="form-group" style={{marginTop: '1rem'}}>
                      <label>Detalles del Área de Paneles Solares</label>
                      <input type="text" name="solarNotes" value={formData.solarNotes} onChange={handleChange} placeholder="Ej: Techo libre despejado (45m²) orientación Sur..." />
                    </div>
                  )}

                  <div className="form-group" style={{marginTop: '1rem'}}>
                    <label>Observaciones de la Estructura / Inmueble</label>
                    <textarea name="housingNotes" value={formData.housingNotes} onChange={handleChange} placeholder="Ej: Espacio apto para racks de baterías e inversores..."></textarea>
                  </div>
                </div>
              )}

              {/* PASO 6 */}
              {currentStep === 6 && (
                <div className="glass-card animate-fade">
                  <div className="card-header-badge">
                    <Camera size={22} className="card-icon primary" />
                    <div>
                      <h2>6. Anexos Fotográficos y Dictamen Final</h2>
                      <p>Clasificación de evidencias e informe de factibilidad energética</p>
                    </div>
                  </div>

                  <div className="photo-categories-wrapper">
                    <h3 className="photo-sec-title"><ImageIcon size={20} /> Anexos Fotográficos de Evidencia</h3>
                    <p className="photo-sec-subtitle">Las imágenes agregadas se estructurarán como láminas/anexos en el informe final PDF:</p>

                    {DEFAULT_PHOTO_CATEGORIES.map((category) => {
                      const catPhotos = photos[category] || [];
                      return (
                        <div key={category} className="photo-category-card large-annex">
                          <div className="photo-cat-header">
                            <span className="photo-cat-name">ANEXO: {category.toUpperCase()}</span>
                            <label className="btn-upload-photo">
                              <Plus size={16} /> Adjuntar Fotografía
                              <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment"
                                multiple
                                onChange={(e) => handlePhotoUpload(category, e.target.files)} 
                                hidden 
                              />
                            </label>
                          </div>

                          {catPhotos.length > 0 ? (
                            <div className="large-photo-grid">
                              {catPhotos.map((imgSrc, idx) => (
                                <div key={idx} className="large-photo-card">
                                  <img src={imgSrc} alt={`${category} ${idx + 1}`} className="large-photo-img" />
                                  <div className="large-photo-caption">
                                    <span>Figura {idx + 1}: {category}</span>
                                    <button 
                                      type="button" 
                                      className="btn-remove-photo" 
                                      onClick={() => handleRemovePhoto(category, idx)}
                                      title="Eliminar foto"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-photo-placeholder large">
                              Sin fotografías adjuntas en este anexo.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="dictamen-corporate-card">
                    <h3 className="dictamen-card-title">
                      <FileCheck size={20} /> Resultado de Factibilidad Energética
                    </h3>
                    <p className="dictamen-card-desc">Seleccione el dictamen técnico correspondiente al expediente del nodo:</p>

                    <div className="dictamen-options-deck">
                      
                      <div 
                        className={`dictamen-option-card apto ${formData.finalStatus === 'APTO' ? 'selected' : ''}`}
                        onClick={() => setStatus('finalStatus', 'APTO')}
                      >
                        <div className="dictamen-status-icon">
                          <CheckCircle2 size={24} />
                        </div>
                        <div className="dictamen-status-info">
                          <h4>APTO</h4>
                          <p>Infraestructura eléctrica óptima. Cumple 100% con los requerimientos para respaldo de red.</p>
                        </div>
                        <div className="dictamen-radio-indicator"></div>
                      </div>

                      <div 
                        className={`dictamen-option-card adecuaciones ${formData.finalStatus === 'APTO CON ADECUACIONES' ? 'selected' : ''}`}
                        onClick={() => setStatus('finalStatus', 'APTO CON ADECUACIONES')}
                      >
                        <div className="dictamen-status-icon">
                          <AlertTriangle size={24} />
                        </div>
                        <div className="dictamen-status-info">
                          <h4>APTO CON ADECUACIONES</h4>
                          <p>Requiere trabajos menores (recableado, adecuación de tablero o tierra física) antes de energizar.</p>
                        </div>
                        <div className="dictamen-radio-indicator"></div>
                      </div>

                      <div 
                        className={`dictamen-option-card no-apto ${formData.finalStatus === 'NO APTO' ? 'selected' : ''}`}
                        onClick={() => setStatus('finalStatus', 'NO APTO')}
                      >
                        <div className="dictamen-status-icon">
                          <XCircle size={24} />
                        </div>
                        <div className="dictamen-status-info">
                          <h4>NO APTO</h4>
                          <p>Inmueble con fallas críticas o inviable para el soporte de equipos de respaldos de energía.</p>
                        </div>
                        <div className="dictamen-radio-indicator"></div>
                      </div>

                    </div>
                  </div>

                  <div className="corporate-action-bar">
                    <button type="button" onClick={handleSave} className="btn-corp-secondary">
                      <Save size={18} /> Guardar Borrador Local
                    </button>
                    <button type="button" onClick={handlePrintPDF} className="btn-corp-primary">
                      <Printer size={18} /> Exportar Informe Oficial (PDF)
                    </button>
                  </div>

                </div>
              )}

              {/* CONTROLES NAVEGACIÓN INFERIOR */}
              <div className="sticky-bottom-bar">
                <button 
                  type="button" 
                  onClick={prevStep} 
                  disabled={currentStep === 1}
                  className="btn btn-secondary-outline"
                >
                  <ChevronLeft size={18} /> Anterior
                </button>

                <div className="step-dots">
                  {STEPS.map(s => (
                    <span 
                      key={s.id} 
                      className={`dot ${currentStep === s.id ? 'active' : ''}`}
                      onClick={() => setCurrentStep(s.id)}
                    ></span>
                  ))}
                </div>

                {currentStep < STEPS.length ? (
                  <button 
                    type="button" 
                    onClick={nextStep} 
                    className="btn btn-primary"
                  >
                    Siguiente <ChevronRight size={18} />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={handlePrintPDF} 
                    className="btn btn-pdf"
                  >
                    <Printer size={18} /> Exportar PDF
                  </button>
                )}
              </div>

            </form>
          </div>
        )}

        {/* VISTA PREVIA FICHA TÉCNICA */}
        {activeTab === 'preview' && (
          <div className="report-preview-container animate-fade no-print">
            <div className="report-card-sheet">
              <div className="report-header">
                <img src="/airtek-logo.png" alt="Airtek" className="report-logo" />
                <div className="report-title-block">
                  <h2>CORPORACION MATRIX TV, C.A.</h2>
                  <h3>GERENCIA OPERATIVA DE ENERGÍA</h3>
                  <h4>FICHA TÉCNICA OFICIAL DE INSPECCIÓN Y RESPALDOS</h4>
                </div>
              </div>
              <hr className="report-divider" />

              {/* 1. DATOS DEL NODO */}
              <div className="report-section">
                <h4 className="rep-sec-title">1. DATOS DEL NODO Y UBICACIÓN</h4>
                <div className="rep-grid-2">
                  <p><strong>Título / Propuesta:</strong> {formData.proposalTitle || 'N/A'}</p>
                  <p><strong>Identificador del Nodo:</strong> {formData.nodeId || 'N/A'}</p>
                  <p><strong>Inspector Responsable:</strong> {formData.inspectorName || 'N/A'}</p>
                  <p><strong>Fecha de Inspección:</strong> {formData.date}</p>
                  <p><strong>Enlace Google Maps / Coordenadas:</strong> {formData.mapsUrl ? <a href={formData.mapsUrl} target="_blank" rel="noreferrer" style={{color: '#0166FF'}}>{formData.mapsUrl}</a> : 'N/A'}</p>
                </div>
                <p style={{marginTop: '0.5rem'}}><strong>Dirección Completa:</strong> {formData.address || 'N/A'}</p>
              </div>

              {/* 2. SERVICIO Y ACOMETIDA */}
              <div className="report-section">
                <h4 className="rep-sec-title">2. SERVICIO ELÉCTRICO Y ACOMETIDA</h4>
                <div className="rep-grid-2">
                  <p><strong>Estatus del Servicio:</strong> <span className={`badge ${formData.serviceStatus}`}>{formData.serviceStatus ? formData.serviceStatus.toUpperCase() : 'N/A'}</span></p>
                  <p><strong>Medidor Eléctrico:</strong> {formData.hasMeter ? 'Sí Presente' : 'No Presente / Conexión Directa'}</p>
                  <p><strong>Condición de Acometida:</strong> {formData.acometidaCondition || 'N/A'}</p>
                  <p><strong>Calibre de Conductor:</strong> {formData.wireGauge || 'N/A'}</p>
                  <p><strong>Acometida Dedicada Requerida:</strong> {formData.dualCircuitNeeded ? 'SÍ (Requerida)' : 'NO (Suficiente)'}</p>
                  <p><strong>Cortes / Racionamiento Promedio:</strong> {formData.loadShedding || 'N/A'}</p>
                </div>
              </div>

              {/* 3. TRANSFORMADOR */}
              <div className="report-section">
                <h4 className="rep-sec-title">3. TRANSFORMADOR Y RED ELÉCTRICA DE LA ZONA</h4>
                <div className="rep-grid-2">
                  <p><strong>Tipo de Transformador:</strong> {formData.transformerType || 'N/A'}</p>
                  <p><strong>Condición Operativa:</strong> {formData.transformerCondition || 'N/A'}</p>
                  <p><strong>Capacidad Nominal:</strong> {formData.transformerCapacity ? `${formData.transformerCapacity} KVA` : 'N/A'}</p>
                  <p><strong>Voltaje Medido / Nominal:</strong> {formData.transformerVoltage ? `${formData.transformerVoltage} V` : 'N/A'}</p>
                  <p><strong>Tipo de Fase:</strong> {formData.phaseType || 'N/A'}</p>
                  <p><strong>Distancia Aproximada al Nodo:</strong> {formData.transformerDistance ? `${formData.transformerDistance} mts` : 'N/A'}</p>
                  <p><strong>Transformador Compartido:</strong> {formData.isShared ? 'SÍ' : 'NO'}</p>
                  <p><strong>Cantidad de Suscriptores:</strong> {formData.subscriberCount || 'N/A'}</p>
                  <p><strong>Código UBT:</strong> {formData.ubt || 'N/A'}</p>
                  <p><strong>Protección Pararrayos:</strong> {formData.hasLightningRod ? 'Sí Presente' : 'No Presente'}</p>
                  <p><strong>Protección Antifraude:</strong> {formData.hasAntiFraud ? 'Sí Presente' : 'No Presente'}</p>
                </div>
                {formData.transformerNotes && (
                  <p style={{marginTop: '0.5rem'}}><strong>Observaciones del Transformador:</strong> {formData.transformerNotes}</p>
                )}
              </div>

              {/* 4. TABLEROS E INFRAESTRUCTURA */}
              <div className="report-section">
                <h4 className="rep-sec-title">4. TABLEROS E INFRAESTRUCTURA ELÉCTRICA INTERNA</h4>
                <div className="rep-grid-2">
                  <p><strong>Cantidad de Tableros:</strong> {formData.panelCount || '0'}</p>
                  <p><strong>Total de Breakers / Circuitos:</strong> {formData.totalCircuits || '0'}</p>
                  <p><strong>Tipos de Tableros:</strong> {formData.panelTypes || 'N/A'}</p>
                  <p><strong>Condición Tablero Principal:</strong> {formData.mainPanelCondition || 'N/A'}</p>
                  <p><strong>Desglose por Tablero:</strong> {formData.circuitsPerPanel || 'N/A'}</p>
                  <p><strong>Estado Breakers / Circuitos:</strong> {formData.circuitsCondition ? 'Deficiente / Reemplazar' : 'Buen Estado / Operativo'}</p>
                  <p><strong>Tuberías y Canalizaciones:</strong> {formData.conduitsCondition ? 'Expuestas / Deficientes' : 'Óptimas / Adecuadas'}</p>
                  <p><strong>Cableado / Conductores:</strong> {formData.conductorsCondition ? 'Deteriorado / Sobrecalentado' : 'Adecuado / Buen Estado'}</p>
                  <p><strong>Tomacorrientes Generales:</strong> {formData.outletsCondition ? 'Deficientes / Sin Tierra' : 'Operativos'}</p>
                  <p><strong>Tomas 110V Disponibles:</strong> {formData.outlets110Count || '0'}</p>
                  <p><strong>Tomas 220V Disponibles:</strong> {formData.outlets220Count || '0'}</p>
                </div>
              </div>

              {/* 5. ESTRUCTURA Y RESPALDO */}
              <div className="report-section">
                <h4 className="rep-sec-title">5. ESTRUCTURA DEL INMUEBLE Y RESPALDO REQUERIDO</h4>
                <div className="rep-grid-2">
                  <p><strong>Tipo de Paredes / Estructura:</strong> {formData.wallType || 'N/A'}</p>
                  <p><strong>Frisado en Paredes:</strong> {formData.hasFriso ? 'SÍ (Frisadas)' : 'NO (Obra Limpia)'}</p>
                  <p><strong>Tipo de Techo / Cubierta:</strong> {formData.roofType || 'N/A'}</p>
                  <p><strong>Espacio para Planta Eléctrica:</strong> {formData.spaceForGenerator ? 'SÍ (Disponible)' : 'NO (Sin Espacio)'}</p>
                  <p><strong>Espacio para Paneles Solares:</strong> {formData.spaceForSolar ? 'SÍ (Disponible en Techo)' : 'NO (Sin Espacio Techo)'}</p>
                </div>
                {formData.generatorNotes && <p style={{marginTop: '0.4rem'}}><strong>Detalles Planta Eléctrica:</strong> {formData.generatorNotes}</p>}
                {formData.solarNotes && <p style={{marginTop: '0.4rem'}}><strong>Detalles Paneles Solares:</strong> {formData.solarNotes}</p>}
                {formData.housingNotes && <p style={{marginTop: '0.4rem'}}><strong>Observaciones Generales Inmueble:</strong> {formData.housingNotes}</p>}
              </div>

              {/* 6. DICTAMEN FINAL */}
              <div className="report-section final-eval">
                <h4 className="rep-sec-title">6. DICTAMEN TÉCNICO FINAL DE EVALUACIÓN</h4>
                <div className={`final-badge-box ${formData.finalStatus === 'APTO' ? 'apto' : formData.finalStatus === 'NO APTO' ? 'no-apto' : 'adecuaciones'}`}>
                  DICTAMEN TÉCNICO: {formData.finalStatus}
                </div>
              </div>

              {/* 7. ANEXOS FOTOGRÁFICOS */}
              <div className="report-section" style={{marginTop: '2rem'}}>
                <h4 className="rep-sec-title">7. ANEXOS FOTOGRÁFICOS INDEPENDIENTES</h4>
                {Object.keys(photos).some(cat => (photos[cat] || []).length > 0) ? (
                  Object.keys(photos).map(cat => {
                    const catPhotos = photos[cat] || [];
                    if (catPhotos.length === 0) return null;
                    return (
                      <div key={cat} className="preview-annex-block">
                        <h5 className="annex-block-title">ANEXO FOTOGRÁFICO: {cat.toUpperCase()}</h5>
                        <div className="preview-annex-grid">
                          {catPhotos.map((imgSrc, idx) => (
                            <div key={idx} className="preview-annex-card">
                              <img src={imgSrc} alt={cat} className="preview-annex-img" />
                              <div className="preview-annex-label">Evidencia {idx + 1}: {cat}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic'}}>Sin anexos fotográficos adjuntos al informe.</p>
                )}
              </div>

              <div className="report-actions">
                <button type="button" onClick={handlePrintPDF} className="btn btn-pdf" style={{width: '100%'}}>
                  <Printer size={18} /> Imprimir / Exportar Ficha Oficial a PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMPRESIÓN PDF */}
        <div className="print-only-header">
          <div className="print-head-flex">
            <img src="/airtek-logo.png" alt="Airtek Logo" className="print-logo-img" />
            <div className="print-head-titles">
              <h2>CORPORACION MATRIX TV, C.A.</h2>
              <h3>GERENCIA OPERATIVA DE ENERGÍA</h3>
              <h4>FICHA OFICIAL DE INSPECCIÓN TÉCNICA DE RESPALDOS</h4>
            </div>
          </div>
          <hr className="print-divider" />
        </div>

        <div className="print-only-body">
          <table className="print-table">
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '28%' }} />
            </colgroup>
            <tbody>
              {/* 1. DATOS GENERALES DEL NODO */}
              <tr><th colSpan="4" className="print-th">1. DATOS GENERALES DEL NODO Y UBICACIÓN</th></tr>
              <tr>
                <td className="label-col">Título Propuesta:</td><td>{formData.proposalTitle || 'N/A'}</td>
                <td className="label-col">Identificador Nodo:</td><td>{formData.nodeId || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Inspector Responsable:</td><td>{formData.inspectorName || 'N/A'}</td>
                <td className="label-col">Fecha Inspección:</td><td>{formData.date}</td>
              </tr>
              <tr>
                <td className="label-col">Coordenadas / Maps:</td><td colSpan="3" style={{ wordBreak: 'break-all' }}>{formData.mapsUrl || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Dirección Inmueble:</td><td colSpan="3">{formData.address || 'N/A'}</td>
              </tr>

              {/* 2. SERVICIO ELÉCTRICO Y ACOMETIDA */}
              <tr><th colSpan="4" className="print-th">2. SERVICIO ELÉCTRICO Y ACOMETIDA</th></tr>
              <tr>
                <td className="label-col">Estatus Servicio:</td><td>{formData.serviceStatus ? formData.serviceStatus.toUpperCase() : 'N/A'}</td>
                <td className="label-col">Medidor Eléctrico:</td><td>{formData.hasMeter ? 'SÍ' : 'NO'}</td>
              </tr>
              <tr>
                <td className="label-col">Condición Acometida:</td><td>{formData.acometidaCondition || 'N/A'}</td>
                <td className="label-col">Calibre Conductor:</td><td>{formData.wireGauge || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Acometida Requerida:</td><td>{formData.dualCircuitNeeded ? 'SÍ (Dedicada)' : 'NO (Suficiente)'}</td>
                <td className="label-col">Cortes Promedio:</td><td>{formData.loadShedding || 'N/A'}</td>
              </tr>

              {/* 3. TRANSFORMADOR DE LA ZONA */}
              <tr><th colSpan="4" className="print-th">3. TRANSFORMADOR Y RED ELÉCTRICA DE LA ZONA</th></tr>
              <tr>
                <td className="label-col">Tipo Transformador:</td><td>{formData.transformerType || 'N/A'}</td>
                <td className="label-col">Condición Operativa:</td><td>{formData.transformerCondition || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Capacidad (KVA):</td><td>{formData.transformerCapacity ? `${formData.transformerCapacity} KVA` : 'N/A'}</td>
                <td className="label-col">Voltaje Medido (V):</td><td>{formData.transformerVoltage ? `${formData.transformerVoltage} V` : 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Fases:</td><td>{formData.phaseType || 'N/A'}</td>
                <td className="label-col">Distancia al Nodo:</td><td>{formData.transformerDistance ? `${formData.transformerDistance} mts` : 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Compartido:</td><td>{formData.isShared ? 'SÍ' : 'NO'}</td>
                <td className="label-col">Suscriptores:</td><td>{formData.subscriberCount || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Código UBT:</td><td>{formData.ubt || 'N/A'}</td>
                <td className="label-col">Protecciones:</td><td>{formData.hasLightningRod ? 'Pararrayos (SÍ)' : 'Sin Pararrayos'} / {formData.hasAntiFraud ? 'Antifraude (SÍ)' : 'Sin Antifraude'}</td>
              </tr>
              {formData.transformerNotes && (
                <tr>
                  <td className="label-col">Observaciones Transf.:</td><td colSpan="3">{formData.transformerNotes}</td>
                </tr>
              )}

              {/* 4. TABLEROS E INFRAESTRUCTURA */}
              <tr><th colSpan="4" className="print-th">4. TABLEROS E INFRAESTRUCTURA ELÉCTRICA INTERNA</th></tr>
              <tr>
                <td className="label-col">Cantidad Tableros:</td><td>{formData.panelCount || '0'}</td>
                <td className="label-col">Total Circuitos/Breakers:</td><td>{formData.totalCircuits || '0'}</td>
              </tr>
              <tr>
                <td className="label-col">Tipos de Tableros:</td><td>{formData.panelTypes || 'N/A'}</td>
                <td className="label-col">Condición Tablero Ppal:</td><td>{formData.mainPanelCondition || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Desglose por Tablero:</td><td colSpan="3">{formData.circuitsPerPanel || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Breakers / Circuitos:</td><td>{formData.circuitsCondition ? 'Deficiente' : 'Buen Estado'}</td>
                <td className="label-col">Tuberías/Canalizaciones:</td><td>{formData.conduitsCondition ? 'Expuestas/Deficientes' : 'Óptimas'}</td>
              </tr>
              <tr>
                <td className="label-col">Cableado Interno:</td><td>{formData.conductorsCondition ? 'Deteriorado' : 'Adecuado'}</td>
                <td className="label-col">Tomacorrientes:</td><td>{formData.outletsCondition ? 'Deficiente/Sin Tierra' : 'Operativos'}</td>
              </tr>
              <tr>
                <td className="label-col">Tomas 110V Disponibles:</td><td>{formData.outlets110Count || '0'}</td>
                <td className="label-col">Tomas 220V Disponibles:</td><td>{formData.outlets220Count || '0'}</td>
              </tr>

              {/* 5. ESTRUCTURA Y RESPALDO */}
              <tr><th colSpan="4" className="print-th">5. ESTRUCTURA DEL INMUEBLE Y ESPACIO DE RESPALDO</th></tr>
              <tr>
                <td className="label-col">Tipo Paredes:</td><td>{formData.wallType || 'N/A'}</td>
                <td className="label-col">Frisado:</td><td>{formData.hasFriso ? 'SÍ (Frisadas)' : 'NO (Obra Limpia)'}</td>
              </tr>
              <tr>
                <td className="label-col">Tipo Techo:</td><td colSpan="3">{formData.roofType || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Espacio Planta Eléctrica:</td><td>{formData.spaceForGenerator ? 'SÍ (Disponible)' : 'NO (Sin Espacio)'}</td>
                <td className="label-col">Detalles Planta:</td><td>{formData.generatorNotes || 'N/A'}</td>
              </tr>
              <tr>
                <td className="label-col">Espacio Paneles Solares:</td><td>{formData.spaceForSolar ? 'SÍ (Disponible en Techo)' : 'NO (Sin Espacio Techo)'}</td>
                <td className="label-col">Detalles Solares:</td><td>{formData.solarNotes || 'N/A'}</td>
              </tr>
              {formData.housingNotes && (
                <tr>
                  <td className="label-col">Observaciones Inmueble:</td><td colSpan="3">{formData.housingNotes}</td>
                </tr>
              )}

              {/* 6. DICTAMEN TÉCNICO FINAL */}
              <tr><th colSpan="4" className="print-th">6. DICTAMEN TÉCNICO DE EVALUACIÓN FINAL</th></tr>
              <tr>
                <td colSpan="4" className="print-dictamen-cell">
                  <div className={`print-dictamen-badge ${formData.finalStatus === 'APTO' ? 'apto' : formData.finalStatus === 'NO APTO' ? 'no-apto' : 'adecuaciones'}`}>
                    DICTAMEN TÉCNICO: {formData.finalStatus}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ANEXOS FOTOGRÁFICOS */}
          {Object.keys(photos).some(cat => (photos[cat] || []).length > 0) && (
            <div className="print-annex-page-break">
              <div className="print-head-flex" style={{marginBottom: '10px'}}>
                <img src="/airtek-logo.png" alt="Airtek" className="print-logo-img" />
                <div className="print-head-titles">
                  <h2>ANEXOS FOTOGRÁFICOS DE EVIDENCIA TÉCNICA</h2>
                  <h4>GERENCIA OPERATIVA DE ENERGÍA</h4>
                </div>
              </div>
              <hr className="print-divider" />

              {Object.keys(photos).map(cat => {
                const catPhotos = photos[cat] || [];
                if (catPhotos.length === 0) return null;
                return (
                  <div key={cat} className="print-annex-section">
                    <h3 className="print-annex-head">ANEXO FOTOGRÁFICO: {cat.toUpperCase()}</h3>
                    <div className="print-annex-grid">
                      {catPhotos.map((imgSrc, idx) => (
                        <div key={idx} className="print-annex-box">
                          <img src={imgSrc} alt={cat} className="print-annex-img" />
                          <div className="print-annex-caption">Evidencia {idx + 1}: {cat}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="print-signatures-block">
            <div className="signature-box">
              <div className="signature-line"></div>
              <p><strong>Inspector Técnico Responsable</strong></p>
              <p>{formData.inspectorName || 'Nombre y Firma'}</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p><strong>Gerencia Operativa De Energía</strong></p>
              <p>Aprobación y Sello Oficial</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default App;
