import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeToolbar } from '@reactflow/node-toolbar';

const nodeStyles = {
  message: { backgroundColor: '#ff8c00', color: 'white' },
  check: { backgroundColor: '#32cd32', color: 'white' },
  delay: { backgroundColor: '#1e90ff', color: 'white' },
  split: { backgroundColor: '#20b2aa', color: 'white' },
};

const baseStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '2px solid #222',
  fontWeight: 'bold',
  minWidth: '100px',
  textAlign: 'center',
  position: 'relative',
};

const EditableNodeContent = ({ nodeId, label, onLabelChange, showToolbar, onToolbarToggle, toolbar }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditLabel(label);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editLabel.trim() !== label && editLabel.trim() !== '' && onLabelChange) {
      onLabelChange(nodeId, editLabel.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditLabel(label);
    }
  };

  const handleClick = (e) => {
    if (!isEditing) {
      e.stopPropagation();
      onToolbarToggle();
    }
  };

  return (
    <>
      {toolbar && <NodeToolbar isVisible={showToolbar} position="top">{toolbar}</NodeToolbar>}
      {isEditing ? (
        <input
          type="text"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
            width: '100%',
            outline: 'none'
          }}
        />
      ) : (
        <div 
          onDoubleClick={handleDoubleClick}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          {label}
        </div>
      )}
    </>
  );
};

export const MessageNode = ({ id, data, selected }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const toolbar = (
    <>
      <span style={{ 
        marginRight: '5px', 
        padding: '4px 8px',
        background: '#f3f4f6',
        borderRadius: '3px',
        fontSize: '12px',
        color: '#374151'
      }}>
        Email
      </span>
      <span style={{ 
        marginRight: '5px', 
        padding: '4px 8px',
        background: '#f3f4f6',
        borderRadius: '3px',
        fontSize: '12px',
        color: '#374151'
      }}>
        Open
      </span>
      <button 
        style={{ 
          padding: '4px 8px', 
          backgroundColor: '#ef4444', 
          color: 'white', 
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        onClick={handleDelete}
      >
        Delete
      </button>
    </>
  );

  return (
    <div style={{ 
      ...baseStyle, 
      ...nodeStyles.message,
      border: selected ? '3px solid #facc15' : '2px solid #222'
    }}>
      <Handle type="target" position={Position.Top} />
      <EditableNodeContent 
        nodeId={id}
        label={data.label}
        onLabelChange={data.onLabelChange}
        showToolbar={showToolbar}
        onToolbarToggle={() => setShowToolbar(!showToolbar)}
        toolbar={toolbar}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const CheckNode = ({ id, data, selected }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  return (
    <div style={{ 
      ...baseStyle, 
      ...nodeStyles.check,
      border: selected ? '3px solid #facc15' : '2px solid #222'
    }}>
      <Handle type="target" position={Position.Top} />
      <EditableNodeContent 
        nodeId={id}
        label={data.label}
        onLabelChange={data.onLabelChange}
        showToolbar={showToolbar}
        onToolbarToggle={() => setShowToolbar(!showToolbar)}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const DelayNode = ({ id, data, selected }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  return (
    <div style={{ 
      ...baseStyle, 
      ...nodeStyles.delay,
      border: selected ? '3px solid #facc15' : '2px solid #222'
    }}>
      <Handle type="target" position={Position.Top} />
      <EditableNodeContent 
        nodeId={id}
        label={data.label}
        onLabelChange={data.onLabelChange}
        showToolbar={showToolbar}
        onToolbarToggle={() => setShowToolbar(!showToolbar)}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export const SplitNode = ({ id, data, selected }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  return (
    <div style={{ 
      ...baseStyle, 
      ...nodeStyles.split,
      border: selected ? '3px solid #facc15' : '2px solid #222'
    }}>
      <Handle type="target" position={Position.Top} />
      <EditableNodeContent 
        nodeId={id}
        label={data.label}
        onLabelChange={data.onLabelChange}
        showToolbar={showToolbar}
        onToolbarToggle={() => setShowToolbar(!showToolbar)}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};