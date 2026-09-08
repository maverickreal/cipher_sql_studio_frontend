import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { authClient } from "../../services/authClient";

type Provider = "google" | "github";

const PROVIDER_LABEL: Record<Provider, string> = {
	google: "Google",
	github: "GitHub",
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
				callbackURL: "/",
			});
			if (error) {
				setError(error.message || `Sign in with ${PROVIDER_LABEL[provider]} failed`);
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
				{(Object.keys(PROVIDER_LABEL) as Provider[]).map((provider) => (
					<Button
						key={provider}
						type="button"
						variant="secondary"
						loading={pending === provider}
						disabled={pending !== null}
						onClick={() => handleSocialSignIn(provider)}
						aria-label={`Continue with ${PROVIDER_LABEL[provider]}`}
					>
						{PROVIDER_LABEL[provider]}
					</Button>
				))}
			</div>
			{error && (
				<p role="alert" className="text-center text-red-400 text-sm">
					{error}
				</p>
			)}
		</div>
	);
}
