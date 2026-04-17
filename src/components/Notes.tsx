import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { decode as base64_decode, encode as base64_encode } from "base-64";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

// ── Inline markdown + link renderer ──────────────────────────────────────────

const INLINE_REGEX = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|~~[^~\n]+~~|`[^`\n]+`|>[^\n]+|https?:\/\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}\.[a-zA-Z]{2,6}(?:\/[^\s]*)?)/g;

function renderLine(line: string, lineIndex: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(INLINE_REGEX.source, "g");
  let match: RegExpExecArray | null;

  if (/^>\s?/.test(line)) {
    const content = line.replace(/^>\s?/, "");
    return (
      <blockquote
        key={lineIndex}
        className="border-l-[3px] border-primary pl-3 ml-0 my-0 text-muted-foreground italic"
      >
        {renderLine(content, lineIndex)}
      </blockquote>
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
        <code
          key={key}
          className="bg-muted rounded px-1 py-0.5 font-mono text-[0.88em]"
        >
          {token.slice(1, -1)}
        </code>
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
  { label: "B", style: "font-bold", marker: "**", tooltip: "Bold (Ctrl+B)" },
  { label: "I", style: "italic", marker: "*", tooltip: "Italic (Ctrl+I)" },
  { label: "S", style: "line-through", marker: "~~", tooltip: "Strikethrough" },
  { label: "</>", style: "font-mono text-[10px]", marker: "`", tooltip: "Inline code (Ctrl+E)" },
  { label: "❝", style: "text-base leading-none", marker: ">", tooltip: "Quote", linePrefix: true },
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

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNote(value);
      saveNote(value);
    },
    [saveNote]
  );

  const wrapSelection = useCallback(
    (marker: string, linePrefix = false) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = note.substring(start, end);
      let newValue: string;
      let cursorStart: number;
      let cursorEnd: number;

      if (linePrefix) {
        const lineStart = note.lastIndexOf("\n", start - 1) + 1;
        const prefix = `${marker} `;
        const lineContent = note.substring(lineStart);
        if (lineContent.startsWith(prefix)) {
          // Remove prefix
          newValue = note.substring(0, lineStart) + lineContent.substring(prefix.length);
          cursorStart = Math.max(lineStart, start - prefix.length);
          cursorEnd = Math.max(lineStart, end - prefix.length);
        } else {
          // Add prefix
          newValue = note.substring(0, lineStart) + prefix + note.substring(lineStart);
          cursorStart = start + prefix.length;
          cursorEnd = end + prefix.length;
        }
      } else {
        const isWrapped =
          selected.startsWith(marker) && selected.endsWith(marker) && selected.length > marker.length * 2;
        if (isWrapped) {
          // Remove markers
          const unwrapped = selected.slice(marker.length, -marker.length);
          newValue = note.substring(0, start) + unwrapped + note.substring(end);
          cursorStart = start;
          cursorEnd = start + unwrapped.length;
        } else {
          // Add markers
          newValue = note.substring(0, start) + marker + selected + marker + note.substring(end);
          cursorStart = start === end ? start + marker.length : start + marker.length;
          cursorEnd = start === end ? start + marker.length : end + marker.length;
        }
      }

      setNote(newValue);
      saveNote(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [note, saveNote]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") { e.preventDefault(); wrapSelection("**"); }
        if (e.key === "i") { e.preventDefault(); wrapSelection("*"); }
        if (e.key === "e") { e.preventDefault(); wrapSelection("`"); }
      }
    },
    [wrapSelection]
  );

  const containerClass = "bg-background mb-2 flex flex-col h-[70vh] max-w-full rounded-sm overflow-hidden";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className={containerClass}>
        <div className="flex items-center px-3 py-2 gap-2 border-b border-border/50">
          {TOOLBAR.map((action) => (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={action.tooltip}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    wrapSelection(action.marker, !!action.linePrefix);
                  }}
                  className={`inline-flex items-center justify-center w-9 h-8 border border-border/70 rounded-xl bg-background text-sm text-muted-foreground cursor-pointer shadow-sm hover:bg-muted hover:text-foreground hover:border-border transition-colors ${action.style}`}
                >
                  {action.label}
                </button>
              </TooltipTrigger>
              <TooltipContent>{action.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex-1 relative p-2">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={handleNoteChange}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing your notes here..."
            className="w-full h-full resize-none border-none outline-none bg-transparent font-[inherit] text-[15px] text-foreground leading-relaxed box-border focus:ring-0 focus:outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${containerClass} cursor-text overflow-y-auto`}
      onClick={() => setIsEditing(true)}
      tabIndex={0}
      role="button"
      aria-label="Edit note"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setIsEditing(true);
      }}
    >
      <div className="p-2 w-full h-full whitespace-pre-wrap break-words text-foreground text-[15px] leading-relaxed">
        {note ? (
          renderMarkdown(note)
        ) : (
          <span className="text-muted-foreground">Start typing your notes here...</span>
        )}
      </div>
    </div>
  );
});

Notes.displayName = "Notes";

export default Notes;
