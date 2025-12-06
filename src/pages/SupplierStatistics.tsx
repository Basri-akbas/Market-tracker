import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Package, DollarSign, Percent } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const SupplierStatistics: React.FC = () => {
    const { supplierName } = useParams<{ supplierName: string }>();
    const navigate = useNavigate();
    const { products } = useProducts();
    const decodedName = decodeURIComponent(supplierName || '');

    const statistics = useMemo(() => {
        // Get all products from this supplier
        const supplierProducts = products
            .map(product => {
                const supplier = product.suppliers.find(s => s.name === decodedName);
                if (!supplier) return null;

                const purchasePrice = supplier.price;
                const salePrice = product.salesPrice;
                const profit = salePrice - purchasePrice;
                const profitMargin = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;

                return {
                    product,
                    purchasePrice,
                    salePrice,
                    profit,
                    profitMargin
                };
            })
            .filter(Boolean) as Array<{
                product: any;
                purchasePrice: number;
                salePrice: number;
                profit: number;
                profitMargin: number;
            }>;

        const productCount = supplierProducts.length;
        const totalPurchase = supplierProducts.reduce((sum, item) => sum + item.purchasePrice, 0);
        const totalSale = supplierProducts.reduce((sum, item) => sum + item.salePrice, 0);
        const totalProfit = totalSale - totalPurchase;
        const avgProfitMargin = productCount > 0
            ? supplierProducts.reduce((sum, item) => sum + item.profitMargin, 0) / productCount
            : 0;

        // Sort by profit margin descending
        const sortedProducts = [...supplierProducts].sort((a, b) => b.profitMargin - a.profitMargin);

        return {
            productCount,
            totalPurchase,
            totalSale,
            totalProfit,
            avgProfitMargin,
            products: sortedProducts
        };
    }, [products, decodedName]);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/suppliers')} className="btn btn-secondary">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">{decodedName}</h1>
                    <p className="text-slate-400">Tedarikçi İstatistikleri</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="text-blue-400" size={24} />
                        <span className="text-slate-400 text-sm">Ürün Sayısı</span>
                    </div>
                    <div className="text-2xl font-bold">{statistics.productCount}</div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <Percent className="text-green-400" size={24} />
                        <span className="text-slate-400 text-sm">Ort. Kar Oranı</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                        {statistics.avgProfitMargin.toFixed(1)}%
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="text-orange-400" size={24} />
                        <span className="text-slate-400 text-sm">Toplam Alış</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {statistics.totalPurchase.toFixed(2)} ₺
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="text-blue-400" size={24} />
                        <span className="text-slate-400 text-sm">Toplam Satış</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {statistics.totalSale.toFixed(2)} ₺
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-emerald-400" size={24} />
                        <span className="text-slate-400 text-sm">Toplam Kar</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {statistics.totalProfit.toFixed(2)} ₺
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Ürün Detayları</h2>
                {statistics.products.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">Bu tedarikçiden ürün bulunmuyor.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4">Ürün</th>
                                    <th className="text-right py-3 px-4">Alış Fiyatı</th>
                                    <th className="text-right py-3 px-4">Satış Fiyatı</th>
                                    <th className="text-right py-3 px-4">Kar</th>
                                    <th className="text-right py-3 px-4">Kar Oranı</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statistics.products.map(({ product, purchasePrice, salePrice, profit, profitMargin }) => (
                                    <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                                        <td className="py-3 px-4">
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="hover:text-emerald-400 transition-colors"
                                            >
                                                <div className="font-medium">{product.brand}</div>
                                                <div className="text-sm text-slate-400">{product.name}</div>
                                            </Link>
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            {purchasePrice.toFixed(2)} ₺
                                        </td>
                                        <td className="text-right py-3 px-4">
                                            {salePrice.toFixed(2)} ₺
                                        </td>
                                        <td className={`text-right py-3 px-4 font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {profit.toFixed(2)} ₺
                                        </td>
                                        <td className={`text-right py-3 px-4 font-medium ${profitMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {profitMargin.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierStatistics;
