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
  return null;
};