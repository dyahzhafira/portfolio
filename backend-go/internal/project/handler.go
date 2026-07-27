package project

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

const dateLayout = "2006-01-02"

func ListProjects(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var projects []Project
		query := db.Preload("Tags").Order("sort_order asc")

		if tagName := c.Query("tag"); tagName != "" {
			query = query.Joins("JOIN project_tags ON project_tags.project_id = projects.id").
				Joins("JOIN tags ON tags.id = project_tags.tag_id").
				Where("tags.name = ?", tagName)
		}

		if err := query.Find(&projects).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not fetch projects", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": projects})
	}
}

func GetProject(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		slug := c.Params("slug")

		var proj Project
		if err := db.Preload("Tags").Where("slug = ?", slug).First(&proj).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Project not found", "code": "NOT_FOUND"},
			})
		}

		return c.JSON(fiber.Map{"data": proj})
	}
}

type CreateProjectRequest struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Learnings   string `json:"learnings"`
	Status      string `json:"status"`
	DemoURL     string `json:"demo_url"`
	RepoURL     string `json:"repo_url"`
	StartedAt   string `json:"started_at"`
	EndedAt     string `json:"ended_at"`
	Role        string `json:"role"`
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

func CreateProject(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req CreateProjectRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		if req.Slug == "" || req.Title == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "slug and title are required", "code": "VALIDATION_FAILED"},
			})
		}

		status := req.Status
		if status == "" {
			status = "active"
		}

		startedAt, err := parseOptionalDate(req.StartedAt)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "started_at must be in YYYY-MM-DD format", "code": "VALIDATION_FAILED"},
			})
		}
		endedAt, err := parseOptionalDate(req.EndedAt)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "ended_at must be in YYYY-MM-DD format", "code": "VALIDATION_FAILED"},
			})
		}

		sortOrder := 0
		if req.SortOrder != nil {
			sortOrder = *req.SortOrder
		}

		proj := Project{
			Slug:        req.Slug,
			Title:       req.Title,
			Description: req.Description,
			Learnings:   req.Learnings,
			Status:      status,
			DemoURL:     req.DemoURL,
			RepoURL:     req.RepoURL,
			StartedAt:   startedAt,
			EndedAt:     endedAt,
			Role:        req.Role,
			SortOrder:   sortOrder,
		}

		if err := db.Create(&proj).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not create project", "code": "INTERNAL_ERROR"},
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": proj})
	}
}

func UpdateProject(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		var proj Project
		if err := db.First(&proj, id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fiber.Map{"message": "Project not found", "code": "NOT_FOUND"},
			})
		}

		var req CreateProjectRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "Invalid request body", "code": "VALIDATION_FAILED"},
			})
		}

		updates := map[string]interface{}{}
		if req.Title != "" {
			updates["title"] = req.Title
		}
		if req.Description != "" {
			updates["description"] = req.Description
		}
		if req.Learnings != "" {
			updates["learnings"] = req.Learnings
		}
		if req.Status != "" {
			updates["status"] = req.Status
		}
		if req.DemoURL != "" {
			updates["demo_url"] = req.DemoURL
		}
		if req.RepoURL != "" {
			updates["repo_url"] = req.RepoURL
		}
		if req.Role != "" {
			updates["role"] = req.Role
		}
		if req.SortOrder != nil {
			updates["sort_order"] = *req.SortOrder
		}
		if req.StartedAt != "" {
			startedAt, err := parseOptionalDate(req.StartedAt)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": fiber.Map{"message": "started_at must be in YYYY-MM-DD format", "code": "VALIDATION_FAILED"},
				})
			}
			updates["started_at"] = startedAt
		}
		if req.EndedAt != "" {
			endedAt, err := parseOptionalDate(req.EndedAt)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": fiber.Map{"message": "ended_at must be in YYYY-MM-DD format", "code": "VALIDATION_FAILED"},
				})
			}
			updates["ended_at"] = endedAt
		}

		if err := db.Model(&proj).Updates(updates).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not update project", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": proj})
	}
}

func DeleteProject(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		if err := db.Delete(&Project{}, id).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not delete project", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Project deleted"}})
	}
}