package auth

import (
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(db *gorm.DB, jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req LoginRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		var user User
		if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid email or password", "code": "AUTH_FAILED"},
			})
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid email or password", "code": "AUTH_FAILED"},
			})
		}

		token, err := GenerateAccessToken(user.ID, jwtSecret)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not generate token", "code": "INTERNAL_ERROR"},
			})
		}

		c.Cookie(&fiber.Cookie{
			Name:     "access_token",
			Value:    token,
			HTTPOnly: true,
			Path:     "/",
		})

		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Login successful"}})
	}
}
