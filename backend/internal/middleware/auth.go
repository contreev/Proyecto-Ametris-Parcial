package middleware

import (
	"context"
	"net/http"
	"strings"

	"alquimia-backend/internal/utils"

	"github.com/golang-jwt/jwt/v5"
)

// Claves para guardar datos en el contexto
type contextKey string

const (
	ContextUserID contextKey = "user_id"
	ContextRole   contextKey = "role"
)

func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth == "" {
			http.Error(w, "missing auth", http.StatusUnauthorized)
			return
		}
		parts := strings.Split(auth, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "invalid auth header", http.StatusUnauthorized)
			return
		}

		tokenStr := parts[1]
		token, err := utils.ParseToken(tokenStr)
		if err != nil || !token.Valid {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		// Extraer los claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			http.Error(w, "invalid claims", http.StatusUnauthorized)
			return
		}

		// Guardar en contexto
		ctx := context.WithValue(r.Context(), ContextUserID, uint(claims["user_id"].(float64)))
		ctx = context.WithValue(ctx, ContextRole, claims["role"].(string))

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
