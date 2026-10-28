"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  // Parse blocks: code blocks vs text blocks
  const parts = parseMarkdownIntoBlocks(content);

  return (
    <div className={`space-y-3 leading-relaxed text-zinc-200 text-[14.5px] ${isStreaming ? "streaming-cursor" : ""}`}>
      {parts.map((block, idx) => {
        if (block.type === "code") {
          return <CodeBlock key={idx} code={block.content} language={block.language} />;
        }
        if (block.type === "table") {
          return <TableBlock key={idx} rows={block.tableRows || []} />;
        }
        return <TextBlock key={idx} text={block.content} />;
      })}
    </div>
  );
}

interface ParsedBlock {
  type: "text" | "code" | "table";
  content: string;
  language?: string;
  tableRows?: string[][];
}

function parseMarkdownIntoBlocks(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = text.split("\n");

  let inCodeBlock = false;
  let codeLanguage = "";
  let currentCodeLines: string[] = [];
  let currentTextLines: string[] = [];
  let inTable = false;
  let currentTableRows: string[][] = [];

  const flushText = () => {
    if (currentTextLines.length > 0) {
      blocks.push({
        type: "text",
        content: currentTextLines.join("\n"),
      });
      currentTextLines = [];
    }
  };

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      blocks.push({
        type: "table",
        content: "",
        tableRows: currentTableRows,
      });
      currentTableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect fenced code block start or end
    const fenceMatch = line.match(/^```([a-zA-Z0-9_\-+]*)/);
    if (fenceMatch) {
      if (!inCodeBlock) {
        flushText();
        flushTable();
        inCodeBlock = true;
        codeLanguage = fenceMatch[1] || "text";
        currentCodeLines = [];
      } else {
        // End of code block
        blocks.push({
          type: "code",
          content: currentCodeLines.join("\n"),
          language: codeLanguage,
        });
        inCodeBlock = false;
        codeLanguage = "";
        currentCodeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      currentCodeLines.push(line);
      continue;
    }

    // Detect table row (starts and contains pipes)
    const isTableRow = line.trim().startsWith("|") && line.trim().endsWith("|");
    if (isTableRow) {
      // Check if it's separator line (e.g. |---|---|)
      const isSep = /^\|[\s-:]+\|[\s-:]*\|?/.test(line.trim());
      if (!inTable) {
        flushText();
        inTable = true;
      }
      if (!isSep) {
        const cells = line
          .trim()
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        currentTableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    currentTextLines.push(line);
  }

  // Handle open-ended code block while streaming
  if (inCodeBlock) {
    blocks.push({
      type: "code",
      content: currentCodeLines.join("\n"),
      language: codeLanguage,
    });
  } else if (inTable) {
    flushTable();
  } else {
    flushText();
  }

  return blocks;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative my-3 rounded-lg border border-zinc-800 bg-[#0d0e11] overflow-hidden text-sm shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-400 font-mono">
        <span className="uppercase tracking-wider font-semibold text-zinc-300">
          {language || "code"}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-zinc-200">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function TableBlock({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return null;
  const header = rows[0];
  const body = rows.slice(1);

  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30">
      <table className="min-w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-900/80 text-zinc-200 font-medium">
          <tr>
            {header.map((cell, idx) => (
              <th key={idx} className="px-3.5 py-2 text-left font-semibold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
          {body.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-zinc-800/20">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Headings
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={pIdx} className="text-base font-semibold text-zinc-100 mt-4 mb-2 tracking-tight">
              {renderFormattedSpan(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={pIdx} className="text-lg font-semibold text-zinc-50 mt-5 mb-2.5 tracking-tight border-b border-zinc-800/60 pb-1">
              {renderFormattedSpan(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={pIdx} className="text-xl font-bold text-zinc-50 mt-5 mb-3 tracking-tight">
              {renderFormattedSpan(trimmed.slice(2))}
            </h1>
          );
        }

        // Blockquote
        if (trimmed.startsWith("> ")) {
          const quoteLines = trimmed.split("\n").map((l) => l.replace(/^>\s?/, ""));
          return (
            <blockquote
              key={pIdx}
              className="border-l-2 border-blue-500/80 bg-blue-950/15 pl-3.5 py-1.5 my-2.5 text-zinc-300 italic rounded-r"
            >
              {quoteLines.map((ql, qIdx) => (
                <p key={qIdx}>{renderFormattedSpan(ql)}</p>
              ))}
            </blockquote>
          );
        }

        // Bullet or Numbered List
        const lines = trimmed.split("\n");
        const isList = lines.every((l) => /^\s*([*\-+]|\d+\.)\s/.test(l));

        if (isList) {
          return (
            <ul key={pIdx} className="space-y-1.5 my-2 pl-5 list-disc marker:text-zinc-500">
              {lines.map((item, lIdx) => {
                const cleanItem = item.replace(/^\s*([*\-+]|\d+\.)\s/, "");
                return <li key={lIdx}>{renderFormattedSpan(cleanItem)}</li>;
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} className="my-1.5">
            {renderFormattedSpan(para)}
          </p>
        );
      })}
    </>
  );
}

function renderFormattedSpan(text: string): React.ReactNode {
  // Simple regex parser for `inline code`, **bold**, *italic*, and [links](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-mono text-[12.5px] text-zinc-200 border border-zinc-700/50"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic text-zinc-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Link: [title](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={i}>{part}</span>;
  });
}
