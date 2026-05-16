import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/creaid.jpg";
import "../App.css";
import { supabase } from "../lib/supabase";

function Login() 
{
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleLogin = async (e) => 
  {
    e.preventDefault();
    try 
    {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", username)
        .eq("password", password)
        .single();

      if (error || !data) 
      {
        alert("Invalid username or password");
        return;
      }

      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data));
      setRole(data.role);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-left">
          <div className="login-logo-wrap">
            <div className="login-logo-box">
              <img src={logo} alt="DentConnect" className="login-logo" />
            </div>
            <p className="login-brand">DentConnect</p>
            <p className="login-tagline">Juana Smile Dental Clinict</p>
          </div>
        </div>

        <div className="login-right">
          <p className="login-eyebrow">Welcome back</p>
          <h2 className="login-heading">Sign in to your account</h2>
          <p className="login-sub">Enter your credentials to continue</p>

          <form onSubmit={handleLogin}>
            <div className="login-fields">
              <div className="login-field">
                <label htmlFor="username">Username</label>
                <input  id="username" type="text" placeholder="your@email.com" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                <span className="field-bar" />
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <span className="field-bar" />
              </div>
            </div>

            <button type="submit" className="login-btn">
              Sign In →
            </button>
          </form>

          <p className="login-footer">
            Need access? <a href="#">Contact your administrator</a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;