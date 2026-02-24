import { useState } from 'react';
import { btnPrimaryStyle, btnSecondaryStyle, dialogStyle, inputStyle, labelStyle } from './style';

const SeatGridDialog = ({ onConfirm, onCancel }) => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [seatSize, setSeatSize] = useState(8);

  return (
    <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
      <h3>remplir la section avec des places</h3>
      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>Nombre de lignes:</label>
        <input
          type="number"
          min="1"
          max="50"
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value) || 1)}
          style={inputStyle}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>nombre de colonnes:</label>
        <input
          type="number"
          min="1"
          max="50"
          value={cols}
          onChange={(e) => setCols(parseInt(e.target.value) || 1)}
          style={inputStyle}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>dimension de place:</label>
        <input
          type="number"
          min="3"
          max="20"
          value={seatSize}
          onChange={(e) => setSeatSize(parseInt(e.target.value) || 3)}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnSecondaryStyle}>
          annuler
        </button>
        <button onClick={() => onConfirm(rows, cols, seatSize)} style={btnPrimaryStyle}>
          remplir
        </button>
      </div>
    </div>
  );
};

export default SeatGridDialog;
