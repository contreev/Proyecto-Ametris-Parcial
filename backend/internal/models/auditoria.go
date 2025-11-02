package models

import (
	"time"
)

// Auditoria representa un registro de eventos o acciones dentro del sistema
type Auditoria struct {
	ID      uint      `gorm:"primaryKey;autoIncrement"`
	Mensaje string    `gorm:"type:text;not null"`
	Fecha   time.Time `gorm:"autoCreateTime"`
}
