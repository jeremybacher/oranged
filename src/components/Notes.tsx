import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Box, Divider, Tooltip } from "@mui/material";
import { decode as base64_decode, encode as base64_encode } from "base-64";

// ── Inline markdown + link renderer ──────────────────────────────────────────

const INLINE_REGEX = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~|`[^`\n]+`|>[^\n]+|https?:\/\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}\.[a-zA-Z]{2,6}(?:\/[^\s]*)?)/g;

function renderLine(line: string, lineIndex: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(INLINE_REGEX.source, "g");
  let match: RegExpExecArray | null;

  // Block quote: lines starting with "> "
  if (/^>\s?/.test(line)) {
    const content = line.replace(/^>\s?/, "");
    return (
      <Box
        key={lineIndex}
        component="blockquote"
        sx={{
          borderLeft: "3px solid",
          borderColor: "primary.main",
          pl: 1.5,
          ml: 0,
          my: 0,
          color: "text.secondary",
          fontStyle: "italic",
        }}
      >
        {renderLine(content, lineIndex)}
      </Box>
    );
  }

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.substring(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${lineIndex}-${match.index}`;

    if (token.startsWith("**")) {
      parts.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      parts.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("~~")) {
      parts.push(<del key={key}>{token.slice(2, -2)}</del>);
    } else if (token.startsWith("`")) {
      parts.push(
        <Box
          key={key}
          component="code"
          sx={{
            bgcolor: "action.hover",
            borderRadius: "3px",
            px: "4px",
            py: "1px",
            fontFamily: "monospace",
            fontSize: "0.88em",
          }}
        >
          {token.slice(1, -1)}
        </Box>
      );
    } else {
      const href = /^https?:\/\//.test(token) ? token : `https://${token}`;
      parts.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ wordBreak: "break-all" }}
          onClick={(e) => e.stopPropagation()}
        >
          {token}
        </a>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) parts.push(line.substring(lastIndex));

  return parts;
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i, arr) => (
    <React.Fragment key={i}>
      {renderLine(line, i)}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));
}

// ── Toolbar config ────────────────────────────────────────────────────────────

const TOOLBAR = [
  { label: "B", style: { fontWeight: 700 }, marker: "**", tooltip: "Bold (Ctrl+B)" },
  { label: "I", style: { fontStyle: "italic" }, marker: "*", tooltip: "Italic (Ctrl+I)" },
  { label: "S", style: { textDecoration: "line-through" }, marker: "~~", tooltip: "Strikethrough" },
  { label: "</>", style: { fontFamily: "monospace" }, marker: "`", tooltip: "Inline code (Ctrl+E)" },
  { label: "❮❯", style: { letterSpacing: "-2px" }, marker: ">", tooltip: "Quote", linePrefix: true },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Notes = memo(() => {
  const [note, setNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const result = await new Promise<{ note?: string }>((resolve) => {
          chrome.storage.sync.get(["note"], (r) => resolve(r));
        });
        setNote(result.note ? JSON.parse(base64_decode(result.note)) : "");
      } catch {
        setNote("");
      } finally {
        setIsLoading(false);
      }
    };
    loadNote();
  }, []);

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  const saveNote = useCallback((value: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        chrome.storage.sync.set({ note: base64_encode(JSON.stringify(value)) });
      } catch (error) {
        console.error("Failed to save note:", error);
      }
    }, 500);
  }, []);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNote(value);
    saveNote(value);
  }, [saveNote]);

  const wrapSelection = useCallback((marker: string, linePrefix = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = note.substring(start, end);
    let newValue: string;
    let cursorStart: number;
    let cursorEnd: number;

    if (linePrefix) {
      // Prefix current line with "> "
      const lineStart = note.lastIndexOf("\n", start - 1) + 1;
      const prefix = `${marker} `;
      newValue = note.substring(0, lineStart) + prefix + note.substring(lineStart);
      cursorStart = start + prefix.length;
      cursorEnd = end + prefix.length;
    } else {
      newValue = note.substring(0, start) + marker + selected + marker + note.substring(end);
      cursorStart = start === end ? start + marker.length : start + marker.length;
      cursorEnd = start === end ? start + marker.length : end + marker.length;
    }

    setNote(newValue);
    saveNote(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  }, [note, saveNote]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") { e.preventDefault(); wrapSelection("**"); }
      if (e.key === "i") { e.preventDefault(); wrapSelection("*"); }
      if (e.key === "e") { e.preventDefault(); wrapSelection("`"); }
    }
  }, [wrapSelection]);

  const containerSx = (theme: any) => ({
    bgcolor: theme.palette.background.paper,
    mb: 2,
    display: "flex",
    flexDirection: "column",
    height: "70vh",
    maxWidth: "100%",
    borderRadius: 1,
    overflow: "hidden",
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", color: "text.secondary" }}>
        Loading...
      </Box>
    );
  }

  if (isEditing) {
    return (
      <Box sx={containerSx}>
        {/* Formatting toolbar */}
        <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 0.5, gap: 0.25 }}>
          {TOOLBAR.map((action) => (
            <Tooltip key={action.label} title={action.tooltip} placement="top" arrow>
              <Box
                component="button"
                aria-label={action.tooltip}
                onMouseDown={(e: React.MouseEvent) => {
                  e.preventDefault();
                  wrapSelection(action.marker, !!action.linePrefix);
                }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 30,
                  height: 26,
                  px: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.8rem",
                  color: "text.secondary",
                  "&:hover": { bgcolor: "action.hover", color: "text.primary", borderColor: "text.secondary" },
                  ...action.style,
                }}
              >
                {action.label}
              </Box>
            </Tooltip>
          ))}
        </Box>
        <Divider />
        {/* Textarea */}
        <Box sx={{ flex: 1, position: "relative", p: 1 }}>
          <textarea
            ref={textareaRef}
            value={note}
            onChange={handleNoteChange}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing your notes here..."
            style={{
              width: "100%",
              height: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: "2px" },
              background: "transparent",
              fontFamily: "inherit",
              fontSize: "inherit",
              color: "inherit",
              lineHeight: "inherit",
              boxSizing: "border-box",
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={containerSx} onClick={() => setIsEditing(true)} tabIndex={0} role="button" aria-label="Edit note" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsEditing(true); }} style={{ cursor: "text", overflowY: "auto" }}>
      <Box sx={{ p: 1, width: "100%", height: "100%", whiteSpace: "pre-wrap", wordBreak: "break-word", color: "text.primary" }}>
        {note ? renderMarkdown(note) : <Box component="span" sx={{ color: "text.disabled" }}>Start typing your notes here...</Box>}
      </Box>
    </Box>
  );
});

Notes.displayName = "Notes";

export default Notes;
