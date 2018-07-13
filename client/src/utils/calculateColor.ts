export interface CalculateGradeOptions {
  inverted?: boolean
}

export function calculateGrade (val: number, max: number, {
  inverted = false
}: CalculateGradeOptions = {}) {

  if (inverted) {
    val = max - val;
  }

  if (val <= 1.2) {
    return 'wqp-rating-0';
  } else if (val <= 2) {
    return 'wqp-rating-1';
  } else if (val <= 3) {
    return 'wqp-rating-2';
  } else if (val <= 3.8) {
    return 'wqp-rating-3';
  } else if (val <= 4.4) {
    return 'wqp-rating-4';
  } else {
    return 'wqp-rating-5';
  }
}
