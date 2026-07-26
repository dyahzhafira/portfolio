package auth

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey"`
	Email        string    `gorm:"unique;not null"`
	PasswordHash string    `gorm:"column:password_hash;not null"`
	CreatedAt    time.Time
}

func (User) TableName() string {
	return "users"
}