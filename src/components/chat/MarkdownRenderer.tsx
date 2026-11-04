"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode2 } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  const parts = parseMarkdownIntoBlocks(content);

  return (
    <div className={`space-y-3.5 leading-relaxed text-foreground text-[14.5px] ${isStreaming ? "streaming-cursor" : ""}`}>
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

    // Detect markdown table rows
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const isDivider = /^\|\s*[-:]+[-|\s:]*\|$/.test(line.trim());
      if (isDivider) {
        // Skip separator row
        continue;
      }
      if (!inTable) {
        flushText();
        inTable = true;
      }
      const cells = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      currentTableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    currentTextLines.push(line);
  }

  flushText();
  flushTable();

  return blocks;
}

// Simple regex-based syntax highlight tokenizer
function highlightCodeLine(line: string, _lang: string): React.ReactNode {
  if (!line) return "\n";

  const tokenRegex = /(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|interface|type|async|await|try|catch|finally|throw|new|switch|case|break|continue|yield|def|lambda|print|elif|self|select|where|insert|delete|update|join|table|create|drop|alter)\b|\b(?:true|false|null|undefined|boolean|string|number|any|void|never|unknown|int|float|str|bool|list|dict)\b|\b\d+(?:\.\d+)?\b)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    const textBefore = line.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(textBefore);
    }

    const token = match[0];
    lastIndex = tokenRegex.lastIndex;

    if (token.startsWith("//") || token.startsWith("#") || token.startsWith("/*")) {
      elements.push(
        <span key={match.index} className="text-zinc-500 italic">
          {token}
        </span>
      );
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
      elements.push(
        <span key={match.index} className="text-emerald-400">
          {token}
        </span>
      );
    } else if (/^\d+(\.\d+)?$/.test(token)) {
      elements.push(
        <span key={match.index} className="text-amber-300">
          {token}
        </span>
      );
    } else if (/^(true|false|null|undefined|boolean|string|number|any|void|never|unknown|int|float|str|bool|list|dict)$/i.test(token)) {
      elements.push(
        <span key={match.index} className="text-sky-400 font-medium">
          {token}
        </span>
      );
    } else if (/^(const|let|var|function|return|if|else|for|while|import|export|from|default|class|extends|interface|type|async|await|try|catch|finally|throw|new|switch|case|break|continue|yield|def|lambda|print|elif|self|select|where|insert|delete|update|join|table|create|drop|alter)$/i.test(token)) {
      elements.push(
        <span key={match.index} className="text-[#ff7043] font-medium">
          {token}
        </span>
      );
    } else {
      elements.push(
        <span key={match.index} className="text-[#ffaa7d]">
          {token}
        </span>
      );
    }
  }

  const remainder = line.substring(lastIndex);
  if (remainder) {
    elements.push(remainder);
  }

  return elements;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const displayLang = (language || "code").toLowerCase();

  return (
    <div className="relative my-3 rounded-xl border border-zinc-700/60 bg-[#0d1117] overflow-hidden text-sm shadow-xl font-mono">
      {/* Code Header Bar with macOS Window Dots */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#161b22] px-3.5 py-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <FileCode2 className="h-3.5 w-3.5 text-[#ff8a50]" />
            <span className="uppercase tracking-wider font-semibold text-[11px]">
              {displayLang}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500">
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors focus-visible:ring-1 focus-visible:ring-[#ff5722] text-xs font-sans"
          title="Copy code to clipboard"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium text-[11px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-[11px]">Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content with Line Numbers & Syntax Highlighting */}
      <div className="overflow-x-auto p-3 text-[13px] leading-relaxed text-[#e6edf3]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((lineStr, lineIdx) => (
              <tr key={lineIdx} className="hover:bg-zinc-800/30">
                <td className="select-none pr-3 text-right text-zinc-600 text-[11px] font-mono align-top w-8">
                  {lineIdx + 1}
                </td>
                <td className="pl-2 whitespace-pre font-mono text-[13px] align-top">
                  {highlightCodeLine(lineStr, displayLang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableBlock({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return null;
  const header = rows[0];
  const body = rows.slice(1);

  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-2 text-foreground font-semibold">
          <tr>
            {header.map((cell, idx) => (
              <th key={idx} className="px-3.5 py-2.5 text-left text-xs uppercase tracking-wider">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-foreground">
          {body.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-surface-2/60 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2.5 text-xs">
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
            <h3 key={pIdx} className="text-base font-bold text-foreground mt-4 mb-2 tracking-tight">
              {renderFormattedSpan(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={pIdx} className="text-lg font-bold text-foreground mt-5 mb-2.5 tracking-tight border-b border-border/80 pb-1.5">
              {renderFormattedSpan(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={pIdx} className="text-xl font-extrabold text-foreground mt-5 mb-3 tracking-tight">
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
              className="border-l-3 border-primary bg-primary/10 pl-3.5 py-2 my-2.5 text-foreground italic rounded-r-lg"
            >
              {quoteLines.map((ql, qIdx) => (
                <p key={qIdx}>{renderFormattedSpan(ql)}</p>
              ))}
            </blockquote>
          );
        }

        // Unordered list
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
          return (
            <ul key={pIdx} className="my-2 ml-4 list-disc space-y-1.5 text-foreground">
              {items.map((item, iIdx) => (
                <li key={iIdx}>{renderFormattedSpan(item.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").filter((l) => /^\d+\.\s/.test(l.trim()));
          return (
            <ol key={pIdx} className="my-2 ml-4 list-decimal space-y-1.5 text-foreground">
              {items.map((item, iIdx) => (
                <li key={iIdx}>{renderFormattedSpan(item.replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        // Standard paragraph
        return (
          <p key={pIdx} className="my-1.5 leading-relaxed text-foreground">
            {renderFormattedSpan(trimmed)}
          </p>
        );
      })}
    </>
  );
}

// Inline formatting: code, bold, italic, links
function renderFormattedSpan(text: string): React.ReactNode {
  // Split inline code `...`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, idx) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[12.5px] text-[#ff8a50] font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold formatting **...**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={idx}>
        {boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith("**") && bPart.endsWith("**") && bPart.length > 4) {
            return (
              <strong key={bIdx} className="font-bold text-foreground">
                {bPart.slice(2, -2)}
              </strong>
            );
          }

          // Link formatting [text](url)
          const linkParts = bPart.split(/(\[[^\]]+\]\([^)]+\))/g);
          return (
            <React.Fragment key={bIdx}>
              {linkParts.map((lPart, lIdx) => {
                const linkMatch = lPart.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                if (linkMatch) {
                  return (
                    <a
                      key={lIdx}
                      href={linkMatch[2]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff8a50] hover:underline font-medium inline-flex items-center gap-0.5"
                    >
                      {linkMatch[1]}
                      <span className="text-[10px]">↗</span>
                    </a>
                  );
                }
                return lPart;
              })}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  });
}
