// SectionItem.tsx
import React from "react";
import { G, Rect, Text as SvgText } from "react-native-svg";
import { Section } from "./type";
// import { Section } from "./type";
// import { Section } from "./types";

interface Props {
  section: Section;
  scaledX: number;
  scaledY: number;
  scaledW: number;
  scaledH: number;
  onPress?: () => void;
}

const SectionItem: React.FC<Props> = ({ section, scaledX, scaledY, scaledW, scaledH, onPress }) => {
  return (
    <G onPress={onPress}>
      <Rect
        x={scaledX}
        y={scaledY}
        width={scaledW}
        height={scaledH+5}
        rx={4}
        fill={section.color ?? "#e6eef7"}
        opacity={0.86}
        stroke="#ccd8e4"
        strokeWidth={1.4}
      />
      <SvgText
        x={scaledX + scaledW / 2}
        y={scaledY + scaledH / 2 }
        fontSize={Math.max(12, Math.min(18, scaledW * 0.09))}
        fontWeight="700"
        fill="#1f2d3d"
        textAnchor="middle"
        alignmentBaseline="middle"
        opacity={section.type==="section" ? 0.8 : 1} 
      >
        {section.name}
      </SvgText>
    </G>
  );
};

export default SectionItem;
