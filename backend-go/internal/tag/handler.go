package tag

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"portfolio-dyah/backend-go/internal/project"
)

func ListTags(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tags []project.Tag
		if err := db.Find(&tags).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not fetch tags", "code": "INTERNAL_ERROR"},
			})
		}
		return c.JSON(fiber.Map{"data": tags})
	}
}

type CreateTagRequest struct {
	Name       string `json:"name"`
	ColorToken string `json:"color_token"`
}

func CreateTag(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req CreateTagRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}
		if req.Name == "" || req.ColorToken == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "name and color_token are required", "code": "VALIDATION_FAILED"},
			})
		}

		t := project.Tag{Name: req.Name, ColorToken: req.ColorToken}
		if err := db.Create(&t).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not create tag", "code": "INTERNAL_ERROR"},
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": t})
	}
}

func AttachTagToProject(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		projectID := c.Params("id")
		tagID := c.Params("tagId")

		var proj project.Project
		if err := db.First(&proj, projectID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Project not found", "code": "NOT_FOUND"},
			})
		}

		var t project.Tag
		if err := db.First(&t, tagID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Tag not found", "code": "NOT_FOUND"},
			})
		}

		if err := db.Model(&proj).Association("Tags").Append(&t); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not attach tag", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Tag attached"}})
	}
}