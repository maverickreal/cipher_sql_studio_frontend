import { type ReactElement, useState } from "react";
import { Button } from "../../components/ui/Button";
import { authClient } from "../../services/authClient";

type Provider = "google" | "github";

const PROVIDER_LABEL: Record<Provider, string> = {
	google: "Google",
	github: "GitHub",
};

function GoogleIcon() {
	return (
		<svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	);
}

function GitHubIcon() {
	return (
		<svg
			aria-hidden="true"
			className="h-5 w-5"
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.76-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.96-.267 1.983-.399 3.003-.404 1.02.005 2.047.137 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0z" />
		</svg>
	);
}

const PROVIDER_ICON: Record<Provider, () => ReactElement> = {
	google: GoogleIcon,
	github: GitHubIcon,
};

export function SocialSignInButtons() {
	const [pending, setPending] = useState<Provider | null>(null);
	const [error, setError] = useState("");

	const handleSocialSignIn = async (provider: Provider) => {
		setError("");
		setPending(provider);
		try {
			const { error } = await authClient.signIn.social({
				provider,
				callbackURL: `${window.location.origin}/`,
			});
			if (error) {
				setError(
					error.message || `Sign in with ${PROVIDER_LABEL[provider]} failed`,
				);
				setPending(null);
			}
			// On success better-auth redirects to the provider; no further action.
		} catch {
			setError(`Sign in with ${PROVIDER_LABEL[provider]} failed`);
			setPending(null);
		}
	};

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-2 gap-3">
				{(Object.keys(PROVIDER_LABEL) as Provider[]).map((provider) => {
					const Icon = PROVIDER_ICON[provider];
					return (
						<Button
							key={provider}
							type="button"
							variant="secondary"
							loading={pending === provider}
							disabled={pending !== null}
							onClick={() => handleSocialSignIn(provider)}
							aria-label={`Continue with ${PROVIDER_LABEL[provider]}`}
						>
							<Icon />
							{PROVIDER_LABEL[provider]}
						</Button>
					);
				})}
			</div>
			{error && (
				<p role="alert" className="text-center text-red-400 text-sm">
					{error}
				</p>
			)}
		</div>
	);
}
