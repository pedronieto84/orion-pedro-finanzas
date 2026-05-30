export interface Provider {
  id: string;
  dimensionId: string;
  name: string;
  category: string;
  contractNumber?: string;
  monthlyCost?: number;
  renewalDate?: string;
  contact?: string;
  notes?: string;
}
