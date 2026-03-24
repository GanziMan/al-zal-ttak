"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { SORTED_GLOSSARY, GLOSSARY_MAP } from "@/lib/glossary";

interface Segment {
  type: "plain" | "term";
  text: string;
}

function segmentText(text: string): Segment[] {
  const segments: Segment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliestIdx = remaining.length;
    let matchedTerm = "";

    for (const { term } of SORTED_GLOSSARY) {
      const idx = remaining.indexOf(term);
      if (idx !== -1 && idx < earliestIdx) {
        earliestIdx = idx;
        matchedTerm = term;
      }
    }

    if (!matchedTerm) {
      segments.push({ type: "plain", text: remaining });
      break;
    }

    if (earliestIdx > 0) {
      segments.push({ type: "plain", text: remaining.slice(0, earliestIdx) });
    }
    segments.push({ type: "term", text: matchedTerm });
    remaining = remaining.slice(earliestIdx + matchedTerm.length);
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
