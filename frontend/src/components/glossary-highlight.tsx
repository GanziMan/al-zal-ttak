"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { SORTED_GLOSSARY, GLOSSARY_MAP } from "@/lib/glossary";

interface Segment {
  type: "plain" | "term";
  text: string;
}

const TERM_REGEX = new RegExp(
  `(${SORTED_GLOSSARY.map(({ term }) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "g",
);

function segmentText(text: string): Segment[] {
  if (!text) return [];

  const segments: Segment[] = [];
  let lastIndex = 0;
  TERM_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = TERM_REGEX.exec(text)) !== null) {
    const idx = match.index;
    const term = match[0];
    if (idx > lastIndex) {
      segments.push({ type: "plain", text: text.slice(lastIndex, idx) });
    }
    segments.push({ type: "term", text: term });
    lastIndex = idx + term.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "plain", text: text.slice(lastIndex) });
  }

  return segments;
}

function TermTooltip({ term }: { term: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const definition = GLOSSARY_MAP.get(term) ?? "";

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!show) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [show]);

  const handleToggle = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShow((prev) => !prev);
  }, []);

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={handleToggle}
    >
      <span className="border-b border-dashed border-muted-foreground/40 cursor-help">
        {term}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-56 rounded-lg bg-popover border border-border px-3 py-2 text-[11px] leading-relaxed text-popover-foreground shadow-lg">
          <span className="font-semibold text-primary">{term}</span>
          <br />
          {definition}
        </span>
      )}
    </span>
  );
}

export function GlossaryHighlight({ text }: { text: string }) {
  const segments = useMemo(() => segmentText(text), [text]);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "term" ? (
          <TermTooltip key={i} term={seg.text} />
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}
