import { cn } from "@/lib/utils";
import Link from "next/link";

const Tag = ({
	link = "#",
	name,
	...props
}: { link?: string; name: string; className?: string }) => {
	return (
		<Link
			href={link}
			className={cn(
				"inline-block rounded-full border-2 border-light border-solid bg-dark px-6 py-2 font-semibold text-light text-sm capitalize transition-all duration-200 ease-out hover:scale-105 sm:px-10 sm:py-3 sm:text-base",
				props.className,
			)}
		>
			{name}
		</Link>
	);
};

export default Tag;
