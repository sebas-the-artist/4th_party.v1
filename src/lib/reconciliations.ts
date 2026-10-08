import { prisma } from "@/lib/prisma";
import type {
  ReconciliationDetail,
  ReconciliationRow,
  ReconciliationStatus,
} from "@/lib/reconciliation-types";

function formatCurrencyFromCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function toReconciliationRow(reconciliation: {
  id: string;
  store: string;
  platform: string;
  expectedCents: number;
  receivedCents: number;
  varianceCents: number;
  status: string;
  date: string;
  time: string;
}): ReconciliationRow {
  return {
    id: reconciliation.id,
    store: reconciliation.store,
    platform: reconciliation.platform,
    expected: formatCurrencyFromCents(reconciliation.expectedCents),
    received: formatCurrencyFromCents(reconciliation.receivedCents),
    variance: formatCurrencyFromCents(reconciliation.varianceCents),
    status: reconciliation.status as ReconciliationStatus,
    date: reconciliation.date,
    time: reconciliation.time,
  };
}

function toReconciliationDetail(reconciliation: {
  id: string;
  store: string;
  platform: string;
  expectedCents: number;
  receivedCents: number;
  varianceCents: number;
  status: string;
  date: string;
  time: string;
  note: string;
}): ReconciliationDetail {
  /* return {  // old PRE_"edit function for reconciliation"
    ...toReconciliationRow(reconciliation),
    note: reconciliation.note,
  }; */
  return {
  ...toReconciliationRow(reconciliation),
  note: reconciliation.note,
  expectedCents: reconciliation.expectedCents,
  receivedCents: reconciliation.receivedCents,
  varianceCents: reconciliation.varianceCents,
};

}

export async function getReconciliations(): Promise<ReconciliationRow[]> {
  const reconciliations = await prisma.reconciliation.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return reconciliations.map(toReconciliationRow);
}

export async function getReconciliationById(
  id: string,
): Promise<ReconciliationDetail | null> {
  const reconciliation = await prisma.reconciliation.findUnique({
    where: {
      id,
    },
  });

  if (!reconciliation) {
    return null;
  }

  return toReconciliationDetail(reconciliation);
}

export async function getExceptions(): Promise<ReconciliationRow[]> {
  const reconciliations = await prisma.reconciliation.findMany({
    where: {
      status: {
        not: "Matched",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reconciliations.map(toReconciliationRow);
}

export async function updateReconciliationStatus(
  id: string,
  status: ReconciliationStatus,
): Promise<ReconciliationDetail> {
  const reconciliation = await prisma.reconciliation.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return toReconciliationDetail(reconciliation);
}

export type DashboardSummary = {
  totalReconciliations: number;
  openExceptions: number;
  matchedRate: number;
  unresolvedVariance: string;
  attentionItems: ReconciliationRow[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const reconciliations = await getReconciliations();

  const attentionItems = reconciliations
    .filter((item) => item.status !== "Matched")
    .slice(0, 5);

  const openExceptions = reconciliations.filter(
    (item) => item.status !== "Matched",
  ).length;

  const totalUnresolvedVarianceCents = reconciliations
    .filter((item) => item.status !== "Matched")
    .reduce((total, item) => {
      const cents = Math.round(
        Number(item.variance.replace(/[$,]/g, "")) * 100,
      );

      return total + Math.abs(cents);
    }, 0);

  const matchedCount = reconciliations.filter(
    (item) => item.status === "Matched",
  ).length;

  const matchedRate =
    reconciliations.length === 0
      ? 0
      : Math.round((matchedCount / reconciliations.length) * 100);

  return {
    totalReconciliations: reconciliations.length,
    openExceptions,
    matchedRate,
    unresolvedVariance: formatCurrencyFromCents(
      totalUnresolvedVarianceCents,
    ),
    attentionItems,
  };
}
//edit reconcilliation function
export async function updateReconciliation(
  id: string,
   data: {
    store: string;
    platform: string;
    expectedCents: number;
    receivedCents: number;
    varianceCents: number;
    status: ReconciliationStatus;
    note: string;
  },
): Promise<ReconciliationDetail> {
  const reconciliation = await prisma.reconciliation.update({
    where: {
      id,
    },
    data,
  });

  return toReconciliationDetail(reconciliation);
}



/* import { prisma } from "@/lib/prisma";
import type {
  ReconciliationDetail,
  ReconciliationRow,
  ReconciliationStatus,
} from "@/lib/reconciliation-types";

function formatCurrencyFromCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function toReconciliationRow(reconciliation: {
  id: string;
  store: string;
  platform: string;
  expectedCents: number;
  receivedCents: number;
  varianceCents: number;
  status: string;
  date: string;
  time: string;
}): ReconciliationRow {
  return {
    id: reconciliation.id,
    store: reconciliation.store,
    platform: reconciliation.platform,
    expected: formatCurrencyFromCents(reconciliation.expectedCents),
    received: formatCurrencyFromCents(reconciliation.receivedCents),
    variance: formatCurrencyFromCents(reconciliation.varianceCents),
    status: reconciliation.status as ReconciliationStatus,
    date: reconciliation.date,
    time: reconciliation.time,
  };
}

function toReconciliationDetail(reconciliation: {
  id: string;
  store: string;
  platform: string;
  expectedCents: number;
  receivedCents: number;
  varianceCents: number;
  status: string;
  date: string;
  time: string;
  note: string;
}): ReconciliationDetail {
  return {
    ...toReconciliationRow(reconciliation),
    note: reconciliation.note,
  };
}

export async function getReconciliations(): Promise<ReconciliationRow[]> {
  const reconciliations = await prisma.reconciliation.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return reconciliations.map(toReconciliationRow);
}

export async function getReconciliationById(
  id: string,
): Promise<ReconciliationDetail | null> {
  const reconciliation = await prisma.reconciliation.findUnique({
    where: {
      id,
    },
  });

  if (!reconciliation) {
    return null;
  }

  return toReconciliationDetail(reconciliation);
}

export async function getExceptions(): Promise<ReconciliationRow[]> {
  const reconciliations = await prisma.reconciliation.findMany({
    where: {
      status: {
        not: "Matched",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reconciliations.map(toReconciliationRow);
}

export async function updateReconciliationStatus(
  id: string,
  status: ReconciliationStatus,
): Promise<ReconciliationDetail> {
  const reconciliation = await prisma.reconciliation.update({
    where: {
      id,
    },
     {
      status,
    },
  });

  return toReconciliationDetail(reconciliation);
}

export type DashboardSummary = {
  totalReconciliations: number;
  openExceptions: number;
  matchedRate: number;
  unresolvedVariance: string;
  attentionItems: ReconciliationRow[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const reconciliations = await getReconciliations();

  const attentionItems = reconciliations
    .filter((item) => item.status !== "Matched")
    .slice(0, 5);

  const openExceptions = reconciliations.filter(
    (item) => item.status !== "Matched",
  ).length;

  const totalUnresolvedVarianceCents = attentionItems.reduce(
    (total, item) => {
      const cents = Math.round(
        Number(item.variance.replace(/[$,]/g, "")) * 100,
      );

      return total + Math.abs(cents);
    },
    0,
  );

  const matchedCount = reconciliations.filter(
    (item) => item.status === "Matched",
  ).length;

  const matchedRate =
    reconciliations.length === 0
      ? 0
      : Math.round((matchedCount / reconciliations.length) * 100);

  return {
    totalReconciliations: reconciliations.length,
    openExceptions,
    matchedRate,
    unresolvedVariance: formatCurrencyFromCents(
      totalUnresolvedVarianceCents,
    ),
    attentionItems,
  };
}

 */


/* import { prisma } from "@/lib/prisma";
import type {
  Exception,
  ReconciliationDetail,
  ReconciliationRow,
} from "@/lib/reconciliation-types";
export

function toReconciliationRow(
  reconciliation: ReconciliationDetail,
): ReconciliationRow {
  return {
    id: reconciliation.id,
    store: reconciliation.store,
    platform: reconciliation.platform,
    expected: reconciliation.expected,
    received: reconciliation.received,
    variance: reconciliation.variance,
    status: reconciliation.status,
  };
}

function toReconciliationDetail(reconciliation: {
  id: string;
  store: string;
  platform: string;
  expected: string;
  received: string;
  variance: string;
  status: string;
  date: string;
  time: string;
  note: string;
}): ReconciliationDetail {
  return {
    id: reconciliation.id,
    store: reconciliation.store,
    platform: reconciliation.platform,
    expected: reconciliation.expected,
    received: reconciliation.received,
    variance: reconciliation.variance,
    status: reconciliation.status as ReconciliationDetail["status"],
    date: reconciliation.date,
    time: reconciliation.time,
    note: reconciliation.note,
  };
}

export async function getReconciliations(): Promise<ReconciliationRow[]> {
  const reconciliations = await prisma.reconciliation.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return reconciliations.map((reconciliation) =>
    toReconciliationRow(toReconciliationDetail(reconciliation)),
  );
}

export async function getReconciliationById(
  id: string,
): Promise<ReconciliationDetail | null> {
  const reconciliation = await prisma.reconciliation.findUnique({
    where: {
      id,
    },
  });

  return reconciliation ? toReconciliationDetail(reconciliation) : null;
}

export async function getExceptions(): Promise<Exception[]> {
  const reconciliations = await prisma.reconciliation.findMany({
    where: {
      status: {
        not: "Matched",
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  return reconciliations.map((reconciliation) => ({
    id: reconciliation.id,
    store: reconciliation.store,
    platform: reconciliation.platform,
    issue: reconciliation.status as Exception["issue"],
    amount: reconciliation.variance,
    age: getExceptionAge(reconciliation.createdAt),
  }));
}

function getExceptionAge(createdAt: Date): string {
  const ageInMinutes = Math.floor(
    (Date.now() - createdAt.getTime()) / 1000 / 60,
  );

  if (ageInMinutes < 1) {
    return "Just now";
  }

  if (ageInMinutes < 60) {
    return `${ageInMinutes} min ago`;
  }

  const ageInHours = Math.floor(ageInMinutes / 60);

  if (ageInHours < 24) {
    return `${ageInHours} hour${ageInHours === 1 ? "" : "s"} ago`;
  }

  const ageInDays = Math.floor(ageInHours / 24);

  return `${ageInDays} day${ageInDays === 1 ? "" : "s"} ago`;
}

export async function updateReconciliationStatus(
  id: string,
  status: ReconciliationDetail["status"],
): Promise<ReconciliationDetail> {
  const reconciliation = await prisma.reconciliation.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return toReconciliationDetail(reconciliation);
}

export type DashboardSummary = {
  totalReconciliations: number;
  openExceptions: number;
  matchedRate: number;
  unresolvedVariance: string;
  attentionItems: ReconciliationRow[];
};

function parseCurrency(value: string) {
  return Number(value.replace(/[$,]/g, ""));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const reconciliations = await getReconciliations();

  const attentionItems = reconciliations
    .filter((item) => item.status !== "Matched")
    .slice(0, 5);

  const openExceptions = reconciliations.filter(
    (item) => item.status !== "Matched",
  ).length;


  const totalUnresolvedVariance = attentionItems.reduce(
    (total, item) => total + Math.abs(parseCurrency(item.variance)),
    0,
  );

  const matchedCount = reconciliations.filter(
    (item) => item.status === "Matched",
  ).length;

  const matchedRate =
    reconciliations.length === 0
      ? 0
      : Math.round((matchedCount / reconciliations.length) * 100);

  return {
    totalReconciliations: reconciliations.length,
    openExceptions,
    matchedRate,
    unresolvedVariance: formatCurrency(totalUnresolvedVariance),
    attentionItems,
  };
}

 */

/* import { reconciliationDetails, reconciliationRows } from "@/lib/mock-reconciliations";
import type {
  Exception,
  ReconciliationDetail,
  ReconciliationRow,
} from "@/lib/reconciliation-types";

const exceptionAgeById: Record<string, string> = {
  "014": "2 hours ago",
  "009": "5 hours ago",
  "022": "Yesterday",
};

export async function getReconciliations(): Promise<ReconciliationRow[]> {
  return reconciliationRows;
}

export async function getReconciliationById(
  id: string,
): Promise<ReconciliationDetail | null> {
  return reconciliationDetails[id] ?? null;
}

export async function getExceptions(): Promise<Exception[]> {
  return reconciliationRows
    .filter((row) => row.status !== "Matched")
    .map((row) => ({
      id: row.id,
      store: row.store,
      platform: row.platform,
      issue: row.status,
      amount: row.variance,
      age: exceptionAgeById[row.id] ?? "Recently",
    }));
}
 */