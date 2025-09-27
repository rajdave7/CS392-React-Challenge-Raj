export const TERMS = ["Fall", "Winter", "Spring"] as const;
export type Term = (typeof TERMS)[number];

interface TermFilterProps {
  term: Term;
  setTerm: (t: Term) => void;
}

const TermFilter = ({ term, setTerm }: TermFilterProps) => {
  return (
    <div
      role="radiogroup"
      aria-label="Filter courses by term"
      className="flex gap-2 m-4 justify-center"
    >
      {TERMS.map((t) => (
        <div key={t}>
          <input
            type="radio"
            id={`term-${t}`}
            name="term"
            className="btn-check"
            checked={t === term}
            onChange={() => setTerm(t)}
          />
          <label htmlFor={`term-${t}`} className={`btn btn-success mb-1 p-2`}>
            {t}
          </label>
        </div>
      ))}
    </div>
  );
};

export default TermFilter;
