export interface Supermarket {
  id: string;
  name: any;
  branches?: number;
}

export interface Offer {
  id: string;
  title: any;
  supermarketId?: string;
  supermarketName?: string;
  categoryName?: string;
  categoryId?: string;
  price?: number;
  status?: string;
}
