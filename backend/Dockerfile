# Etapa de compilación
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compilar el servidor y el worker
RUN go build -o alquimia-backend ./cmd/server/main.go
RUN go build -o worker ./cmd/server/worker/main.go


# Etapa final
FROM alpine:latest
WORKDIR /root/

COPY --from=builder /app/alquimia-backend .
COPY --from=builder /app/worker .
COPY .env .

EXPOSE 8080

CMD ["./alquimia-backend"]
