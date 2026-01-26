// SeatItem.tsx
import React from "react";
import { G, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
// import { Seat } from "./types.ts";

export type SeatState = "available" | "reserved" | "selected";

interface Props {
  cx: number;
  cy: number;
  r: number;
  state?: SeatState;
  onPress?: () => void;
  id?: string;
}

const SeatItem: React.FC<Props> = ({ cx, cy, r, state = "available", onPress }) => {
  const colors = {
    // Available: white seat with subtle outline
    available: { inner: "#ffffff", outer: "#f5f5f5", outline: "#9e9e9e" },
    // Reserved: error palette (red)
    reserved: { inner: "#ffffff", outer: "#d32f2f", outline: "#8b1a1a" },
    // Selected: primary palette (blue)
    selected: { inner: "#ffffff", outer: "#d32f2f", outline: "#8b1a1a" },
  }[state];

  const gradId = `g-${Math.round(cx)}-${Math.round(cy)}-${Math.round(r)}`;

  

  return (
    <G onPress={onPress}>
      <Defs>
        <RadialGradient id={gradId} cx="40%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={colors.inner} stopOpacity="1" />
          <Stop offset="100%" stopColor={colors.outer} stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* soft shadow */}
      <Circle cx={cx + 1} cy={cy + 2} r={r + 1} fill="#000" opacity={0.06} />

      {/* main */}
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${gradId})`} />

      {/* outline */}
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.outline} strokeWidth={state === "selected" ? 2.4 : 1.2} />
    </G>
  );
};

export default SeatItem;
