import React, { useEffect, useState } from "react";
import axios from "axios";

interface Ticket {
  _id: string;
  subject: string;
  description: string;
  student?: { name?: string };
  ta?: { name?: string };
  resolved: boolean;
}

const TeacherEscalatedTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get("/api/teacher/escalated-tickets", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Fetched tickets:", data);

      if (Array.isArray(data.data)) {
        setTickets(data.data);
      } else {
        console.warn("Unexpected response format:", data);
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      await axios.put(
        `/api/teacher/resolve-ticket/${ticketId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchTickets(); // Refresh after resolving
    } catch (error) {
      console.error("Error resolving ticket", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) return <p className="p-4">Loading escalated tickets...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Escalated Tickets</h2>
      {tickets.length === 0 ? (
        <p>No escalated tickets found.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li
              key={ticket._id}
              className="border border-gray-300 rounded-md p-4 shadow-md"
            >
              <h3 className="text-lg font-bold">{ticket.subject}</h3>
              <p>{ticket.description}</p>
              <p>
                <strong>Student:</strong> {ticket.student?.name || "N/A"}
              </p>
              <p>
                <strong>TA:</strong> {ticket.ta?.name || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {ticket.resolved ? "Resolved ✅" : "Pending ❌"}
              </p>

              {!ticket.resolved && (
                <button
                  onClick={() => handleResolve(ticket._id)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherEscalatedTickets;
