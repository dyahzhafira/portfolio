package feedback

import "time"

type Feedback struct {
	ID        uint      `gorm:"primaryKey"`
	Message   string    `gorm:"not null"`
	CreatedAt time.Time
}

func (Feedback) TableName() string {
	return "feedback"
}