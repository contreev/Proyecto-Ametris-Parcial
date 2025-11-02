import React, { useEffect, useState } from "react";
import axios from "axios";

interface Transmutation {
  id?: number;
  nombre: string;
  descripcion: string;
  costo: number;
  resultado?: string;
  estado?: string;
}

// 🔹 URL corregida con prefijo /api
const API_URL = "http://localhost:8080/api/transmutaciones";

const Transmutaciones: React.FC = () => {
  const [transmutaciones, setTransmutaciones] = useState<Transmutation[]>([]);
  const [nueva, setNueva] = useState<Transmutation>({
    nombre: "",
    descripcion: "",
    costo: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  // 🔹 Cargar lista de transmutaciones
  const cargarTransmutaciones = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      setTransmutaciones(data);
    } catch (err) {
      console.error("❌ Error cargando transmutaciones:", err);
      setError("Error cargando transmutaciones");
      setTransmutaciones([]);
    }
  };

  // 🔹 Crear nueva transmutación
  const crearTransmutacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setProcesando(true);

    try {
      const res = await axios.post(API_URL, nueva, {
        headers: { "Content-Type": "application/json" },
      });

      setMensaje(res.data.message || "Transmutación creada con éxito");
      setNueva({ nombre: "", descripcion: "", costo: 0 });

      // Simula el tiempo de procesamiento visualmente
      setTimeout(() => {
        cargarTransmutaciones();
        setProcesando(false);
      }, 3500);
    } catch (err) {
      console.error("❌ Error al crear transmutación:", err);
      setError("Error al crear transmutación");
      setProcesando(false);
    }
  };

  useEffect(() => {
    cargarTransmutaciones();
  }, []);

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "serif",
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#553c9a" }}>⚗️ Transmutaciones Alquímicas</h1>
      <p style={{ color: "#333" }}>
        Realiza simulaciones de intercambio equivalente y observa los resultados.
      </p>

      {error && <p style={{ color: "red" }}>❌ {error}</p>}
      {mensaje && <p style={{ color: "green" }}>✅ {mensaje}</p>}

      <form
        onSubmit={crearTransmutacion}
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          background: "#f0f0ff",
          borderRadius: "10px",
          maxWidth: "400px",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>Agregar nueva transmutación</h3>

        <label>Nombre:</label>
        <input
          type="text"
          value={nueva.nombre}
          onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
          required
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />

        <label>Descripción:</label>
        <input
          type="text"
          value={nueva.descripcion}
          onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
          required
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />

        <label>Costo base:</label>
        <input
          type="number"
          value={nueva.costo}
          onChange={(e) => {
            const value = e.target.value;
            setNueva({
              ...nueva,
              costo: value === "" ? 0 : parseFloat(value),
            });
          }}
          required
          style={{ width: "100%", marginBottom: "0.5rem" }}
        />

        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#553c9a",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          disabled={procesando}
        >
          {procesando ? "⚙️ Procesando..." : "🧪 Iniciar Transmutación"}
        </button>
      </form>

      {/* Animación mientras procesa */}
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

      <h3 style={{ marginBottom: "1rem" }}>📜 Historial de transmutaciones</h3>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          background: "white",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ background: "#553c9a", color: "white" }}>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Costo</th>
            <th>Estado</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          {transmutaciones.length > 0 ? (
            transmutaciones.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.nombre}</td>
                <td>{t.descripcion}</td>
                <td>{t.costo}</td>
                <td
                  style={{
                    color:
                      t.estado === "Completada"
                        ? "green"
                        : t.estado === "Fallida"
                        ? "red"
                        : "#555",
                    fontWeight: "bold",
                  }}
                >
                  {t.estado || "Pendiente"}
                </td>
                <td style={{ fontStyle: "italic" }}>
                  {t.resultado || "Aún sin procesar"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                No hay transmutaciones registradas aún.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Transmutaciones;
