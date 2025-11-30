import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, DollarSign, Percent } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const Stats: React.FC = () => {
    const { products } = useProducts();

    const stats = useMemo(() => {
        let totalRevenue = 0;
        let totalCost = 0;
        let profitableCount = 0;

        products.forEach(product => {
            if (product.suppliers.length > 0) {
                const lowestPrice = Math.min(...product.suppliers.map(s => s.price));
                totalRevenue += product.salesPrice;
                totalCost += lowestPrice;

                if (product.salesPrice > lowestPrice) {
                    profitableCount++;
                }
            }
        });

        const totalProfit = totalRevenue - totalCost;
        // Profit margin = (profit / cost) * 100
        const overallMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

        return {
            totalProducts: products.length,
            profitableCount,
            totalRevenue,
            totalCost,
            totalProfit,
            overallMargin
        };
    }, [products]);

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl text-slate-600 mb-4">Henüz veri yok.</h2>
                <Link to="/add" className="btn btn-primary">
                    İlk Ürünü Ekle
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="mb-8">Genel İstatistikler</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Package size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Toplam Ürün</div>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    </div>
                </div>

                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Kârlı Ürün</div>
                        <div className="text-2xl font-bold">{stats.profitableCount}</div>
                    </div>
                </div>

                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Top. Potansiyel Kâr</div>
                        <div className="text-2xl font-bold text-emerald-600">
                            {stats.totalProfit.toFixed(2)} ₺
                        </div>
                    </div>
                </div>

                <div className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Percent size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">Ort. Kâr Marjı</div>
                        <div className="text-2xl font-bold">
                            %{stats.overallMargin.toFixed(1)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-6">
                <h3 className="text-lg mb-4">Finansal Özet</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Toplam Satış Değeri</span>
                        <span className="font-bold text-lg">{stats.totalRevenue.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Toplam Maliyet (En Düşük)</span>
                        <span className="font-bold text-lg text-slate-700">{stats.totalCost.toFixed(2)} ₺</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <span className="text-emerald-800 font-medium">Net Kâr Beklentisi</span>
                        <span className="font-bold text-xl text-emerald-600">+{stats.totalProfit.toFixed(2)} ₺</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                    * Hesaplamalar her ürün için mevcut en düşük tedarikçi fiyatı baz alınarak yapılmıştır.
                    Stok miktarı hesaba katılmamıştır (birim bazlı analiz).
                </p>
            </div>
        </div>
    );
};

export default Stats;
