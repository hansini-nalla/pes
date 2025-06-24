import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

const DashboardOverview = () => {
  const token = localStorage.getItem('token');

  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['upcomingExams'],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:${PORT}/api/student/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data?.exams || [];
    },
  });

  const { data: evaluations = [], isLoading: evalsLoading } = useQuery({
    queryKey: ['pendingEvaluations'],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:${PORT}/api/student/pending-evaluations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data?.evaluations || data?.evaluatees || [];
    },
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['evaluationResults'],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:${PORT}/api/student/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data?.results || [];
    },
  });

  return (
    <div className="cards-grid">
      {/* Upcoming Exams */}
      <div className="card">
        <h3>Upcoming Exams</h3>
        {examsLoading ? (
          <p>Loading...</p>
        ) : exams.length === 0 ? (
          <p>No upcoming exams</p>
        ) : (
          <ul>
            {exams.slice(0, 3).map((exam) => (
              <li key={exam._id}>
                {exam.title} - {new Date(exam.startTime).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pending Evaluations */}
      <div className="card">
        <h3>Peer Evaluations</h3>
        {evalsLoading ? (
          <p>Loading...</p>
        ) : (
          <p>You have {evaluations.length} peer reviews pending.</p>
        )}
      </div>

      {/* Recent Grades */}
      <div className="card">
        <h3>Recent Grades</h3>
        {resultsLoading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <p>No evaluation results available.</p>
        ) : (
          <ul>
            {results.slice(0, 3).map((r: any) => (
              <li key={r.exam._id}>
                {r.exam.courseName}: {r.averageMarks}/100
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
