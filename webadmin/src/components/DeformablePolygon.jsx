import React, { useState } from 'react';
import { Shape, Circle, Line, Group } from 'react-konva';

export const DeformablePolygon = ({
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  points: initialPoints,
  isEditing = false,
  onUpdate,
  fill = '#ccc',
  stroke = '#000',
  strokeWidth = 2,
  ...rest
}) => {
  const [points, setPoints] = useState(
    initialPoints || [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ]
  );

  const updatePoint = (index, newPos) => {
    const newPoints = [...points];
    newPoints[index] = newPos;
    setPoints(newPoints);
    onUpdate?.({ points: newPoints });
  };

  return (
    <Group x={x} y={y}>
      {/* Main polygon */}
      <Shape
        sceneFunc={(ctx, shape) => {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        {...rest}
      />

      {/* Editing controls */}
      {isEditing && (
        <>
          {points.map((p, i) => (
            <Circle
              key={i}
              x={p.x}
              y={p.y}
              radius={6}
              fill="white"
              stroke="#2196f3"
              strokeWidth={2}
              draggable
              onDragMove={(e) => updatePoint(i, { x: e.target.x(), y: e.target.y() })}
            />
          ))}

          <Line
            points={points.flatMap((p) => [p.x, p.y]).concat([points[0].x, points[0].y])}
            stroke="#2196f3"
            strokeWidth={1}
            dash={[4, 4]}
          />
        </>
      )}
    </Group>
  );
};
