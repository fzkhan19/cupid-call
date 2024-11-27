import Providers from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/navbar";
import { JSON_LD, METADATA } from "@/constants/Metadata";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Dancing_Script, Signika_Negative } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Signika_Negative({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-in",
});

const oswald = Dancing_Script({
	subsets: ["latin"],
	variable: "--font-os",
});

export const metadata: Metadata = METADATA;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn("", inter.variable, oswald.variable)}>
				<main className="no-scrollbar overflow-x-hidden overflow-y-scroll scroll-smooth font-in">
					<Script
						// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
						dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
						type="application/ld+json"
					/>
					<Providers>
						<Navbar />
						{children}
					</Providers>
				</main>
			</body>
		</html>
	);
}
