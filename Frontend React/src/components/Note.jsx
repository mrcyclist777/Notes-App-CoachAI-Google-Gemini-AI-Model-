import React, { useState } from "react";
import api from "./api"; 
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, IconButton, Stack, Typography, 
  Box, Collapse, InputAdornment 
} from '@mui/material';
import "../styles.css";

function Note(props) {

  // Okno edycji
  const [openEdit, setOpenEdit] = useState(false);
  const [editedNote, setEditedNote] = useState({ title: props.title, content: props.content });

  // Okno CoachAI
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // Dzialanie edycji
  function handleOpenEdit() {
    setEditedNote({ title: props.title, content: props.content });
    setOpenEdit(true);
  }

  function handleSaveEdit() {
    props.onEdit(props.id, editedNote.title, editedNote.content);
    setOpenEdit(false);
  }

  // Dzialanie AI
  async function handleChatSend() {
    if (!chatInput.trim()) return;
    const userMsg = { role: "user", text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");

    try {
      const res = await api.post(`/notes/${props.id}/chat`, { message: chatInput });
      setChatHistory(prev => [...prev, { role: "coach", text: res.data.reply }]);
    } catch (err) {
      console.error("Błąd połączenia z Coachem", err);
    }
  }

  return (
    <div className="note">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
      
      <div className="note-actions">
        <IconButton onClick={() => setShowChat(!showChat)} sx={{ color: "#9c27b0" }}>
          <SmartToyIcon />
        </IconButton>
        
        <IconButton onClick={handleOpenEdit} sx={{ color: "#f5ba13" }}>
          <EditSquareIcon />
        </IconButton>

        <IconButton onClick={() => props.onDelete(props.id)} sx={{ color: "#f5ba13" }}>
          <DeleteIcon />
        </IconButton>
      </div>

      <Collapse in={showChat}>
        <Box sx={{ mt: 2, p: 1, backgroundColor: "#f3e5f5", borderRadius: "8px" }}>
          <div className="chat-area" style={{ maxHeight: "120px", overflowY: "auto", marginBottom: "8px" }}>
            {chatHistory.map((m, i) => (
              <Typography key={i} variant="caption" display="block" sx={{ mb: 0.5 }}>
                <strong style={{ color: m.role === "user" ? "#555" : "#9c27b0" }}>
                  {m.role === "user" ? "You: " : "Coach: "}
                </strong>
                {m.text}
              </Typography>
            ))}
          </div>
          <TextField 
            fullWidth size="small" variant="standard" placeholder="Talk to coach..."
            value={chatInput} onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleChatSend} size="small"><SendIcon fontSize="inherit" /></IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Collapse>

      {/* Zmieniona edycja na okno modal */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontFamily: "'McLaren', cursive", color: "#f5ba13" }}>Edit Entry</Typography>
          <IconButton onClick={() => setOpenEdit(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Title" fullWidth value={editedNote.title} 
              onChange={(e) => setEditedNote({...editedNote, title: e.target.value})} 
            />
            <TextField 
              label="Content" fullWidth multiline rows={4} value={editedNote.content} 
              onChange={(e) => setEditedNote({...editedNote, content: e.target.value})} 
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} sx={{ color: "#888" }}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" startIcon={<SaveIcon />} sx={{ bgcolor: "#f5ba13" }}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Note;