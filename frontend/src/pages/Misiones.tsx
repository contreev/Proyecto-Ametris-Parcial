import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, Sparkles, ClipboardCheck } from "lucide-react";

interface User {
  id: number;
  nombre: string;
  rol: string;
}

interface Mision {
  ID: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  alquimista_id: number;
  materiales: string;
  alquimista?: {
    nombre: string;
  };
}

interface Props {
  user?: User;
}

const API_URL = "http://localhost:8080/api/misiones";

const Misiones: React.FC<Props> = ({ user }) => {
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    alquimista_id: user?.id ?? 1,
    materiales: "",
  });
  const [loading, setLoading] = useState(false);
  const [modoSupervisor] = useState<boolean>(user?.rol === "supervisor");

  const fetchMisiones = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setMisiones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener misiones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisiones();
  }, []);

  const registrarMision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ ...form, titulo: "", descripcion: "", materiales: "" });
        fetchMisiones();
      }
    } catch (err) {
      console.error("Error al registrar misión:", err);
    }
  };

  const actualizarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) fetchMisiones();
    } catch (err) {
      console.error("Error al actualizar misión:", err);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "serif",
        background: "linear-gradient(to bottom right, #1a102c, #2b194f)",
        minHeight: "100vh",
        color: "#f3e8ff",
      }}
    >
      {/* 🔮 Encabezado */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#c084fc",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <FlaskConical /> Misiones Alquímicas
      </motion.h1>

      {/* ✨ Formulario */}
      <motion.form
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        onSubmit={registrarMision}
        style={{
          background: "rgba(80, 60, 120, 0.15)",
          border: "1px solid rgba(200, 160, 255, 0.3)",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 0 10px rgba(160, 120, 255, 0.3)",
        }}
      >
        <h2
          style={{
            color: "#c084fc",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <Sparkles size={18} /> Registrar nueva misión
        </h2>

        <div style={{ display: "grid", gap: "0.5rem", maxWidth: "600px" }}>
          <input
            type="text"
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            style={{
              background: "#2d1a4a",
              border: "1px solid #a855f7",
              borderRadius: "8px",
              color: "white",
              padding: "0.5rem",
            }}
          />

          <input
            type="text"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            style={{
              background: "#2d1a4a",
              border: "1px solid #a855f7",
              borderRadius: "8px",
              color: "white",
              padding: "0.5rem",
            }}
          />

          <select
            value={form.prioridad}
            onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
            style={{
              background: "#2d1a4a",
              border: "1px solid #a855f7",
              borderRadius: "8px",
              color: "white",
              padding: "0.5rem",
            }}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>

          <button
            type="submit"
            style={{
              background: "#a855f7",
              color: "white",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#c084fc")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#a855f7")
            }
          >
            <ClipboardCheck size={16} style={{ marginRight: "0.3rem" }} />
            Registrar misión
          </button>
        </div>
      </motion.form>

      {/* 📜 Tabla */}
      <div
        style={{
          background: "rgba(45, 25, 75, 0.5)",
          border: "1px solid rgba(160, 120, 255, 0.3)",
          borderRadius: "10px",
          padding: "1rem",
          overflowX: "auto",
          boxShadow: "0 0 8px rgba(160, 120, 255, 0.2)",
        }}
      >
        {loading ? (
          <p style={{ color: "#c084fc", textAlign: "center" }}>
            Cargando misiones...
          </p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "white",
              fontSize: "0.9rem",
            }}
          >
            <thead
              style={{
                background: "#4c1d95",
                color: "white",
              }}
            >
              <tr>
                <th style={{ padding: "0.5rem" }}>ID</th>
                <th style={{ padding: "0.5rem" }}>Título</th>
                <th style={{ padding: "0.5rem" }}>Prioridad</th>
                <th style={{ padding: "0.5rem" }}>Alquimista</th>
                <th style={{ padding: "0.5rem" }}>Estado</th>
                {modoSupervisor && <th style={{ padding: "0.5rem" }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {misiones.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "1rem", color: "#ccc" }}
                  >
                    No hay misiones registradas aún.
                  </td>
                </tr>
              ) : (
                misiones.map((m) => (
                  <tr
                    key={m.ID}
                    style={{
                      borderTop: "1px solid rgba(160, 120, 255, 0.2)",
                      background:
                        m.estado === "completada"
                          ? "rgba(100,255,100,0.1)"
                          : m.estado === "rechazada"
                          ? "rgba(255,100,100,0.1)"
                          : "transparent",
                    }}
                  >
                    <td style={{ padding: "0.5rem", color: "#ddd" }}>{m.ID}</td>
                    <td style={{ padding: "0.5rem" }}>{m.titulo}</td>
                    <td
                      style={{
                        padding: "0.5rem",
                        color:
                          m.prioridad === "alta"
                            ? "#f87171"
                            : m.prioridad === "media"
                            ? "#facc15"
                            : "#4ade80",
                      }}
                    >
                      {m.prioridad}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {m.alquimista?.nombre || "—"}
                    </td>
                    <td style={{ padding: "0.5rem" }}>{m.estado}</td>

                    {modoSupervisor && (
                      <td style={{ padding: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => actualizarEstado(m.ID, "en progreso")}
                            style={{
                              background: "rgba(250,204,21,0.2)",
                              border: "1px solid #facc15",
                              borderRadius: "6px",
                              padding: "0.2rem 0.6rem",
                              color: "#fde047",
                              cursor: "pointer",
                            }}
                          >
                            Iniciar
                          </button>
                          <button
                            onClick={() => actualizarEstado(m.ID, "completada")}
                            style={{
                              background: "rgba(74,222,128,0.2)",
                              border: "1px solid #4ade80",
                              borderRadius: "6px",
                              padding: "0.2rem 0.6rem",
                              color: "#86efac",
                              cursor: "pointer",
                            }}
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => actualizarEstado(m.ID, "rechazada")}
                            style={{
                              background: "rgba(248,113,113,0.2)",
                              border: "1px solid #f87171",
                              borderRadius: "6px",
                              padding: "0.2rem 0.6rem",
                              color: "#fca5a5",
                              cursor: "pointer",
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Misiones;
