package main

import (
	"log"
	"os"
	"portfolio-dyah/backend-go/internal/auth"
	"portfolio-dyah/backend-go/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main (){
	dsn:= os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil{
		log.Fatal("failed to connect to database: ", err)
	}

	app:= fiber.New()
	app.Get("/health", func (c *fiber.Ctx) error{
		return c.JSON(fiber.Map{
			"status":"ok",
		})
	})

	app.Post("/auth/login", auth.LoginHandler(db, os.Getenv("JWT_SECRET")))

	app.Get("/admin/ping", middleware.RequireAuth(os.Getenv("JWT_SECRET")), func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"data": fiber.Map{"message": "you are authenticated", "userID": c.Locals("userID")}})
	})

	log.Fatal(app.Listen(":8080"))
}