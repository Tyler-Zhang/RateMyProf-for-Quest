export interface ProfessorMetric {
  name: string;
  desc: string;
  key: string;
  colored: boolean;
  decimal: boolean;
  colored_inverted?: boolean;
  offset?: number;
}
