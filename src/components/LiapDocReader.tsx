"use client";

import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@mdrbx/nerv-ui";
import type { LiapDoc } from "@/lib/liap-docs";

type Props = {
  markdown: string;
  doc: LiapDoc;
  prev: LiapDoc | null;
  next: LiapDoc | null;
};

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-nerv-display text-2xl md:text-3xl tracking-[0.14em] text-nerv-orange uppercase mt-6 mb-3">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-nerv-display text-xl md:text-2xl tracking-[0.14em] text-nerv-cyan uppercase mt-8 mb-3 pb-1 border-b border-nerv-cyan/20">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-nerv-display text-base md:text-lg tracking-[0.16em] text-nerv-white uppercase mt-6 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-nerv-mono text-xs tracking-[0.18em] text-nerv-amber uppercase mt-4 mb-2">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="font-nerv-body text-sm md:text-base text-nerv-white/90 leading-relaxed my-3">
      {children}
    </p>
  ),
  a: ({ href, children }) => {
    const isInternal = typeof href === "string" && href.startsWith("/");
    const className =
      "text-nerv-cyan hover:text-nerv-orange underline underline-offset-2 decoration-dotted decoration-nerv-cyan/40 hover:decoration-nerv-orange transition-colors";
    if (isInternal) {
      return (
        <Link href={href!} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="font-nerv-body text-sm md:text-base text-nerv-white/90 list-[square] list-outside pl-5 my-3 space-y-1 marker:text-nerv-cyan">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="font-nerv-body text-sm md:text-base text-nerv-white/90 list-decimal list-outside pl-5 my-3 space-y-1 marker:text-nerv-cyan marker:font-nerv-mono">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="font-nerv-mono text-[12px] text-nerv-green whitespace-pre" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="font-nerv-mono text-[12px] text-nerv-orange bg-nerv-dark-gray px-1.5 py-0.5 border border-nerv-orange/20" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="font-nerv-mono text-[12px] bg-nerv-panel border border-nerv-green/30 p-3 my-4 overflow-x-auto">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-nerv-orange pl-4 my-4 text-nerv-white/80 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-0 border-t border-dashed border-nerv-cyan/30" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 border border-nerv-cyan/30">
      <table className="w-full border-collapse font-nerv-mono text-[12px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-nerv-dark-gray text-nerv-cyan border-b border-nerv-cyan/40">
      {children}
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-nerv-mid-gray/30 last:border-b-0">{children}</tr>,
  th: ({ children }) => (
    <th className="px-2 py-1.5 text-left uppercase tracking-wider text-[10px] font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 align-top text-nerv-white/90">{children}</td>
  ),
  strong: ({ children }) => <strong className="text-nerv-amber font-bold">{children}</strong>,
  em: ({ children }) => <em className="text-nerv-cyan/90 not-italic">{children}</em>,
};

export default function LiapDocReader({ markdown, doc, prev, next }: Props) {
  return (
    <article className="space-y-4">
      <nav className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray flex items-center gap-2">
        <Link href="/software" className="hover:text-nerv-orange transition-colors">
          SOFTWARE
        </Link>
        <span>/</span>
        <Link href="/software" className="hover:text-nerv-orange transition-colors">
          LIAP
        </Link>
        <span>/</span>
        <span className="text-nerv-cyan">{doc.number}</span>
      </nav>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-nerv-mono text-xs tracking-[0.2em] text-nerv-mid-gray">
          DOC.{doc.number}
        </span>
        <Badge label="LIAP" variant="info" size="sm" />
      </div>

      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {markdown}
        </ReactMarkdown>
      </div>

      <div className="pt-6 mt-6 border-t border-nerv-mid-gray/30 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {prev && (
            <Link href={`/software/liap/${prev.slug}`} className="block group py-2">
              <div className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray group-hover:text-nerv-orange transition-colors">
                &larr; PREV &middot; {prev.number}
              </div>
              <div className="font-nerv-display text-sm tracking-[0.14em] text-nerv-white group-hover:text-nerv-orange transition-colors uppercase truncate">
                {prev.title}
              </div>
            </Link>
          )}
        </div>
        <div className="min-w-0 flex-1 text-right">
          {next && (
            <Link href={`/software/liap/${next.slug}`} className="block group py-2">
              <div className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray group-hover:text-nerv-orange transition-colors">
                NEXT &middot; {next.number} &rarr;
              </div>
              <div className="font-nerv-display text-sm tracking-[0.14em] text-nerv-white group-hover:text-nerv-orange transition-colors uppercase truncate">
                {next.title}
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/software"
          className="font-nerv-mono text-[11px] tracking-[0.2em] text-nerv-cyan hover:text-nerv-orange transition-colors"
        >
          &larr; BACK.TO.INDEX
        </Link>
      </div>
    </article>
  );
}
