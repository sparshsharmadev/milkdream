import type { SVGProps } from "react";

export default function DreamMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <path
        d="M24 4.5c10.77 0 19.5 8.73 19.5 19.5S34.77 43.5 24 43.5 4.5 34.77 4.5 24 13.23 4.5 24 4.5Z"
        stroke="currentColor"
        strokeOpacity=".28"
      />
      <path
        d="M13 30.5c3.1-1.8 4.3-8.9 7.2-8.9 3.3 0 4.2 11.3 7.5 11.3 3 0 4.2-13.2 7.5-15.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
      <path
        d="M15.1 16.9c2.7-3.1 7.8-4.4 12.1-2.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
      <circle cx="35.3" cy="17.2" r="2.1" fill="currentColor" />
    </svg>
  );
}
