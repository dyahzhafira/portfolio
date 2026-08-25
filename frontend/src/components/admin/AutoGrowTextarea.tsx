"use client";

import { useLayoutEffect, useRef } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function AutoGrowTextarea({ className, value, onChange, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={1}
      className={`resize-none overflow-hidden ${className ?? ""}`}
      {...rest}
    />
  );
}
