package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"

	"github.com/gorilla/mux"
)

// Crear una nueva misión
func CrearMision(w http.ResponseWriter, r *http.Request) {
	var mision models.Mission
	if err := json.NewDecoder(r.Body).Decode(&mision); err != nil {
		http.Error(w, "Error al decodificar JSON", http.StatusBadRequest)
		return
	}
	mision.Estado = "pendiente"
	mision.FechaCreacion = time.Now()

	if err := repository.DB.Create(&mision).Error; err != nil {
		http.Error(w, "Error al crear misión", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(mision)
}

// Listar misiones
func ListarMisiones(w http.ResponseWriter, r *http.Request) {
	var misiones []models.Mission
	repository.DB.Preload("Alquimista").Find(&misiones)
	json.NewEncoder(w).Encode(misiones)
}

// Actualizar estado
func ActualizarEstadoMision(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	var mision models.Mission

	if err := repository.DB.First(&mision, params["id"]).Error; err != nil {
		http.Error(w, "Misión no encontrada", http.StatusNotFound)
		return
	}

	var data map[string]string
	json.NewDecoder(r.Body).Decode(&data)

	if nuevoEstado, ok := data["estado"]; ok {
		mision.Estado = nuevoEstado
	}

	if informe, ok := data["informe_final"]; ok {
		mision.InformeFinal = informe
		now := time.Now()
		mision.FechaCierre = &now
	}

	repository.DB.Save(&mision)
	json.NewEncoder(w).Encode(mision)
}
