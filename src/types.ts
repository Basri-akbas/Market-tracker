export interface Supplier {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  barcode: string;
  brand: string;
  name: string;
  weight: string;
  salesPrice: number;
  suppliers: Supplier[];
  createdAt: number;
}

export interface SupplierInfo {
  name: string;
  productCount: number;
  products: Array<{
    product: Product;
    price: number;
  }>;
}

export interface ReturnItem {
  id: string;
  supplierName: string;
  brand: string;
  productName: string;
  weight: string;
  quantity: number;
  date: number;
  isReturned: boolean;
  image?: string; // Base64 encoded image
}

export interface SupplierPhoto {
  id: string;
  supplierName: string;
  name: string;
  image: string; // Base64 encoded image
  date: number;
}

export interface SupplierEntity {
  id: string;
  name: string;
  createdAt: number;
}

export interface ProductContextType {
  products: Product[];
  returns: ReturnItem[];
  supplierPhotos: SupplierPhoto[];
  suppliers: SupplierEntity[];
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  getUniqueSuppliers: () => SupplierInfo[];
  getProductsBySupplier: (supplierName: string) => SupplierInfo | null;
  deleteSupplier: (supplierName: string) => void;
  addSupplier: (name: string) => Promise<void>;
  updateSupplier: (oldName: string, newName: string) => Promise<void>;
  addReturn: (item: Omit<ReturnItem, 'id'>) => void;
  updateReturn: (id: string, item: Partial<ReturnItem>) => void;
  toggleReturnStatus: (id: string, currentStatus: boolean) => void;
  deleteReturn: (id: string) => void;
  addSupplierPhoto: (photo: Omit<SupplierPhoto, 'id'>) => void;
  deleteSupplierPhoto: (id: string) => void;
}
