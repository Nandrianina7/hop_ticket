import { menuItemStyle } from './style';

const SeatContextMenu = ({
  x,
  y,
  seatId,
  onEdit,
  onDelete,
  onClose,
  isDisabled,
  onToggleDisabled,
  onSelectSeatType,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 10002,
        minWidth: '160px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #eee',
          fontSize: '12px',
          color: '#333',
          backgroundColor: '#f8f9fa',
          fontWeight: 'bold',
        }}
      >
        ID: {seatId}
      </div>
      <div onClick={onEdit} style={menuItemStyle}>
        ✏️ changer ID
      </div>
      <div style={menuItemStyle} onClick={onToggleDisabled}>
        {isDisabled ? '✅ Activer la place' : '🚫 Désactiver la place'}
      </div>
      <div style={menuItemStyle} onClick={onSelectSeatType}>
        🪑 Type de la place
      </div>
      <div onClick={onDelete} style={{ ...menuItemStyle, color: '#dc3545' }}>
        🗑️ supprimer la place
      </div>
    </div>
  );
};

export default SeatContextMenu;
