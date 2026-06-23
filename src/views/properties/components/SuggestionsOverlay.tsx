/**
 * Floating search suggestions — dark surface, white text, orange highlights.
 */
import { ArrowUpLeft, Search, Sparkles } from 'lucide-react';
import { PropTheme } from '../propertyTheme';

interface Props {
  suggestions: string[];
  onSelect: (s: string) => void;
}

export function SuggestionsOverlay({ suggestions, onSelect }: Props) {
  if (suggestions.length === 0) return null;
  return (
    <div
      className="rounded-md overflow-hidden backdrop-blur-xl"
      style={{
        background: 'rgba(22,20,18,0.95)',
        border: `1px solid ${PropTheme.border}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
        <Sparkles size={12} style={{ color: PropTheme.brand }} />
        <span
          className="text-[10px] font-medium uppercase tracking-[0.3em]"
          style={{ color: PropTheme.textMuted }}
        >
          Suggestions
        </span>
      </div>
      {suggestions.map((s) => (
        <button
          key={s}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(s);
          }}
          className="w-full flex items-center px-4 py-3 transition-colors text-left hover:bg-orange-500/15 cursor-pointer"
        >
          <Search size={16} style={{ color: PropTheme.textMuted }} />
          <span
            className="ml-3 flex-1 text-[13px] font-medium truncate"
            style={{ color: PropTheme.textPrimary }}
          >
            {s}
          </span>
          <ArrowUpLeft size={14} style={{ color: PropTheme.textMuted }} />
        </button>
      ))}
      <div className="h-1.5" />
    </div>
  );
}
