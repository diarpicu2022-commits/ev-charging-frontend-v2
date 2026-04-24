/**
 * Panel izquierdo: badge del estado actual, descripción y métricas eléctricas.
 * Las métricas solo aparecen cuando el estado es CHARGING.
 */
export function StatePanel({ stateName, stateConfig, metrics }) {
  const isCharging = stateName === 'CHARGING';

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={styles.col}>
      <div style={styles.label}>Estado</div>

      {/* Badge de estado */}
      <div style={{
        ...styles.badge,
        background: stateConfig.background,
      }}>
        <div style={{ ...styles.badgeDot, background: stateConfig.color }} />
        <span style={{ ...styles.badgeTxt, color: stateConfig.color }}>
          {stateConfig.badge}
        </span>
      </div>

      {/* Nombre del estado */}
      <div style={{ ...styles.stateName, color: stateConfig.color }}>
        {stateConfig.label}
      </div>

      {/* Descripción */}
      <div style={styles.stateDesc}>{stateConfig.description}</div>

      {/* Métricas eléctricas (solo durante CHARGING) */}
      {isCharging && (
        <div style={styles.metricsGrid}>
          <MetricChip value={metrics.powerKw.toFixed(1)} unit="kW"   color="#F97316" />
          <MetricChip value={metrics.energyKwh.toFixed(2)} unit="kWh" color="#4ADE80" />
          <MetricChip value={`${metrics.tempC.toFixed(0)}°`} unit="TEMP" color="#FBBF24" />
          <MetricChip value={formatTime(metrics.sessionTime)} unit="TIEMPO" />
        </div>
      )}
    </div>
  );
}

function MetricChip({ value, unit, color }) {
  return (
    <div style={styles.chip}>
      <div style={{ ...styles.chipVal, color: color || '#EDE9FE' }}>{value}</div>
      <div style={styles.chipUnit}>{unit}</div>
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
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 11px 5px 7px',
    borderRadius: '30px',
    marginBottom: '9px',
    transition: 'all 0.5s ease',
  },
  badgeDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.5s ease',
  },
  badgeTxt: {
    fontSize: '10px',
    fontWeight: '500',
    letterSpacing: '.5px',
    transition: 'color 0.5s ease',
  },
  stateName: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '17px',
    fontWeight: '700',
    marginBottom: '5px',
    transition: 'color 0.5s ease',
    animation: 'fade-up 0.4s ease',
  },
  stateDesc: {
    fontSize: '11px',
    color: '#7C6FA0',
    lineHeight: '1.65',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    marginTop: '12px',
  },
  chip: {
    background: '#1B1438',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '9px',
    padding: '9px 10px',
    textAlign: 'center',
  },
  chipVal: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1',
  },
  chipUnit: {
    fontSize: '8px',
    color: '#3D3060',
    letterSpacing: '1px',
    marginTop: '3px',
  },
};
