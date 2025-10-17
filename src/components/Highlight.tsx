import React from 'react';
import { normalizeString } from '@/lib/utils';

interface HighlightProps {
  text: string;
  highlight: string;
}

export const Highlight: React.FC<HighlightProps> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  const normalizedText = normalizeString(text);
  const normalizedHighlight = normalizeString(highlight);
  
  const startIndex = normalizedText.indexOf(normalizedHighlight);

  if (startIndex === -1) {
    return <span>{text}</span>;
  }

  const endIndex = startIndex + normalizedHighlight.length;

  const before = text.slice(0, startIndex);
  const match = text.slice(startIndex, endIndex);
  const after = text.slice(endIndex);

  return (
    <span>
      {before}
      <strong className="font-bold">{match}</strong>
      {after}
    </span>
  );
};