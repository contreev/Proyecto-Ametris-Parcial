package repository

import (
	"log"

	"gorm.io/gorm"
)

// AuditRepository maneja los registros de auditoría
type AuditRepository struct {
	DB *gorm.DB
}

// Constructor
func NewAuditRepository(db *gorm.DB) *AuditRepository {
	return &AuditRepository{DB: db}
}

// Guarda un evento de auditoría de forma asíncrona
func (r *AuditRepository) RegistrarEventoAsync(mensaje string) {
	go func() {
		err := r.DB.Exec(
			"INSERT INTO auditorias (mensaje, fecha) VALUES (?, NOW())",
			mensaje,
		).Error

		if err != nil {
			log.Println("❌ Error guardando auditoría:", err)
		}
	}()
}
