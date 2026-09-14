export interface Table {
  id: string;
  name: string;
  type: "Room" | "Table";
  occupied: boolean;
  active: boolean;
  qrCode: string;
  currentOrderId?: string;
}

export type Room = Table;
