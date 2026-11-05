import { getDateLabel, getStageIndex } from "@/features/tracking/format";
import type { TrackingShipment } from "@/features/tracking/types";
import { ProductThumb } from "./ProductThumb";
import { ProgressTrack } from "./ProgressTrack";
import { StatusPill } from "./StatusPill";
import styles from "./tracking.module.css";

export function ShipmentCard({ shipment }: { shipment: TrackingShipment }) {
  const first = shipment.items[0];
  const extra = shipment.items.length - 1;

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <ProductThumb
          key={first.image}
          src={first.image}
          alt=""
          className={styles.cardThumb}
          sizes="56px"
        />
        <div className={styles.cardHeadText}>
          <p className={styles.cardId}>{shipment.reference}</p>
          <p className={styles.cardProduct}>
            {first.name}
            {extra > 0 ? ` +${extra} more` : ""}
          </p>
        </div>
        <StatusPill stage={shipment.stage} />
      </div>

      <ProgressTrack
        stageIndex={getStageIndex(shipment)}
        variant="light"
        chip={shipment.etaChip}
      />

      <div className={styles.cardLower}>
        <div className={styles.cardMeta}>
          <div>
            <p className={styles.metaLabel}>{shipment.createdOn}</p>
            <p className={styles.metaValue}>
              {shipment.origin.area}, {shipment.origin.city}
            </p>
          </div>
          <div>
            <p className={styles.metaLabel}>
              {getDateLabel(shipment)} {shipment.estimatedOn}
            </p>
            <p className={styles.metaValue}>
              {shipment.destination.area}, {shipment.destination.city}
            </p>
          </div>
        </div>
        <div className={styles.cardImage}>
          <ProductThumb
            key={first.image}
            src={first.image}
            alt={first.name}
            className={styles.fill}
            sizes="160px"
          />
        </div>
      </div>
    </article>
  );
}
