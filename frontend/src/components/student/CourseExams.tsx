import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useRef } from 'react';

type Exam = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  batch: { name: string };
  questions: {
    questionText: string;
    maxMarks: number;
  }[];
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
  const [viewingQuestions, setViewingQuestions] = useState<Exam | null>(null);
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

      {exams.map((exam) => {
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
              style={{ marginTop: 10 }}
              onClick={() => setViewingQuestions(exam)}
            >
              View Questions
            </button>

            <button
              className="btn"
              disabled={!canSubmit}
              onClick={() => handleButtonClick(exam._id)}
              style={{ marginTop: 8 }}
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
                {selectedFile && (
                  <span style={{ marginLeft: 8 }}>{selectedFile.name}</span>
                )}
                {uploadMsg && (
                  <div style={{ marginTop: 8 }}>{uploadMsg}</div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* 🧠 Question Modal */}
      {viewingQuestions && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setViewingQuestions(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 12,
              width: '90%',
              maxWidth: 600,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{viewingQuestions.title} - Questions</h2>
            <ol style={{ marginTop: 12 }}>
              {viewingQuestions.questions.map((q, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  {q.questionText} <em>({q.maxMarks} marks)</em>
                </li>
              ))}
            </ol>
            <button className="btn" style={{ marginTop: 16 }} onClick={() => setViewingQuestions(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseExams;
