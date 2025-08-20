import React, { useState, useRef, useCallback, useEffect } from 'react';
import { saveFlowData, loadFlowData } from '../utils/storage';

// Початкові вузли
const initialNodes = [];

// Початкові зв'язки
const initialEdges = [];

const nodeTypes = [
  { type: 'input', label: 'Вхід', color: '#4ade80' },
  { type: 'process', label: 'Процес', color: '#3b82f6' },
  { type: 'decision', label: 'Рішення', color: '#fbbf24' },
  { type: 'output', label: 'Вихід', color: '#f87171' },
];

const Node = ({ node, onDragStart, isSelected, onSelect }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStart(node.id, e);
    onSelect(node.id, e);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(node.id, e);
  };

  return (
    <div
      className={`node node-${node.type} ${isSelected ? 'node-selected' : ''}`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {node.label}
    </div>
  );
};

const Edge = ({ edge, nodes }) => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  
  if (!sourceNode || !targetNode) return null;

  const x1 = sourceNode.x + sourceNode.width / 2;
  const y1 = sourceNode.y + sourceNode.height;
  const x2 = targetNode.x + targetNode.width / 2;
  const y2 = targetNode.y;

  const midY = (y1 + y2) / 2;

  return (
    <g>
      <path
        d={`M ${x1} ${y1} C ${x1} ${midY} ${x2} ${midY} ${x2} ${y2}`}
        stroke="#6b7280"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
};

export default function CustomFlow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragNodeId, setDragNodeId] = useState(null);
  const containerRef = useRef(null);

  // Завантажуємо збережені дані при старті
  useEffect(() => {
    console.log('Завантаження при старті...');
    const savedData = loadFlowData();
    if (savedData) {
      console.log('Завантажено:', savedData.nodes.length, 'вузлів');
      setNodes(savedData.nodes);
      setEdges(savedData.edges);
    } else {
      console.log('Збережених даних немає');
    }
  }, []);

  // Зберігаємо дані при кожній зміні
  useEffect(() => {
    if (nodes.length > 0) {
      saveFlowData(nodes, edges);
    }
  }, [nodes, edges]);

  // Обробник клавіатури для видалення
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          deleteSelectedNode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedNodeId]);

  const onDragStart = useCallback((nodeId, e) => {
    const node = nodes.find(n => n.id === nodeId);
    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });
    setDragNodeId(nodeId);
    setIsDragging(true);
  }, [nodes]);

  const onDrag = useCallback((e) => {
    if (!isDragging || !dragNodeId) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === dragNodeId 
          ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) }
          : node
      )
    );
  }, [isDragging, dragNodeId, dragOffset]);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragNodeId(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const onSelect = (nodeId, e) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
  };

  const addNodeOfType = (nodeType) => {
    const newNode = {
      id: `${Date.now()}`,
      type: nodeType.type,
      label: nodeType.label,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      width: 120,
      height: 60
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    
    setNodes(prevNodes => prevNodes.filter(n => n.id !== selectedNodeId));
    setEdges(prevEdges => prevEdges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    localStorage.removeItem('flow-data');
  };

  return (
    <div className="flow-container">
      {/* Панель інструментів */}
      <div className="toolbar">
        <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
          Додати:
        </div>
        {nodeTypes.map(nodeType => (
          <button
            key={nodeType.type}
            onClick={() => addNodeOfType(nodeType)}
            className="btn btn-primary"
            style={{ 
              marginBottom: '4px',
              display: 'block',
              width: '100px',
              fontSize: '12px'
            }}
          >
            + {nodeType.label}
          </button>
        ))}
        
        {selectedNodeId && (
          <button
            onClick={deleteSelectedNode}
            className="btn btn-danger"
            style={{ 
              marginTop: '8px',
              width: '100px',
              fontSize: '12px'
            }}
          >
            Видалити
          </button>
        )}

        <button
          onClick={clearAll}
          className="btn btn-danger"
          style={{ 
            marginTop: '8px',
            width: '100px',
            fontSize: '12px'
          }}
        >
          Очистити все
        </button>
      </div>

      {/* Інформація */}
      <div className="info-panel">
        <p>
          Клікніть на вузол щоб вибрати<br/>
          Перетягуйте для переміщення<br/>
          Delete/Backspace - видалити
        </p>
        {selectedNodeId && (
          <p className="selected">
            Вибраний: {nodes.find(n => n.id === selectedNodeId)?.label}
          </p>
        )}
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
          Вузлів: {nodes.length}
        </div>
      </div>

      {/* Основне полотно */}
      <div 
        ref={containerRef}
        className="canvas"
        onMouseMove={onDrag}
        onMouseUp={onDragEnd}
        onClick={() => setSelectedNodeId(null)}
      >
        {/* Фонова сітка */}
        <svg className="grid-background">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e5e5" strokeWidth="1"/>
            </pattern>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Відображення з'єднань */}
          {edges.map(edge => (
            <Edge key={edge.id} edge={edge} nodes={nodes} />
          ))}
        </svg>

        {/* Відображення вузлів */}
        <div className="nodes-container">
          {nodes.map(node => (
            <Node 
              key={node.id} 
              node={node} 
              onDragStart={onDragStart}
              isSelected={selectedNodeId === node.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}