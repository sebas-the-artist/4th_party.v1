"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ingestCsvAction, type IngestState } from "@/app/(dashboard)/dashboard/actions";
import {
  SAMPLE_BANK_CSV,
  SAMPLE_DELIVERY_CSV,
  SAMPLE_POS_CSV,
} from "@/domain/samples";
import type { Platform } from "@/domain/types";

const initial: IngestState = {};

function weekDates() {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - 6);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end) };
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="button button--primary" type="submit" disabled={pending}>
      {pending ? "Reading the file…" : "Find what they still owe"}
    </button>
  );
}

function CsvField({
  label,
  hint,
  textName,
  fileName,
  value,
  onText,
}: {
  label: string;
  hint: string;
  textName: string;
  fileName: string;
  value: string;
  onText: (value: string) => void;
}) {
  const [fileLabel, setFileLabel] = useState("No file yet — paste works too");

  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      <p className="filter-bar__hint">{hint}</p>
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
          onText(await file.text());
        }}
      />
      <span className="filter-bar__hint">{fileLabel}</span>
      <textarea
        className="form-field__input form-field__textarea"
        name={textName}
        value={value}
        onChange={(event) => onText(event.target.value)}
        placeholder="Paste the CSV here"
      />
    </label>
  );
}

export function IngestForm({
  locationId,
  defaultPlatform = "doordash",
}: {
  locationId: string;
  defaultPlatform?: Platform;
}) {
  const [state, action] = useActionState(ingestCsvAction, initial);
  const dates = useMemo(() => weekDates(), []);
  const [delivery, setDelivery] = useState("");
  const [pos, setPos] = useState("");
  const [bank, setBank] = useState("");

  return (
    <form className="ingest-form" action={action}>
      <input type="hidden" name="locationId" value={locationId} />
      <input type="hidden" name="defaultPlatform" value={defaultPlatform} />
      <div className="ingest-form__meta">
        <label className="form-field">
          <span className="form-field__label">Week start</span>
          <input
            className="form-field__input"
            type="date"
            name="periodStart"
            defaultValue={dates.start}
            required
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">Week end</span>
          <input
            className="form-field__input"
            type="date"
            name="periodEnd"
            defaultValue={dates.end}
            required
          />
        </label>
      </div>

      <CsvField
        label="DoorDash / Uber / Grubhub payout CSV"
        hint="Export as soon as the portal has it — same day if you can. Waiting a week burns 7 days of a ~30-day fight window."
        textName="deliveryCsv"
        fileName="deliveryFile"
        value={delivery}
        onText={setDelivery}
      />

      <details className="ingest-optional">
        <summary>Optional: POS and bank (stronger letters)</summary>
        <p className="page-header__text">
          Skip these to start. Add Toast/Square tickets if you want to prove the
          food was made. Add the deposit if you want to prove it never landed.
        </p>
        <CsvField
          label="POS CSV"
          hint="Check number, date, total, online order ID if you have it."
          textName="posCsv"
          fileName="posFile"
          value={pos}
          onText={setPos}
        />
        <CsvField
          label="Bank CSV"
          hint="Date, amount, description from the operating account."
          textName="bankCsv"
          fileName="bankFile"
          value={bank}
          onText={setBank}
        />
      </details>

      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="ingest-form__footer">
        <button
          className="button button--ghost"
          type="button"
          onClick={() => {
            setDelivery(SAMPLE_DELIVERY_CSV);
            setPos(SAMPLE_POS_CSV);
            setBank(SAMPLE_BANK_CSV);
          }}
        >
          Load a sample DoorDash week
        </button>
        <Submit />
      </div>
    </form>
  );
}
