import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { alucard, dracula, type Palette, type ThemeName } from "./palette";

function editorTheme(p: Palette) {
	return EditorView.theme(
		{
			"&": {
				backgroundColor: p.bgAlt,
				color: p.fg,
				fontSize: "14px",
				borderRadius: "0.5rem",
				minHeight: "280px",
			},
			".cm-content": {
				caretColor: p.purple,
			},
			".cm-cursor, .cm-dropCursor": {
				borderLeftColor: p.pink,
			},
			".cm-activeLine": {
				backgroundColor: p.currentLine,
			},
			".cm-activeLineGutter": {
				backgroundColor: p.currentLine,
			},
			".cm-gutters": {
				backgroundColor: p.bg,
				color: p.comment,
				border: "none",
			},
			".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
				backgroundColor: p.selection,
			},
			".cm-scroller": {
				fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
			},
		},
		{ dark: p === dracula },
	);
}

function highlight(p: Palette) {
	return HighlightStyle.define([
		{ tag: t.keyword, color: p.pink },
		{ tag: t.operator, color: p.pink },
		{ tag: t.comment, color: p.comment, fontStyle: "italic" },
		{ tag: t.string, color: p.yellow },
		{ tag: t.number, color: p.purple },
		{ tag: t.bool, color: p.purple },
		{ tag: t.null, color: p.purple },
		{ tag: t.typeName, color: p.cyan, fontStyle: "italic" },
		{ tag: t.className, color: p.cyan },
		{ tag: t.function(t.variableName), color: p.green },
		{ tag: t.definition(t.variableName), color: p.fg },
		{ tag: t.variableName, color: p.fg },
		{ tag: t.propertyName, color: p.cyan },
		{ tag: t.punctuation, color: p.fg },
		{ tag: t.meta, color: p.comment },
		{ tag: t.invalid, color: p.red },
	]);
}

export function sqlEditorTheme(theme: ThemeName): Extension {
	const p = theme === "light" ? alucard : dracula;
	return [editorTheme(p), syntaxHighlighting(highlight(p))];
}
