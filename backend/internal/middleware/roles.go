package middleware

import (
	"encoding/json"
	"net/http"
)

// RequireRole valida que el usuario tenga el rol necesario para acceder
func RequireRole(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			roleVal := r.Context().Value(ContextRole)
			if roleVal == nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "No se encontró el rol del usuario en el contexto",
				})
				return
			}

			role := roleVal.(string)
			if role != requiredRole {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusForbidden)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "Acceso denegado. Se requiere rol: " + requiredRole,
				})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
