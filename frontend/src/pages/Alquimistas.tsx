import React, { useEffect, useState } from "react";
import api from "../services/api";

interface Alquimista {
  id: number;
  nombre: string;
  rango: string;
  especialidad: string;
  created_at: string;
}

export default function Alquimistas() {
  const [alquimistas, setAlquimistas] = useState<Alquimista[]>([]);
  const [nombre, setNombre] = useState("");
  const [rango, setRango] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const cargarAlquimistas = () => {
    api
      .get("/alquimistas")
      .then((res) => setAlquimistas(res.data))
      .catch(() => setError("❌ Error cargando alquimistas"));
  };

  useEffect(() => {
    cargarAlquimistas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setProcesando(true);

    if (!nombre || !rango || !especialidad) {
      setError("⚠️ Todos los campos son obligatorios");
      setProcesando(false);
      return;
    }

    try {
      await api.post("/alquimistas", { nombre, rango, especialidad });
      setMensaje("✅ Alquimista agregado correctamente");
      setNombre("");
      setRango("");
      setEspecialidad("");
      setTimeout(() => {
        cargarAlquimistas();
        setProcesando(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      setError("❌ Error al agregar alquimista");
      setProcesando(false);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "serif",
        background: "linear-gradient(180deg, #f6f5ff 0%, #fafafa 100%)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#553c9a", textAlign: "center", fontSize: "2.5rem" }}>
        🧙‍♂️ Registro de Alquimistas
      </h1>
      <p style={{ textAlign: "center", color: "#333", marginBottom: "2rem" }}>
        Registra a los alquimistas y su especialidad en el arte de la transmutación.
      </p>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {mensaje && (
        <p style={{ color: "green", textAlign: "center" }}>{mensaje}</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          margin: "2rem auto",
          padding: "1.5rem",
          background: "#f0f0ff",
          borderRadius: "12px",
          maxWidth: "450px",
          boxShadow: "0 0 10px rgba(85,60,154,0.15)",
        }}
      >
        <h3 style={{ marginBottom: "1rem", color: "#553c9a" }}>
          ✨ Nuevo Alquimista
        </h3>

        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "0.5rem",
            padding: "0.4rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <label>Rango:</label>
        <input
          type="text"
          value={rango}
          onChange={(e) => setRango(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "0.5rem",
            padding: "0.4rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <label>Especialidad:</label>
        <input
          type="text"
          value={especialidad}
          onChange={(e) => setEspecialidad(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "0.5rem",
            padding: "0.4rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "0.6rem 1rem",
            backgroundColor: "#553c9a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
            marginTop: "0.5rem",
          }}
          disabled={procesando}
        >
          {procesando ? "⚙️ Procesando..." : "🧪 Registrar Alquimista"}
        </button>
      </form>

      {procesando && (
        <div style={{ margin: "2rem 0", textAlign: "center" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              margin: "auto",
              border: "6px solid #ddd",
              borderTop: "6px solid #553c9a",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ color: "#553c9a", marginTop: "1rem" }}>
            🔮 Canalizando energía equivalente...
          </p>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <h3 style={{ color: "#553c9a", marginTop: "3rem" }}>
        📜 Registro de alquimistas
      </h3>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          background: "white",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          marginTop: "1rem",
        }}
      >
        <thead style={{ background: "#553c9a", color: "white" }}>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Rango</th>
            <th>Especialidad</th>
          </tr>
        </thead>
        <tbody>
          {alquimistas.length > 0 ? (
            alquimistas.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.nombre}</td>
                <td>{a.rango}</td>
                <td>{a.especialidad}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                No hay alquimistas registrados aún.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
