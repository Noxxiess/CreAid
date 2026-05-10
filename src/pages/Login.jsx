import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "../App.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();

    let role = null;

    if (username === "admin" && password === "admin123") {
      role = "admin";
    } else if (username === "staff" && password === "staff123") {
      role = "staff";
    } else if (username === "tester" && password === "tester123") {
      role = "tester";
    }

    if (role) {
      // ✅ SET ROLE HERE (ONLY HERE)
      localStorage.setItem("role", role);
      setRole(role);

      navigate("/dashboard");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card split">
        <div className="login-left">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>

        <div className="login-right">
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;