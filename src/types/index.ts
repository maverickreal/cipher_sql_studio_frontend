export type Difficulty = "easy" | "medium" | "hard";

export type AccessMode = "read" | "write";

export interface Assignment {
	_id: string;
	title: string;
	description: string;
	difficulty: Difficulty;
	mode: AccessMode;
	sampleInput: string[];
	sampleOutput: string;
	pgSchemaReady: boolean;
	createdAt: string;
	updatedAt: string;
	origin?: "first-party" | "community";
	contributor?: string;
}

export interface AssignmentDetail extends Assignment {
	// same fields plus any extras from the detail endpoint
}

export interface SqlExecutionRequest {
	assignmentId: string;
	userSql: string;
	mode: AccessMode;
	writeTables?: string[];
}

export interface SqlExecutionSuccess {
	success: true;
	passed?: boolean;
	rows: Record<string, unknown>[];
	columns: string[];
	rowCount: number;
	executionTimeMs: number;
}

export interface SqlExecutionError {
	success: false;
	error: string;
}

export type SqlExecutionResult = SqlExecutionSuccess | SqlExecutionError;

export interface JobStatus {
	status: "completed" | "failed" | "active" | "waiting" | "delayed";
	result?: SqlExecutionResult;
}

export interface CreateAssignmentPayload {
	title: string;
	description: string;
	difficulty: Difficulty;
	mode: AccessMode;
	sampleInput: string[];
	sampleOutput: string;
	solutionSql?: string;
	validationSql?: string;
	initSql: string;
	orderMatters: boolean;
}
