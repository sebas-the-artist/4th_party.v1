import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const reconciliations = [
  {
    id: "014",
    store: "Store 014",
    platform: "DoorDash",
    expected: "$8,420.00",
    received: "$8,335.80",
    variance: "-$84.20",
    status: "Short deposit",
    date: "August 19, 2026",
    time: "9:42 AM",
    note: "The deposited amount is short by 1%. Review the DoorDash payout report and confirm whether the difference is a processing fee or an omitted order.",
  },
  {
    id: "009",
    store: "Store 009",
    platform: "Uber Eats",
    expected: "$3,140.00",
    received: "$3,108.60",
    variance: "-$31.40",
    status: "Error charge",
    date: "August 19, 2026",
    time: "8:15 AM",
    note: "An unexpected charge appears in the payout. Compare the charge with the Uber Eats settlement report before resolving it.",
  },
  {
    id: "022",
    store: "Store 022",
    platform: "DoorDash",
    expected: "$1,800.00",
    received: "$1,782.00",
    variance: "-$18.00",
    status: "Unmatched refund",
    date: "August 18, 2026",
    time: "4:30 PM",
    note: "A refund could not be matched to a corresponding order. Verify the marketplace order number and refund date.",
  },
  {
    id: "031",
    store: "Store 031",
    platform: "Uber Eats",
    expected: "$4,920.00",
    received: "$4,920.00",
    variance: "$0.00",
    status: "Matched",
    date: "August 18, 2026",
    time: "2:10 PM",
    note: "Expected and received payout amounts match.",
  },
];

async function main() {
  for (const reconciliation of reconciliations) {
    await prisma.reconciliation.upsert({
      where: {
        id: reconciliation.id,
      },
      update: reconciliation,
      create: reconciliation,
    });
  }

  console.log(`Seeded ${reconciliations.length} reconciliations.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
