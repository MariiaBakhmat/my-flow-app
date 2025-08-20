const STORAGE_KEY = 'flow-data';

export const saveFlowData = (nodes, edges) => {
  const data = { nodes, edges, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log('Дані збережено!');
};

export const loadFlowData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const data = JSON.parse(saved);
    return { nodes: data.nodes, edges: data.edges };
  }
  return null; // <- цей return має бути тут
};

// Додайте ці функції в кінець вашого існуючого utils/storage.js файлу

// Поки що n8n сервера немає, тому відключаємо MongoDB функції
const N8N_BASE_URL = null; // буде потім замінено на реальний URL

// Генеруємо або отримуємо session ID (для майбутнього використання)
const getSessionId = () => {
  let sessionId = localStorage.getItem('flowCanvas_sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('flowCanvas_sessionId', sessionId);
  }
  return sessionId;
};

// ЗАГЛУШКИ для MongoDB функцій (поки що повертають помилки)
export const saveFlowToMongoDB = async (name, nodes, edges, description = '') => {
  return { 
    success: false, 
    error: 'MongoDB зберігання поки що не налаштовано. Потрібен n8n сервер.' 
  };
};

export const loadUserFlows = async () => {
  return { 
    success: false, 
    error: 'MongoDB зберігання поки що не налаштовано. Потрібен n8n сервер.',
    flows: [] 
  };
};

export const loadFlowById = async (flowId) => {
  return { 
    success: false, 
    error: 'MongoDB зберігання поки що не налаштовано. Потрібен n8n сервер.' 
  };
};

export const getCurrentSessionId = () => {
  return getSessionId();
};

// Коли буде n8n сервер, просто замініть N8N_BASE_URL на щось типу:
// const N8N_BASE_URL = 'https://your-n8n-server.herokuapp.com';
// або
// const N8N_BASE_URL = 'https://your-domain.com/n8n';