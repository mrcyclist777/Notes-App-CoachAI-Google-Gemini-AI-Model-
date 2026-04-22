import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = 5000;

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SECRET_KEY) throw new Error("Brak zmiennej środowiskowej SECRET_KEY!");
if (!GEMINI_API_KEY) throw new Error("Brak zmiennej środowiskowej GEMINI_API_KEY!");

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "keeper_db",
  password: "",
  port: 5433,
});

db.connect()
  .then(() => console.log("Połączono z bazą MindfulCoach AI"))
  .catch(err => console.error("Błąd bazy danych:", err.message));

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


// Wszystkie notatki
app.get("/api/notes", authenticateToken, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM notes WHERE user_id = $1 ORDER BY id ASC", [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Błąd pobierania danych." });
  }
});

// Nowa notatka
app.post("/api/notes", authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Błąd dodawania wpisu." });
  }
});

// Edycja notatki
app.patch("/api/notes/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const result = await db.query(
      "UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [title, content, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Nie znaleziono wpisu." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Błąd podczas edycji." });
  }
});

// Usuwanie notatki
app.delete("/api/notes/:id", authenticateToken, async (req, res) => {
  try {
    const result = await db.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    res.json({ message: "Wpis usunięty pomyślnie." });
  } catch (err) {
    res.status(500).json({ message: "Błąd podczas usuwania." });
  }
});

app.post("/api/notes/:id/chat", authenticateToken, async (req, res) => {
  const { message } = req.body;
  const { id } = req.params;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const noteResult = await db.query(
      "SELECT content FROM notes WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (noteResult.rows.length === 0) return res.status(404).json({ message: "Notatka nie istnieje" });
    const noteContext = noteResult.rows[0].content;

    // Zapytanie AI do modelu 2.5 (większość innych modeli nie działała lub była niedostępna z racji przeciążenia lub wersji płatnej)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `Jesteś MindfulCoachem. Oto treść mojej notatki: "${noteContext}".` }]
          },
          {
            role: "model",
            parts: [{ text: "Zrozumiałem kontekst notatki. W czym mogę Ci pomóc?" }]
          },
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Błąd API Google:", data);
      throw new Error(data.error?.message || "Błąd komunikacji z AI");
    }

    // Odpowiedz
    const aiReply = data.candidates[0].content.parts[0].text;
    res.json({ reply: aiReply });

  } catch (err) {
    console.error("Błąd podczas czatu:", err.message);
    res.status(500).json({ error: "Błąd serwera AI", details: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
      return res.json({ token });
    }
    res.status(401).json({ message: "Błędny email lub hasło." });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera." });
  }
});

app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
        [email, hashedPassword]
      );
      const token = jwt.sign({ id: result.rows[0].id }, SECRET_KEY);
      res.json({ token });
    } catch (err) {
      res.status(400).json({ message: "Użytkownik już istnieje." });
    }
  });

app.listen(port, () => {
  console.log(`Backend MindfulCoach AI działa na http://localhost:${port}`);
});