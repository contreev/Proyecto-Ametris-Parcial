package main

import (
	"fmt"
	"log"
	"net/http"

	"alquimia-backend/internal/handlers"
	"alquimia-backend/internal/middleware"
	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// 🔹 Conectar a la base de datos
	repository.ConnectDB()

	// 🔹 Migrar modelos automáticamente
	repository.DB.AutoMigrate(
		&models.User{},          // Usuarios (para login/register)
		&models.Alquimista{},    // Alquimistas
		&models.Transmutation{}, // Transmutaciones
		&models.Mission{},       // Misiones
	)

	// 🔹 Crear repositorios y handlers
	userRepo := repository.NewUserRepository(repository.DB)
	authHandler := handlers.NewAuthHandler(userRepo)

	// 🔹 Configurar router principal
	r := mux.NewRouter()

	// =====================================================================
	// 🔓 RUTAS PÚBLICAS (no requieren JWT)
	// =====================================================================

	// --- Autenticación ---
	r.HandleFunc("/api/register", authHandler.Register).Methods("POST")
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST")

	// --- Alquimistas ---
	r.HandleFunc("/api/alquimistas", handlers.GetAlquimistas).Methods("GET")
	r.HandleFunc("/api/alquimistas", handlers.CreateAlquimista).Methods("POST")

	// --- Misiones ---
	r.HandleFunc("/api/misiones", handlers.ListarMisiones).Methods("GET")
	r.HandleFunc("/api/misiones", handlers.CrearMision).Methods("POST")
	r.HandleFunc("/api/misiones/{id}", handlers.ActualizarEstadoMision).Methods("PUT")

	// --- Transmutaciones ---
	r.HandleFunc("/api/transmutaciones", handlers.GetTransmutaciones).Methods("GET")
	r.HandleFunc("/api/transmutaciones", handlers.CreateTransmutation).Methods("POST")

	// --- Health Check ---
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	}).Methods("GET")

	// =====================================================================
	// 🔐 RUTAS PRIVADAS (con JWT, listas para cuando quieras proteger algo)
	// =====================================================================
	apiPrivate := r.PathPrefix("/api/private").Subrouter()
	apiPrivate.Use(middleware.JWTAuth)

	// Ejemplo de ruta privada (puedes añadir más luego)
	apiPrivate.HandleFunc("/perfil", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Acceso autorizado con JWT ✅"))
	}).Methods("GET")

	// =====================================================================
	// 🌍 Configuración CORS
	// =====================================================================
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	// =====================================================================
	// 🚀 Iniciar servidor
	// =====================================================================
	handler := c.Handler(r)
	fmt.Println("🚀 Servidor escuchando en: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
