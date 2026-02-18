import { useEffect, useState } from "react";
import axios from "axios";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("low");
  const [status, setStatus] = useState("open");

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/tickets/");
      setTickets(res.data);
    } catch (err) {
      console.log("Error fetching tickets:", err);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://127.0.0.1:8000/api/tickets/", {
        title,
        description,
        category,
        priority,
        status,
      });

      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("low");
      setStatus("open");

      fetchTickets();
    } catch (err) {
      console.log("Error creating ticket:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1> Ticket List</h1>

      <h2 style={{ marginTop: "30px" }}> Create Ticket</h2>

      <form onSubmit={createTicket} style={{ marginBottom: "30px" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "300px" }}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "300px" }}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "310px" }}
        >
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="account">Account</option>
          <option value="general">General</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "310px" }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "310px" }}
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        <button type="submit">Create Ticket</button>
      </form>

      <h2> Tickets</h2>

      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id} style={{ marginBottom: "15px" }}>
              <b>{ticket.title}</b> <br />
              {ticket.description} <br />
              <small>
                Category: {ticket.category} | Priority: {ticket.priority} | Status:{" "}
                {ticket.status}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
