import clsx from "clsx";
import {
  TRACKING_STAGES,
  type TrackingStageId,
} from "@/features/tracking/types";
import styles from "./tracking.module.css";

export function StatusPill({
  stage,
  onDark = false,
}: {
  stage: TrackingStageId;
  onDark?: boolean;
}) {
  const label = TRACKING_STAGES.find((s) => s.id === stage)?.pill ?? stage;
  const tone =
    stage === "delivered"
      ? styles.pillDone
      : stage === "shipped" || stage === "out_for_delivery"
        ? styles.pillTransit
        : styles.pillNeutral;

  return (
    <span className={clsx(styles.pill, tone, onDark && styles.onDark)}>
      {label}
    </span>
  );
}
