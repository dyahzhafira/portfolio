package skill

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func ListSkills(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var skills []Skill
		query := db.Order("category asc, sort_order asc")

		if category := c.Query("category"); category != "" {
			query = query.Where("category = ?", category)
		}

		if err := query.Find(&skills).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not fetch skills", "code": "INTERNAL_ERROR"},
			})
		}
		return c.JSON(fiber.Map{"data": skills})
	}
}

type CreateSkillRequest struct {
	Name      string `json:"name"`
	Category  string `json:"category"`
	IconSlug  string `json:"icon_slug"`
	SortOrder *int   `json:"sort_order"`
}

func CreateSkill(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req CreateSkillRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		if req.Name == "" || req.Category == "" || req.IconSlug == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "name, category and icon_slug are required", "code": "VALIDATION_FAILED"},
			})
		}

		sortOrder := 0
		if req.SortOrder != nil {
			sortOrder = *req.SortOrder
		}

		s := Skill{
			Name:      req.Name,
			Category:  req.Category,
			IconSlug:  req.IconSlug,
			SortOrder: sortOrder,
		}

		if err := db.Create(&s).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not create skill", "code": "INTERNAL_ERROR"},
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": s})
	}
}

func UpdateSkill(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var s Skill
		if err := db.First(&s, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Skill not found", "code": "NOT_FOUND"},
			})
		}

		var req CreateSkillRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		updates := map[string]interface{}{}
		if req.Name != "" {
			updates["name"] = req.Name
		}
		if req.Category != "" {
			updates["category"] = req.Category
		}
		if req.IconSlug != "" {
			updates["icon_slug"] = req.IconSlug
		}
		if req.SortOrder != nil {
			updates["sort_order"] = *req.SortOrder
		}

		if err := db.Model(&s).Updates(updates).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not update skill", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": s})
	}
}

func DeleteSkill(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		if err := db.Delete(&Skill{}, id).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not delete skill", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Skill deleted"}})
	}
}
