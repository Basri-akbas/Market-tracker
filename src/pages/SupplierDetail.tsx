import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const SupplierDetail: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const navigate = useNavigate();
    const { getProductsBySupplier } = useProducts();
    const [selectedBrand, setSelectedBrand] = React.useState<string>('Tümü');

    const supplierInfo = name ? getProductsBySupplier(decodeURIComponent(name)) : null;

    if (!supplierInfo) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <h2 className="text-xl text-slate-600 mb-4">Tedarikçi bulunamadı.</h2>
                <button onClick={() => navigate('/suppliers')} className="btn btn-primary">
                    Tedarikçilere Dön
                </button>
            </div>
        );
    }

    // Get unique brands
    const brands = React.useMemo(() => {
        const brandSet = new Set(supplierInfo.products.map(p => p.product.brand));
        return ['Tümü', ...Array.from(brandSet).sort()];
    }, [supplierInfo]);

    // Filter products
    const filteredProducts = React.useMemo(() => {
        if (selectedBrand === 'Tümü') return supplierInfo.products;
        return supplierInfo.products.filter(p => p.product.brand === selectedBrand);
    }, [supplierInfo, selectedBrand]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-secondary">
                    <ArrowLeft size={20} />
                    Geri
                </button>
                <h1>{supplierInfo.name}</h1>
            </div>

            <div className="card mb-6 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Package size={32} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Toplam Ürün</div>
                        <div className="text-3xl font-bold">{supplierInfo.productCount}</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Ürünler</h2>
                <span className="text-sm text-slate-500">
                    {filteredProducts.length} ürün gösteriliyor
                </span>
            </div>

            {/* Brand Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                {brands.map(brand => (
                    <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedBrand === brand
                                ? 'bg-slate-800 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {brand}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredProducts.map(({ product, price }) => {
                    const profit = product.salesPrice - price;
                    // Profit margin = (profit / cost) * 100
                    const margin = price > 0 ? (profit / price) * 100 : 0;
                    const isProfitable = profit > 0;

                    return (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="card block p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="badge bg-slate-100 text-slate-600">
                                            {product.brand}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">
                                            {product.barcode}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800">
                                        {product.name}
                                    </h3>
                                    {product.weight && (
                                        <div className="text-sm text-slate-500">{product.weight}</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 pt-4 border-t border-slate-100">
                                <div>
                                    <div className="text-xs text-slate-500">Alış Fiyatı</div>
                                    <div className="text-lg font-bold text-slate-700">
                                        {price.toFixed(2)} ₺
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Satış Fiyatı</div>
                                    <div className="text-lg font-bold text-emerald-600">
                                        {product.salesPrice.toFixed(2)} ₺
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Kâr</div>
                                    <div
                                        className={`text-lg font-bold flex items-center gap-1 ${isProfitable ? 'text-emerald-600' : 'text-red-600'
                                            }`}
                                    >
                                        {isProfitable ? (
                                            <TrendingUp size={16} />
                                        ) : (
                                            <TrendingDown size={16} />
                                        )}
                                        {profit.toFixed(2)} ₺
                                        <span className="text-sm">(%{margin.toFixed(1)})</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default SupplierDetail;
