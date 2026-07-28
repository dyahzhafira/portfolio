package skill

import "time"

type Skill struct {
	ID        uint   `gorm:"primaryKey"`
	Name      string `gorm:"not null"`
	Category  string `gorm:"not null"`
	IconSlug  string `gorm:"column:icon_slug;not null"`
	SortOrder int    `gorm:"column:sort_order;not null;default:0"`
	CreatedAt time.Time
}

func (Skill) TableName() string {
	return "skills"
}
