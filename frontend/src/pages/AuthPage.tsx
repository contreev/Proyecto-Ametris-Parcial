// src/pages/AuthPage.tsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "register" ? false : true; // por defecto login
  const [isLogin, setIsLogin] = useState(initialMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("alquimista"); // nuevo campo para rol
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // ---- LOGIN ----
        const res = await fetch("http://localhost:8080/api/login", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          throw new Error("Credenciales inválidas");
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        navigate("/"); // redirige al home
      } else {
        // ---- REGISTRO ----
        const res = await fetch("http://localhost:8080/api/register", {

          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, role }),
        });

        if (!res.ok) {
          throw new Error("Error al registrar usuario");
        }

        alert("Registro exitoso. Ahora inicia sesión.");
        navigate("/auth?mode=login"); // redirige al login
      }
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", margin: "10px auto", padding: "5px" }}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", margin: "10px auto", padding: "5px" }}
        />

        {!isLogin && (
          <div style={{ marginTop: "10px" }}>
            <label>
              <input
                type="radio"
                name="role"
                value="alquimista"
                checked={role === "alquimista"}
                onChange={(e) => setRole(e.target.value)}
              />{" "}
              Alquimista
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="role"
                value="supervisor"
                checked={role === "supervisor"}
                onChange={(e) => setRole(e.target.value)}
              />{" "}
              Supervisor
            </label>
          </div>
        )}

        <button
          type="submit"
          style={{
            padding: "5px 10px",
            marginTop: "15px",
            cursor: "pointer",
          }}
        >
          {isLogin ? "Entrar" : "Registrarse"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ marginTop: "10px", fontSize: "12px" }}
      >
        {isLogin
          ? "¿No tienes cuenta? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
};

export default AuthPage;
