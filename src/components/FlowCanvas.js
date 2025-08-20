import React, { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { saveFlowData, loadFlowData } from '../utils/storage';
import { MessageNode, CheckNode, DelayNode, SplitNode } from './CustomNodes';
import SaveLoadModal from './SaveLoadModal';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const layoutElements = async (nodes, edges) => {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    },
    children: nodes.map((node) => ({
      ...node,
      width: 150,
      height: 50,
    })),
    edges: edges,
  };

  const layouted = await elk.layout(graph);
  
  return {
    nodes: layouted.children.map((node) => ({
      ...node,
      position: { x: node.x, y: node.y },
    })),
    edges,
  };
};

const initialNodes = [];
const initialEdges = [];

const buttonStyles = {
  message: { backgroundColor: '#ff8c00', color: 'white', border: 'none' },
  check: { backgroundColor: '#32cd32', color: 'white', border: 'none' },
  delay: { backgroundColor: '#1e90ff', color: 'white', border: 'none' },
  split: { backgroundColor: '#20b2aa', color: 'white', border: 'none' },
};

const baseButtonStyle = {
  padding: '8px 16px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginRight: '5px',
  marginBottom: '5px',
};

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => ({
    message: MessageNode,
    check: CheckNode,
    delay: DelayNode,
    split: SplitNode,
  }), []);

  const edgeTypes = useMemo(() => ({}), []);

  // Винесемо функції для збереження
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleLabelChange = useCallback((nodeId, newLabel) => {
    setNodes((nds) => nds.map((node) => 
      node.id === nodeId ? { ...node, data: { ...node.data, label: newLabel } } : node
    ));
  }, [setNodes]);

  // Функція для додавання функцій до data
  const addNodeFunctions = useCallback((node) => {
    return {
      ...node,
      data: {
        ...node.data,
        onDelete: handleDeleteNode,
        onLabelChange: handleLabelChange
      }
    };
  }, [handleDeleteNode, handleLabelChange]);

  useEffect(() => {
    const savedData = loadFlowData();
    if (savedData && savedData.nodes && savedData.edges) {
      // Додаємо функції до збережених вузлів
      const nodesWithFunctions = savedData.nodes.map(addNodeFunctions);
      setNodes(nodesWithFunctions);
      setEdges(savedData.edges);
    }
    setIsLoaded(true);
  }, [addNodeFunctions, setNodes, setEdges]);

  useEffect(() => {
    if (isLoaded) {
      saveFlowData(nodes, edges);
    }
  }, [nodes, edges, isLoaded]);

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      
      if (sourceNode && sourceNode.type === 'split') {
        const existingConnections = edges.filter(e => e.source === params.source);
        
        if (existingConnections.length >= 2) {
          alert('Split вузол може мати максимум 2 вихідні з\'єднання');
          return;
        }
        
        // Визначаємо колір: перше з'єднання - зелене, друге - червоне
        const edgeColor = existingConnections.length === 0 ? '#22c55e' : '#ef4444';
        
        const newEdge = {
          ...params,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
          style: { stroke: edgeColor, strokeWidth: 2 },
        };
        
        setEdges((eds) => addEdge(newEdge, eds));
      } else {
        // Звичайне з'єднання з сірим кольором
        const newEdge = {
          ...params,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6b7280',
          },
          style: { stroke: '#6b7280', strokeWidth: 2 },
        };
        
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [setEdges, nodes, edges]
  );

  const addNode = (type) => {
    const nodeId = `${Date.now()}`;
    const newNode = {
      id: nodeId,
      type: type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: type.charAt(0).toUpperCase() + type.slice(1),
        onDelete: handleDeleteNode,
        onLabelChange: handleLabelChange
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onLayout = useCallback(async () => {
    if (nodes.length === 0) return;
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 100);
  }, [nodes, edges, fitView, setNodes, setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 4,
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => addNode('message')} 
            style={{ ...baseButtonStyle, ...buttonStyles.message }}
          >
            Message
          </button>
          <button 
            onClick={() => addNode('check')} 
            style={{ ...baseButtonStyle, ...buttonStyles.check }}
          >
            Check
          </button>
          <button 
            onClick={() => addNode('delay')} 
            style={{ ...baseButtonStyle, ...buttonStyles.delay }}
          >
            Delay
          </button>
          <button 
            onClick={() => addNode('split')} 
            style={{ ...baseButtonStyle, ...buttonStyles.split }}
          >
            Split
          </button>
        </div>
        
        <div>
          <button 
            onClick={onLayout}
            style={{ ...baseButtonStyle, backgroundColor: '#6b7280', color: 'white' }}
          >
            Auto Layout
          </button>
          <button 
            onClick={() => setShowSaveLoadModal(true)}
            style={{ ...baseButtonStyle, backgroundColor: '#28a745', color: 'white' }}
          >
          Зберегти схему
          </button>
        </div>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <SaveLoadModal
      isOpen={showSaveLoadModal}
      onClose={() => setShowSaveLoadModal(false)}
      nodes={nodes}
      edges={edges}
    />
    </div>
  );
}

export default function WrappedFlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}