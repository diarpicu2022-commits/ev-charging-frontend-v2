import { JOURNEY_LABELS } from '../api/stationConfig';

/**
 * Panel de progreso del proceso de carga.
 * Muestra los 4 pasos del journey con estado visual (pendiente/activo/completado).
 */
export function JourneyPanel({ journeyStep, lastEvent }) {
  return (
    <div style={styles.col}>
      <div style={styles.label}>Tu Proceso de Carga</div>

      {/* Track de pasos */}
      <div style={styles.track}>
        {JOURNEY_LABELS.map((lbl, i) => {
          const step  = i + 1;
          const done  = step < journeyStep;
          const cur   = step === journeyStep;
          return (
            <div key={step} style={styles.stepGroup}>
              {/* Círculo del paso */}
              <div style={{
                ...styles.dot,
                ...(done ? styles.dotDone : cur ? styles.dotCur : {}),
                animation: cur ? 'step-glow 1.8s ease-in-out infinite' : 'none',
              }}>
                {done ? '✓' : step}
              </div>
              {/* Línea conectora */}
              {i < JOURNEY_LABELS.length - 1 && (
                <div style={{ ...styles.line, ...(done ? styles.lineDone : {}) }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Etiquetas */}
      <div style={styles.labelsRow}>
        {JOURNEY_LABELS.map((lbl, i) => {
          const step = i + 1;
          const done = step < journeyStep;
          const cur  = step === journeyStep;
          return (
            <div key={step} style={{
              ...styles.lbl,
              color: done ? '#4ADE80' : cur ? '#F97316' : '#3D3060',
            }}>
              {lbl}
            </div>
          );
        })}
      </div>

      {/* Último evento del log */}
      <div style={styles.lastEvent}>{lastEvent}</div>
    </div>
  );
}

const styles = {
  col: {
    padding: '15px 17px',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  label: {
    fontSize: '9px',
    fontWeight: '500',
    letterSpacing: '2.5px',
    color: '#3D3060',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  track: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
  },
  stepGroup: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.1)',
    background: '#1B1438',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Syne, sans-serif',
    fontSize: '12px',
    fontWeight: '700',
    color: '#3D3060',
    flexShrink: 0,
    transition: 'all 0.5s ease',
  },
  dotDone: {
    background: '#4ADE80',
    borderColor: '#4ADE80',
    color: '#05180B',
  },
  dotCur: {
    borderColor: '#F97316',
    color: '#F97316',
    background: 'rgba(249,115,22,.12)',
  },
  line: {
    flex: 1,
    height: '2px',
    background: 'rgba(255,255,255,0.07)',
    transition: 'background 0.5s ease',
  },
  lineDone: {
    background: '#4ADE80',
  },
  labelsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0',
  },
  lbl: {
    fontSize: '9px',
    width: '32px',
    textAlign: 'center',
    lineHeight: '1.3',
    transition: 'color 0.5s ease',
  },
  lastEvent: {
    fontSize: '10px',
    color: '#4A3F5E',
    lineHeight: '1.7',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },
};
