package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"alquimia-backend/internal/handlers"
	"alquimia-backend/internal/middleware"
	"alquimia-backend/internal/models"
	"alquimia-backend/internal/repository"
	"alquimia-backend/internal/utils"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// ==========================================
	// 🔹 CONEXIÓN Y MIGRACIÓN DE LA BASE DE DATOS
	// ==========================================
	repository.ConnectDB()
	repository.DB.AutoMigrate(
		&models.User{},
		&models.Alquimista{},
		&models.Transmutation{},
		&models.Mission{},
		&models.Auditoria{},
		&models.Material{}, // materiales
	)

	// ==========================================
	// 🔹 REPOSITORIOS Y HANDLERS
	// ==========================================
	userRepo := repository.NewUserRepository(repository.DB)
	authHandler := handlers.NewAuthHandler(userRepo)

	// ==========================================
	// 🔹 CONFIGURACIÓN DEL ROUTER PRINCIPAL
	// ==========================================
	r := mux.NewRouter()

	// ==========================================
	// 🔓 RUTAS PÚBLICAS (sin autenticación)
	// ==========================================
	r.HandleFunc("/api/register", authHandler.Register).Methods("POST")
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	}).Methods("GET")

	// ==========================================
	// 🔐 RUTAS PRIVADAS (con JWT)
	// ==========================================
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.JWTAuth)

	// -------------------------------
	// ⚗️ Transmutaciones (alquimista)
	// -------------------------------
	api.Handle("/transmutaciones",
		middleware.RequireRole("alquimista")(http.HandlerFunc(handlers.GetTransmutaciones)),
	).Methods("GET")

	api.Handle("/transmutaciones",
		middleware.RequireRole("alquimista")(http.HandlerFunc(handlers.CreateTransmutation)),
	).Methods("POST")

	// -------------------------------
	// 👩‍🔬 Alquimistas (supervisor)
	// -------------------------------
	api.Handle("/alquimistas",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.GetAlquimistas)),
	).Methods("GET")

	api.Handle("/alquimistas",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.CreateAlquimista)),
	).Methods("POST")

	// -------------------------------
	// 🚀 Misiones (supervisor)
	// -------------------------------
	api.Handle("/misiones",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.ListarMisiones)),
	).Methods("GET")

	api.Handle("/misiones",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.CrearMision)),
	).Methods("POST")

	api.Handle("/misiones/{id}",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.ActualizarEstadoMision)),
	).Methods("PUT")

	// -------------------------------
	// 🧾 Auditorías (supervisor)
	// -------------------------------
	api.Handle("/auditorias",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.ObtenerAuditorias)),
	).Methods("GET")

	api.Handle("/auditorias",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.CrearAuditoria)),
	).Methods("POST")

	// -------------------------------
	// 🧪 Materiales (lectura para alquimistas / CRUD para supervisores)
	// -------------------------------
	api.Handle("/materiales",
		middleware.RequireAnyRole("supervisor", "alquimista")(http.HandlerFunc(handlers.ListarMateriales)),
	).Methods("GET")

	api.Handle("/materiales",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.CrearMaterial)),
	).Methods("POST")

	api.Handle("/materiales/{id}",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.ActualizarMaterial)),
	).Methods("PUT")

	api.Handle("/materiales/{id}",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.EliminarMaterial)),
	).Methods("DELETE")

	api.Handle("/materiales/{id}/ajustar",
		middleware.RequireRole("supervisor")(http.HandlerFunc(handlers.AjustarStockMaterial)),
	).Methods("PATCH")

	// -------------------------------
	// 👤 Perfil general (cualquier autenticado)
	// -------------------------------
	api.HandleFunc("/perfil", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("✅ Acceso autorizado con JWT"))
	}).Methods("GET")

	// ==========================================
	// 🧠 VERIFICACIÓN AUTOMÁTICA EN SEGUNDO PLANO
	// ==========================================
	go iniciarVerificacionesPeriodicas()

	// ==========================================
	// 🌍 CONFIGURACIÓN DE CORS
	// ==========================================
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	// ==========================================
	// 🚀 SERVIDOR
	// ==========================================
	handler := c.Handler(r)
	fmt.Println("🚀 Servidor escuchando en: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

// ==========================================
// 🔁 TAREA PERIÓDICA AUTOMÁTICA
// ==========================================
func iniciarVerificacionesPeriodicas() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		var misiones []models.Mission
		repository.DB.Where("estado != ?", "Completada").Find(&misiones)

		if len(misiones) > 0 {
			log.Printf("🔍 Verificación automática: %d misiones pendientes detectadas.", len(misiones))
			utils.RegistrarAuditoriaAsync(0, "Verificación automática", "Misión",
				fmt.Sprintf("Se detectaron %d misiones sin completar.", len(misiones)))
		}
	}
}
