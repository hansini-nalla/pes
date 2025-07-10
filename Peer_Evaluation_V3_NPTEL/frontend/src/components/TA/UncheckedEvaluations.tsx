import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Evaluation {
  _id: string;
  evaluatee: {
    name: string;
    email: string;
  };
  exam: {
    title: string;
    course: {
      name: string;
      code: string;
    };
  };
}

interface UncheckedEvaluationsProps {
  currentPalette: Record<string, string>;
  commonCardClasses: string;
  getCardStyles: () => React.CSSProperties;
}

const UncheckedEvaluations: React.FC<UncheckedEvaluationsProps> = ({
  currentPalette,
  commonCardClasses,
  getCardStyles,
}) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await axios.get('/api/ta/unchecked-evaluations', {
          withCredentials: true,
        });

        const data = response.data?.uncheckedEvaluations ?? [];
        setEvaluations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch unchecked evaluations.');
        setEvaluations([]); // fallback to empty array to avoid undefined errors
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: currentPalette['accent-purple'] }}>
          Unchecked Evaluations
        </h2>
        <div className="w-full max-w-4xl">
          <div className={commonCardClasses} style={getCardStyles()}>
            <div className="flex justify-center py-6">
              <div
                className="animate-spin rounded-full h-10 w-10 border-b-2"
                style={{ borderColor: currentPalette['accent-purple'] }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start w-full h-full pt-10 pb-4">
      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: currentPalette['accent-purple'] }}>
        Unchecked Evaluations
      </h2>
      <div className="w-full max-w-4xl">
        <div className={commonCardClasses} style={getCardStyles()}>
          {error || evaluations.length === 0 ? (
            <p className="text-center" style={{ color: currentPalette['text-muted'] }}>
              {error ?? 'No Flagged Evaluations'}
            </p>
          ) : (
            <ul className="space-y-4">
              {evaluations.map((evaluation) => (
                <li key={evaluation._id} className={commonCardClasses} style={getCardStyles()}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p style={{ color: currentPalette['text-muted'] }}>Student:</p>
                      <p className="font-semibold" style={{ color: currentPalette['text-dark'] }}>
                        {evaluation.evaluatee.name}
                      </p>
                      <p className="text-sm" style={{ color: currentPalette['text-muted'] }}>
                        {evaluation.evaluatee.email}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: currentPalette['text-muted'] }}>Exam:</p>
                      <p className="font-semibold" style={{ color: currentPalette['text-dark'] }}>
                        {evaluation.exam.title}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: currentPalette['text-muted'] }}>Course:</p>
                      <p className="font-semibold" style={{ color: currentPalette['text-dark'] }}>
                        {evaluation.exam.course.name}
                      </p>
                      <p className="text-sm" style={{ color: currentPalette['text-muted'] }}>
                        Code: {evaluation.exam.course.code}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-4">{/* Add Evaluate button here if needed */}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UncheckedEvaluations;