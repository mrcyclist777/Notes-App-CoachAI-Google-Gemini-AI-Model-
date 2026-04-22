import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import Login from "./Login";
import api from "./api";
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Pobieranie notatek po zalogowaniu
  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const fetchNotes = async () => {
  try {
    const token = localStorage.getItem("token"); 
    const response = await axios.get("http://localhost:5000/api/notes", {
      headers: {
        Authorization: `Bearer ${token}`, // 'Bearer '
      },
    });
    setNotes(response.data);
  } catch (err) {
    console.error("Błąd podczas pobierania notatek:", err);
  }
};

  // Dodawanie nowej notatki
  async function addNote(newNote) {
    try {
      const response = await api.post("/notes", newNote);
      setNotes(prevNotes => [...prevNotes, response.data]);
    } catch (err) {
      console.error("Nie udało się dodać notatki:", err);
    }
  }

  // USUWANIE NOTATKI 
  async function deleteNote(id) {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prevNotes => prevNotes.filter(noteItem => noteItem.id !== id));
    } catch (err) {
      console.error("Błąd podczas usuwania notatki:", err);
    }
  }

  // EDYTOWANIE NOTATKI 
  async function editNote(id, title, content) {
    try {
      await api.patch(`/notes/${id}`, { title, content });
      setNotes(prevNotes => 
        prevNotes.map(noteItem => 
          noteItem.id === id ? { ...noteItem, title, content } : noteItem
        )
      );
    } catch (err) {
      console.error("Błąd podczas edycji notatki:", err);
    }
  }

  // Obsługa logowania
  function handleLogin(userToken) {
    setToken(userToken);
    localStorage.setItem("token", userToken);
  }

  // Obsługa wylogowania
  function handleLogout() {
    setToken(null);
    localStorage.removeItem("token");
    setNotes([]); // Czyszczenie notatek po zalogowaniu
  }

  return (
    <div>
      <Header onLogout={handleLogout} isLogged={!!token} />
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <CreateArea onAdd={addNote} />
          <div className="notes-container"> 
            {notes.map(noteItem => (
              <Note
                key={noteItem.id}
                id={noteItem.id}
                title={noteItem.title}
                content={noteItem.content}
                onDelete={deleteNote} // Przekazanie funkcji usuwania
                onEdit={editNote}     // Przekazanie funkcji edycji
              />
            ))}
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}

export default App;