package tasks

import (
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

func MonitorRecursosTask(db *gorm.DB) {
	go func() {
		for {
			fmt.Println("🔍 Ejecutando verificación automática de recursos...")

			// Verificar materiales con exceso
			rows, err := db.Raw("SELECT id, nombre, cantidad FROM materiales WHERE cantidad > 1000").Rows()
			if err != nil {
				log.Println("Error verificando materiales:", err)
				time.Sleep(10 * time.Minute)
				continue
			}
			defer rows.Close()

			for rows.Next() {
				var id int
				var nombre string
				var cantidad int
				if err := rows.Scan(&id, &nombre, &cantidad); err != nil {
					log.Println("Error leyendo fila:", err)
					continue
				}

				// Registrar la auditoría
				auditMsg := fmt.Sprintf("⚠️ Material '%s' (ID %d) tiene cantidad anómala: %d", nombre, id, cantidad)
				if err := db.Exec("INSERT INTO auditorias (mensaje, fecha) VALUES (?, NOW())", auditMsg).Error; err != nil {
					log.Println("Error registrando auditoría:", err)
				}
			}

			// Esperar 10 minutos antes de repetir
			time.Sleep(10 * time.Minute)
		}
	}()
}
