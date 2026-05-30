export interface BureaucracyItem {
  id: string;
  dimensionId: string;
  title: string;
  type: 'document' | 'permit' | 'license' | 'other';
  expiryDate?: string;
  status: 'ok' | 'expiring_soon' | 'expired' | 'pending';
  notes?: string;
}
