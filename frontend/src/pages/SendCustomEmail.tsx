import React, { useState } from 'react';

const SendCustomEmail: React.FC = () => {
  const [form, setForm] = useState({
    fromEmail: '',
    fromPass: '',
    to: '',
    subject: '',
    text: ''
  });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:5000/api/send-custom-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setResult(data.message || 'Success');
    } catch (err) {
      setResult('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <h2>Send Custom Email (Backend Demo)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input name="fromEmail" placeholder="Sender Email" value={form.fromEmail} onChange={handleChange} required />
        <input name="fromPass" placeholder="Sender App Password" value={form.fromPass} onChange={handleChange} required type="password" />
        <input name="to" placeholder="Recipient Email" value={form.to} onChange={handleChange} required />
        <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />
        <textarea name="text" placeholder="Message" value={form.text} onChange={handleChange} required rows={4} />
        <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Email'}</button>
      </form>
      {result && <div style={{ marginTop: 16 }}>{result}</div>}
    </div>
  );
};

export default SendCustomEmail;
