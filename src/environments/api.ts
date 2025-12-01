// ==========================
// 🔗 API BASE
// ==========================
// Asegúrate de que este puerto coincida con tu application.properties (ej. 8080 o 8082)
const API_BASE = 'http://localhost:8081/api';

// ==========================
// 🔐 AUTH (AuthController)
// ==========================
// Corresponde a @RequestMapping("/api/auth") en tu backend
export const AUTH_API_URL = `${API_BASE}/auth`;

// ==========================
// 📦 MODULES (ModuleController)
// ==========================
// Corresponde a @RequestMapping("/api/modules") en tu backend
export const MODULES_API_URL = `${API_BASE}/modules`;