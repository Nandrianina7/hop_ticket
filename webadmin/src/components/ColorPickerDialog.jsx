import { useState } from 'react';
import { btnPrimaryStyle, btnSecondaryStyle, dialogStyle } from './style';

const ColorPickerDialog = ({ currentColor, onConfirm, onCancel }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const predefinedColors = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#feca57',
    '#ff9ff3',
    '#54a0ff',
    '#5f27cd',
    '#00d2d3',
    '#ff9f43',
    '#10ac84',
    '#ee5253',
    '#0abde3',
    '#ff6b6b',
    '#48dbfb',
  ];

  return (
    <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
      <h3>Changer la couleur de la section</h3>
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '15px',
          }}
        >
          {predefinedColors.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: color,
                borderRadius: '50%',
                cursor: 'pointer',
                border: selectedColor === color ? '3px solid #333' : '2px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedColor === color && (
                <span style={{ color: 'white', fontSize: '16px' }}>✓</span>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Custom:</label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            style={{
              width: '50px',
              height: '40px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnSecondaryStyle}>
          annuler
        </button>
        <button onClick={() => onConfirm(selectedColor)} style={btnPrimaryStyle}>
          Appliquer la couleur
        </button>
      </div>
    </div>
  );
};

export default ColorPickerDialog;
