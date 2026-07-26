package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Cookies("access_token")
		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": fiber.Map{"message": "Not authenticated", "code": "AUTH_REQUIRED"},
			})
		}

		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error){
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": fiber.Map{"message": "Invalid or expired token", "code": "AUTH_INVALID"},
		})
	}
	claims := token.Claims.(jwt.MapClaims)
	c.Locals("userID", claims["sub"])

	return c.Next()
	}
}