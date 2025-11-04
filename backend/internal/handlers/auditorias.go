package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"
)

// Crear una nueva auditoría manualmente (opcional)
func CrearAuditoria(w http.ResponseWriter, r *http.Request) {
	var auditoria models.Auditoria
	if err := json.NewDecoder(r.Body).Decode(&auditoria); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	auditoria.Fecha = time.Now()

	if err := repository.DB.Create(&auditoria).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(auditoria)
}

// Obtener todas las auditorías
func ObtenerAuditorias(w http.ResponseWriter, r *http.Request) {
	var auditorias []models.Auditoria
	if err := repository.DB.Order("fecha desc").Find(&auditorias).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(auditorias)
}
