// Concurrent Ticket Booking System with Seat Locking and Confirmation
// Author: ChatGPT (GPT-5)

const express = require("express");
const app = express();
app.use(express.json());

const PORT = 3000;

// ===============================
// In-memory seat store
// ===============================
let seats = {};
const TOTAL_SEATS = 10;
for (let i = 1; i <= TOTAL_SEATS; i++) {
  seats[i] = { status: "available", lockedBy: null, lockExpiry: null };
}

// ===============================
// Helper Function to Auto-Release Locks
// ===============================
setInterval(() => {
  const now = Date.now();
  for (let id in seats) {
    if (seats[id].status === "locked" && seats[id].lockExpiry < now) {
      seats[id].status = "available";
      seats[id].lockedBy = null;
      seats[id].lockExpiry = null;
      console.log(`Seat ${id} auto-unlocked after expiry.`);
    }
  }
}, 5000);

// ===============================
// 1️⃣ View all seats
// ===============================
app.get("/seats", (req, res) => {
  res.status(200).json(seats);
});

// ===============================
// 2️⃣ Lock a seat
// ===============================
app.post("/lock/:id", (req, res) => {
  const id = req.params.id;
  const seat = seats[id];

  if (!seat) {
    return res.status(404).json({ message: "Seat not found." });
  }
  if (seat.status === "booked") {
    return res.status(400).json({ message: "Seat already booked." });
  }
  if (seat.status === "locked") {
    return res.status(400).json({ message: "Seat already locked." });
  }

  seat.status = "locked";
  seat.lockedBy = "user"; // simple placeholder
  seat.lockExpiry = Date.now() + 60000; // 1 minute lock

  res
    .status(200)
    .json({ message: `Seat ${id} locked successfully. Confirm within 1 minute.` });
});

// ===============================
// 3️⃣ Confirm a seat
// ===============================
app.post("/confirm/:id", (req, res) => {
  const id = req.params.id;
  const seat = seats[id];

  if (!seat) {
    return res.status(404).json({ message: "Seat not found." });
  }
  if (seat.status === "booked") {
    return res.status(400).json({ message: "Seat already booked." });
  }
  if (seat.status !== "locked") {
    return res.status(400).json({ message: "Seat is not locked and cannot be booked." });
  }

  seat.status = "booked";
  seat.lockedBy = null;
  seat.lockExpiry = null;

  res.status(200).json({ message: `Seat ${id} booked successfully!` });
});

// ===============================
// Server Start
// ===============================
app.listen(PORT, () => {
  console.log(`🎟️ Ticket Booking System running on http://localhost:${PORT}`);
});
