// SeatIcon.tsx
import React from "react";
import { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";

export type SeatState = "available" | "reserved" | "selected";

interface Props {
  cx: number;
  cy: number;
  r: number;
  state?: SeatState;
  id?: string;
  showOutline?: boolean;
}

const SeatIcon: React.FC<Props> = ({ cx, cy, r, state = "available", showOutline = true }) => {
  // colors for style A
  const colors = {
    available: { outer: "#0abde3", inner: "#9ee9f8" },
    reserved: { outer: "#ff6b6b", inner: "#ffb4a2" },
    selected: { outer: "#54a0ff", inner: "#a8d0ff" },
  };

  const col = colors[state];

  // small 3D-ish circle using radial gradient
  return (
    <G>
      <Defs>
        <RadialGradient id={`grad-${cx}-${cy}-${r}`} cx="50%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={col.inner} stopOpacity="1" />
          <Stop offset="100%" stopColor={col.outer} stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* outer shadow */}
      <Circle cx={cx + 1.5} cy={cy + 2} r={r + 1.1} fill="#000" opacity={0.08} />

      {/* main seat */}
      <Circle cx={cx} cy={cy} r={r} fill={`url(#grad-${cx}-${cy}-${r})`} />

      {/* optional outline */}
      {showOutline && (
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={state === "reserved" ? "#8e2e2e" : "#2b394a"}
          strokeWidth={state === "selected" ? 2.6 : 1.2}
          opacity={state === "available" ? 0.9 : 1}
        />
      )}
    </G>
  );
};

export default SeatIcon;
