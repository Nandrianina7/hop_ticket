import React from "react";
import { G, Rect, Circle, Ellipse, Polygon, Path, Text as SvgText } from "react-native-svg";
import { Section } from "./type";

interface Props {
  section: Section;
  scaledX: number;
  scaledY: number;
  scaledW: number;
  scaledH: number;
  onPress?: () => void;
}

const SectionItem: React.FC<Props> = ({ section, scaledX, scaledY, scaledW, scaledH, onPress }) => {
  const color = section.color ?? "#e6eef7";
  const strokeColor = "#ccd8e4";
  const opacity = 0.86;
  const rotation = section.rotation || 0;
  
  // Calculate center for shapes that need it
  const centerX = scaledX + scaledW / 2;
  const centerY = scaledY + scaledH / 2;

  const renderShape = () => {
    const shapeType = section.shapeType?.toLowerCase() || "rectangle";

    switch (shapeType) {
      case "circle":
        return (
          <Circle
            cx={centerX}
            cy={centerY}
            r={Math.min(scaledW, scaledH) / 2}
            fill={color}
            opacity={opacity}
            stroke={strokeColor}
            strokeWidth={1.4}
            onPress={onPress}
          />
        );

      case "ellipse":
        return (
          <Ellipse
            cx={centerX}
            cy={centerY}
            rx={scaledW / 2}
            ry={scaledH / 2}
            fill={color}
            opacity={opacity}
            stroke={strokeColor}
            strokeWidth={1.4}
            onPress={onPress}
          />
        );

      case "triangle":
        const trianglePoints = [
          [scaledX + scaledW / 2, scaledY],
          [scaledX, scaledY + scaledH],
          [scaledX + scaledW, scaledY + scaledH]
        ].map(p => p.join(',')).join(' ');
        
        return (
          <Polygon
            points={trianglePoints}
            fill={color}
            opacity={opacity}
            stroke={strokeColor}
            strokeWidth={1.4}
            onPress={onPress}
          />
        );

      case "pentagon":
        // Calculate pentagon points
        const pentagonPoints = [];
        const sides = 5;
        const angleStep = (Math.PI * 2) / sides;
        const radius = Math.min(scaledW, scaledH) / 2;
        
        for (let i = 0; i < sides; i++) {
          // Start from top (-90 degrees offset)
          const angle = i * angleStep - Math.PI / 2;
          const px = centerX + radius * Math.cos(angle);
          const py = centerY + radius * Math.sin(angle);
          pentagonPoints.push([px, py]);
        }
        
        const pentagonPointsStr = pentagonPoints.map(p => p.join(',')).join(' ');
        
        return (
          <Polygon
            points={pentagonPointsStr}
            fill={color}
            opacity={opacity}
            stroke={strokeColor}
            strokeWidth={1.4}
            onPress={onPress}
          />
        );

      case "hexagon":
        const hexagonPoints = [];
        const hexSides = 6;
        const hexAngleStep = (Math.PI * 2) / hexSides;
        const hexRadius = Math.min(scaledW, scaledH) / 2;
        
        for (let i = 0; i < hexSides; i++) {
          const angle = i * hexAngleStep - Math.PI / 2;
          const px = centerX + hexRadius * Math.cos(angle);
          const py = centerY + hexRadius * Math.sin(angle);
          hexagonPoints.push([px, py]);
        }
        
        const hexagonPointsStr = hexagonPoints.map(p => p.join(',')).join(' ');
        
        return (
          <Polygon
            points={hexagonPointsStr}
            fill={color}
            opacity={opacity}
            stroke={strokeColor}
            strokeWidth={1.4}
            onPress={onPress}
          />
        );

      case "star":
        const starPoints = [];
        const outerRadius = Math.min(scaledW, scaledH) / 2;
        const innerRadius = outerRadius * 0.4;
        const points_count = 5;
        
        for (let i = 0; i < points_count * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / points_count - Math.PI / 2;
          const px = centerX + radius * Math.cos(angle);
          const py = centerY + radius * Math.sin(angle);
          starPoints.push([px, py]);
        }
        
        const starPointsStr = starPoints.map(p => p.join(',')).join(' ');
        
        return (
          <Polygon
            points={starPointsStr}
            fill={color}
            opacity={opacity}
            stroke={strokeColor}
            strokeWidth={1.4}
            onPress={onPress}
          />
        );

      case "rectangle":
      default:
        // Handle rotated rectangle if needed
        if (rotation !== 0) {
          const halfW = scaledW / 2;
          const halfH = scaledH / 2;
          const cos = Math.cos(rotation * Math.PI / 180);
          const sin = Math.sin(rotation * Math.PI / 180);
          
          const corners = [
            [-halfW, -halfH],
            [halfW, -halfH],
            [halfW, halfH],
            [-halfW, halfH]
          ].map(([x, y]) => [
            centerX + x * cos - y * sin,
            centerY + x * sin + y * cos
          ]);
          
          const rectPoints = corners.map(p => p.join(',')).join(' ');
          
          return (
            <Polygon
              points={rectPoints}
              fill={color}
              opacity={opacity}
              stroke={strokeColor}
              strokeWidth={1.4}
              onPress={onPress}
            />
          );
        }
        
        // Default rectangle (your existing code)
        return (
          <Rect
            x={scaledX}
            y={scaledY}
            width={scaledW}
            height={scaledH + (section.type === "section" ? 5 : 0)} // Keep your +5 adjustment
            rx={4}
            fill={color}
            opacity={opacity}
            stroke={strokeColor}
            strokeWidth={1.4}
            onPress={onPress}
          />
        );
    }
  };

  // Only render text for shapes that make sense to have text
  const shouldRenderText = () => {
    // Don't render text on very small shapes
    if (scaledW < 40 || scaledH < 30) return false;
    
    // You might want to skip text for certain shape types
    const shapeType = section.shapeType?.toLowerCase();
    return !["star", "triangle"].includes(shapeType || "");
  };

  return (
    <G onPress={onPress}>
      {renderShape()}
      
      {/* Add section name text if it exists and shape is large enough */}
      {section.name && shouldRenderText() && (
        <SvgText
          x={centerX}
          y={centerY}
          fontSize={Math.max(12, Math.min(18, scaledW * 0.09))}
          fontWeight="700"
          fill="#1f2d3d"
          textAnchor="middle"
          alignmentBaseline="middle"
          opacity={section.type === "section" ? 0.8 : 1}
        >
          {section.name}
        </SvgText>
      )}
    </G>
  );
};

export default SectionItem;