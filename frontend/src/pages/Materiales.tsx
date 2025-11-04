import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

type Material = {
  id: number;
  nombre: string;
  unidad: string;
  cantidad: number;
  created_at?: string;
  updated_at?: string;
};

type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

const Materiales: React.FC = () => {
  const role = localStorage.getItem("role") || ""; // "supervisor" | "alquimista"
  const userId = Number(localStorage.getItem("id") || 0);
  const isSupervisor = role === "supervisor";

  // ---- Listado / filtros / paginación
  const [data, setData] = useState<Paginated<Material>>({
    items: [],
    page: 1,
    limit: 10,
    total: 0,
  });
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // ---- Formularios
  const [form, setForm] = useState<{ nombre: string; unidad: string; cantidad: number }>({
    nombre: "",
    unidad: "",
    cantidad: 0,
  });

  const [editRow, setEditRow] = useState<Material | null>(null);

  // ---- Ajuste de stock
  const [ajuste, setAjuste] = useState<{ id?: number; delta: number; motivo: string }>({
    id: undefined,
    delta: 0,
    motivo: "",
  });

  // ---- Mensajes
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.total / data.limit)), [data.total, data.limit]);

  const fetchMateriales = async (page = data.page, limit = data.limit, query = q) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get("/materiales", {
        params: { page, limit, q: query },
      });
      // backend retorna { items, page, limit, total }
      setData(res.data);
    } catch (e) {
      console.error(e);
      setErr("❌ Error cargando materiales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriales(1, data.limit, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMateriales(1, data.limit, q);
  };

  const resetMessages = () => {
    setErr(null);
    setMsg(null);
  };

  // ---- Crear
  const crearMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    try {
      if (!form.nombre.trim() || !form.unidad.trim()) {
        setErr("⚠️ Nombre y Unidad son obligatorios");
        return;
      }
      if (form.cantidad < 0) {
        setErr("⚠️ La cantidad no puede ser negativa");
        return;
      }
      await api.post("/materiales", form);
      setMsg("✅ Material creado");
      setForm({ nombre: "", unidad: "", cantidad: 0 });
      fetchMateriales(1, data.limit, q);
    } catch (e) {
      console.error(e);
      setErr("❌ No se pudo crear el material (¿nombre duplicado?)");
    }
  };

  // ---- Editar
  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!editRow) return;
    try {
      if (!editRow.nombre.trim() || !editRow.unidad.trim()) {
        setErr("⚠️ Nombre y Unidad son obligatorios");
        return;
      }
      if (editRow.cantidad < 0) {
        setErr("⚠️ La cantidad no puede ser negativa");
        return;
      }
      await api.put(`/materiales/${editRow.id}`, {
        nombre: editRow.nombre,
        unidad: editRow.unidad,
        cantidad: editRow.cantidad,
      });
      setMsg("✅ Material actualizado");
      setEditRow(null);
      fetchMateriales(data.page, data.limit, q);
    } catch (e) {
      console.error(e);
      setErr("❌ No se pudo actualizar el material");
    }
  };

  // ---- Eliminar
  const eliminarMaterial = async (m: Material) => {
    resetMessages();
    const ok = confirm(`¿Eliminar material "${m.nombre}"? Esta acción es irreversible.`);
    if (!ok) return;
    try {
      await api.delete(`/materiales/${m.id}`);
      setMsg("🗑️ Material eliminado");
      // Si la página queda vacía tras borrar, retrocede una página
      const newTotal = data.total - 1;
      const lastPage = Math.max(1, Math.ceil(newTotal / data.limit));
      const nextPage = Math.min(data.page, lastPage);
      fetchMateriales(nextPage, data.limit, q);
    } catch (e) {
      console.error(e);
      setErr("❌ No se pudo eliminar");
    }
  };

  // ---- Ajustar stock
  const ajustarStock = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!ajuste.id) return;
    if (!ajuste.delta || ajuste.delta === 0) {
      setErr("⚠️ El delta no puede ser 0");
      return;
    }
    try {
      await api.patch(`/materiales/${ajuste.id}/ajustar`, {
        delta: ajuste.delta,
        motivo: ajuste.motivo || "Ajuste manual",
        usuario_id: userId || 0,
      });
      setMsg("♻️ Stock ajustado");
      setAjuste({ id: undefined, delta: 0, motivo: "" });
      fetchMateriales(data.page, data.limit, q);
    } catch (e) {
      console.error(e);
      setErr("❌ No se pudo ajustar el stock");
    }
  };

  // ---- UI
  return (
    <div style={{ padding: "2rem", fontFamily: "serif", minHeight: "100vh", background: "linear-gradient(180deg,#f8fafc, #ffffff)" }}>
      <h1 style={{ color: "#065f46", fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>🧪 Materiales Alquímicos</h1>
      <p style={{ color: "#334155", marginBottom: "1.25rem" }}>
        Consulta y gestiona el inventario. Los <b>alquimistas</b> pueden ver la disponibilidad; los <b>supervisores</b> pueden administrar.
      </p>

      {/* mensajes */}
      {err && <div style={{ color: "#b91c1c", marginBottom: ".75rem" }}>{err}</div>}
      {msg && <div style={{ color: "#065f46", marginBottom: ".75rem" }}>{msg}</div>}

      {/* barra de búsqueda */}
      <form onSubmit={onSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          placeholder="Buscar por nombre o unidad..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: ".5rem .75rem", border: "1px solid #cbd5e1", borderRadius: 8 }}
        />
        <button type="submit" style={{ padding: ".5rem .9rem", background: "#065f46", color: "white", borderRadius: 8, border: "none", cursor: "pointer" }}>
          Buscar
        </button>
      </form>

      {/* crear (solo supervisor) */}
      {isSupervisor && (
        <form onSubmit={crearMaterial} style={{ display: "grid", gap: ".5rem", gridTemplateColumns: "2fr 1fr 1fr auto", alignItems: "center", marginBottom: "1rem",
          background: "#ecfeff", border: "1px solid #bae6fd", borderRadius: 12, padding: "0.75rem" }}>
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            style={{ padding: ".5rem .75rem", border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
          <input
            placeholder="Unidad (kg, g, ml...)"
            value={form.unidad}
            onChange={(e) => setForm({ ...form, unidad: e.target.value })}
            style={{ padding: ".5rem .75rem", border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
          <input
            type="number"
            placeholder="Cantidad"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
            style={{ padding: ".5rem .75rem", border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
          <button type="submit" style={{ padding: ".6rem .9rem", background: "#2563eb", color: "white", borderRadius: 8, border: "none", cursor: "pointer" }}>
            Crear
          </button>
        </form>
      )}

      {/* tabla */}
      <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white" }}>
          <thead style={{ background: "#065f46", color: "white" }}>
            <tr>
              <th style={{ textAlign: "left", padding: ".6rem" }}>ID</th>
              <th style={{ textAlign: "left", padding: ".6rem" }}>Nombre</th>
              <th style={{ textAlign: "left", padding: ".6rem" }}>Unidad</th>
              <th style={{ textAlign: "right", padding: ".6rem" }}>Cantidad</th>
              {isSupervisor && <th style={{ textAlign: "center", padding: ".6rem" }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isSupervisor ? 5 : 4} style={{ padding: "1rem", textAlign: "center" }}>Cargando...</td></tr>
            ) : data.items.length === 0 ? (
              <tr><td colSpan={isSupervisor ? 5 : 4} style={{ padding: "1rem", textAlign: "center" }}>No hay materiales</td></tr>
            ) : (
              data.items.map((m) => {
                const enEdicion = editRow?.id === m.id;
                return (
                  <tr key={m.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ padding: ".6rem" }}>{m.id}</td>

                    {/* nombre */}
                    <td style={{ padding: ".6rem" }}>
                      {isSupervisor && enEdicion ? (
                        <input
                          value={editRow!.nombre}
                          onChange={(e) => setEditRow({ ...(editRow as Material), nombre: e.target.value })}
                          style={{ width: "100%", padding: ".35rem .5rem", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      ) : (
                        m.nombre
                      )}
                    </td>

                    {/* unidad */}
                    <td style={{ padding: ".6rem" }}>
                      {isSupervisor && enEdicion ? (
                        <input
                          value={editRow!.unidad}
                          onChange={(e) => setEditRow({ ...(editRow as Material), unidad: e.target.value })}
                          style={{ width: "100%", padding: ".35rem .5rem", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      ) : (
                        m.unidad
                      )}
                    </td>

                    {/* cantidad */}
                    <td style={{ padding: ".6rem", textAlign: "right" }}>
                      {isSupervisor && enEdicion ? (
                        <input
                          type="number"
                          value={editRow!.cantidad}
                          onChange={(e) => setEditRow({ ...(editRow as Material), cantidad: Number(e.target.value) })}
                          style={{ width: "100%", padding: ".35rem .5rem", border: "1px solid #cbd5e1", borderRadius: 6, textAlign: "right" }}
                        />
                      ) : (
                        m.cantidad
                      )}
                    </td>

                    {/* acciones supervisor */}
                    {isSupervisor && (
                      <td style={{ padding: ".6rem", textAlign: "center" }}>
                        {!enEdicion ? (
                          <div style={{ display: "inline-flex", gap: ".35rem" }}>
                            <button
                              onClick={() => setEditRow(m)}
                              style={{ padding: ".35rem .6rem", borderRadius: 8, border: "1px solid #94a3b8", background: "white", cursor: "pointer" }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarMaterial(m)}
                              style={{ padding: ".35rem .6rem", borderRadius: 8, border: "1px solid #fecaca", background: "#fff1f2", color: "#b91c1c", cursor: "pointer" }}
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => setAjuste({ id: m.id, delta: 0, motivo: "" })}
                              style={{ padding: ".35rem .6rem", borderRadius: 8, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer" }}
                            >
                              Ajustar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "inline-flex", gap: ".35rem" }}>
                            <button
                              onClick={guardarEdicion}
                              style={{ padding: ".35rem .6rem", borderRadius: 8, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", cursor: "pointer" }}
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditRow(null)}
                              style={{ padding: ".35rem .6rem", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer" }}
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* paginación */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", justifyContent: "flex-end" }}>
        <button
          onClick={() => fetchMateriales(Math.max(1, data.page - 1), data.limit, q)}
          disabled={data.page <= 1}
          style={{ padding: ".35rem .6rem", border: "1px solid #cbd5e1", background: "white", borderRadius: 8, cursor: data.page <= 1 ? "not-allowed" : "pointer" }}
        >
          ⬅️
        </button>
        <span style={{ color: "#334155" }}>
          Página <b>{data.page}</b> de <b>{totalPages}</b>
        </span>
        <button
          onClick={() => fetchMateriales(Math.min(totalPages, data.page + 1), data.limit, q)}
          disabled={data.page >= totalPages}
          style={{ padding: ".35rem .6rem", border: "1px solid #cbd5e1", background: "white", borderRadius: 8, cursor: data.page >= totalPages ? "not-allowed" : "pointer" }}
        >
          ➡️
        </button>
      </div>

      {/* panel de ajuste */}
      {isSupervisor && ajuste.id !== undefined && (
        <form onSubmit={ajustarStock}
          style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: ".5rem",
            alignItems: "center", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: ".75rem" }}>
          <input
            type="number"
            step="0.001"
            value={ajuste.delta}
            onChange={(e) => setAjuste({ ...ajuste, delta: Number(e.target.value) })}
            placeholder="Δ cantidad (ej. -2.5)"
            style={{ padding: ".5rem .75rem", border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
          <input
            value={ajuste.motivo}
            onChange={(e) => setAjuste({ ...ajuste, motivo: e.target.value })}
            placeholder="Motivo del ajuste"
            style={{ padding: ".5rem .75rem", border: "1px solid #cbd5e1", borderRadius: 8 }}
          />
          <div style={{ display: "flex", gap: ".5rem" }}>
            <button type="submit" style={{ padding: ".5rem .9rem", background: "#ea580c", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Aplicar ajuste
            </button>
            <button type="button" onClick={() => setAjuste({ id: undefined, delta: 0, motivo: "" })}
              style={{ padding: ".5rem .9rem", background: "white", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer" }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Materiales;
