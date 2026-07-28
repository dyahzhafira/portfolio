package media

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func newR2Client(ctx context.Context) (*s3.Client, error) {
	accountID := os.Getenv("R2_ACCOUNT_ID")
	accessKey := os.Getenv("R2_ACCESS_KEY_ID")
	secretKey := os.Getenv("R2_SECRET_ACCESS_KEY")

	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)

	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("auto"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
	})

	return client, nil
}

func parseOwnerID(value string) (*uint, error) {
	if value == "" {
		return nil, nil
	}
	parsed, err := strconv.ParseUint(value, 10, 64)
	if err != nil {
		return nil, err
	}
	id := uint(parsed)
	return &id, nil
}

func UploadMedia(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		projectIDStr := c.FormValue("project_id")
		experienceIDStr := c.FormValue("experience_id")
		altText := c.FormValue("alt_text")

		if (projectIDStr == "") == (experienceIDStr == "") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "exactly one of project_id or experience_id is required", "code": "VALIDATION_FAILED"},
			})
		}
		if altText == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "alt_text is required", "code": "VALIDATION_FAILED"},
			})
		}

		projectID, err := parseOwnerID(projectIDStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "project_id must be a number", "code": "VALIDATION_FAILED"},
			})
		}
		experienceID, err := parseOwnerID(experienceIDStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "experience_id must be a number", "code": "VALIDATION_FAILED"},
			})
		}

		fileHeader, err := c.FormFile("file")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "file is required", "code": "VALIDATION_FAILED"},
			})
		}

		file, err := fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "could not open uploaded file", "code": "INTERNAL_ERROR"},
			})
		}
		defer file.Close()

		ownerPart := projectIDStr
		if ownerPart == "" {
			ownerPart = "exp-" + experienceIDStr
		}
		key := fmt.Sprintf("%s-%d-%s", ownerPart, time.Now().Unix(), fileHeader.Filename)

		ctx := context.Background()
		client, err := newR2Client(ctx)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "could not connect to storage", "code": "INTERNAL_ERROR"},
			})
		}

		_, err = client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(os.Getenv("R2_BUCKET_NAME")),
			Key:         aws.String(key),
			Body:        file,
			ContentType: aws.String(fileHeader.Header.Get("Content-Type")),
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "could not upload file", "code": "INTERNAL_ERROR"},
			})
		}

		publicURL := fmt.Sprintf("%s/%s", os.Getenv("R2_PUBLIC_URL"), key)

		m := Media{
			ProjectID:    projectID,
			ExperienceID: experienceID,
			URL:          publicURL,
			AltText:      altText,
		}
		if err := db.Create(&m).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "could not save media record", "code": "INTERNAL_ERROR"},
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"data": m})
	}
}

func ListMedia(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		projectIDStr := c.Query("project_id")
		experienceIDStr := c.Query("experience_id")

		if (projectIDStr == "") == (experienceIDStr == "") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fiber.Map{"message": "exactly one of project_id or experience_id is required", "code": "VALIDATION_FAILED"},
			})
		}

		var items []Media
		query := db.Order("created_at asc")
		if projectIDStr != "" {
			query = query.Where("project_id = ?", projectIDStr)
		} else {
			query = query.Where("experience_id = ?", experienceIDStr)
		}

		if err := query.Find(&items).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not fetch media", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": items})
	}
}

func DeleteMedia(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")

		if err := db.Delete(&Media{}, id).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": fiber.Map{"message": "Could not delete media", "code": "INTERNAL_ERROR"},
			})
		}

		return c.JSON(fiber.Map{"data": fiber.Map{"message": "Media deleted"}})
	}
}
