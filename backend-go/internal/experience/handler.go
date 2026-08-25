package experience

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"portfolio-dyah/backend-go/internal/project"
)

const dateLayout = "2006-01-02"

func ListExperience(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var items []Experience
		if err := db.Preload("Tags").Order("sort_order asc").Find(&items).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not fetch experience", "code": "INTERNAL_ERROR"},
			})
		}
		return c.JSON(fiber.Map{"data": items})
	}
}

type CreateExperienceRequest struct {
	Role        string `json:"role"`
	Org         string `json:"org"`
	PeriodStart string `json:"period_start"`
	PeriodEnd   string `json:"period_end"`
	Description string `json:"description"`
	SortOrder   *int   `json:"sort_order"`
}

func parseOptionalDate(value string) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}
	parsed, err := time.Parse(dateLayout, value)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}

func CreateExperience(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req CreateExperienceRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		if req.Role == "" || req.Org == "" || req.PeriodStart == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "role, org and period_start are required", "code": "VALIDATION_FAILED"},
			})
		}

		periodStart, err := time.Parse(dateLayout, req.PeriodStart)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "period_start must be in YYYY-MM-DD format", "code": "VALIDATION_FAILED"},
			})
		}

		periodEnd, err := parseOptionalDate(req.PeriodEnd)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "period_end must be in YYYY-MM-DD format", "code": "VALIDATION_FAILED"},
			})
		}

		sortOrder := 0
		if req.SortOrder != nil {
			sortOrder = *req.SortOrder
		}

		exp := Experience{
			Role:        req.Role,
			Org:         req.Org,
			PeriodStart: periodStart,
			PeriodEnd:   periodEnd,
			Description: req.Description,
			SortOrder:   sortOrder,
		}

		if err := db.Create(&exp).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not create experience", "code": "INTERNAL_ERROR"},
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": exp})
	}
}

func UpdateExperience(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var exp Experience
		if err := db.First(&exp, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Experience not found", "code": "NOT_FOUND"},
			})
		}

		var req CreateExperienceRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		updates := map[string]interface{}{}
		if req.Role != "" {
			updates["role"] = req.Role
		}
		if req.Org != "" {
			updates["org"] = req.Org
		}
		if req.Description != "" {
			updates["description"] = req.Description
		}
		if req.SortOrder != nil {
			updates["sort_order"] = *req.SortOrder
		}
		if req.PeriodStart != "" {
			periodStart, err := time.Parse(dateLayout, req.PeriodStart)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": fiber.Map{"message": "period_start must be in YYYY-MM-DD format", "code": "VALIDATION_FAILED"},
				})
			}
			updates["period_start"] = periodStart
		}
		if req.PeriodEnd != "" {
			periodEnd, err := parseOptionalDate(req.PeriodEnd)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": fiber.Map{"message": "period_end must be in YYYY-MM-DD format", "code": "VALIDATION_FAILED"},
				})
			}
			updates["period_end"] = periodEnd
		}

		if err := db.Model(&exp).Updates(updates).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not update experience", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": exp})
	}
}

func DeleteExperience(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		if err := db.Delete(&Experience{}, id).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not delete experience", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Experience deleted"}})
	}
}

func AttachTagToExperience(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		experienceID := c.Params("id")
		tagID := c.Params("tagId")

		var exp Experience
		if err := db.First(&exp, experienceID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Experience not found", "code": "NOT_FOUND"},
			})
		}

		var t project.Tag
		if err := db.First(&t, tagID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Tag not found", "code": "NOT_FOUND"},
			})
		}

		if err := db.Model(&exp).Association("Tags").Append(&t); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not attach tag", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Tag attached"}})
	}
}

func DetachTagFromExperience(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		experienceID := c.Params("id")
		tagID := c.Params("tagId")

		var exp Experience
		if err := db.First(&exp, experienceID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Experience not found", "code": "NOT_FOUND"},
			})
		}

		var t project.Tag
		if err := db.First(&t, tagID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Tag not found", "code": "NOT_FOUND"},
			})
		}

		if err := db.Model(&exp).Association("Tags").Delete(&t); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not detach tag", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Tag detached"}})
	}
}
