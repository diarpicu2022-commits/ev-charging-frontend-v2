import { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../api/stationApi';

/**
 * Hook que gestiona toda la lógica de la estación:
 * - Polling al backend Java cada 3 segundos
 * - Ejecución de acciones con feedback
 * - Métricas eléctricas en tiempo real (simuladas cuando no hay hardware)
 */
export function useChargingStation() {

  // ─── Estado del servidor ───────────────────────────────────────────────
  const [stationData, setStationData]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [serverError, setServerError]     = useState(null);
  const [lastTransition, setLastTransition] = useState(null);

  // ─── Métricas eléctricas en tiempo real ───────────────────────────────
  const [metrics, setMetrics] = useState({
    powerKw: 0, energyKwh: 0, tempC: 25, sessionTime: 0,
  });
  const metricsTimerRef = useRef(null);
  const sessionSecRef   = useRef(0);
  const energyRef       = useRef(0);

  // ─── Fetch de estado desde el backend ─────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getStatus();
      setStationData(data);
      setServerError(null);
    } catch {
      setServerError('Backend Java no disponible. Verifique que el servidor esté corriendo en puerto 8080.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling cada 3 segundos
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // ─── Métricas: arrancar/detener según estado ──────────────────────────
  useEffect(() => {
    const stateName = stationData?.currentState;

    if (stateName === 'CHARGING') {
      // Iniciar timer de métricas
      if (!metricsTimerRef.current) {
        metricsTimerRef.current = setInterval(() => {
          const kw = parseFloat((82 + Math.random() * 62).toFixed(1));
          sessionSecRef.current += 1;
          energyRef.current += kw / 3600;
          setMetrics({
            powerKw:     kw,
            energyKwh:   parseFloat(energyRef.current.toFixed(3)),
            tempC:        parseFloat((33 + Math.random() * 14).toFixed(1)),
            sessionTime:  sessionSecRef.current,
          });
        }, 1000);
      }
    } else {
      // Detener y resetear
      if (metricsTimerRef.current) {
        clearInterval(metricsTimerRef.current);
        metricsTimerRef.current = null;
      }
      if (stateName === 'AVAILABLE') {
        sessionSecRef.current = 0;
        energyRef.current = 0;
        setMetrics({ powerKw: 0, energyKwh: 0, tempC: 25, sessionTime: 0 });
      }
    }

    return () => {
      if (metricsTimerRef.current) {
        clearInterval(metricsTimerRef.current);
        metricsTimerRef.current = null;
      }
    };
  }, [stationData?.currentState]);

  // ─── Ejecutar acción ──────────────────────────────────────────────────
  const executeAction = useCallback(async (apiCall) => {
    setActionLoading(true);
    try {
      const response = await apiCall();
      setLastTransition(response);
      await fetchStatus();
    } catch (err) {
      setServerError(`Error al ejecutar acción: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [fetchStatus]);

  // ─── Acciones expuestas ───────────────────────────────────────────────
  const actions = {
    connect:          () => executeAction(api.connectVehicle),
    startCharging:    () => executeAction(api.startCharging),
    completeCharge:   () => executeAction(api.completeCharge),
    disconnect:       () => executeAction(api.disconnectVehicle),
    reportError:      (msg) => executeAction(() => api.reportError(msg)),
    startMaintenance: () => executeAction(api.startMaintenance),
    endMaintenance:   () => executeAction(api.endMaintenance),
    resetError:       () => executeAction(api.resetError),
  };

  return { stationData, loading, actionLoading, serverError, lastTransition, metrics, actions };
}
