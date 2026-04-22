import React, { useState } from "react";
import api from "./api";
import "../styles.css";

function Login(props) {
  const [isRegister, setIsRegister] = useState(false);
  const [contact, setContact] = useState({
    email: "",
    password: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setContact((prevValue) => ({
      ...prevValue,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    const endpoint = isRegister ? "register" : "login";
    
    try {
      const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
      });

      const data = await response.json();

      if (response.ok) {
        props.onLogin(data.token); 
      } else {
        alert(data.message || "An error occurred");
      }
    } catch (err) {
      console.error("API Connection Error:", err);
    }
  }

  return (
    <div className="login-container" style={{ textAlign: "center" }}>
      <h1 style={{ marginTop: "20px", color: "#ffffff" }}>
        {isRegister ? "Create Account" : "Login"}
      </h1>
      
      <form className="create-note" onSubmit={handleSubmit} style={{ margin: "20px auto" }}>
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          onChange={handleChange}
          value={contact.email}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          value={contact.password}
          required
        />
        
        <button 
          type="submit" 
          style={{ 
            width: "20%", 
            padding: "10px", 
            backgroundColor: "#f5ba13", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {isRegister ? "Sign Up" : "Sign In"}
        </button>
      </form>
      
      <p 
        onClick={() => setIsRegister(!isRegister)} 
        style={{
          cursor: "pointer", 
          color: "#f5ba13", 
          textDecoration: "underline",
          fontSize: "0.9rem"
        }}
      >
        {isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
      </p>
    </div>
  );
}

export default Login;