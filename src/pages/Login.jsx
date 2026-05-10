import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "../App.css";
import { supabase } from "../lib/supabase";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const handleLogout = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("user");

  navigate("/");
};
const handleLogin = async (e) => {
  e.preventDefault();

  try {

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", username)
      .eq("password", password)
      .single();

    if (error || !data) {
      alert("Invalid username or password");
      return;
    }

    console.log("Logged in user:", data);

    // SAVE ROLE
    localStorage.setItem("role", data.role);

    // OPTIONAL: SAVE USER
    localStorage.setItem("user", JSON.stringify(data));

    // UPDATE CONTEXT
    setRole(data.role);

    // REDIRECT
    navigate("/dashboard");

  } catch (err) {
    console.error(err);
    alert("Login failed");
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
