"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ingestCsvAction, type IngestState } from "@/app/(dashboard)/dashboard/actions";
import {
  SAMPLE_BANK_CSV,
  SAMPLE_DELIVERY_CSV,
  SAMPLE_POS_CSV,
} from "@/domain/samples";

const initial: IngestState = {};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="button button--primary" type="submit" disabled={pending}>
      {pending ? "Matching…" : "Run three-way match"}
    </button>
  );
}

function CsvField({
  label,
  textName,
  fileName,
  defaultValue,
}: {
  label: string;
  textName: string;
  fileName: string;
  defaultValue: string;
}) {
  const [text, setText] = useState(defaultValue);
  const [fileLabel, setFileLabel] = useState("No file yet — paste works too");

  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      <input
        className="form-field__input"
        type="file"
        name={fileName}
        accept=".csv,.txt,text/csv,text/plain"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) {
            setFileLabel("No file yet — paste works too");
            return;
          }
          setFileLabel(file.name);
          setText(await file.text());
        }}
      />
      <span className="filter-bar__hint">{fileLabel}</span>
      <textarea
        className="form-field__input form-field__textarea"
        name={textName}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </label>
  );
}

export function IngestForm({ locationId }: { locationId: string }) {
  const [state, action] = useActionState(ingestCsvAction, initial);

  return (
    <form className="ingest-form" action={action}>
      <input type="hidden" name="locationId" value={locationId} />
      <div className="ingest-form__meta">
        <label className="form-field">
          <span className="form-field__label">Period start</span>
          <input
            className="form-field__input"
            type="date"
            name="periodStart"
            defaultValue="2026-10-13"
            required
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">Period end</span>
          <input
            className="form-field__input"
            type="date"
            name="periodEnd"
            defaultValue="2026-10-19"
            required
          />
        </label>
      </div>

      <CsvField label="POS CSV" textName="posCsv" fileName="posFile" defaultValue={SAMPLE_POS_CSV} />
      <CsvField
        label="DoorDash / Uber / Grubhub CSV"
        textName="deliveryCsv"
        fileName="deliveryFile"
        defaultValue={SAMPLE_DELIVERY_CSV}
      />
      <CsvField label="Bank CSV" textName="bankCsv" fileName="bankFile" defaultValue={SAMPLE_BANK_CSV} />

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="ingest-form__footer">
        <Submit />
      </div>
    </form>
  );
}
