import { useEffect, useState } from 'react';
import axios from 'axios';

interface ExamInfo {
    _id: string;
    title: string;
    startTime?: string;
    courseName?: string;
}

interface Result {
    exam: ExamInfo;
    averageMarks: string | null;
    marks: number[][];
    feedback: string[];
}

const ViewMarks = () => {
    const [marks, setMarks] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated');
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('http://localhost:5000/api/student/results', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMarks(res.data.results || []);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Failed to fetch marks'
                );
            } finally {
                setLoading(false);
            }
        };
        fetchMarks();
    }, []);

    if (loading) return <p className="text-center text-gray-500">Loading marks...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-center text-indigo-600">My Marks</h2>
            {marks.length === 0 ? (
                <p className="text-center text-gray-500">No marks available.</p>
            ) : (
                <ul className="space-y-4">
                    {marks.map((result, idx) => (
                        <li key={idx} className="border-b pb-2">
                            <div>
                                <span className="font-semibold">Course:</span> {result.exam?.courseName || 'Course'}
                            </div>
                            <div>
                                <span className="font-semibold">Exam:</span> {result.exam?.title || 'Exam'}
                                {result.exam?.startTime && (
                                    <span className="ml-2 text-gray-400 text-sm">
                                        ({result.exam.startTime.slice(0, 10)})
                                    </span>
                                )}
                            </div>
                            <div>
                                <span className="font-semibold">Average Marks:</span> {result.averageMarks}
                            </div>
                            <div>
                                <span className="font-semibold">All Marks:</span>{" "}
                                {Array.isArray(result.marks)
                                    ? result.marks.map((m, i) => (
                                        <span key={i}>
                                            [{Array.isArray(m) ? m.join(", ") : m}]
                                            {i < result.marks.length - 1 ? "; " : ""}
                                        </span>
                                    ))
                                    : result.marks}
                            </div>
                            <div>
                                <span className="font-semibold">Feedback:</span>{" "}
                                {Array.isArray(result.feedback)
                                    ? result.feedback.join("; ")
                                    : result.feedback}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewMarks;