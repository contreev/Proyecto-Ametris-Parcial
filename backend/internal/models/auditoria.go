package models

import "time"

type Auditoria struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UsuarioID uint      `json:"usuario_id"`
	Accion    string    `json:"accion"`
	Entidad   string    `json:"entidad"`
	Detalles  string    `json:"detalles"`
	Fecha     time.Time `json:"fecha"`
}
