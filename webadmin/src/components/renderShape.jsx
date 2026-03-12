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

  // Calculate center position
  const centerX = x + width / 2;
  const centerY = y + height / 2;

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

  // --- Existing Shapes ---
  switch (shapeType) {
    case SHAPE_TYPES.RECTANGLE:
      return (
        <Rect
          width={width}
          height={height}
          cornerRadius={cornerRadius}
          {...commonProps}
          offsetX={width / 2}
          offsetY={height / 2}
          x={centerX}
          y={centerY}
        />
      );
      
    case SHAPE_TYPES.DEFORMABLE_QUAD:
      return <DeformablePolygon {...props} />;
      
    case SHAPE_TYPES.TRAPEZOID:
      return (
        <Shape
          x={centerX}
          y={centerY}
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            ctx.moveTo(-width/2 + width * 0.2, -height/2);
            ctx.lineTo(-width/2 + width * 0.8, -height/2);
            ctx.lineTo(width/2, height/2);
            ctx.lineTo(-width/2, height/2);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.PARALLELOGRAM:
      return (
        <Shape
          x={centerX}
          y={centerY}
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            ctx.moveTo(-width/2 + width * 0.2, -height/2);
            ctx.lineTo(width/2, -height/2);
            ctx.lineTo(-width/2 + width * 0.8, height/2);
            ctx.lineTo(-width/2, height/2);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.CIRCLE:
      return (
        <Circle
          x={centerX}
          y={centerY}
          radius={Math.min(width, height) / 2}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.TRIANGLE:
      return (
        <RegularPolygon
          x={centerX}
          y={centerY}
          sides={3}
          radius={Math.min(width, height) / 2}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.PENTAGON:
      return (
        <RegularPolygon
          x={centerX}
          y={centerY}
          sides={5}
          radius={Math.min(width, height) / 2}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.HEXAGON:
      return (
        <RegularPolygon
          x={centerX}
          y={centerY}
          sides={6}
          radius={Math.min(width, height) / 2}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.OCTAGON:
      return (
        <RegularPolygon
          x={centerX}
          y={centerY}
          sides={8}
          radius={Math.min(width, height) / 2}
          {...commonProps}
        />
      );

    case SHAPE_TYPES.STAR:
      return (
        <Shape
          x={centerX}
          y={centerY}
          sceneFunc={(ctx, shape) => {
            const outerR = Math.min(width, height) / 2;
            const innerR = outerR * 0.4;
            const pointsNum = 5;
            let rot = (Math.PI / 2) * 3;
            const step = Math.PI / pointsNum;
            ctx.beginPath();
            for (let i = 0; i < pointsNum; i++) {
              ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
              rot += step;
              ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
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
          x={centerX}
          y={centerY}
          sceneFunc={(ctx, shape) => {
            const barWidth = width * 0.2;
            const barHeight = height * 0.2;
            ctx.beginPath();
            ctx.rect(-width/2, -barHeight/2, width, barHeight);
            ctx.rect(-barWidth/2, -height/2, barWidth, height);
            ctx.closePath();
            ctx.fillStrokeShape(shape);
          }}
          {...commonProps}
        />
      );

    default:
      return (
        <Rect
          x={centerX}
          y={centerY}
          width={width}
          height={height}
          cornerRadius={cornerRadius}
          offsetX={width / 2}
          offsetY={height / 2}
          {...commonProps}
        />
      );
  }
};