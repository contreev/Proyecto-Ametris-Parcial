package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"

	"github.com/hibiken/asynq"
)

type TransmutationPayload struct {
	TransmutationID uint `json:"transmutation_id"`
}

func main() {
	repository.ConnectDB()

	srv := asynq.NewServer(
		asynq.RedisClientOpt{Addr: "redis:6379"},
		asynq.Config{
			Concurrency: 5,
		},
	)

	mux := asynq.NewServeMux()
	mux.HandleFunc("process:transmutation", handleTransmutationTask)

	fmt.Println("⚙️  Worker escuchando tareas de transmutación en Redis...")
	if err := srv.Run(mux); err != nil {
		log.Fatalf("❌ Error ejecutando el worker: %v", err)
	}
}

func handleTransmutationTask(ctx context.Context, t *asynq.Task) error {
	var payload TransmutationPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return err
	}

	var trans models.Transmutation
	if err := repository.DB.First(&trans, payload.TransmutationID).Error; err != nil {
		return err
	}

	fmt.Printf("⚗️ Procesando transmutación #%d: %s...\n", trans.ID, trans.Nombre)
	time.Sleep(3 * time.Second) // simula el proceso

	// --- 🔮 Simulación del costo alquímico y resultado ---
	rand.Seed(time.Now().UnixNano())

	// Variación del costo: entre -20% y +30%
	variacion := 0.8 + rand.Float64()*0.5
	costoFinal := trans.Costo * variacion

	// Probabilidad de éxito (70%)
	success := rand.Intn(100) < 70

	if success {
		trans.Estado = "Completada"
		trans.Resultado = fmt.Sprintf(
			"Éxito: materia estable. Costo final: %.2f (variación %.0f%%)",
			costoFinal, (variacion-1)*100,
		)
	} else {
		trans.Estado = "Fallida"
		trans.Resultado = fmt.Sprintf(
			"Fallo: intercambio desequilibrado. Energía desperdiciada %.2f unidades.",
			costoFinal*0.5,
		)
	}

	// Guardar cambios
	if err := repository.DB.Save(&trans).Error; err != nil {
		return err
	}

	fmt.Printf("✅ Transmutación #%d finalizada. Estado: %s | Costo simulado: %.2f\n",
		trans.ID, trans.Estado, costoFinal)

	return nil
}
