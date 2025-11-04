package utils

import (
	"time"

	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"
)

// RegistrarAuditoriaAsync lanza una goroutine para registrar auditorías sin bloquear
func RegistrarAuditoriaAsync(usuarioID uint, accion, entidad, detalles string) {
	go func() {
		auditoria := models.Auditoria{
			UsuarioID: usuarioID,
			Accion:    accion,
			Entidad:   entidad,
			Detalles:  detalles,
			Fecha:     time.Now(),
		}
		repository.DB.Create(&auditoria)
	}()
}
