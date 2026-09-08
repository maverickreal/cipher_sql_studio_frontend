import { motion } from "motion/react";
import { useSearchParams } from "react-router";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { PageTransition } from "../../components/PageTransition";
import { Button } from "../../components/ui/Button";
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
		transition: { type: "spring" as const, bounce: 0.1, duration: 0.6 }
	},
};

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"] as const;
type Difficulty = typeof DIFFICULTIES[number];

function DifficultyGauge({ 
	current, 
	onChange 
}: { 
	current: Difficulty; 
	onChange: (val: Difficulty) => void 
}) {
	const activeIndex = DIFFICULTIES.indexOf(current);
	const fillPercentage = ((activeIndex + 1) / DIFFICULTIES.length) * 100;
	
	const getTrackColor = () => {
		switch (current) {
			case "Easy": return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
			case "Medium": return "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]";
			case "Hard": return "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]";
			default: return "bg-surface-700 shadow-[0_0_15px_rgba(63,63,70,0.5)]"; 
		}
	};

	return (
		<div className="mb-8 flex flex-col items-center">
			<span className="mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
				Filter by Intensity
			</span>
			
			<div className="relative flex w-full max-w-md items-center rounded-full bg-surface-900/50 p-2 ring-1 ring-surface-800">
				<div className="absolute inset-0 z-0 overflow-hidden rounded-full p-2 pointer-events-none">
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
								className={`block text-center text-sm font-medium transition-colors duration-300 ${
									isCoveredByFill ? "text-white" : "text-surface-400"
								}`}
								animate={{ 
									scale: isActive ? 1.15 : 1,
									fontWeight: isActive ? 700 : 500
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

export function AssignmentListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Number(searchParams.get("page") || "1");
	
	const currentDifficulty = (searchParams.get("difficulty") as Difficulty) || "All";

	const { data, isLoading, isError, error } = useGetAssignmentsQuery({
		page,
		limit: 20,
	});

	const handleDifficultyChange = (level: Difficulty) => {
		const params = new URLSearchParams(searchParams);
		if (level === "All") {
			params.delete("difficulty");
		} else {
			params.set("difficulty", level);
		}
		params.set("page", "1"); 
		setSearchParams(params);
	};

	const filteredAssignments = data?.assignments ? data.assignments.filter((assignment) => {
		if (currentDifficulty === "All") return true;
		return assignment.difficulty.toLowerCase() === currentDifficulty.toLowerCase();
	}) : [];

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
					current={currentDifficulty} 
					onChange={handleDifficultyChange} 
				/>

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
				) : filteredAssignments.length > 0 ? (
					<>
						<motion.div 
							className="mt-4 flex flex-col gap-4"
							variants={listVariants}
							initial="hidden"
							animate="show"
							key={currentDifficulty + page} 
						>
							{filteredAssignments.map((assignment, i) => (
								<motion.div 
									key={assignment._id} 
									variants={cardVariants}
									whileHover={{ 
										scale: 1.015, 
										y: -2,
										transition: { duration: 0.2, ease: "easeOut" }
									}}
									whileTap={{ scale: 0.985 }}
									className="origin-center"
								>
									<AssignmentCard
										assignment={assignment}
										index={i}
									/>
								</motion.div>
							))}
						</motion.div>

						<div className="mt-12 flex items-center justify-center gap-4 border-t border-surface-800 pt-8">
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
							<span className="text-sm font-medium text-surface-400">
								Page {page}
							</span>
							<Button
								variant="secondary"
								size="sm"
								disabled={(data?.assignments.length ?? 0) < 20}
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
						<p className="text-lg font-medium text-surface-300">No scenarios found</p>
						<p className="mt-1 text-sm text-surface-500">
							Try adjusting your intensity filter.
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
