// src/components/Navbar.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth?mode=login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "10px",
        backgroundColor: "#f3f3f3",
        borderBottom: "1px solid #ccc",
      }}
    >
      <Link to="/">🏠 Inicio</Link>
      <Link to="/alquimistas">🧙‍♂️ Alquimistas</Link>
      <Link to="/misiones">⚔️ Misiones</Link>
      <Link to="/transmutaciones">⚗️ Transmutaciones</Link>

      {!token ? (
        <Link to="/auth?mode=login">🔐 Login / Registro</Link>
      ) : (
        <button
          onClick={handleLogout}
          style={{ border: "none", background: "none", cursor: "pointer" }}
        >
          🚪 Cerrar sesión
        </button>
      )}
    </nav>
  );
};

export default Navbar;
