import { ArrowRight, Search, X } from "lucide-react";
import { useId } from "react";
import styles from "./tracking.module.css";

interface TrackingSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
  samples: string[];
  onPickSample: (reference: string) => void;
}

export function TrackingSearch({
  value,
  onChange,
  onSubmit,
  busy,
  samples,
  onPickSample,
}: TrackingSearchProps) {
  const inputId = useId();

  return (
    <div>
      <form
        className={styles.search}
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className={styles.searchField}>
          <Search size={18} aria-hidden="true" className={styles.searchIcon} />
          <label htmlFor={inputId} className="sr-only">
            Order reference
          </label>
          <input
            id={inputId}
            className={styles.searchInput}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Enter order reference"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
          {value ? (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => onChange("")}
              aria-label="Clear"
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          className={styles.searchBtn}
          disabled={busy}
          aria-label="Track parcel"
        >
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </form>

      <div className={styles.hints}>
        <span>Sample references</span>
        {samples.map((reference) => (
          <button
            key={reference}
            type="button"
            className={styles.hintChip}
            onClick={() => onPickSample(reference)}
          >
            {reference}
          </button>
        ))}
      </div>
    </div>
  );
}
