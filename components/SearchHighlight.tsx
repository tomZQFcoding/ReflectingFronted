import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  text,
  searchQuery,
  className = '',
}) => {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-900/40 text-slate-900 dark:text-slate-100 px-1 rounded font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

