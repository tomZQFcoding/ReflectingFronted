import React, { useState, useRef, useEffect } from 'react';
import { Tag, X } from 'lucide-react';

interface TagAutocompleteProps {
  tags: string[];
  availableTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  tags,
  availableTags,
  onChange,
  placeholder = '输入标签后回车...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(tag) &&
      inputValue.trim().length > 0
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || inputValue.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      onChange([...tags, tagToAdd]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
      e.preventDefault();
      const firstSuggestion = suggestionsRef.current?.querySelector('button');
      (firstSuggestion as HTMLElement)?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[52px] focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-sm font-medium group"
          >
            <Tag size={12} className="mr-1.5" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-2 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.trim().length > 0)}
          placeholder={tags.length === 0 ? placeholder : '添加...'}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1 placeholder-slate-400 text-slate-800 dark:text-slate-100"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleAddTag(suggestion)}
              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag(suggestion);
                }
              }}
            >
              <Tag size={14} className="text-indigo-500" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

