import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import BarcodeScanner from '../components/BarcodeScanner';

const ProductList: React.FC = () => {
    const { products, getUniqueSuppliers } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState<string>('');

    const suppliers = useMemo(() => getUniqueSuppliers(), [getUniqueSuppliers]);

    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Filter by supplier if selected
        if (selectedSupplier) {
            filtered = filtered.filter((p) =>
                p.suppliers.some((s) => s.name === selectedSupplier)
            );
        }

        // Filter by search term
        const term = searchTerm.toLowerCase().trim();
        if (term) {
            filtered = filtered.filter(
                (p) =>
                    p.barcode.toLowerCase().includes(term) ||
                    p.name.toLowerCase().includes(term) ||
                    p.brand.toLowerCase().includes(term) ||
                    p.suppliers.some((s) => s.name.toLowerCase().includes(term))
            );
        }

        return filtered;
    }, [products, searchTerm, selectedSupplier]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1>Ürün Arama</h1>
                <div className="text-sm text-slate-500">
                    Toplam {products.length} ürün
                </div>
            </div>

            <div className="card mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="input-group mb-0">
                        <label className="label">Barkod Ara</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input flex-1"
                                placeholder="Barkod numarasını girin ve Enter'a basın"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const target = e.target as HTMLInputElement;
                                        if (target.value.trim()) {
                                            setSearchTerm(target.value.trim());
                                            target.value = '';
                                        }
                                    }
                                }}
                            />
                            <BarcodeScanner onScan={(barcode) => setSearchTerm(barcode)} />
                        </div>
                    </div>
                    <div className="input-group mb-0">
                        <label className="label">Genel Arama</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input
                                type="text"
                                className="input pl-10 w-full"
                                placeholder="Ürün Adı, Marka veya Tedarikçi"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="input-group mb-0">
                        <select
                            className="input"
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                        >
                            <option value="">Tüm Tedarikçiler</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.name} value={supplier.name}>
                                    {supplier.name} ({supplier.productCount})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <Package size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Ürün bulunamadı.</p>
                        {searchTerm && <p className="text-sm">"{searchTerm}" için sonuç yok.</p>}
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="card flex items-center justify-between p-4 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="badge bg-slate-100 text-slate-600">{product.brand}</span>
                                    <span className="text-xs text-slate-400 font-mono">{product.barcode}</span>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="text-sm text-slate-500">
                                    {product.weight} • {product.suppliers.length} Tedarikçi
                                </div>
                            </div>

                            <div className="text-right mr-4">
                                <div className="text-base font-bold text-emerald-600">
                                    {product.salesPrice.toFixed(2)} ₺
                                </div>
                                <div className="text-xs text-slate-400">Satış Fiyatı</div>
                            </div>

                            <ChevronRight className="text-slate-300 group-hover:text-emerald-500" />
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductList;
