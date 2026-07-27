package main

import (
	"log"
	"os"
	"time"

	"portfolio-dyah/backend-go/internal/auth"
	"portfolio-dyah/backend-go/internal/feedback"
	"portfolio-dyah/backend-go/internal/media"
	"portfolio-dyah/backend-go/internal/middleware"
	"portfolio-dyah/backend-go/internal/project"
	"portfolio-dyah/backend-go/internal/tag"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
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

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,https://dyahzhafira.dev",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))

	app.Get("/health", func (c *fiber.Ctx) error{
		return c.JSON(fiber.Map{
			"status":"ok",
		})
	})

	loginLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
	})
	feedbackLimiter := limiter.New(limiter.Config{
		Max:        3,
		Expiration: 1 * time.Minute,
	})

	app.Post("/auth/login", loginLimiter, auth.LoginHandler(db, os.Getenv("JWT_SECRET")))

	app.Get("/admin/ping", middleware.RequireAuth(os.Getenv("JWT_SECRET")), func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"data": fiber.Map{"message": "you are authenticated", "userID": c.Locals("userID")}})
	})

	app.Get("/projects", project.ListProjects(db))
	app.Get("/projects/:slug", project.GetProject(db))

	admin := app.Group("/admin", middleware.RequireAuth(os.Getenv("JWT_SECRET")))
	admin.Post("/projects", project.CreateProject(db))
	admin.Patch("/projects/:id", project.UpdateProject(db))
	admin.Delete("/projects/:id", project.DeleteProject(db))

	app.Get("/tags", tag.ListTags(db))
	admin.Post("/tags", tag.CreateTag(db))
	admin.Post("/projects/:id/tags/:tagId", tag.AttachTagToProject(db))
	admin.Post("/media/upload", media.UploadMedia(db))

	app.Post("/feedback", feedbackLimiter, feedback.CreateFeedback(db))

	log.Fatal(app.Listen(":8080"))
}