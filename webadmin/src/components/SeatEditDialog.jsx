import { useState } from 'react';
import { btnPrimaryStyle, btnSecondaryStyle, labelStyle } from './style';

const SeatEditDialog = ({ seat, onConfirm, onCancel }) => {
  const [newId, setNewId] = useState(seat.id);

  return (
    <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
      <h3>changer la place ID</h3>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>place ID:</label>
        <input
          type="text"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnSecondaryStyle}>
          Annuler
        </button>
        <button onClick={() => onConfirm(newId)} style={btnPrimaryStyle}>
          Sauvgarder
        </button>
      </div>
    </div>
  );
};

export default SeatEditDialog;
