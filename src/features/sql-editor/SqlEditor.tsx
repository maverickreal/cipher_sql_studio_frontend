import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { Compartment } from "@codemirror/state";
import {
	EditorView,
	highlightActiveLine,
	keymap,
	lineNumbers,
} from "@codemirror/view";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../components/ui/Button";
import { useJobStatusStream } from "../../hooks/useJobStatusStream";
import type { AppDispatch, RootState } from "../../store";
import { useExecuteSqlMutation, useSaveLastSqlMutation } from "../../store/api";
import { sqlEditorTheme } from "../../theme/codemirror";
import { useTheme } from "../../theme/ThemeProvider";
import type { Assignment } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import {
	executionFailed,
	executionStarted,
	resetExecution,
} from "./executionSlice";
import { initialDoc } from "./initialDoc";

interface SqlEditorProps {
	assignment: Assignment;
	initialSql?: string | null;
}

export function SqlEditor({ assignment, initialSql }: SqlEditorProps) {
	const dispatch = useDispatch<AppDispatch>();
	const { theme } = useTheme();
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const themeCompartment = useRef(new Compartment());
	const themeRef = useRef(theme);
	themeRef.current = theme;
	const [userEdited, setUserEdited] = useState(false);
	const initialDocRef = useRef(initialDoc(initialSql));

	const { phase, taskId } = useSelector((state: RootState) => state.execution);

	const [executeSql, { isLoading: isExecuting }] = useExecuteSqlMutation();
	const [saveLastSql] = useSaveLastSqlMutation();

	useJobStatusStream(phase === "polling" ? (taskId ?? null) : null);

	useEffect(() => {
		if (!editorRef.current) return;

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				setUserEdited(true);
			}
		});

		const view = new EditorView({
			doc: initialDocRef.current,
			extensions: [
				lineNumbers(),
				highlightActiveLine(),
				history(),
				keymap.of([...defaultKeymap, ...historyKeymap]),
				sql({ dialect: PostgreSQL }),
				themeCompartment.current.of(sqlEditorTheme(themeRef.current)),
				updateListener,
			],
			parent: editorRef.current,
		});

		viewRef.current = view;

		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, []);

	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		view.dispatch({
			effects: themeCompartment.current.reconfigure(sqlEditorTheme(theme)),
		});
	}, [theme]);

	useEffect(() => {
		const view = viewRef.current;
		if (!view || !initialSql || userEdited) return;
		const current = view.state.doc.toString();
		if (current !== initialSql) {
			view.dispatch({
				changes: { from: 0, to: current.length, insert: initialSql },
			});
		}
	}, [initialSql, userEdited]);

	const handleRun = useCallback(async () => {
		if (!viewRef.current) return;

		const userSql = viewRef.current.state.doc.toString().trim();
		if (!userSql) return;

		dispatch(resetExecution());

		try {
			const result = await executeSql({
				assignmentId: assignment._id,
				userSql,
				mode: assignment.mode,
			}).unwrap();

			dispatch(executionStarted(result.taskId));

			saveLastSql({ assignmentId: assignment._id, userSql }).catch(() => {
				// persistence is best-effort; the SQL already executed
			});
		} catch (err) {
			const message = getErrorMessage(err, "Failed to execute SQL");
			dispatch(executionFailed(message));
		}
	}, [assignment, executeSql, saveLastSql, dispatch]);

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-lg border border-surface-800">
				<div className="flex items-center justify-between border-surface-800 border-b bg-surface-900 px-4 py-2">
					<span className="font-medium text-surface-400 text-xs">
						SQL Editor
					</span>
					<span className="text-surface-600 text-xs">
						PostgreSQL ·{" "}
						{assignment.mode === "read" ? "Read only" : "Read/Write"}
					</span>
				</div>
				<div ref={editorRef} className="cm-editor-container min-h-[280px]" />
			</div>

			<div className="flex items-center gap-3">
				<Button
					onClick={handleRun}
					loading={isExecuting || phase === "polling"}
					disabled={isExecuting || phase === "polling"}
					size="sm"
				>
					{phase === "polling" ? "Running..." : "Run Query"}
				</Button>

				{phase !== "idle" && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => dispatch(resetExecution())}
						disabled={phase === "polling"}
					>
						Clear Results
					</Button>
				)}
			</div>
		</div>
	);
}
