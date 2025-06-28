import { Types } from 'mongoose';

interface EvaluationAssignment {
  exam: string;
  evaluator: string;
  evaluatee: string;
  marks: number[];
  feedback: string;
  status: 'pending';
  flagged: boolean;
}

export function assignBalancedEvaluations(
  examId: string,
  studentIds: string[],
  k: number
): EvaluationAssignment[] {
  if (k < 1 || k >= studentIds.length) {
    throw new Error("Invalid 'k' value. Must be >=1 and < number of students.");
  }

  const n = studentIds.length;
  const shuffled = [...studentIds].sort(() => Math.random() - 0.5);

  const assignments: EvaluationAssignment[] = [];

  // Initialize a map to track how many times a student has been evaluated
  const evaluationCount: Record<string, number> = {};
  shuffled.forEach((id) => (evaluationCount[id] = 0));

  for (let i = 0; i < n; i++) {
    const evaluator = shuffled[i];
    let assigned = 0;
    let offset = 1;

    while (assigned < k && offset < n * 2) {
      const evaluatee = shuffled[(i + offset) % n];

      if (
        evaluatee !== evaluator &&
        evaluationCount[evaluatee] < k &&
        !assignments.find(
          (e) => e.evaluator === evaluator && e.evaluatee === evaluatee
        )
      ) {
        assignments.push({
          exam: examId,
          evaluator,
          evaluatee,
          marks: [],
          feedback: '',
          status: 'pending',
          flagged: false,
        });
        evaluationCount[evaluatee]++;
        assigned++;
      }
      offset++;
    }
  }

  // Final sanity check: all students should have exactly K evaluations
  for (const sid of studentIds) {
    if (evaluationCount[sid] !== k) {
      throw new Error(
        `Evaluation distribution failed. Student ${sid} has ${evaluationCount[sid]} evaluations instead of ${k}.`
      );
    }
  }

  return assignments;
}
