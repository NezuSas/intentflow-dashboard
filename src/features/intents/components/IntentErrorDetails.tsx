import type { Intent } from "../domain/Intent";
import styles from "./IntentErrorDetails.module.css";
import { formatGuayaquilDateTime } from "@/shared/format/date";
import { IntentSourceBadge } from "./IntentSourceBadge";
import { getIntentErrorPresentation } from "../domain/intentError";

export function IntentErrorDetails({ intent }: { intent: Intent }) {
  const error = getIntentErrorPresentation(intent);
  return (
    <div className={styles.details}>
      <section className={styles.summary} role="alert">
        <h3 className={styles.summaryTitle}>{error.title}</h3>
        <p className={styles.summaryDescription}>{error.description}</p>
      </section>
      <section className={styles.field}>
        <h3 className={styles.label}>Source</h3>
        <IntentSourceBadge source={intent.source} />
      </section>
      <section className={styles.field}>
        <h3 className={styles.label}>Board</h3>
        <p className={styles.value}>
          {intent.board?.name} ({intent.board?.adb_identifier})
        </p>
      </section>

      <section className={styles.field}>
        <h3 className={styles.label}>Command</h3>
        <code className={styles.code}>{intent.resolved_command}</code>
      </section>

      <section className={styles.field}>
        <details className={styles.technicalDetails}>
          <summary>Show technical details</summary>
          <pre className={`${styles.code} ${styles.output}`}>
            {intent.output || "No error output available"}
          </pre>
        </details>
      </section>

      <section className={styles.field}>
        <h3 className={styles.label}>Executed At</h3>
        <p className={styles.value}>
          {formatGuayaquilDateTime(intent.executed_at)}
        </p>
      </section>
    </div>
  );
}
