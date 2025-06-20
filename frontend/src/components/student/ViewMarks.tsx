import { useEffect, useState } from 'react';

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
                const res = await fetch('http://localhost:5000/api/student/results', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setMarks(data.results || []);
            } catch (err: any) {
                setError(
                    err.message || 'Failed to fetch marks'
                );
            } finally {
                setLoading(false);
            }
        };
        fetchMarks();
    }, []);

    const componentStyles = {
        container: {
            maxWidth: '900px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh',
            padding: '40px 20px',
            fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        },
        card: {
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            position: 'relative' as const,
            overflow: 'hidden' as const,
        },
        cardBefore: {
            content: "''",
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        },
        header: {
            fontSize: '2rem',
            fontWeight: '800',
            textAlign: 'center' as const,
            marginBottom: '40px',
            background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
        },
        loadingText: {
            textAlign: 'center' as const,
            color: '#4a5568',
            fontSize: '1.1rem',
            padding: '60px 0',
            fontWeight: '500',
        },
        errorText: {
            textAlign: 'center' as const,
            color: '#e53e3e',
            fontSize: '1.1rem',
            padding: '60px 0',
            fontWeight: '500',
            background: 'rgba(229, 62, 62, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(229, 62, 62, 0.2)',
        },
        noMarksText: {
            textAlign: 'center' as const,
            color: '#4a5568',
            fontSize: '1.1rem',
            padding: '60px 0',
            fontWeight: '500',
        },
        resultsList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '24px',
        },
        resultItem: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            position: 'relative' as const,
            overflow: 'hidden' as const,
        },
        resultItemHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
        },
        infoRow: {
            display: 'flex',
            flexWrap: 'wrap' as const,
            alignItems: 'center',
            marginBottom: '16px',
            fontSize: '0.95rem',
        },
        label: {
            fontWeight: '700',
            color: '#1a202c',
            marginRight: '8px',
            minWidth: '120px',
        },
        value: {
            color: '#4a5568',
            flex: 1,
        },
        dateText: {
            marginLeft: '12px',
            color: '#718096',
            fontSize: '0.85rem',
            fontStyle: 'italic',
        },
        marksContainer: {
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '8px',
            marginTop: '8px',
        },
        marksBadge: {
            background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(45, 55, 72, 0.3)',
        },
        feedbackText: {
            background: 'rgba(102, 126, 234, 0.05)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: '10px',
            padding: '16px',
            color: '#4a5568',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            fontStyle: 'italic',
            marginTop: '8px',
        },
        averageScore: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '700',
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        },
    };

    if (loading) return (
        <div style={componentStyles.container}>
            <div style={componentStyles.card}>
                <div style={componentStyles.cardBefore}></div>
                <p style={componentStyles.loadingText}>Loading marks...</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={componentStyles.container}>
            <div style={componentStyles.card}>
                <div style={componentStyles.cardBefore}></div>
                <p style={componentStyles.errorText}>{error}</p>
            </div>
        </div>
    );

    return (
        <div style={componentStyles.container}>
            <div style={componentStyles.card}>
                <div style={componentStyles.cardBefore}></div>
                <h2 style={componentStyles.header}>My Academic Results</h2>
                {marks.length === 0 ? (
                    <p style={componentStyles.noMarksText}>No examination results available at the moment.</p>
                ) : (
                    <ul style={componentStyles.resultsList}>
                        {marks.map((result, idx) => (
                            <li 
                                key={idx} 
                                style={componentStyles.resultItem}
                                onMouseEnter={(e) => {
                                    const target = e.currentTarget as HTMLElement;
                                    target.style.transform = 'translateY(-2px)';
                                    target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    const target = e.currentTarget as HTMLElement;
                                    target.style.transform = 'translateY(0)';
                                    target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                <div style={componentStyles.infoRow}>
                                    <span style={componentStyles.label}>Course:</span>
                                    <span style={componentStyles.value}>{result.exam?.courseName || 'Course'}</span>
                                </div>
                                
                                <div style={componentStyles.infoRow}>
                                    <span style={componentStyles.label}>Examination:</span>
                                    <span style={componentStyles.value}>
                                        {result.exam?.title || 'Exam'}
                                        {result.exam?.startTime && (
                                            <span style={componentStyles.dateText}>
                                                ({result.exam.startTime.slice(0, 10)})
                                            </span>
                                        )}
                                    </span>
                                </div>
                                
                                <div style={componentStyles.infoRow}>
                                    <span style={componentStyles.label}>Average Score:</span>
                                    <span style={componentStyles.averageScore}>
                                        {result.averageMarks || 'N/A'}
                                    </span>
                                </div>
                                
                                <div style={componentStyles.infoRow}>
                                    <span style={componentStyles.label}>Detailed Marks:</span>
                                    <div style={componentStyles.marksContainer}>
                                        {Array.isArray(result.marks)
                                            ? result.marks.map((m, i) => (
                                                <span key={i} style={componentStyles.marksBadge}>
                                                    {Array.isArray(m) ? m.join(", ") : m}
                                                </span>
                                            ))
                                            : <span style={componentStyles.marksBadge}>{result.marks}</span>}
                                    </div>
                                </div>
                                
                                {(result.feedback && result.feedback.length > 0) && (
                                    <div style={componentStyles.infoRow}>
                                        <span style={componentStyles.label}>Feedback:</span>
                                        <div style={componentStyles.feedbackText}>
                                            {Array.isArray(result.feedback)
                                                ? result.feedback.join(" • ")
                                                : result.feedback}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ViewMarks;