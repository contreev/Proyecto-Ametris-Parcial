package models

import (
	"time"

	"gorm.io/gorm"
)

type Mission struct {
	gorm.Model
	Titulo        string     `json:"titulo"`
	Descripcion   string     `json:"descripcion"`
	Prioridad     string     `json:"prioridad"` // baja, media, alta
	AlquimistaID  uint       `json:"alquimista_id"`
	Alquimista    Alquimista `json:"alquimista" gorm:"foreignKey:AlquimistaID"`
	Materiales    string     `json:"materiales"` // lista separada por comas o JSON
	Estado        string     `json:"estado"`     // pendiente, en progreso, completada, rechazada
	InformeFinal  string     `json:"informe_final"`
	FechaCreacion time.Time  `json:"fecha_creacion"`
	FechaCierre   *time.Time `json:"fecha_cierre"`
}
