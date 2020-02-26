package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "<%=appName%>",
	Short: "<%=description%>",
	Long:  `<%=description%>`,
	Run: func(cmd *cobra.Command, args []string) {
		// Do stuff here
	},
}

// Execute is the root for all commands
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
