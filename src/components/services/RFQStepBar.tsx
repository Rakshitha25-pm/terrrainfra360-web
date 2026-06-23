import { Check } from 'lucide-react';

interface RFQStepBarProps {
  step: number;
  totalSteps: number;
  labels?: [string, string, string];
}

const DEFAULT_LABELS: [string, string, string] = ['Project Details', 'Specifications', 'Review & Submit'];

export const RFQStepBar = ({ step, totalSteps, labels = DEFAULT_LABELS }: RFQStepBarProps) => {
  const p1 = Math.ceil(totalSteps / 3);
  const p2 = Math.ceil((2 * totalSteps) / 3);
  const currentPhase = step <= p1 ? 1 : step <= p2 ? 2 : 3;

  return (
    <div className="flex items-start w-full">
      {labels.map((label, i) => {
        const phase = i + 1;
        const done = currentPhase > phase;
        const active = currentPhase === phase;
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all duration-300 ${
                done
                  ? 'bg-luxury-gold border-luxury-gold text-white'
                  : active
                  ? 'bg-luxury-gold/15 border-luxury-gold text-luxury-gold'
                  : 'bg-transparent border-[var(--line)] text-[var(--muted)]'
              }`}>
                {done ? <Check size={13} /> : phase}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-wider text-center mt-1 leading-tight max-w-[64px] ${
                active ? 'text-luxury-gold' : done ? 'text-[var(--muted)]' : 'text-[var(--line)]'
              }`}>{label}</span>
            </div>
            {i < 2 && (
              <div className={`h-[1.5px] flex-1 mx-2 mb-5 transition-all duration-500 ${
                currentPhase > phase ? 'bg-luxury-gold' : 'bg-[var(--line)]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
