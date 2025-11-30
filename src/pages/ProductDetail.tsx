import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products, deleteProduct } = useProducts();

    const product = products.find((p) => p.id === id);

    if (!product) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl text-slate-600">Ürün bulunamadı.</h2>
                <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    // Logic: Sort suppliers by price ASC
    const sortedSuppliers = useMemo(() => {
        return [...product.suppliers].sort((a, b) => a.price - b.price);
    }, [product.suppliers]);

    // Logic: Get top 2 cheapest
    const cheapestSuppliers = sortedSuppliers.slice(0, 2);
    const lowestPrice = cheapestSuppliers[0]?.price || 0;

    // Logic: Calculate Margin
    const profitAmount = product.salesPrice - lowestPrice;
    // Profit margin = (profit / cost) * 100 = (sales - cost) / cost * 100
    const profitMargin = lowestPrice > 0 ? (profitAmount / lowestPrice) * 100 : 0;
    const isProfitable = profitAmount > 0;

    const handleDelete = () => {
        if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            deleteProduct(product.id);
            navigate('/');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-secondary">
                    <ArrowLeft size={20} />
                    Geri
                </button>
                <div className="flex gap-2">
                    <button onClick={() => navigate(`/edit-product/${product.id}`)} className="btn btn-primary">
                        Düzenle
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger">
                        <Trash2 size={20} />
                        Sil
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Main Info Card */}
                <div className="card md:col-span-2 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="badge bg-slate-100 text-slate-600">{product.brand}</span>
                                <span className="text-sm text-slate-400 font-mono">{product.barcode}</span>
                            </div>
                            <h1 className="text-2xl mb-1">{product.name}</h1>
                            <p className="text-slate-500">{product.weight}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-emerald-600">
                                {product.salesPrice.toFixed(2)} ₺
                            </div>
                            <div className="text-sm text-slate-400">Satış Fiyatı</div>
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg mb-3 flex items-center gap-2">
                            <Building2 size={20} className="text-slate-400" />
                            En Uygun Tedarikçiler
                        </h3>
                        <div className="space-y-3">
                            {cheapestSuppliers.map((supplier, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-slate-700">{supplier.name}</span>
                                    </div>
                                    <div className="font-bold text-slate-800">
                                        {supplier.price.toFixed(2)} ₺
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Profit Analysis Card */}
                <div className="card bg-gradient-to-br from-white to-slate-50">
                    <h3 className="text-lg mb-4 text-slate-700">Kârlılık Analizi</h3>

                    <div className="space-y-6">
                        <div>
                            <div className="text-sm text-slate-500 mb-1">Net Kâr (Birim)</div>
                            <div className={`text-2xl font-bold flex items-center gap-2 ${isProfitable ? 'text-emerald-600' : 'text-red-500'}`}>
                                {isProfitable ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                {profitAmount.toFixed(2)} ₺
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-slate-500 mb-1">Kâr Marjı</div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                                <div
                                    className={`h-2.5 rounded-full ${isProfitable ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-lg font-semibold text-slate-700">
                                %{profitMargin.toFixed(1)}
                            </div>
                        </div>

                        <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-200">
                            * En düşük tedarikçi fiyatı ({lowestPrice.toFixed(2)} ₺) baz alınarak hesaplanmıştır.
                        </div>
                    </div>
                </div>
            </div>

            {/* All Suppliers Table */}
            <div className="card">
                <h3 className="text-lg mb-4">Tüm Tedarikçiler</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Firma Adı</th>
                            <th className="text-right">Alış Fiyatı</th>
                            <th className="text-right">Fark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSuppliers.map((supplier, index) => {
                            const diff = supplier.price - lowestPrice;
                            return (
                                <tr key={index}>
                                    <td className="font-medium">{supplier.name}</td>
                                    <td className="text-right">{supplier.price.toFixed(2)} ₺</td>
                                    <td className="text-right text-sm text-slate-500">
                                        {diff === 0 ? (
                                            <span className="badge badge-success">En Ucuz</span>
                                        ) : (
                                            `+${diff.toFixed(2)} ₺`
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductDetail;
