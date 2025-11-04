package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"
	"alquimia-backend/internal/utils"

	"github.com/gorilla/mux"

)

// internal/handlers/materiales.go
func ListarMateriales(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	var mats []models.Material
	dbq := repository.DB.Model(&models.Material{})
	if q != "" {
		like := "%" + q + "%"
		dbq = dbq.Where("nombre ILIKE ? OR unidad ILIKE ?", like, like)
	}

	var total int64
	if err := dbq.Count(&total).Error; err != nil {
		http.Error(w, "Error contando resultados", http.StatusInternalServerError)
		return
	}

	if err := dbq.Order("nombre asc").Limit(limit).Offset((page - 1) * limit).Find(&mats).Error; err != nil {
		http.Error(w, "Error listando materiales", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"items": mats,
		"page":  page,
		"limit": limit,
		"total": total,
	})
}

func CrearMaterial(w http.ResponseWriter, r *http.Request) {
	var m models.Material
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if m.Nombre == "" || m.Unidad == "" {
		http.Error(w, "Nombre y Unidad son requeridos", http.StatusBadRequest)
		return
	}
	if err := repository.DB.Create(&m).Error; err != nil {
		http.Error(w, "No se pudo crear", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(m)
}

func ActualizarMaterial(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var m models.Material
	if err := repository.DB.First(&m, id).Error; err != nil {
		http.Error(w, "Material no encontrado", http.StatusNotFound)
		return
	}

	var payload models.Material
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if payload.Nombre != "" {
		m.Nombre = payload.Nombre
	}
	if payload.Unidad != "" {
		m.Unidad = payload.Unidad
	}
	// Permitimos 0 como valor válido, por eso no usamos "!= 0" para decidir.
	m.Cantidad = payload.Cantidad

	if err := repository.DB.Save(&m).Error; err != nil {
		http.Error(w, "No se pudo actualizar", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(m)
}

func EliminarMaterial(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := repository.DB.Delete(&models.Material{}, id).Error; err != nil {
		http.Error(w, "No se pudo eliminar", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type AjusteStockRequest struct {
	Delta     float64 `json:"delta"`      // puede ser negativo
	Motivo    string  `json:"motivo"`     // ej: "Consumo en misión X"
	UsuarioID uint    `json:"usuario_id"` // del contexto real si lo quieres
}

func AjustarStockMaterial(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var body AjusteStockRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if body.Delta == 0 {
		http.Error(w, "Delta no puede ser 0", http.StatusBadRequest)
		return
	}

	tx := repository.DB.Begin()
	if tx.Error != nil {
		http.Error(w, "No se pudo iniciar transacción", http.StatusInternalServerError)
		return
	}

	var m models.Material
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&m, id).Error; err != nil {
		tx.Rollback()
		http.Error(w, "Material no encontrado", http.StatusNotFound)
		return
	}

	nuevo := m.Cantidad + body.Delta
	if nuevo < 0 {
		tx.Rollback()
		http.Error(w, "Stock insuficiente para el ajuste", http.StatusBadRequest)
		return
	}

	m.Cantidad = nuevo
	if err := tx.Save(&m).Error; err != nil {
		tx.Rollback()
		http.Error(w, "No se pudo actualizar el stock", http.StatusInternalServerError)
		return
	}

	// Registrar auditoría
	utils.RegistrarAuditoriaAsync(body.UsuarioID, "Ajuste de stock", "Material",
		fmt.Sprintf("Material #%d (%s): delta=%.3f, motivo=%s, nuevo=%.3f", m.ID, m.Nombre, body.Delta, body.Motivo, m.Cantidad))

	if err := tx.Commit().Error; err != nil {
		http.Error(w, "No se pudo confirmar el ajuste", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(m)
}
