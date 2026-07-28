package media

import "time"

type Media struct {
	ID           uint `gorm:"primaryKey"`
	ProjectID    *uint `gorm:"column:project_id"`
	ExperienceID *uint `gorm:"column:experience_id"`
	URL          string `gorm:"not null"`
	AltText      string `gorm:"column:alt_text;not null"`
	CreatedAt    time.Time
}

func (Media) TableName() string {
	return "media"
}
