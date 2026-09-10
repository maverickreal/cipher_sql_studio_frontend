import { type FormEvent, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { z } from "zod";
import { PageTransition } from "../../components/PageTransition";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import type { RootState } from "../../store";
import { useCreateAssignmentMutation } from "../../store/api";
import { getErrorMessage } from "../../utils/errors";

const createAssignmentSchema = z.object({
	title: z.string().min(1, "Title is required").max(200),
	description: z.string().min(1, "Description is required").max(5000),
	difficulty: z.enum(["easy", "medium", "hard"]),
	mode: z.enum(["read", "write"]),
	sampleInput: z.string().min(1, "Sample input is required"),
	sampleOutput: z.string().min(1, "Sample output is required"),
	solutionSql: z.string().optional(),
	validationSql: z.string().optional(),
	initSql: z.string().min(1, "Init SQL is required"),
	orderMatters: z.boolean(),
});

export function CreateAssignmentPage() {
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.auth.user);
	const sessionReady = useSelector(
		(state: RootState) => state.auth.sessionReady,
	);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
		"easy",
	);
	const [mode, setMode] = useState<"read" | "write">("read");
	const [sampleInput, setSampleInput] = useState("");
	const [sampleOutput, setSampleOutput] = useState("");
	const [solutionSql, setSolutionSql] = useState("");
	const [validationSql, setValidationSql] = useState("");
	const [initSql, setInitSql] = useState("");
	const [orderMatters, setOrderMatters] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [serverError, setServerError] = useState("");

	const [createAssignment, { isLoading }] = useCreateAssignmentMutation();

	if (sessionReady && user?.role !== "admin") {
		return (
			<PageTransition>
				<div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
					<div className="rounded-lg border border-amber-800 bg-amber-950/30 p-6 text-center">
						<p className="text-amber-400">
							Admin access required to create assignments.
						</p>
					</div>
				</div>
			</PageTransition>
		);
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setErrors({});
		setServerError("");

		const result = createAssignmentSchema.safeParse({
			title,
			description,
			difficulty,
			mode,
			sampleInput,
			sampleOutput,
			solutionSql: solutionSql || undefined,
			validationSql: validationSql || undefined,
			initSql,
			orderMatters,
		});

		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			result.error.issues.forEach((err) => {
				fieldErrors[err.path[0] as string] = err.message;
			});
			setErrors(fieldErrors);
			return;
		}

		try {
			const payload = {
				...result.data,
				sampleInput: result.data.sampleInput.split("\n").filter(Boolean),
			};
			await createAssignment(payload).unwrap();
			navigate("/assignments");
		} catch (err) {
			const message = getErrorMessage(err, "Failed to create assignment");
			setServerError(message);
		}
	};

	return (
		<PageTransition>
			<div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
				<h1 className="font-bold text-2xl text-fg">Create Assignment</h1>
				<p className="mt-1 text-sm text-surface-400">
					Add a new SQL assignment for students
				</p>

				<form onSubmit={handleSubmit} className="mt-8 space-y-5">
					<Input
						label="Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						error={errors.title}
						placeholder="e.g. Find all users"
					/>

					<Textarea
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						error={errors.description}
						placeholder="Describe what the student needs to do..."
						rows={4}
					/>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="difficulty"
								className="font-medium text-sm text-surface-300"
							>
								Difficulty
							</label>
							<select
								id="difficulty"
								value={difficulty}
								onChange={(e) =>
									setDifficulty(e.target.value as "easy" | "medium" | "hard")
								}
								className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
							>
								<option value="easy">Easy</option>
								<option value="medium">Medium</option>
								<option value="hard">Hard</option>
							</select>
						</div>
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="mode"
								className="font-medium text-sm text-surface-300"
							>
								Mode
							</label>
							<select
								id="mode"
								value={mode}
								onChange={(e) => setMode(e.target.value as "read" | "write")}
								className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
							>
								<option value="read">Read (SELECT only)</option>
								<option value="write">Write (INSERT/UPDATE/DELETE)</option>
							</select>
						</div>
					</div>

					<Textarea
						label="Sample Input"
						value={sampleInput}
						onChange={(e) => setSampleInput(e.target.value)}
						error={errors.sampleInput}
						placeholder="One per line"
						rows={3}
					/>

					<Input
						label="Sample Output"
						value={sampleOutput}
						onChange={(e) => setSampleOutput(e.target.value)}
						error={errors.sampleOutput}
						placeholder='e.g. {"id": 1, "name": "Alice"}'
					/>

					<Textarea
						label="Solution SQL (optional)"
						value={solutionSql}
						onChange={(e) => setSolutionSql(e.target.value)}
						error={errors.solutionSql}
						placeholder="The reference solution query"
						rows={3}
					/>

					<Textarea
						label="Validation SQL (optional)"
						value={validationSql}
						onChange={(e) => setValidationSql(e.target.value)}
						error={errors.validationSql}
						placeholder="SQL to validate the user's output against"
						rows={3}
					/>

					<Textarea
						label="Init SQL"
						value={initSql}
						onChange={(e) => setInitSql(e.target.value)}
						error={errors.initSql}
						placeholder="CREATE TABLE ... INSERT INTO ..."
						rows={6}
					/>

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={orderMatters}
							onChange={(e) => setOrderMatters(e.target.checked)}
							className="rounded border-surface-700 bg-surface-900 text-brand-500 focus:ring-brand-500"
						/>
						<span className="text-sm text-surface-300">Order matters</span>
					</label>

					{serverError && (
						<div className="rounded-lg border border-red-800 bg-red-950/30 p-3">
							<p className="text-red-400 text-sm">{serverError}</p>
						</div>
					)}

					<div className="flex items-center gap-3">
						<Button type="submit" loading={isLoading}>
							Create Assignment
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={() => navigate("/assignments")}
						>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</PageTransition>
	);
}

export async function createAssignmentLoader() {
	return null;
}
