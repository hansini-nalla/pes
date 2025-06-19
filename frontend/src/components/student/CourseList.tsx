import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Course = {
  _id: string;
  name: string;
  code: string;
};

type Props = {
  onSelectCourse: (courseId: string) => void;
};

const fetchCourses = async (): Promise<Course[]> => {
  const { data } = await axios.get('http://localhost:5000/api/student/courses', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return data.courses;
};

const CourseList = ({ onSelectCourse }: Props) => {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['studentCourses'],
    queryFn: fetchCourses,
  });

  if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error loading courses</div>;

  return (
    <div className="cards-grid">
      {courses && courses.map((course) => (
        <div key={course._id} className="card">
          <h3>{course.name}</h3>
          <p>{course.code}</p>
          <button className="btn" onClick={() => onSelectCourse(course._id)}>
            View Exams
          </button>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
