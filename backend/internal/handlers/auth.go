package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"
	"alquimia-backend/internal/utils"

	"golang.org/x/crypto/bcrypt"
)

// AuthHandler maneja register/login
type AuthHandler struct {
	UserRepo *repository.UserRepository
}

func NewAuthHandler(repo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{UserRepo: repo}
}

// Register - crea un nuevo usuario (alquimista o supervisor)
// Espera JSON: { "email": "...", "password": "...", "role":"alquimista" }
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.JSONResponse(w, http.StatusBadRequest, map[string]string{"error": "datos inválidos"})
		return
	}

	// Normalize inputs
	req.Email = strings.TrimSpace(req.Email)
	req.Role = strings.ToLower(strings.TrimSpace(req.Role))

	// Validate role
	if req.Role != string(models.RoleAlquimista) && req.Role != string(models.RoleSupervisor) {
		utils.JSONResponse(w, http.StatusBadRequest, map[string]string{"error": "role inválido, use 'alquimista' o 'supervisor'"})
		return
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.JSONResponse(w, http.StatusInternalServerError, map[string]string{"error": "error en servidor"})
		return
	}

	user := models.User{
		Email: req.Email,
		Password: string(hashed),
		Nombre: req.Nombre,
		Rango: req.Rango,
		Especialidad: req.Especialidad,
		Role: models.Role(req.Role),
	}

	if err := h.UserRepo.Create(&user); err != nil {
		// posible duplicado por unique constraint
		utils.JSONResponse(w, http.StatusInternalServerError, map[string]string{"error": "no se pudo crear usuario (¿email ya usado?)"})
		return
	}

	utils.JSONResponse(w, http.StatusCreated, map[string]string{"message": "usuario registrado correctamente"})
}

// Login - autentica y devuelve JWT
// Espera JSON: { "email":"...", "password":"..." }
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.JSONResponse(w, http.StatusBadRequest, map[string]string{"error": "datos inválidos"})
		return
	}

	user, err := h.UserRepo.GetByEmail(strings.TrimSpace(req.Email))
	if err != nil {
		utils.JSONResponse(w, http.StatusUnauthorized, map[string]string{"error": "credenciales inválidas"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		utils.JSONResponse(w, http.StatusUnauthorized, map[string]string{"error": "credenciales inválidas"})
		return
	}

	// Generar token (usa ID y role)
	tokenString, err := utils.CreateToken(user.ID, string(user.Role))
	if err != nil {
		utils.JSONResponse(w, http.StatusInternalServerError, map[string]string{"error": "error generando token"})
		return
	}

	// Retornar token y role (útil para frontend)
	utils.JSONResponse(w, http.StatusOK, map[string]interface{}{
		"token": tokenString,
		"role":  user.Role,
		"email": user.Email,
		"id":    user.ID,
	})
}
