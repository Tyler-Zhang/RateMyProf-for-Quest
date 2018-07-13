export interface ProfessorMetric {
  name: string;
  desc: string;
  key: string;
  colored: boolean;
  decimal: boolean;
  colorInverted?: boolean;
  offset?: number;
}
