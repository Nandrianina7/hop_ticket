import React, { useState } from 'react';
import { Circle, Rect, RegularPolygon, Shape, Line, Group } from 'react-konva';
import { SHAPE_TYPES } from './shapeType';
import { DeformablePolygon } from './DeformablePolygon';

export const renderShape = (shapeType, props) => {
  const {
    id,
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    fill = '#ccc',
    stroke = '#000',
    strokeWidth = 2,
    opacity = 1,
    rotation = 0,
    cornerRadius = 0,
    points: initialPoints,
    isEditing = false,
    onUpdate,
    draggable = true,
    onClick,
    onTap,
    onContextMenu,
    onDragEnd,
    ...rest
  } = props;

  const commonProps = {
    id,
    fill,
    stroke,
    strokeWidth,
    opacity,
    rotation,
    draggable,
    onClick,
    onTap,
    onContextMenu,
    onDragEnd,
    ...rest,
  };

  // --- Deformable Polygon Renderer ---
  
  // --- Existing Shapes ---
  switch (shapeType) {
    case SHAPE_TYPES.RECTANGLE:
      return <Rect x={x} y={y} width={width} height={height} cornerRadius={cornerRadius} {...commonProps} />;
    case SHAPE_TYPES.DEFORMABLE_QUAD:
      return <DeformablePolygon {...props} />;
    case SHAPE_TYPES.TRAPEZOID:
      return (
        <Shape
          x={x}
          y={y}
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            ctx.moveTo(width * 0.2, 0);
            ctx.lineTo(width * 0.8, 0);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.PARALLELOGRAM:
      return (
        <Shape
          x={x}
          y={y}
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            ctx.moveTo(width * 0.2, 0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width * 0.8, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.CIRCLE:
      return <Circle x={x + width / 2} y={y + height / 2} radius={Math.min(width, height) / 2} {...commonProps} />;

    case SHAPE_TYPES.TRIANGLE:
      return <RegularPolygon x={x + width / 2} y={y + height / 2} sides={3} radius={Math.min(width, height) / 2} {...commonProps} />;

    case SHAPE_TYPES.PENTAGON:
      return <RegularPolygon x={x + width / 2} y={y + height / 2} sides={5} radius={Math.min(width, height) / 2} {...commonProps} />;

    case SHAPE_TYPES.HEXAGON:
      return <RegularPolygon x={x + width / 2} y={y + height / 2} sides={6} radius={Math.min(width, height) / 2} {...commonProps} />;

    case SHAPE_TYPES.OCTAGON:
      return <RegularPolygon x={x + width / 2} y={y + height / 2} sides={8} radius={Math.min(width, height) / 2} {...commonProps} />;

    case SHAPE_TYPES.STAR:
      return (
        <Shape
          x={x}
          y={y}
          sceneFunc={(ctx, shape) => {
            const centerX = width / 2;
            const centerY = height / 2;
            const outerR = Math.min(width, height) / 2;
            const innerR = outerR * 0.4;
            const pointsNum = 5;
            let rot = Math.PI / 2 * 3;
            const step = Math.PI / pointsNum;
            ctx.beginPath();
            for (let i = 0; i < pointsNum; i++) {
              ctx.lineTo(centerX + Math.cos(rot) * outerR, centerY + Math.sin(rot) * outerR);
              rot += step;
              ctx.lineTo(centerX + Math.cos(rot) * innerR, centerY + Math.sin(rot) * innerR);
              rot += step;
            }
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.CROSS:
      return (
        <Shape
          sceneFunc={(ctx, shape) => {
            const barWidth = width * 0.2;
            const barHeight = height * 0.2;
            ctx.beginPath();
            ctx.rect(x, y + height / 2 - barHeight / 2, width, barHeight);
            ctx.rect(x + width / 2 - barWidth / 2, y, barWidth, height);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          {...commonProps}
        />
      );

    default:
      return <Rect x={x} y={y} width={width} height={height} cornerRadius={cornerRadius} {...commonProps} />;
  }
};