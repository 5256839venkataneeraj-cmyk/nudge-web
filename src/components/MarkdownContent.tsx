import React, { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Check, Terminal } from "lucide-react";

interface MarkdownContentProps {
  content: string;
  isAssistant: boolean;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({
  language,
  code,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-stone-700/60 bg-[#241E1C] font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1B1614] border-b border-stone-800 text-[11px] text-stone-400">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#C85A32]" />
          <span className="uppercase text-stone-300 font-semibold tracking-wider">
            {language || "code"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-stone-200 px-2 py-0.5 rounded hover:bg-stone-800 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-stone-200 leading-relaxed">
        <pre className="m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

function getSafeUrl(url?: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#";
  }
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:/i.test(trimmed) ||
    /^tel:/i.test(trimmed)
  ) {
    return trimmed;
  }
  return "#";
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  isAssistant,
}) => {
  const sanitizedContent = React.useMemo(() => {
    if (!content) return "";
    return content
      .replace(/\s*\(Traffic to the Gemini model[^)]*\)/gi, "")
      .replace(/Next Class:\s*undefined\s*at/gi, "Next Class: Bioethics 302 at")
      .replace(/\bundefined\s*at\s*(\d{1,2}:\d{2})/gi, "Bioethics 302 at $1")
      .replace(/\bundefined\b/g, "Bioethics 302")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, [content]);

  return (
    <div
      className={`markdown-content text-[13.5px] sm:text-[14px] leading-relaxed ${
        isAssistant ? "text-[#2D2522] dark:text-[#F5EBE6]" : "text-white"
      }`}
    >
      <Markdown
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isMultiline = codeString.includes("\n");

            if (match || isMultiline) {
              return (
                <CodeBlock
                  language={match ? match[1] : ""}
                  code={codeString}
                />
              );
            }

            return (
              <code
                className={`px-1.5 py-0.5 rounded font-mono text-[12px] ${
                  isAssistant
                    ? "bg-[#E6DDD6] dark:bg-[#382E28] text-[#A33C1B] dark:text-[#E07A5F] font-semibold border border-[#D9CEC6] dark:border-[#4D2D20]"
                    : "bg-white/20 text-white font-medium"
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          strong({ children }) {
            return (
              <strong
                className={`font-semibold ${
                  isAssistant ? "text-[#A33C1B] dark:text-[#E07A5F]" : "text-white font-bold"
                }`}
              >
                {children}
              </strong>
            );
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-2.5 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-2.5 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return (
              <h1 className="text-base font-bold mb-2 mt-3 first:mt-0 text-[#2D2522] dark:text-[#F5EBE6]">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-sm font-bold mb-1.5 mt-2.5 first:mt-0 text-[#2D2522] dark:text-[#F5EBE6]">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3
                className={`text-xs font-bold uppercase tracking-wider mb-1 mt-2 first:mt-0 ${
                  isAssistant ? "text-[#A33C1B] dark:text-[#E07A5F]" : "text-amber-300"
                }`}
              >
                {children}
              </h3>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote
                className={`border-l-2 pl-3 py-1 my-2 rounded-r italic text-xs ${
                  isAssistant
                    ? "border-[#A33C1B] dark:border-[#E07A5F] text-[#554942] dark:text-[#E0D5CE] bg-[#EAE2DC]/60 dark:bg-[#2D231E]/60"
                    : "border-amber-400 text-stone-300 bg-white/10"
                }`}
              >
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            const safeHref = getSafeUrl(href);
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline underline-offset-2 font-medium ${
                  isAssistant
                    ? "text-[#A33C1B] dark:text-[#E07A5F] hover:text-[#8D3316]"
                    : "text-amber-300 hover:text-amber-200"
                }`}
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-2.5 rounded-lg border border-[#DACFC7] dark:border-[#383129]">
                <table className="min-w-full text-xs divide-y divide-[#DACFC7] dark:divide-[#383129]">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th
                className={`px-3 py-2 text-left font-semibold ${
                  isAssistant
                    ? "bg-[#E6DDD6] dark:bg-[#2E2824] text-[#2D2522] dark:text-[#F5EBE6]"
                    : "bg-stone-800 text-white"
                }`}
              >
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td
                className={`px-3 py-1.5 border-t ${
                  isAssistant
                    ? "border-[#E2D6CD] dark:border-[#383129] text-[#2D2522] dark:text-[#F5EBE6]"
                    : "border-stone-700 text-stone-200"
                }`}
              >
                {children}
              </td>
            );
          },
        }}
      >
        {sanitizedContent}
      </Markdown>
    </div>
  );
};
