// ==========================
// 🔗 API BASE
// ==========================
// Asegúrate de que este puerto coincida con tu application.properties (ej. 8081)
const API_BASE = 'http://localhost:8081/api';

// ==========================
// 🔐 AUTH (AuthController)
// Corresponde a @RequestMapping("/api/auth") en tu backend
// ==========================
export const AUTH_API_URL = `${API_BASE}/auth`;

// ==========================
// 📦 MODULES (ModuleController)
// Corresponde a @RequestMapping("/api/modules") en tu backend
// ==========================
export const MODULES_API_URL = `${API_BASE}/modules`;
// ==========================

// ==========================
// 🚚 REGISTRO LLEGADA (RegistroLlegadaChoferController)
// Corresponde a @RequestMapping("/api/llegadas-chofer") en tu backend
// ==========================
export const REGISTRO_LLEGADA_API_URL = `${API_BASE}/llegadas-chofer`;

// ==========================
// 📦 OTROS MÓDULOS (Ejemplos)
// ==========================
export const MANIFIESTOS_API_URL = `${API_BASE}/manifiestos`;
export const VEHICULOS_API_URL = `${API_BASE}/vehiculos`;