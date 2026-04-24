import { useRef, useEffect, useState } from 'react';
import { useChargingStation } from './hooks/useChargingStation';
import { STATE_CONFIG }       from './api/stationConfig';
import ChargingStage           from './components/ChargingStage';
import { StatePanel }          from './components/StatePanel';
import { JourneyPanel }        from './components/JourneyPanel';
import { ActionPanel }         from './components/ActionPanel';

/**
 * Componente raíz del Dashboard de Carga para Vehículos Eléctricos.
 * Orquesta:
 *  - Comunicación con el backend Java (polling + acciones)
 *  - Animaciones del escenario SVG (auto, cable, partículas, batería)
 *  - UI de estado, journey y panel de acción
 */
export default function App() {

  const {
    stationData, loading, actionLoading,
    serverError, lastTransition, metrics, actions,
  } = useChargingStation();

  const stageRef    = useRef(null);   // ref al componente ChargingStage
  const prevStateRef = useRef(null);  // para detectar transiciones
  const [lastEvent, setLastEvent] = useState('Sistema inicializado. Estación operativa.');

  const stateName   = stationData?.currentState ?? 'AVAILABLE';
  const stateConfig = STATE_CONFIG[stateName] ?? STATE_CONFIG['AVAILABLE'];

  // ─── Reaccionar a cambios de estado con animaciones SVG ───────────────
  useEffect(() => {
    const prev = prevStateRef.current;
    const stage = stageRef.current;
    if (!stage || prev === stateName) return;

    // Auto entra cuando pasa a CONNECTING
    if (stateName === 'CONNECTING' && prev !== 'CONNECTING') {
      stage.carDriveIn();
      setLastEvent('⟳ EV detectado. Iniciando handshake OCPP...');
    }

    // Cable pulsa y partículas aparecen cuando empieza a cargar
    if (stateName === 'CHARGING') {
      stage.showParticles();
      setLastEvent('⚡ Protocolo negociado. Flujo DC activado.');
    }

    // Carga completada
    if (stateName === 'COMPLETED') {
      stage.hideParticles();
      stage.completeBattery();
      setLastEvent('✓ Batería al 100%. Sesión completada.');
    }

    // Auto sale y batería se resetea
    if (stateName === 'AVAILABLE' && prev && prev !== 'AVAILABLE') {
      stage.carDriveOut();
      setLastEvent('✓ EV desconectado. Estación disponible.');
    }

    if (stateName === 'ERROR') {
      stage.hideParticles();
      stage.hideCable();
      setLastEvent('✗ Falla crítica detectada. Sistema bloqueado.');
    }

    if (stateName === 'MAINTENANCE') {
      setLastEvent('⚙ Modo mantenimiento activado.');
    }

    prevStateRef.current = stateName;
  }, [stateName]);

  // Actualizar batería en tiempo real durante CHARGING
  useEffect(() => {
    if (stateName === 'CHARGING' && stageRef.current && metrics.sessionTime > 0) {
      // Empezar en 15% y subir hasta 100%
      const estimatedPct = Math.min(100, 15 + (metrics.sessionTime * 0.4));
      stageRef.current.updateBattery(estimatedPct);
    }
  }, [metrics.sessionTime, stateName]);

  // ─── Acciones del panel de control ───────────────────────────────────

  const STATE_ACTIONS = {
    AVAILABLE:   actions.connect,
    CONNECTING:  actions.startCharging,
    CHARGING:    actions.completeCharge,
    COMPLETED:   actions.disconnect,
    ERROR:       actions.resetError,
    MAINTENANCE: actions.endMaintenance,
  };

  const handleAction = () => {
    const action = STATE_ACTIONS[stateName];
    if (action) action();
  };

  const handleReportError = () => {
    actions.reportError('Falla del inversor DC detectada');
  };

  const handleStartMaintenance = () => {
    actions.startMaintenance();
  };

  // ─── Pantalla de carga inicial ────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.loadScreen}>
        <div style={styles.loadIcon}>⚡</div>
        <div style={styles.loadText}>Conectando al sistema...</div>
      </div>
    );
  }

  // ─── Error de conexión al backend ──────────────────────────────────────
  if (serverError && !stationData) {
    return (
      <div style={styles.loadScreen}>
        <div style={styles.loadIcon}>✗</div>
        <div style={{ ...styles.loadText, color: '#F87171', maxWidth: '380px', textAlign: 'center' }}>
          {serverError}
        </div>
        <div style={styles.hintText}>mvn spring-boot:run → http://localhost:8080</div>
      </div>
    );
  }

  // ─── Dashboard principal ──────────────────────────────────────────────
  return (
    <div style={styles.root}>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={{ color: '#F97316' }}>⚡</span> Volt<span style={{ color: '#F97316' }}>Station</span>
        </div>
        <div style={styles.stationId}>
          {stationData?.stationId} · {stationData?.connectorType} · {stationData?.maxPowerKw} kW DC
        </div>
        <div style={styles.hdrRight}>
          <div style={{ ...styles.liveDot, background: stateConfig.color }} />
          <span style={{ ...styles.liveTxt, color: stateConfig.color }}>PATRÓN STATE</span>
          {lastTransition && (
            <span style={{
              ...styles.transitionBadge,
              background: lastTransition.success ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)',
              borderColor: lastTransition.success ? 'rgba(74,222,128,.3)' : 'rgba(248,113,113,.3)',
              color: lastTransition.success ? '#4ADE80' : '#F87171',
            }}>
              {lastTransition.previousState} → {lastTransition.currentState}
            </span>
          )}
        </div>
      </header>

      {/* Error banner (no bloquea si ya hay datos) */}
      {serverError && stationData && (
        <div style={styles.errBanner}>⚠ {serverError}</div>
      )}

      {/* ESCENARIO ANIMADO */}
      <ChargingStage
        ref={stageRef}
        stateName={stateName}
        stateConfig={stateConfig}
        metrics={metrics}
      />

      {/* PANEL INFERIOR */}
      <div style={styles.panel}>
        <StatePanel
          stateName={stateName}
          stateConfig={stateConfig}
          metrics={metrics}
        />
        <JourneyPanel
          journeyStep={stateConfig.journeyStep}
          lastEvent={lastEvent}
        />
        <ActionPanel
          stateName={stateName}
          stateConfig={stateConfig}
          actionLoading={actionLoading}
          onAction={handleAction}
          onReportError={handleReportError}
          onStartMaintenance={handleStartMaintenance}
        />
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: '100vh',
    background: '#0A061C',
    fontFamily: 'DM Sans, system-ui, sans-serif',
  },
  loadScreen: {
    minHeight: '100vh',
    background: '#0A061C',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  loadIcon: {
    fontSize: '40px',
    animation: 'spin-in 1s linear infinite',
  },
  loadText: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
    color: '#7C6FA0',
    margin: 0,
  },
  hintText: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#3D3060',
  },
  header: {
    background: '#07041A',
    padding: '11px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  brand: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '16px',
    fontWeight: '700',
    color: '#EDE9FE',
    letterSpacing: '.3px',
  },
  stationId: {
    fontSize: '10px',
    color: '#7C6FA0',
    background: '#1B1438',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '3px 11px',
    letterSpacing: '.5px',
  },
  hdrRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  liveDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    transition: 'background 0.5s ease',
  },
  liveTxt: {
    fontSize: '10px',
    letterSpacing: '1px',
    fontWeight: '500',
    transition: 'color 0.5s ease',
  },
  transitionBadge: {
    fontSize: '10px',
    padding: '3px 9px',
    borderRadius: '20px',
    border: '1px solid',
    letterSpacing: '.3px',
  },
  errBanner: {
    background: 'rgba(248,113,113,.08)',
    border: '1px solid rgba(248,113,113,.2)',
    padding: '10px 20px',
    fontSize: '12px',
    color: '#F87171',
    fontFamily: 'monospace',
  },
  panel: {
    background: '#130E28',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'grid',
    gridTemplateColumns: '180px 1fr 188px',
  },
};
