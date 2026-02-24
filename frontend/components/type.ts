// types.ts
export type Seat = {
  id: string;
  x: number; // relative to section
  y: number; // relative to section
  row: string;
  number: number;
  sectionId: string;
  seatSize: number;
};

export type Section = {
  id: string;
  name: string;
  color: string;
  x: number; // absolute on creator canvas
  y: number; // absolute on creator canvas
  width: number;
  height: number;
  rotation: number;
  seats: Seat[];
  type: "section" | "label";
  tier: string;
};

export type SeatingLayout = {
  sections: Section[];
  scale?: number;
  [k: string]: any;
};
