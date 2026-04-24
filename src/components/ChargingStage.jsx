import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useWheelSpin } from '../hooks/useWheelSpin';

/**
 * Escena visual principal del dashboard.
 * Contiene el SVG completo con:
 *  - Cielo nocturno con estrellas y luna
 *  - Silueta de ciudad
 *  - Estación de carga (con pantalla dinámica)
 *  - Auto eléctrico animado (entra, se conecta, sale)
 *  - Cable de carga animado
 *  - Partículas de energía
 *  - Texto de estado superpuesto
 *
 * El componente padre controla las animaciones via ref.
 */
const ChargingStage = forwardRef(function ChargingStage({ stateName, stateConfig, metrics }, ref) {

  const carRef         = useRef(null);
  const cableMainRef   = useRef(null);
  const cablePulseRef  = useRef(null);
  const particlesRef   = useRef(null);
  const cportRef       = useRef(null);
  const batFillRef     = useRef(null);
  const batPctRef      = useRef(null);
  const scrBarRef      = useRef(null);
  const scrKwRef       = useRef(null);
  const scrStateRef    = useRef(null);
  const stOrbRef       = useRef(null);
  const ovTitleRef     = useRef(null);
  const ovSubRef       = useRef(null);
  const starsRef       = useRef(null);
  const { spin }       = useWheelSpin();

  // Exponer funciones de animación al componente padre
  useImperativeHandle(ref, () => ({
    carDriveIn,
    carDriveOut,
    showCable,
    hideCable,
    showParticles,
    hideParticles,
    updateBattery,
    completeBattery,
    resetBattery,
  }));

  // ─── Animaciones del auto ────────────────────────────────────────────

  function carDriveIn() {
    const car = carRef.current;
    if (!car) return;
    car.style.transition = 'transform 2.2s cubic-bezier(.25,.46,.45,.94)';
    car.style.transform = 'translateX(0)';
    spin(2200);
    // Conectar cable después de que el auto llegue
    setTimeout(() => {
      showCable();
      if (cportRef.current) cportRef.current.setAttribute('stroke', '#60A5FA');
    }, 2200);
  }

  function carDriveOut() {
    hideCable();
    hideParticles();
    if (cportRef.current) cportRef.current.setAttribute('stroke', '#3D2D6A');
    setTimeout(() => {
      const car = carRef.current;
      if (!car) return;
      car.style.transition = 'transform 1.8s cubic-bezier(.55,0,1,.45)';
      car.style.transform = 'translateX(-760px)';
      spin(1800);
    }, 350);
  }

  // ─── Cable ───────────────────────────────────────────────────────────

  function showCable() {
    if (cableMainRef.current)  cableMainRef.current.style.opacity = '1';
  }

  function hideCable() {
    if (cableMainRef.current)  cableMainRef.current.style.opacity = '0';
    if (cablePulseRef.current) cablePulseRef.current.style.opacity = '0';
  }

  // ─── Partículas de carga ─────────────────────────────────────────────

  function showParticles() {
    if (cablePulseRef.current)  cablePulseRef.current.style.opacity = '1';
    if (particlesRef.current)   particlesRef.current.style.opacity  = '1';
    if (cportRef.current)       cportRef.current.setAttribute('stroke', '#F97316');
  }

  function hideParticles() {
    if (cablePulseRef.current)  cablePulseRef.current.style.opacity = '0';
    if (particlesRef.current)   particlesRef.current.style.opacity  = '0';
  }

  // ─── Batería ──────────────────────────────────────────────────────────

  function updateBattery(percent) {
    const MAX_W = 104; // ancho máximo de la barra (108 - 4px padding)
    const fillW = Math.round((percent / 100) * MAX_W);
    const color = percent < 30 ? '#F87171' : percent < 65 ? '#F97316' : '#4ADE80';

    if (batFillRef.current) {
      batFillRef.current.setAttribute('width', fillW);
      batFillRef.current.setAttribute('fill', color);
    }
    if (batPctRef.current) {
      batPctRef.current.textContent = `${Math.round(percent)}%`;
      batPctRef.current.setAttribute('fill', color);
    }

    // Actualizar pantalla de la estación
    const barW = Math.round((percent / 100) * 36);
    if (scrBarRef.current) scrBarRef.current.setAttribute('width', barW);
  }

  function completeBattery() {
    updateBattery(100);
    if (scrBarRef.current)  scrBarRef.current.setAttribute('fill', '#4ADE80');
    if (scrKwRef.current)   scrKwRef.current.textContent = '✓ 100%';
  }

  function resetBattery() {
    if (batFillRef.current)  batFillRef.current.setAttribute('width', '0');
    if (batPctRef.current) {
      batPctRef.current.textContent = '--';
      batPctRef.current.setAttribute('fill', '#3D2D6A');
    }
    if (scrBarRef.current) {
      scrBarRef.current.setAttribute('width', '0');
      scrBarRef.current.setAttribute('fill', '#F97316');
    }
    if (scrKwRef.current) scrKwRef.current.textContent = '0.0 kW';
  }

  // ─── Actualizar pantalla de la estación según estado ─────────────────

  useEffect(() => {
    if (stOrbRef.current)    stOrbRef.current.setAttribute('fill', stateConfig.orbColor);
    if (scrStateRef.current) {
      scrStateRef.current.textContent = stateConfig.badge;
      scrStateRef.current.setAttribute('fill', stateConfig.color);
    }
    if (ovTitleRef.current) {
      ovTitleRef.current.textContent = stateConfig.stageTitle;
      ovTitleRef.current.setAttribute('fill', stateConfig.color);
    }
    if (ovSubRef.current)    ovSubRef.current.textContent = stateConfig.stageSub;
  }, [stateConfig]);

  // Actualizar kW de la pantalla durante la carga
  useEffect(() => {
    if (stateName === 'CHARGING' && scrKwRef.current) {
      scrKwRef.current.textContent = `${metrics.powerKw} kW`;
    }
  }, [metrics.powerKw, stateName]);

  // ─── Generar estrellas una sola vez ──────────────────────────────────

  useEffect(() => {
    if (!starsRef.current) return;
    const stars = Array.from({ length: 30 }, () => {
      const x   = (Math.random() * 680).toFixed(0);
      const y   = (Math.random() * 148).toFixed(0);
      const r   = (Math.random() * 1.4 + 0.3).toFixed(1);
      const op  = (Math.random() * 0.38 + 0.1).toFixed(2);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${op}"/>`;
    });
    starsRef.current.innerHTML = stars.join('');
  }, []);

  // ─── Render SVG ───────────────────────────────────────────────────────

  return (
    <svg
      viewBox="0 0 680 242"
      width="100%"
      style={{ display: 'block', background: '#080618' }}
      aria-label="Escena animada de la estación de carga para vehículos eléctricos"
    >
      {/* Cielo */}
      <rect width="680" height="242" fill="#080618" />

      {/* Estrellas (generadas por JS) */}
      <g ref={starsRef} />

      {/* Luna */}
      <circle cx="598" cy="36" r="24" fill="#160F30" />
      <circle cx="607" cy="30" r="19" fill="#080618" />

      {/* Silueta de ciudad */}
      <rect x="0" y="152" width="680" height="90" fill="#0C0822" />
      <rect x="575" y="118" width="40" height="34" rx="2" fill="#0C0822" />
      <rect x="618" y="130" width="28" height="22" rx="2" fill="#0C0822" />
      <rect x="646" y="122" width="34" height="30" rx="2" fill="#0C0822" />
      {/* Ventanas de edificios */}
      <rect x="581" y="124" width="5" height="4" rx="1" fill="#FBBF24" opacity=".18" />
      <rect x="590" y="124" width="5" height="4" rx="1" fill="#FBBF24" opacity=".10" />
      <rect x="599" y="124" width="5" height="4" rx="1" fill="#FBBF24" opacity=".22" />
      <rect x="581" y="133" width="5" height="4" rx="1" fill="#FBBF24" opacity=".12" />
      <rect x="652" y="128" width="5" height="4" rx="1" fill="#F97316" opacity=".20" />
      <rect x="661" y="128" width="5" height="4" rx="1" fill="#FBBF24" opacity=".10" />

      {/* Carretera */}
      <rect x="0" y="200" width="680" height="42" fill="#0E0924" />
      <rect x="38" y="204" width="604" height="32" rx="4" fill="#130C2C" />
      <line x1="38" y1="220" x2="642" y2="220" stroke="#1E1648" strokeWidth="1.5" strokeDasharray="16,12" />
      {/* Marcadores de estacionamiento */}
      <rect x="150" y="200" width="2" height="12" fill="#221A48" opacity=".8" />
      <rect x="402" y="200" width="2" height="12" fill="#221A48" opacity=".8" />

      {/* ── ESTACIÓN DE CARGA ── */}
      <g>
        {/* Sombra */}
        <ellipse cx="98" cy="201" rx="42" ry="5" fill="#030112" opacity=".6" />
        {/* Cuerpo */}
        <rect x="68" y="55" width="60" height="148" rx="11" fill="#1C1240" />
        <rect x="68" y="55" width="60" height="148" rx="11" fill="none" stroke="#2C1E58" strokeWidth="1.5" />
        {/* Pantalla */}
        <rect x="76" y="70" width="44" height="60" rx="5" fill="#08051A" />
        <text ref={scrStateRef} x="98" y="89" fontSize="8" fill="#7C6FA0" textAnchor="middle" fontFamily="DM Sans,sans-serif">ESPERANDO</text>
        <rect x="80" y="95" width="36" height="10" rx="4" fill="#130C28" />
        <rect ref={scrBarRef} x="80" y="95" width="0" height="10" rx="4" fill="#F97316" />
        <text ref={scrKwRef} x="98" y="118" fontSize="10" fill="#FBBF24" textAnchor="middle" fontFamily="Syne,sans-serif" fontWeight="700">0.0 kW</text>
        {/* Orb de estado */}
        <circle cx="98" cy="58" r="8" fill="#130C28" stroke="#241852" strokeWidth="2" />
        <circle ref={stOrbRef} cx="98" cy="58" r="4.5" fill="#4ADE80" />
        {/* Puerto del cable */}
        <rect x="78" y="180" width="40" height="20" rx="6" fill="#08051A" stroke="#241852" strokeWidth="1.5" />
        <text x="98" y="193" fontSize="7" fill="#3A2860" textAnchor="middle" fontFamily="DM Sans,sans-serif">CABLE OUT</text>
        {/* Líneas decorativas */}
        <rect x="76" y="150" width="44" height="2" rx="1" fill="#241852" />
        <rect x="76" y="157" width="44" height="2" rx="1" fill="#241852" />
        <rect x="76" y="164" width="28" height="2" rx="1" fill="#241852" />
        {/* Cápsula superior */}
        <rect x="82" y="48" width="32" height="8" rx="4" fill="#241852" />
      </g>

      {/* ── CABLE ── */}
      <path
        ref={cableMainRef}
        d="M128,192 C144,192 152,172 163,170"
        fill="none" stroke="#F97316" strokeWidth="5.5" strokeLinecap="round"
        style={{ opacity: 0, transition: 'opacity .7s ease' }}
      />
      <path
        ref={cablePulseRef}
        d="M128,192 C144,192 152,172 163,170"
        fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"
        strokeDasharray="6,5"
        style={{ opacity: 0, transition: 'opacity .5s ease', animation: 'cable-pulse .9s linear infinite' }}
      />

      {/* ── PARTÍCULAS ── */}
      <g ref={particlesRef} style={{ opacity: 0, transition: 'opacity .5s ease' }}>
        {[
          { cx: 150, cy: 182, r: 3.5, delay: '0s' },
          { cx: 144, cy: 174, r: 2.5, delay: '.38s' },
          { cx: 158, cy: 178, r: 3,   delay: '.76s' },
          { cx: 139, cy: 185, r: 2,   delay: '1.14s' },
          { cx: 155, cy: 168, r: 2.5, delay: '1.52s' },
        ].map((p, i) => (
          <circle
            key={i}
            cx={p.cx} cy={p.cy} r={p.r}
            fill={i % 2 === 0 ? '#FBBF24' : '#F97316'}
            style={{ animation: `particle-rise 1.9s ease-out ${p.delay} infinite` }}
          />
        ))}
      </g>

      {/* ── AUTO ELÉCTRICO ── */}
      {/* Empieza fuera de pantalla (derecha). translateX(0) = posición estacionado. */}
      <g ref={carRef} style={{ transform: 'translateX(620px)', transition: 'transform 2.2s cubic-bezier(.25,.46,.45,.94)' }}>
        {/* Sombra */}
        <ellipse cx="280" cy="201" rx="130" ry="5" fill="#030112" opacity=".65" />
        {/* Carrocería baja */}
        <rect x="154" y="135" width="246" height="41" rx="16" fill="#1E1042" />
        {/* Cabina */}
        <path d="M178,135 Q190,94 224,91 L354,91 Q383,94 400,135 Z" fill="#1A0D3A" />
        {/* Parachoques delantero */}
        <path d="M154,138 Q143,148 142,165 L155,168 Z" fill="#160B30" />
        {/* Parachoques trasero */}
        <path d="M400,138 Q411,148 412,165 L400,168 Z" fill="#140930" />
        {/* Tira LED delantera (ámbar) */}
        <rect x="141" y="144" width="16" height="5" rx="2.5" fill="#FBBF24" />
        <rect x="141" y="152" width="11" height="3" rx="1.5" fill="#F97316" opacity=".6" />
        {/* Tira LED trasera */}
        <rect x="400" y="144" width="14" height="5" rx="2.5" fill="#FB923C" opacity=".75" />
        {/* Parabrisas delantero */}
        <path d="M189,94 L181,135 L316,135 L316,94 Z" fill="#07041A" opacity=".9" />
        {/* Luneta trasera */}
        <path d="M326,94 L326,135 L392,135 L398,100 Z" fill="#07041A" opacity=".9" />
        {/* Pilar B */}
        <rect x="315" y="91" width="13" height="44" fill="#160A30" />
        {/* Línea del techo */}
        <rect x="189" y="90" width="207" height="5" rx="2" fill="#14082C" />
        {/* División de puertas */}
        <line x1="282" y1="135" x2="282" y2="176" stroke="#10082A" strokeWidth="2" />
        {/* Manijas */}
        <rect x="214" y="151" width="40" height="5" rx="2.5" fill="#130830" />
        <rect x="309" y="151" width="40" height="5" rx="2.5" fill="#130830" />
        {/* Panel zócalo */}
        <rect x="165" y="170" width="224" height="8" rx="4" fill="#100820" />

        {/* Puerto de carga */}
        <rect ref={cportRef} x="160" y="149" width="15" height="10" rx="2.5" fill="#08051A" stroke="#3D2D6A" strokeWidth="1.5" />

        {/* HUD Batería */}
        <rect x="220" y="157" width="112" height="14" rx="5" fill="#08051A" stroke="#1E1040" strokeWidth="1" />
        <rect ref={batFillRef} x="222" y="159" width="0" height="10" rx="3" fill="#4ADE80" />
        <text ref={batPctRef} x="276" y="168" fontSize="7.5" fill="#3D2D6A" textAnchor="middle" fontFamily="DM Sans,sans-serif">--</text>

        {/* Badge EV */}
        <rect x="376" y="120" width="28" height="12" rx="3" fill="#F97316" />
        <text x="390" y="129.5" fontSize="7.5" fill="#3A0E00" textAnchor="middle" fontWeight="700" fontFamily="Syne,sans-serif">EV</text>

        {/* Rueda delantera: cx=218 cy=176 r=24 */}
        <circle cx="218" cy="176" r="24" fill="#08051A" />
        <circle cx="218" cy="176" r="18" fill="#160B30" stroke="#F97316" strokeWidth="2" />
        <line id="f1" x1="218" y1="159" x2="218" y2="193" stroke="#F97316" strokeWidth="1.5" />
        <line id="f2" x1="202" y1="167" x2="234" y2="185" stroke="#F97316" strokeWidth="1.5" />
        <line id="f3" x1="202" y1="185" x2="234" y2="167" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="218" cy="176" r="5.5" fill="#F97316" />

        {/* Rueda trasera: cx=356 cy=176 r=24 */}
        <circle cx="356" cy="176" r="24" fill="#08051A" />
        <circle cx="356" cy="176" r="18" fill="#160B30" stroke="#F97316" strokeWidth="2" />
        <line id="r1" x1="356" y1="159" x2="356" y2="193" stroke="#F97316" strokeWidth="1.5" />
        <line id="r2" x1="340" y1="167" x2="372" y2="185" stroke="#F97316" strokeWidth="1.5" />
        <line id="r3" x1="340" y1="185" x2="372" y2="167" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="356" cy="176" r="5.5" fill="#F97316" />
      </g>

      {/* ── TEXTO SUPERPUESTO (derecha del cielo) ── */}
      <text
        ref={ovTitleRef}
        x="496" y="52"
        fontSize="20" fill={stateConfig.color}
        textAnchor="middle"
        fontFamily="Syne,sans-serif" fontWeight="700"
      >
        {stateConfig.stageTitle}
      </text>
      <text
        ref={ovSubRef}
        x="496" y="74"
        fontSize="12" fill="#7C6FA0"
        textAnchor="middle"
        fontFamily="DM Sans,sans-serif"
      >
        {stateConfig.stageSub}
      </text>
      <rect x="456" y="80" width="80" height="2" rx="1" fill={stateConfig.color} opacity=".4" />
    </svg>
  );
});

export default ChargingStage;
