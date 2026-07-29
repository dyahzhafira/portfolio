package main

import (
	"log"
	"os"
	"time"

	"portfolio-dyah/backend-go/internal/auth"
	"portfolio-dyah/backend-go/internal/experience"
	"portfolio-dyah/backend-go/internal/feedback"
	"portfolio-dyah/backend-go/internal/github"
	"portfolio-dyah/backend-go/internal/media"
	"portfolio-dyah/backend-go/internal/middleware"
	"portfolio-dyah/backend-go/internal/project"
	"portfolio-dyah/backend-go/internal/skill"
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
		AllowOrigins:     "http://localhost:3000,https://dyahzhafira.dev,https://www.dyahzhafira.dev",
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
	app.Post("/auth/logout", auth.LogoutHandler())

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
	admin.Patch("/tags/:id", tag.UpdateTag(db))
	admin.Delete("/tags/:id", tag.DeleteTag(db))
	admin.Post("/projects/:id/tags/:tagId", tag.AttachTagToProject(db))

	app.Get("/media", media.ListMedia(db))
	admin.Post("/media/upload", media.UploadMedia(db))
	admin.Delete("/media/:id", media.DeleteMedia(db))

	app.Post("/feedback", feedbackLimiter, feedback.CreateFeedback(db))
	admin.Get("/feedback", feedback.ListFeedback(db))
	admin.Delete("/feedback/:id", feedback.DeleteFeedback(db))

	app.Get("/experience", experience.ListExperience(db))
	admin.Post("/experience", experience.CreateExperience(db))
	admin.Patch("/experience/:id", experience.UpdateExperience(db))
	admin.Delete("/experience/:id", experience.DeleteExperience(db))
	admin.Post("/experience/:id/tags/:tagId", experience.AttachTagToExperience(db))

	app.Get("/github/contributions", github.ListContributions())

	app.Get("/skills", skill.ListSkills(db))
	admin.Post("/skills", skill.CreateSkill(db))
	admin.Patch("/skills/:id", skill.UpdateSkill(db))
	admin.Delete("/skills/:id", skill.DeleteSkill(db))

	log.Fatal(app.Listen(":8080"))
}