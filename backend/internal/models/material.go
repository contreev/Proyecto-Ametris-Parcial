// backend/internal/models/material.go
package models

import "time"

type Material struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Nombre    string    `gorm:"not null" json:"nombre"`
	Cantidad  float64   `json:"cantidad"` // unidades
	Unidad    string    `json:"unidad"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
