package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetConfigWithDefaultConfig(t *testing.T) {
	var c = GetConfig()
	assert.IsType(t, &Config{}, c)
	// Uses the deflt
	assert.Equal(t, "app", c.Name)
	assert.Equal(t, "static", c.Type)
}
