import { useState } from 'react';
import { SHAPE_TYPES } from './shapeType';
import { btnPrimaryStyle, btnSecondaryStyle, dialogStyle } from './style';

const ShapePickerDialog = ({ currentShape, onConfirm, onCancel }) => {
  const [selectedShape, setSelectedShape] = useState(currentShape || SHAPE_TYPES.RECTANGLE);

  const shapeOptions = [
    { type: SHAPE_TYPES.RECTANGLE, name: 'Rectangle', icon: '⬜' },
    { type: SHAPE_TYPES.TRAPEZOID, name: 'Trapèze', icon: '🔷' },
    { type: SHAPE_TYPES.PARALLELOGRAM, name: 'Parallélogramme', icon: '🔶' },
    { type: SHAPE_TYPES.CIRCLE, name: 'Cercle', icon: '⚪' },
    { type: SHAPE_TYPES.TRIANGLE, name: 'Triangle', icon: '🔺' },
    { type: SHAPE_TYPES.PENTAGON, name: 'Pentagone', icon: '⬟' },
    { type: SHAPE_TYPES.HEXAGON, name: 'Hexagone', icon: '⬡' },
    { type: SHAPE_TYPES.OCTAGON, name: 'Octogone', icon: '🛑' },
    { type: SHAPE_TYPES.STAR, name: 'Étoile', icon: '⭐' },
    { type: SHAPE_TYPES.CROSS, name: 'Croix', icon: '✚' },
    { type: SHAPE_TYPES.DEFORMABLE_QUAD, name: 'deformable' },
  ];

  return (
    <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
      <h3>Choisir la forme de la section</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '20px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {shapeOptions.map((shape) => (
          <div
            key={shape.type}
            onClick={() => setSelectedShape(shape.type)}
            style={{
              padding: '10px',
              border: selectedShape === shape.type ? '3px solid #007bff' : '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: selectedShape === shape.type ? '#e3f2fd' : 'white',
            }}
          >
            <span style={{ fontSize: '24px' }}>{shape.icon}</span>
            <span>{shape.name}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnSecondaryStyle}>
          Annuler
        </button>
        <button onClick={() => onConfirm(selectedShape)} style={btnPrimaryStyle}>
          Appliquer la forme
        </button>
      </div>
    </div>
  );
};

export default ShapePickerDialog;
