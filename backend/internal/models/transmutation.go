package models

import "gorm.io/gorm"

type Transmutation struct {
	gorm.Model
	Nombre      string  `json:"nombre"`
	Descripcion string  `json:"descripcion"`
	Costo       float64 `json:"costo"`
	Estado      string  `json:"estado"`
	Resultado   string  `json:"resultado"`
}
