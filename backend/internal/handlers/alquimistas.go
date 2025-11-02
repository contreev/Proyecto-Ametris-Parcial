package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"
)

// Obtener todos los alquimistas
func GetAlquimistas(w http.ResponseWriter, r *http.Request) {
	var alquimistas []models.Alquimista
	repository.DB.Find(&alquimistas)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(alquimistas)
}

// Crear un alquimista nuevo
func CreateAlquimista(w http.ResponseWriter, r *http.Request) {
	var alquimista models.Alquimista

	fmt.Println("📩 Recibiendo solicitud POST /alquimistas...")

	if err := json.NewDecoder(r.Body).Decode(&alquimista); err != nil {
		fmt.Println("❌ Error al decodificar JSON:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Printf("✅ JSON recibido: %+v\n", alquimista)

	if err := repository.DB.Create(&alquimista).Error; err != nil {
		fmt.Println("❌ Error al guardar en la base de datos:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("💾 Alquimista guardado correctamente")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(alquimista)
}
