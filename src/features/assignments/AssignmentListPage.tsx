import { motion } from "motion/react";
import { useSearchParams } from "react-router";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { PageTransition } from "../../components/PageTransition";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useGetAssignmentsQuery } from "../../store/api";
import { AssignmentCard } from "./AssignmentCard";

const listVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.08 },
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 30 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring" as const, bounce: 0.1, duration: 0.6 },
	},
};

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const MODES = ["All", "read", "write"] as const;
type Mode = (typeof MODES)[number];

const ORIGINS = ["All", "first-party", "community"] as const;
type Origin = (typeof ORIGINS)[number];

const SORTS = ["createdAt", "title"] as const;
type Sort = (typeof SORTS)[number];

const ORDERS = ["asc", "desc"] as const;
type Order = (typeof ORDERS)[number];

function DifficultyGauge({
	current,
	onChange,
}: {
	current: Difficulty;
	onChange: (val: Difficulty) => void;
}) {
	const activeIndex = DIFFICULTIES.indexOf(current);
	const fillPercentage = ((activeIndex + 1) / DIFFICULTIES.length) * 100;

	const getTrackColor = () => {
		switch (current) {
			case "Easy":
				return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
			case "Medium":
				return "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
			case "Hard":
				return "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]";
			default:
				return "bg-surface-700 shadow-[0_0_15px_rgba(63,63,70,0.5)]";
		}
	};

	return (
		<div className="mb-8 flex flex-col items-center">
			<span className="mb-3 font-semibold text-surface-400 text-xs uppercase tracking-wider">
				Filter by Intensity
			</span>

			<div className="relative flex w-full max-w-md items-center rounded-full bg-surface-900/50 p-2 ring-1 ring-surface-800">
				<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-full p-2">
					<motion.div
						className={`h-full rounded-full ${getTrackColor()}`}
						initial={false}
						animate={{
							width: `${fillPercentage}%`,
						}}
						transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
						style={{ originX: 0 }}
					/>
				</div>

				{DIFFICULTIES.map((level, i) => {
					const isActive = current === level;
					const isCoveredByFill = i <= activeIndex;

					return (
						<button
							type="button"
							key={level}
							onClick={() => onChange(level)}
							className="relative z-10 flex-1 py-1.5 outline-none"
						>
							<motion.span
								className={`block text-center font-medium text-sm transition-colors duration-300 ${
									isCoveredByFill ? "text-white" : "text-surface-400"
								}`}
								animate={{
									scale: isActive ? 1.15 : 1,
									fontWeight: isActive ? 700 : 500,
								}}
								transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
							>
								{level}
							</motion.span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function updateParams(
	searchParams: URLSearchParams,
	setSearchParams: (params: URLSearchParams) => void,
	patch: Record<string, string | null>,
) {
	const params = new URLSearchParams(searchParams);
	for (const [key, value] of Object.entries(patch)) {
		if (value === null || value === "") {
			params.delete(key);
		} else {
			params.set(key, value);
		}
	}
	setSearchParams(params);
}

export function AssignmentListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const rawPage = Number(searchParams.get("page") || "1");
	const page =
		Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

	const currentDifficulty =
		(searchParams.get("difficulty") as Difficulty) || "All";
	const currentMode = (searchParams.get("mode") as Mode) || "All";
	const currentOrigin = (searchParams.get("origin") as Origin) || "All";
	const currentSort = (searchParams.get("sort") as Sort) || "createdAt";
	const currentOrder = (searchParams.get("order") as Order) || "desc";
	const currentQ = searchParams.get("q") ?? "";

	const { data, isLoading, isError, error } = useGetAssignmentsQuery({
		page,
		limit: 20,
		q: currentQ.trim() ? currentQ.trim() : undefined,
		difficulty:
			currentDifficulty === "All" ? undefined : currentDifficulty.toLowerCase(),
		mode: currentMode === "All" ? undefined : currentMode,
		origin: currentOrigin === "All" ? undefined : currentOrigin,
		sort: SORTS.includes(currentSort) ? currentSort : "createdAt",
		order: ORDERS.includes(currentOrder) ? currentOrder : "desc",
	});

	const setPageReset = (patch: Record<string, string | null>) =>
		updateParams(searchParams, setSearchParams, { ...patch, page: "1" });

	const handleDifficultyChange = (level: Difficulty) => {
		setPageReset({ difficulty: level === "All" ? null : level });
	};

	const handleModeChange = (mode: Mode) => {
		setPageReset({ mode: mode === "All" ? null : mode });
	};

	const handleOriginChange = (origin: Origin) => {
		setPageReset({ origin: origin === "All" ? null : origin });
	};

	const assignments = data?.assignments ?? [];
	const totalPages = data?.totalPages ?? 1;
	const total = data?.total;

	return (
		<PageTransition>
			<div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
				<div className="mb-10 text-center">
					<h1 className="font-bold text-3xl text-white">Assignments</h1>
					<p className="mt-2 text-surface-400">
						Practice SQL with real-world scenarios
					</p>
				</div>

				<DifficultyGauge
					current={
						DIFFICULTIES.includes(currentDifficulty) ? currentDifficulty : "All"
					}
					onChange={handleDifficultyChange}
				/>

				<div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
					<div className="flex-1">
						<Input
							label="Search"
							placeholder="Search assignments…"
							value={currentQ}
							onChange={(e) => setPageReset({ q: e.target.value || null })}
						/>
					</div>
					<div className="flex gap-3">
						<label className="flex flex-col gap-1.5 font-medium text-sm text-surface-300">
							Mode
							<select
								aria-label="Mode"
								value={MODES.includes(currentMode) ? currentMode : "All"}
								onChange={(e) => handleModeChange(e.target.value as Mode)}
								className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
							>
								{MODES.map((m) => (
									<option key={m} value={m}>
										{m === "All" ? "All modes" : m}
									</option>
								))}
							</select>
						</label>
						<label className="flex flex-col gap-1.5 font-medium text-sm text-surface-300">
							Origin
							<select
								aria-label="Origin"
								value={ORIGINS.includes(currentOrigin) ? currentOrigin : "All"}
								onChange={(e) => handleOriginChange(e.target.value as Origin)}
								className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
							>
								{ORIGINS.map((o) => (
									<option key={o} value={o}>
										{o === "All" ? "All origins" : o}
									</option>
								))}
							</select>
						</label>
						<label className="flex flex-col gap-1.5 font-medium text-sm text-surface-300">
							Sort by
							<select
								aria-label="Sort by"
								value={SORTS.includes(currentSort) ? currentSort : "createdAt"}
								onChange={(e) =>
									setPageReset({ sort: e.target.value, order: currentOrder })
								}
								className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
							>
								{SORTS.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
						</label>
						<label className="flex flex-col gap-1.5 font-medium text-sm text-surface-300">
							Order
							<select
								aria-label="Order"
								value={ORDERS.includes(currentOrder) ? currentOrder : "desc"}
								onChange={(e) =>
									setPageReset({ sort: currentSort, order: e.target.value })
								}
								className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
							>
								{ORDERS.map((o) => (
									<option key={o} value={o}>
										{o}
									</option>
								))}
							</select>
						</label>
					</div>
				</div>

				{isLoading ? (
					<div className="mt-12 flex justify-center">
						<LoadingSpinner />
					</div>
				) : isError ? (
					<div className="mt-12 rounded-lg border border-red-800 bg-red-950/30 p-6 text-center">
						<p className="text-red-400">
							{error && "status" in error
								? `Error ${error.status}`
								: "Failed to load assignments. Please try again."}
						</p>
					</div>
				) : assignments.length > 0 ? (
					<>
						{typeof total === "number" && (
							<p className="mt-4 text-center text-sm text-surface-400">
								{total} assignment{total === 1 ? "" : "s"}
							</p>
						)}
						<motion.div
							className="mt-4 flex flex-col gap-4"
							variants={listVariants}
							initial="hidden"
							animate="show"
							key={`${currentDifficulty}-${currentMode}-${currentQ}-${currentSort}-${currentOrder}-${page}`}
						>
							{assignments.map((assignment, i) => (
								<motion.div
									key={assignment._id}
									variants={cardVariants}
									whileHover={{
										scale: 1.015,
										y: -2,
										transition: { duration: 0.2, ease: "easeOut" },
									}}
									whileTap={{ scale: 0.985 }}
									className="origin-center"
								>
									<AssignmentCard assignment={assignment} index={i} />
								</motion.div>
							))}
						</motion.div>

						<div className="mt-12 flex items-center justify-center gap-4 border-surface-800 border-t pt-8">
							<Button
								variant="secondary"
								size="sm"
								disabled={page <= 1}
								onClick={() => {
									const params = new URLSearchParams(searchParams);
									params.set("page", String(page - 1));
									setSearchParams(params);
								}}
							>
								Previous
							</Button>
							<span className="font-medium text-sm text-surface-400">
								Page {page} of {totalPages}
							</span>
							<Button
								variant="secondary"
								size="sm"
								disabled={page >= totalPages}
								onClick={() => {
									const params = new URLSearchParams(searchParams);
									params.set("page", String(page + 1));
									setSearchParams(params);
								}}
							>
								Next
							</Button>
						</div>
					</>
				) : (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="mt-12 flex flex-col items-center justify-center rounded-xl border border-surface-800 bg-surface-900/40 p-12 text-center shadow-inner"
					>
						<span className="mb-3 text-4xl">📭</span>
						<p className="font-medium text-lg text-surface-300">
							No scenarios found
						</p>
						<p className="mt-1 text-sm text-surface-500">
							Try adjusting your search or filters.
						</p>
					</motion.div>
				)}
			</div>
		</PageTransition>
	);
}

export async function assignmentListLoader() {
	return null;
}
