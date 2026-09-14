// import type { Table } from "@/types";
import { Table } from "@/types/table";

export const tables: Table[] = [
  { id: "table-502", name: "Table 502", type: "Table", occupied: true, active: true, qrCode: "QR-502", currentOrderId: "ORD-2401" },
  { id: "table-208", name: "Table 208", type: "Table", occupied: true, active: true, qrCode: "QR-208", currentOrderId: "ORD-2403" },
  { id: "table-701", name: "Table 701", type: "Table", occupied: true, active: true, qrCode: "QR-701" },
  { id: "table-08", name: "Table 08", type: "Table", occupied: true, active: true, qrCode: "QR-T08", currentOrderId: "ORD-2402" },
  { id: "table-12", name: "Table 12", type: "Table", occupied: false, active: true, qrCode: "QR-T12" },
  { id: "pool", name: "Pool Deck", type: "Table", occupied: true, active: false, qrCode: "QR-POOL", currentOrderId: "ORD-2404" },
];

export const rooms = tables;
