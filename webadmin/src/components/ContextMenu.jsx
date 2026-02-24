import { TICKET_TIERS } from './SeatingEditor';
import { menuItemStyle } from './style';

const ContextMenu = ({
  x,
  y,
  sectionType,
  onDuplicate,
  onEdit,
  onFillWithSeats,
  onDelete,
  onChangeColor,
  onChangeTier,
  onChangeShape,
  onClose,
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
        minWidth: '180px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div onClick={onDuplicate} style={menuItemStyle}>
        📋 Dupliquer
      </div>
      <div onClick={onEdit} style={menuItemStyle}>
        ✏️ modifier {sectionType === 'label' ? 'Label' : 'Nom'}
      </div>
      {sectionType === 'section' && (
        <>
          <div onClick={onFillWithSeats} style={menuItemStyle}>
            🪑 remplir de places
          </div>
          <div onClick={onChangeShape} style={menuItemStyle}>
            🔷 Changer la forme
          </div>
        </>
      )}
      <div onClick={onChangeColor} style={menuItemStyle}>
        🎨 Changer de couleur
      </div>
      <div onClick={onDelete} style={{ ...menuItemStyle, color: '#dc3545' }}>
        🗑️ supprimer {sectionType === 'label' ? 'Label' : 'Section'}
      </div>
      <div style={{ ...menuItemStyle, fontWeight: 'bold', cursor: 'default' }}>
        🎟️ Type de ticket :
        {Object.keys(TICKET_TIERS).map((tier) => (
          <div
            key={tier}
            style={{ ...menuItemStyle, paddingLeft: '20px' }}
            onClick={() => onChangeTier(tier)}
          >
            {tier}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu;
