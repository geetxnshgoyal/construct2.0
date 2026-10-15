import type { ReactNode } from 'react';

type SectionHeadingProps = {
  title: string;
  children?: ReactNode;
};

export default function SectionHeading({ title, children }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-wide text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-tight text-navy">{title}</h2>
      {children ? <p className="mt-4 text-lg leading-relaxed text-navy/70">{children}</p> : null}
    </div>
  );
}
