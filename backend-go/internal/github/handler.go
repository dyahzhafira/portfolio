package github

import (
	"io"
	"net/http"
	"regexp"

	"github.com/gofiber/fiber/v2"
)

type ContributionDay struct {
	Date  string `json:"date"`
	Level int    `json:"level"`
}

var (
	cellRe   = regexp.MustCompile(`<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*>`)
	levelRe  = regexp.MustCompile(`data-level="(\d)"`)
	tagEndRe = regexp.MustCompile(`>`)
)

func ListContributions() fiber.Handler {
	return func(c *fiber.Ctx) error {
		username := c.Query("username", "dyahzhafira")

		resp, err := http.Get("https://github.com/users/" + username + "/contributions")
		if err != nil {
			return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not reach GitHub", "code": "UPSTREAM_ERROR"},
			})
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not read GitHub response", "code": "INTERNAL_ERROR"},
			})
		}

		matches := cellRe.FindAllSubmatchIndex(body, -1)
		days := make([]ContributionDay, 0, len(matches))

		for _, m := range matches {
			date := string(body[m[2]:m[3]])

			tagEndIdx := tagEndRe.FindIndex(body[m[0]:])
			level := 0
			if tagEndIdx != nil {
				tagBytes := body[m[0] : m[0]+tagEndIdx[1]]
				if lm := levelRe.FindSubmatch(tagBytes); lm != nil {
					level = int(lm[1][0] - '0')
				}
			}
			days = append(days, ContributionDay{Date: date, Level: level})
		}

		return c.JSON(fiber.Map{"data": days})
	}
}
