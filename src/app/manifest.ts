import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "CupidCall",
		short_name: "CupidCall",
		description:
			"CupidCall is a web application that allows you to call your lover using your cupid.",
		theme_color: "#994fdd",
		background_color: "#ffffff",
		display: "standalone",
		orientation: "any",
		scope: "/",
		start_url: "/",
		icons: [
			{
				src: "/favicon/favicon-16x16.png",
				sizes: "16x16",
				type: "image/png",
			},
			{
				src: "/favicon/android-icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/favicon/favicon-96x96.png",
				sizes: "96x96",
				type: "image/png",
			},
			{
				src: "/favicon/apple-icon-72x72.png",
				sizes: "72x72",
				type: "image/png",
			},
			{
				src: "/favicon/apple-icon-180x180.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	};
}
