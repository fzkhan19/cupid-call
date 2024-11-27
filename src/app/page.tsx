import WebRTC from "@/components/WebRTC";

export default function Home() {
	return (
		<article className="flex min-h-[100dvh] flex-col space-y-10 px-6 pt-8 pb-40 md:pt-24">
			<div className="mx-auto w-full max-w-7xl space-y-8">
				<WebRTC />
			</div>
		</article>
	);
}
