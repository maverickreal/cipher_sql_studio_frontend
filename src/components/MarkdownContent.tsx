import { Fragment, type ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
	const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
	// biome-ignore lint/suspicious/noArrayIndexKey: markdown tokens are ordered and stable
	return parts.map((part, i) => {
		const key = `${part}-${i}`;
		if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
			return <strong key={key}>{part.slice(2, -2)}</strong>;
		}
		if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
			return (
				<code
					key={key}
					className="rounded bg-surface-900 px-1 font-mono text-sm"
				>
					{part.slice(1, -1)}
				</code>
			);
		}
		return <Fragment key={key}>{part}</Fragment>;
	});
}

function isTableSeparator(line: string): boolean {
	return /^\s*\|?[\s:|-]+\|[\s:|-]*\|?\s*$/.test(line) && line.includes("-");
}

function splitRow(line: string): string[] {
	let row = line.trim();
	if (row.startsWith("|")) row = row.slice(1);
	if (row.endsWith("|")) row = row.slice(0, -1);
	return row.split("|").map((cell) => cell.trim());
}

function renderTable(rows: string[], key: string): ReactNode {
	const header = splitRow(rows[0]);
	const body = rows.slice(2).map(splitRow);
	return (
		<table key={key} className="my-2 w-full border-collapse">
			<thead>
				<tr>
					{header.map((cell) => (
						<th
							key={cell}
							className="border border-surface-700 px-2 py-1 text-left"
						>
							{renderInline(cell)}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{body.map((cells) => (
					<tr key={cells.join("|")}>
						{cells.map((cell) => (
							<td key={cell} className="border border-surface-700 px-2 py-1">
								{renderInline(cell)}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function parseBlocks(markdown: string): ReactNode[] {
	const lines = markdown.replace(/\r\n/g, "\n").split("\n");
	const nodes: ReactNode[] = [];
	let i = 0;
	let para: string[] = [];

	const flushPara = () => {
		if (para.length === 0) return;
		const text = para.join("\n");
		nodes.push(
			<p key={`p-${nodes.length}`} className="my-2 whitespace-pre-wrap">
				{renderInline(text)}
			</p>,
		);
		para = [];
	};

	while (i < lines.length) {
		const line = lines[i];

		if (line.startsWith("```")) {
			flushPara();
			const fenceLang = line.slice(3).trim();
			const body: string[] = [];
			i += 1;
			while (i < lines.length && !lines[i].startsWith("```")) {
				body.push(lines[i]);
				i += 1;
			}
			nodes.push(
				<pre
					key={`pre-${nodes.length}`}
					className="overflow-x-auto rounded-md bg-surface-900 p-3 font-mono text-sm"
				>
					<code data-lang={fenceLang || undefined}>{body.join("\n")}</code>
				</pre>,
			);
			i += 1;
			continue;
		}

		if (
			line.includes("|") &&
			i + 1 < lines.length &&
			isTableSeparator(lines[i + 1])
		) {
			flushPara();
			const tableLines = [line, lines[i + 1]];
			i += 2;
			while (i < lines.length && lines[i].includes("|")) {
				tableLines.push(lines[i]);
				i += 1;
			}
			nodes.push(renderTable(tableLines, `t-${nodes.length}`));
			continue;
		}

		if (line.trim() === "") {
			flushPara();
			i += 1;
			continue;
		}

		para.push(line);
		i += 1;
	}
	flushPara();
	return nodes;
}

export function MarkdownContent({
	children,
	className = "",
}: {
	children: string;
	className?: string;
}) {
	return <div className={className}>{parseBlocks(children)}</div>;
}
