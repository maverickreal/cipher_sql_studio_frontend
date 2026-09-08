import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authClient } from "../../services/authClient";
import { SocialSignInButtons } from "./SocialSignInButtons";

const signUpSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Must be at least 8 characters"),
});

export function SignUpPage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setErrors({});
		setServerError("");

		const result = signUpSchema.safeParse({ name, email, password });
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
			const { error } = await authClient.signUp.email({
				name,
				email,
				password,
			});
			if (error) {
				setServerError(error.message || "Sign up failed");
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
				<h1 className="font-bold text-2xl text-white">Create Account</h1>
				<p className="mt-1 text-sm text-surface-400">
					Start your SQL learning journey
				</p>

				<div className="mt-8">
					<SocialSignInButtons />
				</div>

				<div className="my-6 flex items-center gap-3" aria-hidden="true">
					<span className="h-px flex-1 bg-surface-800" />
					<span className="text-xs text-surface-500">or continue with email</span>
					<span className="h-px flex-1 bg-surface-800" />
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						label="Name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						error={errors.name}
						placeholder="Your name"
						autoComplete="name"
					/>
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
						placeholder="At least 8 characters"
						autoComplete="new-password"
					/>

					{serverError && <p className="text-red-400 text-sm">{serverError}</p>}

					<Button type="submit" loading={loading} className="w-full">
						Create Account
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-surface-400">
					Already have an account?{" "}
					<Link
						to="/signin"
						className="font-medium text-brand-400 hover:text-brand-300"
					>
						Sign in
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
