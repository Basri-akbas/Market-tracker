import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, ProductContextType, SupplierInfo, ReturnItem, SupplierPhoto } from '../types';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch, setDoc } from 'firebase/firestore';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = 'market_tracker_products';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [returns, setReturns] = useState<ReturnItem[]>([]);
    const [supplierPhotos, setSupplierPhotos] = useState<SupplierPhoto[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial load and subscription for products
    useEffect(() => {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Product[];

            setProducts(productsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Subscription for returns
    useEffect(() => {
        const q = query(collection(db, 'returns'), orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const returnsData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as ReturnItem[];

            setReturns(returnsData);
        });

        return () => unsubscribe();
    }, []);

    // Subscription for supplier photos
    useEffect(() => {
        const q = query(collection(db, 'supplier_photos'), orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const photosData = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as SupplierPhoto[];

            setSupplierPhotos(photosData);
        });

        return () => unsubscribe();
    }, []);

    // Migration logic: Upload local data if Firestore is empty
    useEffect(() => {
        const migrateData = async () => {
            if (loading) return; // Wait for initial load

            // Only migrate if Firestore is empty
            if (products.length === 0) {
                const localData = localStorage.getItem(STORAGE_KEY);
                if (localData) {
                    try {
                        const localProducts = JSON.parse(localData) as Product[];
                        if (localProducts.length > 0) {
                            console.log('Migrating local data to Firebase...', localProducts.length);
                            const batch = writeBatch(db);

                            localProducts.forEach(product => {
                                const { id, ...data } = product; // Remove old ID
                                const newDocRef = doc(collection(db, 'products'));
                                batch.set(newDocRef, { ...data, createdAt: product.createdAt || Date.now() });
                            });

                            await batch.commit();
                            console.log('Migration complete!');
                            // Clear local storage to prevent re-migration
                            localStorage.removeItem(STORAGE_KEY);
                        }
                    } catch (error) {
                        console.error('Migration failed:', error);
                    }
                }
            }
        };

        migrateData();
    }, [loading, products.length]);

    const addProduct = async (product: Product) => {
        try {
            const { id, ...productData } = product;
            await addDoc(collection(db, 'products'), {
                ...productData,
                createdAt: Date.now()
            });
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Ürün eklenirken hata oluştu.');
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'products', id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Ürün silinirken hata oluştu.');
        }
    };

    const updateProduct = async (id: string, updatedData: Partial<Product>) => {
        try {
            const productRef = doc(db, 'products', id);
            await setDoc(productRef, { ...updatedData }, { merge: true });
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Ürün güncellenirken hata oluştu.');
        }
    };

    const addReturn = async (item: Omit<ReturnItem, 'id'>) => {
        try {
            await addDoc(collection(db, 'returns'), item);
        } catch (error) {
            console.error('Error adding return:', error);
            alert('İade eklenirken hata oluştu.');
        }
    };

    const toggleReturnStatus = async (id: string, currentStatus: boolean) => {
        try {
            const returnRef = doc(db, 'returns', id);
            await setDoc(returnRef, { isReturned: !currentStatus }, { merge: true });
        } catch (error) {
            console.error('Error updating return status:', error);
        }
    };

    const deleteReturn = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'returns', id));
        } catch (error) {
            console.error('Error deleting return:', error);
        }
    };

    const addSupplierPhoto = async (photo: Omit<SupplierPhoto, 'id'>) => {
        try {
            await addDoc(collection(db, 'supplier_photos'), photo);
        } catch (error) {
            console.error('Error adding supplier photo:', error);
            alert('Fotoğraf eklenirken hata oluştu.');
        }
    };

    const deleteSupplierPhoto = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'supplier_photos', id));
        } catch (error) {
            console.error('Error deleting supplier photo:', error);
        }
    };

    const getUniqueSuppliers = (): SupplierInfo[] => {
        const supplierMap = new Map<string, SupplierInfo>();

        products.forEach((product) => {
            product.suppliers.forEach((supplier) => {
                if (!supplierMap.has(supplier.name)) {
                    supplierMap.set(supplier.name, {
                        name: supplier.name,
                        productCount: 0,
                        products: [],
                    });
                }

                const supplierInfo = supplierMap.get(supplier.name)!;
                const existingProduct = supplierInfo.products.find(
                    (p) => p.product.id === product.id
                );

                if (!existingProduct) {
                    supplierInfo.productCount++;
                    supplierInfo.products.push({
                        product,
                        price: supplier.price,
                    });
                }
            });
        });

        return Array.from(supplierMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    };

    const getProductsBySupplier = (supplierName: string): SupplierInfo | null => {
        const suppliers = getUniqueSuppliers();
        return suppliers.find((s) => s.name === supplierName) || null;
    };

    return (
        <ProductContext.Provider value={{
            products,
            returns,
            supplierPhotos,
            addProduct,
            deleteProduct,
            updateProduct,
            getUniqueSuppliers,
            getProductsBySupplier,
            addReturn,
            toggleReturnStatus,
            deleteReturn,
            addSupplierPhoto,
            deleteSupplierPhoto
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
