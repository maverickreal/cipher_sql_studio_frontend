import { ChartColumn, Code2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { Button } from "../../components/ui/Button";
import type { RootState } from "../../store";
import { APP_DESCRIPTION, APP_NAME } from "../../utils/constants";

export function LandingPage() {
	const user = useSelector((state: RootState) => state.auth.user);
	const sessionReady = useSelector(
		(state: RootState) => state.auth.sessionReady,
	);
	const showSignup = sessionReady && !user;

	return (
		<div className="mx-auto max-w-6xl px-4 sm:px-6">
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-700 bg-brand-950/50 px-4 py-1.5 text-brand-400 text-sm">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
						</span>
						Interactive SQL Learning
					</div>
					<h1 className="font-bold text-4xl text-white tracking-tight sm:text-6xl">
						Master SQL with
						<span className="block bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
							{APP_NAME}
						</span>
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-lg text-surface-400">
						{APP_DESCRIPTION}
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
				>
					<Link to="/assignments">
						<Button size="lg">Browse Assignments</Button>
					</Link>
					<Link to="/signup">
						<Button variant="secondary" size="lg">
							Create Free Account
						</Button>
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.5 }}
					className="mt-20 grid gap-8 sm:grid-cols-3"
				>
					{[
						{
							title: "Write SQL",
							description:
								"Use the built-in CodeMirror editor with syntax highlighting and auto-completion.",
							icon: Code2,
						},
						{
							title: "Execute Instantly",
							description:
								"Run queries against real PostgreSQL databases. Get results in milliseconds.",
							icon: Zap,
						},
						{
							title: "Track Progress",
							description:
								"Solve assignments at your own pace. From easy SELECTs to complex JOINs.",
							icon: ChartColumn,
						},
					].map((feature) => (
						<div
							key={feature.title}
							className="rounded-xl border border-surface-800 bg-surface-900/50 p-6 text-left"
						>
							<div className="mb-4 inline-flex rounded-lg bg-brand-500/10 p-2 text-brand-400">
								<feature.icon aria-hidden="true" className="h-6 w-6" />
							</div>
							<h3 className="font-semibold text-base text-white">
								{feature.title}
							</h3>
							<p className="mt-2 text-sm text-surface-400">
								{feature.description}
							</p>
						</div>
					))}
				</motion.div>
			</div>
		</div>
	);
}
