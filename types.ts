export interface PurchaseStages {
  ordered: boolean; // 喊單
  paid: boolean;    // 匯款
  shipped: boolean; // 出貨
  arrived: boolean; // 到貨
  completed: boolean; // 完成
}

export interface Purchase {
  id: string;
  name: string;
  price: number;
  date: string; // YYYY-MM-DD
  note: string;
  tag?: string; // 作品/系列 Tag
  tagColor?: string; // Tag 顏色
  stages: PurchaseStages;
}
