package experience

import (
	"time"

	"portfolio-dyah/backend-go/internal/project"
)

type Experience struct {
	ID           uint      `gorm:"primaryKey"`
	Role         string    `gorm:"not null"`
	Org          string    `gorm:"not null"`
	PeriodStart  time.Time `gorm:"column:period_start;not null"`
	PeriodEnd    *time.Time `gorm:"column:period_end"`
	Description  string
	SortOrder    int         `gorm:"column:sort_order;not null;default:0"`
	CreatedAt    time.Time
	Tags         []project.Tag `gorm:"many2many:experience_tags"`
}

func (Experience) TableName() string {
	return "experience"
}
