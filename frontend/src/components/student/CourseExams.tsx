import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useRef } from 'react';

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
    `http://localhost:5000/api/student/courses/${courseId}/exams`,
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

  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (examId: string) => {
    setActiveExamId(examId);
    setUploadMsg(null);
    setSelectedFile(null);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (examId: string) => {
    if (!selectedFile) {
      setUploadMsg('Please select a PDF file.');
      return;
    }
    setUploadMsg('Uploading...');
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('examId', examId);
      await axios.post(
        'http://localhost:5000/api/student/submit-answer',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUploadMsg('Submission successful!');
      setActiveExamId(null);
      setSelectedFile(null);
    } catch (err: any) {
      setUploadMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Submission failed.'
      );
    }
  };

  if (isLoading) return <div>Loading exams...</div>;
  if (error) return <div>Failed to load exams.</div>;

  const now = new Date();

  return (
    <div className="cards-grid">
      <button className="btn" onClick={onBack}>
        ← Back to Courses
      </button>
      {exams && exams.map((exam) => {
        const isStarted = new Date(exam.startTime) <= now;
        const isEnded = new Date(exam.endTime) < now;
        const canSubmit = isStarted && !isEnded;

        return (
          <div key={exam._id} className="card">
            <h3>{exam.title}</h3>
            <p>Batch: {exam.batch?.name}</p>
            <p>
              {new Date(exam.startTime).toLocaleString()} →{' '}
              {new Date(exam.endTime).toLocaleString()}
            </p>
            <button
              className="btn"
              disabled={!canSubmit}
              onClick={() => handleButtonClick(exam._id)}
            >
              {isEnded ? 'Closed' : isStarted ? 'Submit Answers' : 'Not Started'}
            </button>
            {activeExamId === exam._id && canSubmit && (
              <div style={{ marginTop: 12 }}>
                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  className="btn"
                  style={{ marginLeft: 8 }}
                  onClick={() => handleSubmit(exam._id)}
                >
                  {selectedFile ? 'Upload PDF' : 'Choose PDF'}
                </button>
                {selectedFile && <span style={{ marginLeft: 8 }}>{selectedFile.name}</span>}
                {uploadMsg && <div style={{ marginTop: 8 }}>{uploadMsg}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CourseExams;