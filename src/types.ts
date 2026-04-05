export type GraphType = 'general' | 'quadratic' | 'exponential' | 'logarithmic' | 'trigonometric';

export interface Params {
  a: number;
  b: number;
  h: number;
  k: number;
  reflectX: boolean;
  reflectY: boolean;
}

export interface SavedGraph {
  id: string;
  type: GraphType;
  params: Params;
  color: string;
}
