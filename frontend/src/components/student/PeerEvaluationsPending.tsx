import { useEffect, useState } from "react";
import axios from "axios";

interface Evaluation {
    _id: string;
    exam: {
        title: string;
    };
    evaluatee: {
        name: string;
        email: string;
    };
}

const PeerEvaluationsPending = () => {
    const [pending, setPending] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPending = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/student/pending-evaluations", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(res.data);
                setPending(res.data.evaluations || []);
            } catch (err: any) {
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Failed to fetch pending evaluations"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchPending();
    }, []);

    if (loading) return <div className="card">Loading pending evaluations...</div>;
    if (error) return <div className="card text-red-500">{error}</div>;

    return (
        <div className="card">
            <h2>Pending Peer Evaluations</h2>
            {pending.length === 0 ? (
                <p>No pending evaluations</p>
            ) : (
                <ul>
                    {pending.map((ev) => (
                        <li key={ev._id} style={{ marginBottom: 12 }}>
                            <strong>Exam:</strong> {ev.exam.title}
                            <br />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PeerEvaluationsPending;