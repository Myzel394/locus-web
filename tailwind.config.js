const colors = require("tailwindcss/colors")

module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				...colors,
				locus: {
					background: "#25232C",
					cave: "#18161D",
					paper: "#403A51",
				},
				compass: {
					light: "#FFFFFF",
					dark: "#D8D8D8",
					pin: "#B0B0B0",
					north: "#EF4646",
					south: "#3324DF",
				},
			},
		},
	},
	plugins: [],
}
