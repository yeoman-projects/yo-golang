package config

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"path"
	"runtime"

	"github.com/spf13/viper"
)

// Config struct
type Config struct {
	Name    string
	Type    string
	Include []string
}

func getDefaultConfigPath() string {
	_, filename, _, _ := runtime.Caller(1)
	return path.Join(path.Dir(filename), "../default_app.json")
}

// GetConfig fetches the config
func GetConfig() *Config {
	var C Config
	viper.SetConfigName("<%=appName%>")
	viper.SetConfigType("json")
	viper.AddConfigPath(".")
	viper.AddConfigPath("..")
	viper.AddConfigPath("/etc/<%=appName%>")
	viper.AddConfigPath("$HOME/.<%=appName%>	")

	var defaultPath = getDefaultConfigPath()
	if err := viper.ReadInConfig(); err != nil {
		fmt.Printf("Error: %s (%s)", err, defaultPath)
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Config file not found; ignore error if desired
			data, err := ioutil.ReadFile(defaultPath)
			if err != nil {
				panic(fmt.Errorf("fatal error reading default config file at %s: %s", defaultPath, err))
			}
			r := bytes.NewReader(data)
			viper.ReadConfig(r)
		} else if _, ok := err.(viper.ConfigParseError); ok {
			panic(fmt.Errorf("config file is invalid: %s", err))
		} else {
			// Config file was found but another error was produced
			panic(fmt.Errorf("fatal error reading config file: %s", err))
		}
	}

	err := viper.Unmarshal(&C)
	if err != nil {
		panic(fmt.Errorf("unable to decode into struct, %v", err))
	}
	return &C
}
