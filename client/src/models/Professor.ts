export interface MissingProfessor {
  isMissing: true;
  name: string;
  quality: null;
  easiness: null;
  count: null;
  url: null
}

export interface FoundProfessor {
  isMissing: false;
  name: string;
  quality: string;
  easiness: string;
  count: number;
  url: string;
}

export type Professor = MissingProfessor | FoundProfessor;
