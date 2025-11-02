package models

import "time"

type Alquimista struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Nombre       string    `json:"nombre"`
	Rango        string    `json:"rango"`
	Especialidad string    `json:"especialidad"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
