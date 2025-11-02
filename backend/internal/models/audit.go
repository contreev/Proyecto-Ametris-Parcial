// backend/internal/models/audit.go
package models

import "time"

type Audit struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Entity    string    `json:"entity"` // e.g., "transmutation"
	EntityID  uint      `json:"entity_id"`
	Action    string    `json:"action"` // e.g., "processed", "approved"
	Details   string    `json:"details"`
	CreatedAt time.Time `json:"created_at"`
}
