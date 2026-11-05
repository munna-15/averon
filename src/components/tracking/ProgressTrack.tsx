import clsx from "clsx";
import { Check } from "lucide-react";
import { Fragment } from "react";
import { TRACKING_STAGES } from "@/features/tracking/types";
import styles from "./tracking.module.css";

interface ProgressTrackProps {
  stageIndex: number;
  variant: "light" | "dark";
  chip?: string | null;
}

export function ProgressTrack({
  stageIndex,
  variant,
  chip,
}: ProgressTrackProps) {
  const last = TRACKING_STAGES.length - 1;
  const delivered = stageIndex === last;

  return (
    <ol
      className={clsx(
        styles.track,
        variant === "dark" ? styles.dark : styles.light,
      )}
      aria-label={`Progress: ${TRACKING_STAGES[stageIndex].label}, step ${stageIndex + 1} of ${TRACKING_STAGES.length}`}
    >
      {TRACKING_STAGES.map((stage, i) => {
        const done = i < stageIndex || delivered;
        const current = i === stageIndex && !delivered;
        return (
          <Fragment key={stage.id}>
            <li
              className={clsx(
                styles.node,
                done && styles.nodeDone,
                current && styles.nodeCurrent,
              )}
            >
              <span className="sr-only">{stage.label}</span>
              {done ? (
                <Check size={12} strokeWidth={3.2} aria-hidden="true" />
              ) : null}
              {current && chip ? (
                <span className={styles.etaChip}>{chip}</span>
              ) : null}
            </li>
            {i < last ? (
              <li
                aria-hidden="true"
                className={clsx(
                  styles.connector,
                  i < stageIndex && styles.connectorDone,
                )}
              />
            ) : null}
          </Fragment>
        );
      })}
    </ol>
  );
}
