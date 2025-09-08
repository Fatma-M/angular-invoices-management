export interface Invoice {
  docId: string;
  invoiceId: string;
  billerStreetAddress: string;
  billerCity: string;
  billerZipCode: string;
  billerCountry: string;
  clientName: string;
  clientEmail: string;
  clientStreetAddress: string;
  clientCity: string;
  clientZipCode: string;
  clientCountry: string;
  invoiceDateUnix: number;
  invoiceDate: string;
  paymentTerms: string;
  paymentDueDateUnix: number;
  paymentDueDate: string;
  productDescription: string;
  invoiceItemList: InvoiceListItem[];
  invoiceTotal: number;
  invoicePending: boolean;
  invoiceDraft: boolean;
  invoicePaid: boolean;
}

export interface InvoiceListItem {
  itemName: string;
  qty: string;
  price: string;
  total: string;
}
