import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
	loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
	primary:
		"bg-brand-600 text-on-accent hover:bg-brand-700 focus-visible:ring-brand-500",
	secondary:
		"bg-surface-800 text-surface-100 hover:bg-surface-700 focus-visible:ring-surface-500 border border-surface-600",
	ghost:
		"text-surface-300 hover:text-surface-100 hover:bg-surface-800 focus-visible:ring-surface-500",
	danger:
		"bg-red-600 text-on-accent hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeClasses: Record<Size, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-sm",
	lg: "px-6 py-3 text-base",
};

export function Button({
	variant = "primary",
	size = "md",
	loading,
	disabled,
	className = "",
	children,
	...props
}: ButtonProps) {
	return (
		<button
			disabled={disabled || loading}
			className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
			{...props}
		>
			{loading && <Spinner />}
			{children}
		</button>
	);
}

function Spinner() {
	return <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />;
}
