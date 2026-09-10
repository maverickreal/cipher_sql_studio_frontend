import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className = "" }: { className?: string }) {
	return (
		<div className={`flex items-center justify-center py-12 ${className}`}>
			<Loader2
				aria-label="Loading"
				className="h-8 w-8 animate-spin text-brand-500"
			/>
		</div>
	);
}
