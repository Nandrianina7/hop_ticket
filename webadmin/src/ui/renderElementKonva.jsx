import React from 'react';
import { Rect, Circle, Line, Text, Group } from 'react-konva';

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

const renderElementKonva = (
  element,
  {
    selectedId = null,
    onElementClick = () => {},
    draggable = false,
    onUpdate = () => {}, // 👈 new prop to push updates to parent
  } = {}
) => {
  const isSelected = element.id === selectedId;

  const baseProps = {
    id: element.id,
    onClick: (e) => {
      e.cancelBubble = true;
      onElementClick(e);
    },
    onTap: (e) => {
      e.cancelBubble = true;
      onElementClick(e);
    },
    draggable,
    onDragEnd: (e) => {
      const node = e.target;
      onUpdate({
        ...element,
        x: node.x(),
        y: node.y(),
      });
    },
  };

  switch (element.type) {
    case TOOLS.RECTANGLE:
      return (
        <Group key={element.id}>
          <Rect
            {...baseProps}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={isSelected ? '#ff4081' : element.stroke}
            strokeWidth={isSelected ? 3 : element.strokeWidth}
          />
          {element.label && (
            <Text
              x={element.x}
              y={element.y}
              text={element.label}
              fontSize={element.fontSize ?? 14}
              fill="#000000"
              align="center"
              verticalAlign="middle"
              width={element.width}
              height={element.height}
              listening={false}
            />
          )}
        </Group>
      );

    case TOOLS.CIRCLE:
      return (
        <Group key={element.id}>
          <Circle
            {...baseProps}
            x={element.x}
            y={element.y}
            radius={element.radius}
            fill={element.fill}
            stroke={isSelected ? '#ff4081' : element.stroke}
            strokeWidth={isSelected ? 3 : element.strokeWidth}
          />
          {element.label && (
            <Text
              x={element.x - element.radius}
              y={element.y - element.radius / 2}
              text={element.label}
              fontSize={element.fontSize ?? 12}
              fill="#000000"
              width={element.radius * 2}
              align="center"
              listening={false}
            />
          )}
        </Group>
      );

    case TOOLS.LINE:
      return (
        <Line
          key={element.id}
          {...baseProps}
          points={element.points}
          stroke={element.fill}
          strokeWidth={element.strokeWidth}
        />
      );

    case TOOLS.SEAT:
      return (
        <Group key={element.id}>
          <Circle
            {...baseProps}
            x={element.x}
            y={element.y}
            radius={element.radius}
            fill={element.fill}
            stroke={isSelected ? '#ff4081' : element.stroke}
            strokeWidth={isSelected ? 3 : element.strokeWidth}
          />
          <Text
            x={element.x - (element.radius || 8)}
            y={element.y - (element.radius || 8) / 2}
            text={element.label}
            fontSize={10}
            fill="#ffffff"
            width={(element.radius || 8) * 2}
            align="center"
            listening={false}
          />
        </Group>
      );

    case TOOLS.TABLE:
      return (
        <Group key={element.id}>
          <Rect
            {...baseProps}
            x={element.x - (element.width || 40) / 2}
            y={element.y - (element.height || 30) / 2}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={isSelected ? '#ff4081' : element.stroke}
            strokeWidth={isSelected ? 3 : element.strokeWidth}
          />
          <Text
            x={element.x - (element.width || 40) / 2}
            y={element.y - (element.height || 30) / 2}
            text={element.label}
            fontSize={12}
            fill="#000000"
            width={element.width}
            height={element.height}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </Group>
      );

    case TOOLS.ENTRANCE:
    case TOOLS.RESTROOM:
      return (
        <Group key={element.id}>
          <Rect
            {...baseProps}
            x={element.x - (element.width || 30) / 2}
            y={element.y - (element.height || 20) / 2}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={isSelected ? '#ff4081' : element.stroke}
            strokeWidth={isSelected ? 3 : element.strokeWidth}
          />
          <Text
            x={element.x - (element.width || 30) / 2}
            y={element.y - (element.height || 20) / 2}
            text={element.label || (element.type === TOOLS.ENTRANCE ? 'ENTRANCE' : 'RESTROOM')}
            fontSize={element.fontSize ?? 10}
            fill="#000000"
            width={element.width}
            height={element.height}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </Group>
      );

    case TOOLS.TEXT:
      return (
        <Text
          key={element.id}
          {...baseProps}
          x={element.x}
          y={element.y}
          text={element.text}
          fontSize={element.fontSize ?? 16}
          fill={element.fill ?? '#000000'}
        />
      );

    default:
      return null;
  }
};

export default renderElementKonva;
