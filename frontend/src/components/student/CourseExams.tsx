import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Exam = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  batch: { name: string };
};

type Props = {
  courseId: string;
  onBack: () => void;
};

const fetchExams = async (courseId: string): Promise<Exam[]> => {
  const { data } = await axios.get(
    `http://localhost:5000/api/student/courses/${courseId}/exams`,  // ✅ correct path
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }
  );
  return data.exams;
};


const CourseExams = ({ courseId, onBack }: Props) => {
  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['courseExams', courseId],
    queryFn: () => fetchExams(courseId),
  });

  if (isLoading) return <div>Loading exams...</div>;
  if (error) return <div>Failed to load exams.</div>;

  const now = new Date();

  return (
    <div className="cards-grid">
      <button className="btn" onClick={onBack}>
        ← Back to Courses
      </button>
      {exams.map((exam) => {
        const isStarted = new Date(exam.startTime) <= now;
        const isEnded = new Date(exam.endTime) < now;

        return (
          <div key={exam._id} className="card">
            <h3>{exam.title}</h3>
            <p>Batch: {exam.batch?.name}</p>
            <p>
              {new Date(exam.startTime).toLocaleString()} →{' '}
              {new Date(exam.endTime).toLocaleString()}
            </p>
            <button className="btn" disabled={!isStarted || isEnded}>
              {isEnded ? 'Closed' : isStarted ? 'Submit Answers' : 'Not Started'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CourseExams;
