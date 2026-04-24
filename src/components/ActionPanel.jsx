/**
 * Panel de acción: un solo botón CTA grande y contextual
 * que cambia según el estado actual del Patrón State.
 * Botones secundarios para reportar error y activar mantenimiento.
 */
export function ActionPanel({
  stateName,
  stateConfig,
  actionLoading,
  onAction,
  onReportError,
  onStartMaintenance,
}) {
  // Color del texto del botón: oscuro para colores claros, claro para oscuros
  const lightBgs = ['#F97316', '#4ADE80', '#2DD4BF'];
  const btnTextColor = lightBgs.includes(stateConfig.buttonBg)
    ? '#0A061C'
    : '#EDE9FE';

  return (
    <div style={styles.col}>
      <div style={styles.label}>Acción</div>

      {/* Botón principal CTA */}
      <button
        onClick={onAction}
        disabled={actionLoading}
        style={{
          ...styles.btn,
          background: stateConfig.buttonBg,
          color: btnTextColor,
          opacity: actionLoading ? 0.5 : 1,
        }}
      >
        {actionLoading ? (
          <span style={styles.spinner}>⟳</span>
        ) : (
          stateConfig.buttonText
        )}
      </button>

      {/* Reportar error */}
      {stateConfig.showErrorBtn && (
        <button onClick={onReportError} style={styles.errBtn}>
          ⚠ Reportar Falla
        </button>
      )}

      {/* Activar mantenimiento */}
      {stateConfig.showMaintBtn && stateName === 'AVAILABLE' && (
        <button onClick={onStartMaintenance} style={styles.mntBtn}>
          ⚙ Modo Mantenimiento
        </button>
      )}

      {/* Endpoint que se llamaría al backend */}
      <div style={styles.apiHint}>{stateConfig.apiEndpoint}</div>
    </div>
  );
}

const styles = {
  col: {
    padding: '15px 17px',
  },
  label: {
    fontSize: '9px',
    fontWeight: '500',
    letterSpacing: '2.5px',
    color: '#3D3060',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  btn: {
    width: '100%',
    padding: '13px',
    borderRadius: '13px',
    border: 'none',
    fontFamily: 'Syne, sans-serif',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.4px',
    cursor: 'pointer',
    transition: 'all 0.35s ease',
    marginBottom: '7px',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin-in 1s linear infinite',
  },
  errBtn: {
    width: '100%',
    padding: '9px',
    borderRadius: '10px',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '11px',
    cursor: 'pointer',
    border: '1px solid rgba(248,113,113,.25)',
    background: 'rgba(248,113,113,.07)',
    color: '#F87171',
    transition: 'all 0.3s ease',
    marginTop: '6px',
  },
  mntBtn: {
    width: '100%',
    padding: '9px',
    borderRadius: '10px',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '11px',
    cursor: 'pointer',
    border: '1px solid rgba(167,139,250,.25)',
    background: 'rgba(167,139,250,.07)',
    color: '#A78BFA',
    transition: 'all 0.3s ease',
    marginTop: '6px',
  },
  apiHint: {
    fontSize: '9px',
    color: '#221840',
    textAlign: 'center',
    marginTop: '7px',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
};
