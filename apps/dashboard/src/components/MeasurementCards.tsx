import { Activity, ClipboardList, Scale } from "lucide-react";
import type {
  EcgReading,
  PatientReview,
  QuestionnaireReading,
  WeightReading,
} from "../types";
import { formatDateTime } from "../lib/formatting";

export default function MeasurementCards({ review }: { review: PatientReview }) {
  return (
    <div className="measurement-grid">
      <EcgCard reading={review.ecg} synthetic={review.synthetic} />
      <WeightCard reading={review.weight} synthetic={review.synthetic} />
      <QuestionnaireCard reading={review.questionnaire} synthetic={review.synthetic} />
    </div>
  );
}

function EcgCard({ reading, synthetic }: { reading: EcgReading | null; synthetic: boolean }) {
  return (
    <article className="measurement-card ecg-card">
      <div className="card-heading">
        <span className="measurement-icon ecg-icon"><Activity size={17} /></span>
        <div><h3>ECG</h3><p>Electrocardiogram</p></div>
        <span className={`reading-state ${reading ? "is-recorded" : "is-empty"}`}>
          <span />{reading ? "Recorded" : "No reading"}
        </span>
      </div>
      {reading ? (
        <>
          <div className="ecg-visual">
            {reading.waveform ? <EcgWaveform values={reading.waveform} /> : (
              <div className="chart-empty">Waveform data unavailable</div>
            )}
          </div>
          <div className="reading-value ecg-value">
            <strong>{reading.durationSeconds ? `${reading.durationSeconds.toFixed(0)} sec` : "ECG recording"}</strong>
            <span>{synthetic ? "Illustrative waveform" : "Recording duration"}</span>
          </div>
          <ReadingFooter readingAt={reading.recordedAt} source={reading.source} />
        </>
      ) : <MeasurementEmpty kind="ECG" />}
    </article>
  );
}

function WeightCard({ reading, synthetic }: { reading: WeightReading | null; synthetic: boolean }) {
  return (
    <article className="measurement-card">
      <div className="card-heading">
        <span className="measurement-icon weight-icon"><Scale size={17} /></span>
        <div><h3>Weight</h3><p>Body weight</p></div>
        <span className={`reading-state ${reading ? "is-recorded" : "is-empty"}`}>
          <span />{reading ? "Recorded" : "No reading"}
        </span>
      </div>
      {reading ? (
        <>
          <div className="reading-value weight-value">
            <strong>{reading.valueKg === null ? "—" : reading.valueKg.toFixed(1)} <small>kg</small></strong>
            <span>{synthetic ? "Example reading" : "Latest recorded value"}</span>
          </div>
          <div className="weight-chart-wrap">
            {reading.history.length > 1 ? <WeightTrend points={reading.history.map((point) => point.valueKg)} /> : (
              <div className="chart-empty">Not enough readings for a trend</div>
            )}
          </div>
          <div className="trend-labels">
            <span>{reading.history[0]?.label ?? ""}</span>
            <span>{reading.history.at(-1)?.label ?? ""}</span>
          </div>
          <ReadingFooter readingAt={reading.recordedAt} source={reading.source} />
        </>
      ) : <MeasurementEmpty kind="weight" />}
    </article>
  );
}

function QuestionnaireCard({ reading, synthetic }: { reading: QuestionnaireReading | null; synthetic: boolean }) {
  return (
    <article className="measurement-card questionnaire-card">
      <div className="card-heading">
        <span className="measurement-icon questionnaire-icon"><ClipboardList size={17} /></span>
        <div><h3>Questionnaire</h3><p>Daily check-in</p></div>
        <span className={`reading-state ${reading ? "is-recorded" : "is-empty"}`}>
          <span />{reading ? "Completed" : "No response"}
        </span>
      </div>
      {reading ? (
        <>
          <div className="questionnaire-answers">
            {reading.answers.slice(0, 4).map((answer) => (
              <div className="answer-row" key={`${answer.label}-${answer.value}`}>
                <span>{answer.label}</span><strong>{answer.value}</strong>
              </div>
            ))}
            {!reading.answers.length && <div className="chart-empty">No answers were returned.</div>}
          </div>
          <ReadingFooter readingAt={reading.recordedAt} source={synthetic ? "Patient questionnaire" : reading.source} />
        </>
      ) : <MeasurementEmpty kind="questionnaire" />}
    </article>
  );
}

function EcgWaveform({ values }: { values: number[] }) {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const points = values.map((value, index) => {
    const x = values.length > 1 ? (index / (values.length - 1)) * 320 : 0;
    const y = 86 - ((value - minimum) / range) * 72;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 320 100" preserveAspectRatio="none" role="img" aria-label="ECG waveform preview">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function WeightTrend({ points }: { points: number[] }) {
  const minimum = Math.min(...points);
  const maximum = Math.max(...points);
  const range = maximum - minimum || 1;
  const polyline = points.map((value, index) => {
    const x = points.length > 1 ? (index / (points.length - 1)) * 320 : 0;
    const y = 84 - ((value - minimum) / range) * 58;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 320 100" preserveAspectRatio="none" role="img" aria-label="Recent weight readings trend">
      <polyline points={polyline} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      {points.map((value, index) => {
        const x = points.length > 1 ? (index / (points.length - 1)) * 320 : 0;
        const y = 84 - ((value - minimum) / range) * 58;
        return <circle key={`${index}-${value}`} cx={x} cy={y} r="3" />;
      })}
    </svg>
  );
}

function ReadingFooter({ readingAt, source }: { readingAt: string; source: string }) {
  return (
    <div className="reading-footer">
      <span>{source}</span>
      <time dateTime={readingAt}>{formatDateTime(readingAt)}</time>
    </div>
  );
}

function MeasurementEmpty({ kind }: { kind: string }) {
  return <div className="measurement-empty">No {kind} reading is available for this patient.</div>;
}
