//  import React, { useState, useRef, useCallback, useEffect } from 'react';
// import { useState, useRef, useCallback, useEffect } from 'react';
// import { Stage, Layer, Line, Transformer } from 'react-konva';
// import {
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Transformer } from 'react-konva';
import {
  Box,
  Paper,
  Typography,
  Button,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  FormControlLabel,
  Switch,
  Slider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import {
  Close,
  Save,
  Undo,
  Redo,
  Delete,
  Square,
  Circle as CircleIcon,
  Straighten,
  Edit,
  Chair,
  TableRestaurant,
  DoorFront,
  LocalCafe,
  ZoomIn,
  ZoomOut,
  TextFields,
  Label,
} from '@mui/icons-material';
import renderElementKonva from '../../ui/renderElementKonva';

const TOOLS = {
  SELECT: 'select',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  LINE: 'line',
  SEAT: 'seat',
  TABLE: 'table',
  ENTRANCE: 'entrance',
  RESTROOM: 'restroom',
  TEXT: 'text',
};

const DEFAULT_COLORS = {
  [TOOLS.RECTANGLE]: '#1976d2',
  [TOOLS.CIRCLE]: '#2e7d32',
  [TOOLS.LINE]: '#ed6c02',
  [TOOLS.SEAT]: '#1976d2',
  [TOOLS.TABLE]: '#9c27b0',
  [TOOLS.ENTRANCE]: '#4caf50',
  [TOOLS.RESTROOM]: '#ff9800',
  [TOOLS.TEXT]: '#000000',
};

const VenuePlanBuilder = ({ open, onClose, onSave, initialPlan }) => {
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const containerRef = useRef(null);

  const [tool, setTool] = useState(TOOLS.SELECT);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [currentLabel, setCurrentLabel] = useState('');
  const [editingElementId, setEditingElementId] = useState(null);
  const [siteName, setSiteName] = useState('');

  useEffect(() => {
    if (initialPlan) {
      const planElements = initialPlan.elements || [];
      setElements(planElements);
      setHistory([planElements]);
      setHistoryStep(0);
      setSiteName(initialPlan.site_name || '');
    }
  }, [initialPlan]);

  const updateStageSize = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const width = container.clientWidth - 32;
      const height = container.clientHeight - 32;
      setStageSize({ width, height });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      updateStageSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateStageSize]);

  const snapToGrid = (x, y) => {
    if (!showGrid) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  };

  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };
  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);

      if (tool === TOOLS.SELECT) return;

      const pos = e.target.getStage().getPointerPosition();
      const snappedPos = snapToGrid(pos.x / zoom, pos.y / zoom);

      if (tool === TOOLS.TEXT) {
        const newElement = createElement(
          tool,
          snappedPos.x,
          snappedPos.y,
          snappedPos.x,
          snappedPos.y
        );
        setElements((prev) => {
          const updated = [...prev, newElement];
          addToHistory(updated);
          return updated;
        });
        setSelectedId(newElement.id);
        openLabelDialog(newElement.id);
      } else {
        setIsDrawing(true);
        setCurrentElement(
          createElement(tool, snappedPos.x, snappedPos.y, snappedPos.x, snappedPos.y)
        );
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentElement) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const snappedPos = snapToGrid(point.x / zoom, point.y / zoom);

    setCurrentElement(updateElement(currentElement, snappedPos.x, snappedPos.y));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;

    if (isElementValid(currentElement)) {
      setElements((prev) => {
        const updated = [...prev, currentElement];
        addToHistory(updated);
        return updated;
      });

      if ([TOOLS.RECTANGLE, TOOLS.CIRCLE, TOOLS.ENTRANCE, TOOLS.RESTROOM].includes(tool)) {
        setSelectedId(currentElement.id);
        setTimeout(() => openLabelDialog(currentElement.id), 100);
      }
    }

    setIsDrawing(false);
    setCurrentElement(null);
  };

  const createElement = (type, x1, y1, x2, y2) => {
    const id = Date.now().toString();
    const snappedX1 = snapToGrid(x1, y1).x;
    const snappedY1 = snapToGrid(x1, y1).y;
    const snappedX2 = snapToGrid(x2, y2).x;
    const snappedY2 = snapToGrid(x2, y2).y;

    const baseProps = {
      id,
      type,
      x: snappedX1,
      y: snappedY1,
      fill: DEFAULT_COLORS[type],
      stroke: '#000000',
      strokeWidth: 2,
    };

    switch (type) {
      case TOOLS.RECTANGLE:
        return {
          ...baseProps,
          width: Math.max(Math.abs(snappedX2 - snappedX1), gridSize),
          height: Math.max(Math.abs(snappedY2 - snappedY1), gridSize),
          fontSize: 14,
        };
      case TOOLS.CIRCLE:
        const radius =
          Math.max(Math.abs(snappedX2 - snappedX1), Math.abs(snappedY2 - snappedY1)) / 2;
        return {
          ...baseProps,
          radius: Math.max(radius, gridSize),
          fontSize: 12,
        };
      case TOOLS.LINE:
        return {
          ...baseProps,
          points: [snappedX1, snappedY1, snappedX2, snappedY2],
        };
      case TOOLS.SEAT:
        return {
          ...baseProps,
          radius: 8,
          label: `S${elements.filter((el) => el.type === TOOLS.SEAT).length + 1}`,
        };
      case TOOLS.TABLE:
        return {
          ...baseProps,
          width: 40,
          height: 30,
          label: `T${elements.filter((el) => el.type === TOOLS.TABLE).length + 1}`,
        };
      case TOOLS.ENTRANCE:
        return {
          ...baseProps,
          width: 30,
          height: 20,
          fontSize: 10,
        };
      case TOOLS.RESTROOM:
        return {
          ...baseProps,
          width: 30,
          height: 20,
          fontSize: 10,
        };
      case TOOLS.TEXT:
        return {
          ...baseProps,
          text: 'Double click to edit',
          fontSize: 16,
          fill: '#000000',
        };
      default:
        return baseProps;
    }
  };

  const updateElement = (element, x2, y2) => {
    const snappedX1 = snapToGrid(element.x, element.y).x;
    const snappedY1 = snapToGrid(element.x, element.y).y;
    const snappedX2 = snapToGrid(x2, y2).x;
    const snappedY2 = snapToGrid(x2, y2).y;

    switch (element.type) {
      case TOOLS.RECTANGLE:
        return {
          ...element,
          x: Math.min(snappedX1, snappedX2),
          y: Math.min(snappedY1, snappedY2),
          width: Math.abs(snappedX2 - snappedX1),
          height: Math.abs(snappedY2 - snappedY1),
        };
      case TOOLS.CIRCLE:
        const radius =
          Math.max(Math.abs(snappedX2 - snappedX1), Math.abs(snappedY2 - snappedY1)) / 2;
        return {
          ...element,
          radius: Math.max(radius, gridSize),
        };
      case TOOLS.LINE:
        return {
          ...element,
          points: [snappedX1, snappedY1, snappedX2, snappedY2],
        };
      default:
        return element;
    }
  };
  const isElementValid = (element) => {
    switch (element.type) {
      case TOOLS.RECTANGLE:
        return element.width > 5 && element.height > 5;
      case TOOLS.CIRCLE:
        return element.radius > 5;
      case TOOLS.LINE:
        const [x1, y1, x2, y2] = element.points;
        return Math.abs(x2 - x1) > 5 || Math.abs(y2 - y1) > 5;
      default:
        return true;
    }
  };

  const handleElementClick = (e) => {
    if (tool === TOOLS.SELECT) {
      setSelectedId(e.target.attrs.id);
    }
  };

  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);

      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      }
    }
  }, [selectedId]);

  const openLabelDialog = (elementId) => {
    const element = elements.find((el) => el.id === elementId);
    if (element) {
      setEditingElementId(element.id);
      setCurrentLabel(element.label || element.text || '');
      setLabelDialogOpen(true);
    }
  };

  const handleLabelSave = () => {
    if (editingElementId) {
      setElements((prev) =>
        prev.map((el) =>
          el.id === editingElementId ? { ...el, label: currentLabel, text: currentLabel } : el
        )
      );
    }
    setLabelDialogOpen(false);
    setCurrentLabel('');
    setEditingElementId(null);
  };

  const handleDoubleClick = (e) => {
    if (tool === TOOLS.SELECT && selectedId) {
      openLabelDialog(selectedId);
    }
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements(history[historyStep - 1]);
      setSelectedId(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements(history[historyStep + 1]);
      setSelectedId(null);
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      setElements((prev) => {
        const updated = prev.filter((el) => el.id !== selectedId);
        addToHistory(updated);
        return updated;
      });
      setSelectedId(null);
    }
  };

  const addLabelToSelected = () => {
    if (selectedId) {
      openLabelDialog(selectedId);
    }
  };

  const handleSiteName = (e) => {
    setSiteName(e.target.value);
  };
  const handleSave = () => {
    const venuePlan = {
      site_name: siteName,
      elements,
      metadata: {
        createdAt: new Date().toISOString(),
        gridSize,
        stageSize,
        version: '2.0',
      },
    };
    onSave(venuePlan);
    // onClose();
  };

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const width = stageSize.width;
    const height = stageSize.height;

    for (let x = 0; x <= width; x += gridSize) {
      gridLines.push(
        <Line key={`v-${x}`} points={[x, 0, x, height]} stroke="#e0e0e0" strokeWidth={0.5} />
      );
    }

    for (let y = 0; y <= height; y += gridSize) {
      gridLines.push(
        <Line key={`h-${y}`} points={[0, y, width, y]} stroke="#e0e0e0" strokeWidth={0.5} />
      );
    }

    return gridLines;
  };

  const renderElement = (element, i) =>
    renderElementKonva(element, {
      selectedId,
      onElementClick: handleElementClick,
      draggable: tool === TOOLS.SELECT,
      onUpdate: (newAttrs) => {
        const updated = elements.slice();
        updated[i] = newAttrs;
        setElements(updated);
      },
    });
  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: '95vw',
            maxWidth: 1400,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', minHeight: '64px !important' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Venue Plan Builder (React-Konva)
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Toolbar>
        <Box
          sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', height: 'calc(100vh - 64px)' }}
        >
          <Paper
            sx={{
              width: 320,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              overflow: 'auto',
              borderRadius: 0,
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Tools
                <Typography variant="subtitle2">
                  {'(to add a labeled the just double click it)'}
                </Typography>
              </Typography>
              <Grid container spacing={1.5}>
                {Object.entries(TOOLS).map(([key, value]) => (
                  <Grid item xs={6} key={value}>
                    <Button
                      fullWidth
                      variant={tool === value ? 'contained' : 'outlined'}
                      onClick={() => setTool(value)}
                      startIcon={getToolIcon(value)}
                      size="small"
                      sx={{
                        height: '48px',
                        fontSize: '0.75rem',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <TextField
              name="siteName"
              label="Enter site name"
              value={siteName || (initialPlan ? initialPlan.site_name : '')}
              onChange={handleSiteName}
              size="small"
            />
            <Divider />

            {selectedId && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Selected Element
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Label />}
                  onClick={addLabelToSelected}
                  sx={{ mb: 1 }}
                >
                  Add/Edit Label
                </Button>
                <Chip
                  label={selectedElement?.type || 'Unknown'}
                  color="primary"
                  variant="outlined"
                  sx={{ width: '100%', mb: 1 }}
                />
                {selectedElement?.label && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                    "{selectedElement.label}"
                  </Typography>
                )}
              </Box>
            )}

            <Divider />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Grid & Display
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    Show Grid
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  Grid Size
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current: {gridSize}px
                </Typography>
                <Slider
                  value={gridSize}
                  onChange={(e, val) => setGridSize(val)}
                  min={10}
                  max={50}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}px`}
                  sx={{ mt: 2 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  🔍 Zoom Level
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current: {Math.round(zoom * 100)}%
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  <IconButton
                    onClick={() => setZoom((p) => Math.max(0.25, p - 0.25))}
                    size="medium"
                    sx={{ border: 1, borderColor: 'divider' }}
                  >
                    <ZoomOut />
                  </IconButton>

                  <Button
                    onClick={() => setZoom(1)}
                    variant="outlined"
                    size="small"
                    sx={{ flex: 1 }}
                  >
                    Reset to 100%
                  </Button>

                  <IconButton
                    onClick={() => setZoom((p) => Math.min(3, p + 0.25))}
                    size="medium"
                    sx={{ border: 1, borderColor: 'divider' }}
                  >
                    <ZoomIn />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Undo />}
                  onClick={undo}
                  disabled={historyStep <= 0}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Undo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Redo />}
                  onClick={redo}
                  disabled={historyStep >= history.length - 1}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Redo
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={deleteSelected}
                  disabled={!selectedId}
                  size="small"
                  sx={{ flex: 1 }}
                >
                  Delete
                </Button>
              </Box>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                Save Venue Plan
              </Button>
            </Box>
          </Paper>

          <Box
            ref={containerRef}
            sx={{
              flexGrow: 1,
              p: 3,
              backgroundColor: '#f8f9fa',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
              }}
            >
              <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                onDblClick={handleDoubleClick}
                scaleX={zoom}
                scaleY={zoom}
              >
                <Layer>
                  {renderGrid()}
                  {elements.map((el, i) => renderElement(el, i))}
                  {currentElement && renderElement(currentElement, -1)}
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                </Layer>
              </Stage>
            </Paper>
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={labelDialogOpen}
        onClose={() => setLabelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Label</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Label Text"
            fullWidth
            variant="outlined"
            value={currentLabel}
            onChange={(e) => setCurrentLabel(e.target.value)}
            placeholder="e.g., VIP Zone, Fan Zone, Stage, etc."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLabelSave();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLabelDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLabelSave} variant="contained">
            Save Label
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const getToolIcon = (tool) => {
  switch (tool) {
    case TOOLS.SELECT:
      return <Edit />;
    case TOOLS.RECTANGLE:
      return <Square />;
    case TOOLS.CIRCLE:
      return <CircleIcon />;
    case TOOLS.LINE:
      return <Straighten />;
    case TOOLS.SEAT:
      return <Chair />;
    case TOOLS.TABLE:
      return <TableRestaurant />;
    case TOOLS.ENTRANCE:
      return <DoorFront />;
    case TOOLS.RESTROOM:
      return <LocalCafe />;
    case TOOLS.TEXT:
      return <TextFields />;
    default:
      return <Edit />;
  }
};

export default VenuePlanBuilder;
