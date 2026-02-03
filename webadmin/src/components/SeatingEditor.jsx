import { Button } from '@mui/material';
import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { Stage, Layer, Group, Rect, Text, Circle, Transformer } from 'react-konva';

// Mapping pour les types de ticket et leur couleur
const TICKET_TIERS = {
  VIP: '#ff6b6b',
  Argent: '#45b7d1',
  Bronze: '#feca57',
  Public: '#96ceb4'
};

/**
 * SeatingEditor - Final Fixed Version
 * Fixes: Zoom State, Spacebar Scoping, Input Typing, and Dialog Visibility
 */

// --- Internal Helper Components ---

// 1. Updated Dialog Style to 'fixed' so it never disappears off-screen
const dialogStyle = {
  position: 'fixed', // Changed from absolute to fixed
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  zIndex: 10000, // High z-index to ensure it's on top
  minWidth: '300px'
};

const menuItemStyle = {
  padding: '8px 12px',
  cursor: 'pointer',
  borderBottom: '1px solid #eee',
  fontSize: '14px'
};

const ContextMenu = ({ x, y, sectionType, onDuplicate, onEdit, onFillWithSeats, onDelete, onChangeColor, onChangeTier, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed', // Fixed ensures it stays under mouse even if scrolled
        left: x,
        top: y,
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 10002,
        minWidth: '160px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div onClick={onDuplicate} style={menuItemStyle}>📋 Dupliquer</div>
      <div onClick={onEdit} style={menuItemStyle}>✏️ modifier {sectionType === 'label' ? 'Label' : 'Name'}</div>
      {sectionType === 'section' && (
        <div onClick={onFillWithSeats} style={menuItemStyle}>🪑 remplir de place</div>
      )}
      <div onClick={onChangeColor} style={menuItemStyle}>🎨 Changer de couleur</div>
      <div onClick={onDelete} style={{ ...menuItemStyle, color: '#dc3545' }}>🗑️ supprimer {sectionType === 'label' ? 'Label' : 'Section'}</div>
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

const SeatContextMenu = ({ x, y, seatId, onEdit, onDelete, onClose }) => {
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
        minWidth: '160px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#333', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
        ID: {seatId}
      </div>
      <div onClick={onEdit} style={menuItemStyle}>✏️ changer ID</div>
      <div onClick={onDelete} style={{ ...menuItemStyle, color: '#dc3545' }}>🗑️ supprimer la place</div>
    </div>
  );
};

const ColorPickerDialog = ({ currentColor, onConfirm, onCancel }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const predefinedColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84', '#ee5253', '#0abde3', '#ff6b6b', '#48dbfb'];

  return (
    <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
      <h3>Changer la couleur de la section</h3>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '15px' }}>
          {predefinedColors.map((color) => (
            <div
              key={color}
              onClick={() => setSelectedColor(color)}
              style={{
                width: '40px', height: '40px', backgroundColor: color, borderRadius: '50%', cursor: 'pointer',
                border: selectedColor === color ? '3px solid #333' : '2px solid #ddd',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {selectedColor === color && <span style={{ color: 'white', fontSize: '16px' }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Custom:</label>
          <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} style={{ width: '50px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnSecondaryStyle}>annuler</button>
        <button onClick={() => onConfirm(selectedColor)} style={btnPrimaryStyle}>Appliquer la couleur</button>
      </div>
    </div>
  );
};

const SeatGridDialog = ({ onConfirm, onCancel }) => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [seatSize, setSeatSize] = useState(8);

  return (
    <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
      <h3>remplir la section avec des places</h3>
      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>Nombre de lignes:</label>
        <input type="number" min="1" max="50" value={rows} onChange={(e) => setRows(parseInt(e.target.value) || 1)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>nombre de colonnes:</label>
        <input type="number" min="1" max="50" value={cols} onChange={(e) => setCols(parseInt(e.target.value) || 1)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>dimension de place:</label>
        <input type="number" min="3" max="20" value={seatSize} onChange={(e) => setSeatSize(parseInt(e.target.value) || 3)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnSecondaryStyle}>annuler</button>
        <button onClick={() => onConfirm(rows, cols, seatSize)} style={btnPrimaryStyle}>remplir</button>
      </div>
    </div>
  );
};

const SeatEditDialog = ({ seat, onConfirm, onCancel }) => {
  const [newId, setNewId] = useState(seat.id);

  return (
    <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
      <h3>changer la place ID</h3>
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>place ID:</label>
        <input type="text" value={newId} onChange={(e) => setNewId(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={btnSecondaryStyle}>Annuler</button>
        <button onClick={() => onConfirm(newId)} style={btnPrimaryStyle}>Sauvgarder</button>
      </div>
    </div>
  );
};

// Styles
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' };
const btnPrimaryStyle = { background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' };
const btnSecondaryStyle = { background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' };

// --- Main Component ---

const SeatingEditor = React.forwardRef(({ 
  onLayoutChange, 
  initialLayout,
  height = '100vh',
  width = '100%',
  backgroundColor = 'transparent',
  hideToolbar = false,
  onSave,
  getSiteName,
  position = 'relative'
}, ref) => {
  const [layout, setLayout] = useState(initialLayout || {
    sections: [
      { id: 'section-1', name: 'Section A', color: '#ff6b6b', x: 50, y: 200, width: 150, height: 120, rotation: 0, seats: [], type: 'section' },
      { id: 'section-2', name: 'Section B', color: '#4ecdc4', x: 250, y: 200, width: 150, height: 120, rotation: 0, seats: [], type: 'section' }
    ],
    scale: 1
  });
  useEffect(() => {
    if (initialLayout) {
      setLayout(initialLayout);
      }
  }, [initialLayout]);

      const handleChangeTier = useCallback((sectionId, tier) => {
      const newLayout = { ...layout };
      const sectionIndex = newLayout.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex !== -1) {
        // Change la couleur de la section
        newLayout.sections[sectionIndex].color = TICKET_TIERS[tier];

        // Change la couleur de tous les seats dans cette section
        newLayout.sections[sectionIndex].seats = newLayout.sections[sectionIndex].seats.map(seat => ({
          ...seat,
          color: TICKET_TIERS[tier]
        }));

        setLayout(newLayout);
        if (onLayoutChange) onLayoutChange(newLayout);
      }
      setContextMenu(null); // fermer le menu après sélection
    }, [layout, onLayoutChange]);


  const [selectedId, setSelectedId] = useState(null);
  const [scale, setScale] = useState(initialLayout?.scale || 1);
  const [tool, setTool] = useState('select');
  const [editingSection, setEditingSection] = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  const isHoveredRef = useRef(false);

  const [contextMenu, setContextMenu] = useState(null);
  const [seatContextMenu, setSeatContextMenu] = useState(null);
  const [seatGridDialog, setSeatGridDialog] = useState(null);
  const [seatEditDialog, setSeatEditDialog] = useState(null);
  const [colorPickerDialog, setColorPickerDialog] = useState(null);
  
  const transformerRef = useRef(null);
  const stageRef = useRef(null);
  const labelTextRef = useRef(null);
  const sectionTextRefs = useRef({});
  const [labelDims, setLabelDims] = useState({width: 0, height: 0});
  const [sectionTextDims, setSectionTextDims] = useState({});

  // 2. Updated Keyboard Handler to allow spaces in inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // CRITICAL FIX: If user is typing in an input, do NOT trigger Pan Mode
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        return;
      }

      if (e.code === 'Space' && isHoveredRef.current) {
        e.preventDefault(); 
        setIsSpacePressed(true);
        document.body.style.cursor = 'grab';
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        document.body.style.cursor = 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.body.style.cursor = 'default';
    };
  }, []);

  // Handle Ctrl + scroll wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey && isHoveredRef.current) {
        e.preventDefault(); 
        const direction = e.deltaY > 0 ? 'out' : 'in';
        const newScale = direction === 'in' ? scale * 1.1 : scale / 1.1;
        setScale(Math.max(0.1, Math.min(3, newScale)));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scale]);

  // Handle mouse events for pan mode cursor
  useEffect(() => {
    const handleMouseDown = () => {
      if (isSpacePressed) document.body.style.cursor = 'grabbing';
    };
    const handleMouseUp = () => {
      if (isSpacePressed) document.body.style.cursor = 'grab';
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSpacePressed]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setSeatContextMenu(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedId) {
      const stage = stageRef.current;
      const transformer = transformerRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode && transformer) {
        transformer.nodes([selectedNode]);
        transformer.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  const fitToScreen = useCallback(() => {
    if (!layout.sections || layout.sections.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    layout.sections.forEach(section => {
      minX = Math.min(minX, section.x);
      minY = Math.min(minY, section.y);
      maxX = Math.max(maxX, section.x + section.width);
      maxY = Math.max(maxY, section.y + section.height);
    });

    if (minX === Infinity) return;

    const padding = 50;
    const mapWidth = maxX - minX + padding * 2;
    const mapHeight = maxY - minY + padding * 2;

    const containerWidth = typeof width === 'number' ? width : window.innerWidth;
    const containerHeight = typeof height === 'number' ? height : window.innerHeight;

    const scaleX = containerWidth / mapWidth;
    const scaleY = containerHeight / mapHeight;
    const newScale = Math.min(scaleX, scaleY, 1); 

    const stage = stageRef.current;
    if (stage) {
        const newX = (containerWidth - mapWidth * newScale) / 2 - (minX - padding) * newScale;
        const newY = (containerHeight - mapHeight * newScale) / 2 - (minY - padding) * newScale;
        
        stage.position({ x: newX, y: newY });
        stage.batchDraw();
    }

    setScale(newScale);
  }, [layout, width, height]);

  useEffect(() => {
    if (initialLayout && initialLayout.scale) {
      fitToScreen();
    }
  }, [initialLayout, fitToScreen]);

  useLayoutEffect(() => {
    if (labelTextRef.current) {
      setLabelDims({ width: labelTextRef.current.width(), height: labelTextRef.current.height() });
    }
    const newSectionTextDims = {};
    layout.sections.forEach(section => {
      if (section.type === 'section' && sectionTextRefs.current[section.id]) {
        newSectionTextDims[section.id] = {
          width: sectionTextRefs.current[section.id].width(),
          height: sectionTextRefs.current[section.id].height(),
        };
      }
    });
    setSectionTextDims(newSectionTextDims);
  }, [layout.sections]); 

  const handleDragEnd = useCallback((e, type, id) => {
    const newLayout = { ...layout };
    const sectionIndex = newLayout.sections.findIndex(s => s.id === id);
    if (sectionIndex !== -1) {
      newLayout.sections[sectionIndex].x = e.target.x() - newLayout.sections[sectionIndex].width / 2;
      newLayout.sections[sectionIndex].y = e.target.y() - newLayout.sections[sectionIndex].height / 2;
    }
    setLayout(newLayout);
    if (onLayoutChange) onLayoutChange(newLayout);
  }, [layout, onLayoutChange]);

  const handleSectionClick = useCallback((sectionId) => {
    if (tool === 'add-seat') {
      const section = layout.sections.find(s => s.id === sectionId);
      if (section && section.type === 'section') { 
        const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
        const newSeat = {
          id: `${section.name}-${randomChars}`,
          x: Math.random() * (section.width - 20) + 10,
          y: Math.random() * (section.height - 20) + 10,
          row: 'A',
          number: section.seats.length + 1,
          sectionId,
          seatSize: 8 
        };
        const newLayout = { ...layout };
        const sectionIndex = newLayout.sections.findIndex(s => s.id === sectionId);
        newLayout.sections[sectionIndex].seats.push(newSeat);
        setLayout(newLayout);
        if (onLayoutChange) onLayoutChange(newLayout);
      }
    } else {
      setSelectedId(sectionId);
    }
  }, [layout, tool, onLayoutChange]);

  const handleSectionRightClick = useCallback((e, sectionId) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    
    // Get mouse position relative to browser viewport, not canvas
    // This ensures context menu opens exactly where you click
    setContextMenu({ 
      x: e.evt.clientX, 
      y: e.evt.clientY, 
      sectionId 
    });
  }, []);

  const handleDuplicateSection = useCallback((sectionId) => {
    const section = layout.sections.find(s => s.id === sectionId);
    if (section) {
      const newSection = {
        ...section,
        id: `section-${Date.now()}`,
        name: `${section.name} (Copy)`,
        x: section.x + 20,
        y: section.y + 20,
        seats: section.seats.map(seat => ({
          ...seat,
          id: `seat-${Date.now()}-${Math.random()}`,
          sectionId: `section-${Date.now()}`,
          seatSize: seat.seatSize || 8 
        }))
      };
      const newLayout = { ...layout, sections: [...layout.sections, newSection] };
      setLayout(newLayout);
      if (onLayoutChange) onLayoutChange(newLayout);
    }
    setContextMenu(null);
  }, [layout, onLayoutChange]);

  const handleFillWithSeats = useCallback((sectionId, rows, cols, seatSize) => {
    const section = layout.sections.find(s => s.id === sectionId);
    if (section) {
      const newSeats = [];
      const minPadding = 15; 
      const totalHorizontalSpaces = cols + 1; 
      const totalVerticalSpaces = rows + 1;   
      const spacingX = Math.max(minPadding, (section.width - (cols * seatSize * 2)) / totalHorizontalSpaces);
      const spacingY = Math.max(minPadding, (section.height - (rows * seatSize * 2)) / totalVerticalSpaces);
      
      if (spacingX < minPadding || spacingY < minPadding) {
        console.warn('Section too small for seats with current configuration');
        return;
      }
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const seat = {
            id: `${section.name}-${String.fromCharCode(65 + row)}-${col + 1}`,
            x: spacingX + col * (seatSize * 2 + spacingX),
            y: spacingY + row * (seatSize * 2 + spacingY),
            row: String.fromCharCode(65 + row), 
            number: col + 1,
            sectionId,
            seatSize
          };
          newSeats.push(seat);
        }
      }
      const newLayout = { ...layout };
      const sectionIndex = newLayout.sections.findIndex(s => s.id === sectionId);
      newLayout.sections[sectionIndex].seats = newSeats;
      setLayout(newLayout);
      if (onLayoutChange) onLayoutChange(newLayout);
    }
    setSeatGridDialog(null);
  }, [layout, onLayoutChange]);

  const handleSeatDragEnd = useCallback((e, seat, section) => {
    const newLayout = { ...layout };
    const sectionIndex = newLayout.sections.findIndex(s => s.id === section.id);
    const seatIndex = newLayout.sections[sectionIndex].seats.findIndex(s => s.id === seat.id);
    
    const centerX = section.x + section.width / 2;
    const centerY = section.y + section.height / 2;
    const draggedX = e.target.x();
    const draggedY = e.target.y();
    const relativeX = draggedX - centerX;
    const relativeY = draggedY - centerY;
    
    const angle = -(section.rotation * Math.PI) / 180;
    const originalX = relativeX * Math.cos(angle) - relativeY * Math.sin(angle);
    const originalY = relativeX * Math.sin(angle) + relativeY * Math.cos(angle);
    
    const sectionRelativeX = originalX + section.width / 2;
    const sectionRelativeY = originalY + section.height / 2;
    
    newLayout.sections[sectionIndex].seats[seatIndex].x = sectionRelativeX;
    newLayout.sections[sectionIndex].seats[seatIndex].y = sectionRelativeY;
    setLayout(newLayout);
    if (onLayoutChange) onLayoutChange(newLayout);
  }, [layout, onLayoutChange]);

  const handleTransformEnd = useCallback((e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    node.scaleX(1);
    node.scaleY(1);
    
    const newLayout = { ...layout };
    const sectionIndex = newLayout.sections.findIndex(s => s.id === selectedId);
    
    if (sectionIndex !== -1) {
      newLayout.sections[sectionIndex].x = node.x() - (node.width() * scaleX) / 2;
      newLayout.sections[sectionIndex].y = node.y() - (node.height() * scaleY) / 2;
      newLayout.sections[sectionIndex].width = Math.max(node.width() * scaleX, 50);
      newLayout.sections[sectionIndex].height = Math.max(node.height() * scaleY, 50);
      newLayout.sections[sectionIndex].rotation = rotation;
    }
    setLayout(newLayout);
    if (onLayoutChange) onLayoutChange(newLayout);
  }, [layout, selectedId, onLayoutChange]);

  const handleZoom = useCallback((direction) => {
    const newScale = direction === 'in' ? scale * 1.2 : scale / 1.2;
    setScale(Math.max(0.1, Math.min(3, newScale)));
  }, [scale]);

  const addSection = useCallback(() => {
    const newSection = {
      id: `section-${Date.now()}`,
      name: `Section ${layout.sections.length + 1}`,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      x: 100 + layout.sections.length * 200,
      y: 300,
      width: 150,
      height: 120,
      rotation: 0,
      seats: [],
      type: 'section'
    };
    const newLayout = { ...layout, sections: [...layout.sections, newSection] };
    setLayout(newLayout);
    if (onLayoutChange) onLayoutChange(newLayout);
  }, [layout, onLayoutChange]);

  const addLabelSection = useCallback(() => {
    const newLabelSection = {
      id: `label-${Date.now()}`,
      name: 'Stage',
      color: '#2c3e50',
      x: 100,
      y: 50,
      width: 200,
      height: 100,
      rotation: 0,
      seats: [],
      type: 'label'
    };
    const newLayout = { ...layout, sections: [...layout.sections, newLabelSection] };
    setLayout(newLayout);
    if (onLayoutChange) onLayoutChange(newLayout);
  }, [layout, onLayoutChange]);

  const exportToJSON = useCallback(() => {
    const jsonData = {
      ...layout,
      scale: scale, 
      exportDate: new Date().toISOString(),
      totalSeats: layout.sections.reduce((sum, section) => sum + section.seats.length, 0)
    };
    
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seating-layout.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [layout, scale]); 

  const handleSectionNameChange = useCallback((sectionId, newName) => {
    const newLayout = { ...layout };
    const sectionIndex = newLayout.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      newLayout.sections[sectionIndex].name = newName;
      setLayout(newLayout);
      if (onLayoutChange) onLayoutChange(newLayout);
    }
  }, [layout, onLayoutChange]);

  const handleSeatContextMenu = useCallback((e, seat) => {
    e.evt.preventDefault();
    setSeatContextMenu({ x: e.evt.clientX, y: e.evt.clientY, seatId: seat.id, sectionId: seat.sectionId });
  }, []);

  const handleSeatEdit = useCallback((newId) => {
    if (!seatEditDialog) return;
    const newLayout = { ...layout };
    const sectionIndex = newLayout.sections.findIndex(s => s.id === seatEditDialog.sectionId);
    if (sectionIndex !== -1) {
      const seatIndex = newLayout.sections[sectionIndex].seats.findIndex(s => s.id === seatEditDialog.id);
      if (seatIndex !== -1) {
        newLayout.sections[sectionIndex].seats[seatIndex].id = newId;
        setLayout(newLayout);
        if (onLayoutChange) onLayoutChange(newLayout);
      }
    }
    setSeatEditDialog(null);
  }, [layout, onLayoutChange, seatEditDialog]);

  React.useImperativeHandle(ref, () => ({
    addSection,
    addLabelSection,
    setTool,
    zoomIn: () => handleZoom('in'),
    zoomOut: () => handleZoom('out'),
    exportToJSON,
    fitToScreen,
    getLayout: () => layout,
    setLayout: (newLayout) => {
      setLayout(newLayout);
      if (newLayout.scale) setScale(newLayout.scale);
      if (onLayoutChange) onLayoutChange(newLayout);
    }
  }), [layout, onLayoutChange, addSection, addLabelSection, setTool, handleZoom, exportToJSON, fitToScreen]);

  return (
    <div 
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height, 
        position: position,
        backgroundColor
      }}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { 
        isHoveredRef.current = false; 
        setIsSpacePressed(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Toolbar */}
      {!hideToolbar && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: '10px',
          borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', gap: '10px', flexWrap: 'wrap'
        }}>
          <input type="text" placeholder="nom de Salle" onChange={(e) => {
                getSiteName(e.target.value);
          }} />
          <Button onClick={() => setTool('select')} style={tool === 'select' ? btnActive : btnInactive}>Selection</Button>
          <Button onClick={() => setTool('add-seat')} style={tool === 'add-seat' ? btnActive : btnInactive}>Ajouter place</Button>
          <Button onClick={addSection} style={btnAction}>Ajouter Section</Button>
          <Button onClick={addLabelSection} style={btnAction}>Ajouter Label</Button>
          <Button onClick={() => handleZoom('in')} style={btnZoom}>+</Button>
          <Button onClick={() => handleZoom('out')} style={btnZoom}>-</Button>
          <Button onClick={fitToScreen} style={btnAction}>recentrer</Button>
          <Button onClick={exportToJSON} style={btnExport}>Exporter</Button>
          <Button onClick={onSave} style={btnAction}>Sauvgarder</Button>

          <div style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>Scale: {scale.toFixed(2)}x</div>
          {isSpacePressed && <div style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold', alignSelf: 'center' }}>PAN MODE</div>}
        </div>
      )}

      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={typeof width === 'number' ? width : window.innerWidth}
        height={typeof height === 'number' ? height : window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        draggable={isSpacePressed}
        onClick={(e) => {
          if (e.target === e.target.getStage()) setSelectedId(null);
        }}
      >
        <Layer>
          {layout.sections.map((section) => (
            <Group key={section.id}>
              <Rect
                id={section.id}
                x={section.x + section.width / 2}
                y={section.y + section.height / 2}
                width={section.width}
                height={section.height}
                fill={section.color}
                stroke="#333"
                strokeWidth={2}
                cornerRadius={6}
                opacity={0.8}
                rotation={section.rotation}
                offsetX={section.width / 2}
                offsetY={section.height / 2}
                onClick={() => handleSectionClick(section.id)}
                onTap={() => handleSectionClick(section.id)}
                onContextMenu={(e) => handleSectionRightClick(e, section.id)}
                draggable={tool === 'select' && !isSpacePressed}
                onDragEnd={(e) => handleDragEnd(e, 'section', section.id)}
                onTransformEnd={handleTransformEnd}
              />
              {section.type === 'label' ? (
                <Text
                  ref={labelTextRef}
                  x={section.x + section.width / 2 - labelDims.width / 2}
                  y={section.y + section.height / 2 - labelDims.height / 2}
                  text={section.name}
                  fontSize={18}
                  fontStyle="bold"
                  fill="white"
                  align="center"
                  verticalAlign="middle"
                  rotation={section.rotation}
                  onClick={() => setEditingSection(section.id)}
                />
              ) : (
                <Text
                  ref={(el) => { if (el) sectionTextRefs.current[section.id] = el; }}
                  x={section.x + section.width / 2}
                  y={section.y - 25}
                  text={section.name}
                  fontSize={14}
                  fill="black"
                  fontStyle="bold"
                  align="center"
                  rotation={section.rotation}
                  offsetX={sectionTextDims[section.id]?.width ? sectionTextDims[section.id].width / 2 : 0}
                  offsetY={0}
                  onClick={() => setEditingSection(section.id)}
                />
              )}
              
              {section.seats.map((seat) => {
                const centerX = section.x + section.width / 2;
                const centerY = section.y + section.height / 2;
                const seatX = section.x + seat.x;
                const seatY = section.y + seat.y;
                const relativeX = seatX - centerX;
                const relativeY = seatY - centerY;
                const angle = (section.rotation * Math.PI) / 180;
                const rotatedX = relativeX * Math.cos(angle) - relativeY * Math.sin(angle);
                const rotatedY = relativeX * Math.sin(angle) + relativeY * Math.cos(angle);
                const finalX = centerX + rotatedX;
                const finalY = centerY + rotatedY;
                
                return (
                  <Circle
                    key={seat.id}
                    x={finalX}
                    y={finalY}
                    radius={seat.seatSize}
                    // fill="#fff"
                    fill={seat.color || '#fff'} // si seat.color existe, on l'utilise
                    stroke="#333"
                    strokeWidth={1}
                    draggable={tool === 'select' && !isSpacePressed}
                    onDragEnd={(e) => handleSeatDragEnd(e, seat, section)}
                    onContextMenu={(e) => handleSeatContextMenu(e, seat)}
                  />
                );
              })}
            </Group>
          ))}
          {selectedId && <Transformer ref={transformerRef} boundBoxFunc={(oldBox, newBox) => newBox} />}
        </Layer>
      </Stage>

      {/* Overlays */}
      {contextMenu && (
        <ContextMenu
          {...contextMenu}
          sectionType={layout.sections.find(s => s.id === contextMenu.sectionId)?.type || 'section'}
          onDuplicate={() => handleDuplicateSection(contextMenu.sectionId)}
          onEdit={() => { setEditingSection(contextMenu.sectionId); setContextMenu(null); }}
          onFillWithSeats={() => {
            const section = layout.sections.find(s => s.id === contextMenu.sectionId);
            if (section && section.type === 'section') setSeatGridDialog({ sectionId: contextMenu.sectionId });
            setContextMenu(null);
          }}
          onDelete={() => {
            const newLayout = { ...layout };
            const sectionIndex = newLayout.sections.findIndex(s => s.id === contextMenu.sectionId);
            if (sectionIndex !== -1) {
              newLayout.sections.splice(sectionIndex, 1);
              setLayout(newLayout);
              if (onLayoutChange) onLayoutChange(newLayout);
            }
            setContextMenu(null);
          }}
          onChangeColor={() => {
            setContextMenu(null);
            setColorPickerDialog({
              currentColor: layout.sections.find(s => s.id === contextMenu.sectionId)?.color || '#ff6b6b',
              onConfirm: (color) => {
                const newLayout = { ...layout };
                const sectionIndex = newLayout.sections.findIndex(s => s.id === contextMenu.sectionId);
                if (sectionIndex !== -1) {
                  newLayout.sections[sectionIndex].color = color;
                  setLayout(newLayout);
                  if (onLayoutChange) onLayoutChange(newLayout);
                }
                setColorPickerDialog(null);
              },
              onCancel: () => setColorPickerDialog(null)
            });
          }}
          onChangeTier={(tier) => handleChangeTier(contextMenu.sectionId, tier)}
          
          onClose={() => setContextMenu(null)}
        />
      )}

      {seatContextMenu && (
        <SeatContextMenu
          {...seatContextMenu}
          onEdit={() => {
            const seat = layout.sections.find(s => s.id === seatContextMenu.sectionId)?.seats.find(s => s.id === seatContextMenu.seatId);
            if (seat) setSeatEditDialog(seat);
            setSeatContextMenu(null);
          }}
          onDelete={() => {
            const newLayout = { ...layout };
            const sectionIndex = newLayout.sections.findIndex(s => s.id === seatContextMenu.sectionId);
            if (sectionIndex !== -1) {
              newLayout.sections[sectionIndex].seats = newLayout.sections[sectionIndex].seats.filter(s => s.id !== seatContextMenu.seatId);
              setLayout(newLayout);
              if (onLayoutChange) onLayoutChange(newLayout);
            }
            setSeatContextMenu(null);
          }}
          onClose={() => setSeatContextMenu(null)}
        />
      )}

      {seatGridDialog && (
        <SeatGridDialog
          onConfirm={(rows, cols, seatSize) => handleFillWithSeats(seatGridDialog.sectionId, rows, cols, seatSize)}
          onCancel={() => setSeatGridDialog(null)}
        />
      )}

      {seatEditDialog && (
        <SeatEditDialog
          seat={seatEditDialog}
          onConfirm={handleSeatEdit}
          onCancel={() => setSeatEditDialog(null)}
        />
      )}

      {editingSection && (
        <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
          <h3>Modifier le nom de la section</h3>
          <input
            type="text"
            defaultValue={layout.sections.find(s => s.id === editingSection)?.name || ''}
            onChange={(e) => handleSectionNameChange(editingSection, e.target.value)}
            style={{ width: '200px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setEditingSection(null)} style={btnSecondaryStyle}>annuler</button>
            <button onClick={() => setEditingSection(null)} style={{ ...btnPrimaryStyle, background: '#007bff' }}>Enregistrer</button>
          </div>
        </div>
      )}

      {colorPickerDialog && (
        <ColorPickerDialog
          currentColor={colorPickerDialog.currentColor}
          onConfirm={colorPickerDialog.onConfirm}
          onCancel={colorPickerDialog.onCancel}
        />
      )}
    </div>
  );
});

// Button Styles
const btnBase = { border: '1px solid #ddd', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' };
const btnActive = { ...btnBase, background: '#28a745', color: 'white' };
const btnInactive = { ...btnBase, background: '#f8f9fa', color: '#333' };
const btnAction = { ...btnBase, background: '#17a2b8', color: 'white', borderColor: '#17a2b8', '&:hover': { background: '#138496' } };
const btnZoom = { ...btnBase, background: '#ffc107', color: '#333', borderColor: '#ffc107', fontWeight: 'bold' };
const btnExport = { ...btnBase, background: '#6f42c1', color: 'white', borderColor: '#6f42c1' };

export default SeatingEditor;