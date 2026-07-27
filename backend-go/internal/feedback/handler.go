package feedback

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

const minMessageLength = 3

type CreateFeedbackRequest struct {
	Message string `json:"message"`
}

func CreateFeedback(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req CreateFeedbackRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		if len(req.Message) < minMessageLength {
			remaining := minMessageLength - len(req.Message)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{
					"message": fmt.Sprintf("Hii! I'm sorry, you can add %d character more.", remaining),
					"code":    "VALIDATION_FAILED",
				},
			})
		}

		fb := Feedback{Message: req.Message}
		if err := db.Create(&fb).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Sorry, there was a problem sending it. Try again in a moment?", "code": "INTERNAL_ERROR"},
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": fiber.Map{"message": "Thank you! Your message has been received. Your feedback really means to me."}})
	}
}