package project

import "time"

type Tag struct {
	ID			uint	`gorm:"primaryKey"`
	Name		string	`gorm:"unique;not null"`
	IconSlug	string	`gorm:"column:icon_slug;not null"`
}

func (Tag) TableName() string {
	return "tags"
}

type Project struct {
	ID			uint	`gorm:"primaryKey"`
	Slug		string	`gorm:"unique;not null"`
	Title		string	`gorm:"not null"`
	Description	string
	Learnings	string
	Status		string	`gorm:"not null;default:active"`
	DemoURL		string	`gorm:"column:demo_url"`
	RepoURL		string	`gorm:"column:repo_url"`
	StartedAt	*time.Time	`gorm:"column:started_at"`
	EndedAt		*time.Time	`gorm:"column:ended_at"`
	Role		string	`gorm:"column:role"`
	SortOrder	int		`gorm:"column:sort_order;not null;default:0"`
	CreatedAt	time.Time
	Tags		[]Tag	`gorm:"many2many:project_tags"`
}

func (Project) TableName() string {
	return "projects"
}