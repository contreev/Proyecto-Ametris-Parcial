package models

import "time"

type Role string

const (
	RoleAlquimista Role = "alquimista"
	RoleSupervisor Role = "supervisor"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	Password     string    `json:"-"` // hashed
	Nombre       string    `json:"nombre"`
	Rango        string    `json:"rango"`
	Especialidad string    `json:"especialidad"`
	Role         Role      `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Para login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Para register
type RegisterRequest struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	Nombre       string `json:"nombre,omitempty"`
	Rango        string `json:"rango,omitempty"`
	Especialidad string `json:"especialidad,omitempty"`
	Role         string `json:"role"` // "alquimista" o "supervisor"
}
