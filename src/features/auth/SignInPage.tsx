import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authClient } from "../../services/authClient";
import { SocialSignInButtons } from "./SocialSignInButtons";

const signInSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export function SignInPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setErrors({});
		setServerError("");

		const result = signInSchema.safeParse({ email, password });
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			result.error.issues.forEach((err) => {
				fieldErrors[err.path[0] as string] = err.message;
			});
			setErrors(fieldErrors);
			return;
		}

		setLoading(true);
		try {
			const { error } = await authClient.signIn.email({
				email,
				password,
			});
			if (error) {
				setServerError(error.message || "Sign in failed");
			} else {
				navigate("/");
				window.location.reload();
			}
		} catch {
			setServerError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-[80vh] items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-sm"
			>
				<h1 className="font-bold text-2xl text-fg">Sign In</h1>
				<p className="mt-1 text-sm text-surface-400">
					Welcome back to M SQL Studio
				</p>

				<div className="mt-8">
					<SocialSignInButtons />
				</div>

				<div className="my-6 flex items-center gap-3" aria-hidden="true">
					<span className="h-px flex-1 bg-surface-800" />
					<span className="text-surface-500 text-xs">
						or continue with email
					</span>
					<span className="h-px flex-1 bg-surface-800" />
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						error={errors.email}
						placeholder="you@example.com"
						autoComplete="email"
					/>
					<Input
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						error={errors.password}
						placeholder="Your password"
						autoComplete="current-password"
					/>

					{serverError && <p className="text-red-400 text-sm">{serverError}</p>}

					<Button type="submit" loading={loading} className="w-full">
						Sign In
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-surface-400">
					Don&apos;t have an account?{" "}
					<Link
						to="/signup"
						className="font-medium text-brand-400 hover:text-brand-300"
					>
						Sign up
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
