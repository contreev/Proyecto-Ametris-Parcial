package handlers

import (
	"encoding/json"
	"net/http"

	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"

	"github.com/hibiken/asynq"
)

func CreateTransmutation(w http.ResponseWriter, r *http.Request) {
	var newTransmutation models.Transmutation

	if err := json.NewDecoder(r.Body).Decode(&newTransmutation); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := repository.DB.Create(&newTransmutation).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	client := asynq.NewClient(asynq.RedisClientOpt{Addr: "redis:6379"})
	defer client.Close()

	payload := map[string]interface{}{"transmutation_id": newTransmutation.ID}
	data, _ := json.Marshal(payload)

	task := asynq.NewTask("process:transmutation", data)
	client.Enqueue(task)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Transmutación creada y procesándose",
		"id":      newTransmutation.ID,
	})
}

// Esta va fuera de la otra
func GetTransmutaciones(w http.ResponseWriter, r *http.Request) {
	var transmutaciones []models.Transmutation
	repository.DB.Find(&transmutaciones)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transmutaciones)
	
}
