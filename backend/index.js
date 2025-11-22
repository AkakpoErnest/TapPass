import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// POST /register route
app.post("/register", async (req, res) => {
  try {
    // TODO: Implement registration logic with viem
    // This will interact with the AttendeeRegistry contract
    const { tagHash, wallet } = req.body;

    if (!tagHash || !wallet) {
      return res.status(400).json({ error: "tagHash and wallet are required" });
    }

    // Placeholder response
    res.json({
      success: true,
      message: "Registration endpoint - implementation pending",
      data: { tagHash, wallet },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`TapPass backend server running on port ${PORT}`);
});

