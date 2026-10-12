import React from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-transition">{children}</div>;
}
