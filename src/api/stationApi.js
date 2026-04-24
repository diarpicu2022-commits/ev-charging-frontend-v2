/**
 * Capa de servicio REST para comunicarse con el backend Java Spring Boot.
 * Todos los métodos retornan Promises.
 */
const BASE = import.meta.env.VITE_API_URL || '/api/station';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const getStatus       = ()          => request('/status');
export const connectVehicle  = ()          => request('/connect',           { method: 'POST' });
export const startCharging   = ()          => request('/start-charging',    { method: 'POST' });
export const completeCharge  = ()          => request('/complete-charge',   { method: 'POST' });
export const disconnectVehicle = ()        => request('/disconnect',        { method: 'POST' });
export const startMaintenance = ()         => request('/start-maintenance', { method: 'POST' });
export const endMaintenance  = ()          => request('/end-maintenance',   { method: 'POST' });
export const resetError      = ()          => request('/reset-error',       { method: 'POST' });
export const reportError     = (message)   => request('/report-error',      {
  method: 'POST',
  body: JSON.stringify({ message }),
});
