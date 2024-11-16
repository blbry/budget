/* eslint-disable react/jsx-props-no-spreading */
import { SVGProps } from 'react';

export function UnitsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block h-4 w-4"
      {...props}
    >
      <path
        d="M 30 20
           L 30 70
           A 20 20 0 0 0 70 70
           L 70 20"
        stroke="currentColor"
        fill="transparent"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <line
        x1="15"
        y1="40"
        x2="85"
        y2="40"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <line
        x1="15"
        y1="70"
        x2="85"
        y2="70"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
