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
	Name     string `json:"name"`
	IconSlug string `json:"icon_slug"`
}

func CreateTag(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req CreateTagRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}
		if req.Name == "" || req.IconSlug == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "name and icon_slug are required", "code": "VALIDATION_FAILED"},
			})
		}

		t := project.Tag{Name: req.Name, IconSlug: req.IconSlug}
		if err := db.Create(&t).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not create tag", "code": "INTERNAL_ERROR"},
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": t})
	}
}

func UpdateTag(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var t project.Tag
		if err := db.First(&t, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Tag not found", "code": "NOT_FOUND"},
			})
		}

		var req CreateTagRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		updates := map[string]interface{}{}
		if req.Name != "" {
			updates["name"] = req.Name
		}
		if req.IconSlug != "" {
			updates["icon_slug"] = req.IconSlug
		}

		if err := db.Model(&t).Updates(updates).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not update tag", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": t})
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

func DeleteTag(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		if err := db.Delete(&project.Tag{}, id).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not delete tag", "code": "INTERNAL_ERROR"},
			})
		}
		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Tag deleted"}})
	}
}