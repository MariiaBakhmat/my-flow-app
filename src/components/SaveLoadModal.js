import React, { useState } from 'react';
import { saveFlowToMongoDB, getCurrentSessionId } from '../utils/storage';

const SaveLoadModal = ({ isOpen, onClose, nodes, edges }) => {
  const [flowName, setFlowName] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!flowName.trim()) {
      setMessage('Введіть назву схеми');
      return;
    }

    const result = await saveFlowToMongoDB(flowName, nodes, edges);
    if (result.success) {
      setMessage('Схему збережено успішно!');
      setFlowName('');
    } else {
      setMessage(result.error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '400px'
      }}>
        <h2>Зберегти схему</h2>
        
        {message && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '10px', 
            borderRadius: '4px',
            backgroundColor: message.includes('Потрібен') ? '#f8d7da' : '#d1edff',
            color: message.includes('Потрібен') ? '#721c24' : '#0c5460'
          }}>
            {message}
          </div>
        )}

        <input
          type="text"
          placeholder="Назва схеми"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />

        <div>
          <button 
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              margin: '5px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Зберегти в MongoDB
          </button>
          
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              margin: '5px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Закрити
          </button>
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Session ID: {getCurrentSessionId()}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadModal;