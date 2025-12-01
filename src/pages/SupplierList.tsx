import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Search, Trash2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const SupplierList: React.FC = () => {
    const { products, getUniqueSuppliers, deleteSupplier } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');

    const suppliers = useMemo(() => getUniqueSuppliers(), [products, getUniqueSuppliers]);

    const term = searchTerm.toLowerCase().trim();
    const filteredSuppliers = term
        ? suppliers.filter((s) => s.name.toLowerCase().includes(term))
        : suppliers;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1>Tedarikçiler</h1>
                <div className="text-sm text-slate-500">
                    Toplam {suppliers.length} tedarikçi
                </div>
            </div>

            <div className="card mb-6 p-4">
                <div className="input-group mb-0 relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Tedarikçi adı ile arayın..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredSuppliers.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Tedarikçi bulunamadı.</p>
                        {searchTerm && <p className="text-sm">"{searchTerm}" için sonuç yok.</p>}
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <Link
                            key={supplier.name}
                            to={`/supplier/${encodeURIComponent(supplier.name)}`}
                            className="card flex items-center justify-between p-4 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                                        {supplier.name}
                                    </h3>
                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                        <Package size={14} />
                                        {supplier.productCount} Ürün
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-slate-300 group-hover:text-emerald-500">
                                    →
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (window.confirm(`"${supplier.name}" tedarikçisini silmek istediğinize emin misiniz? Bu işlem tüm ürünlerden bu tedarikçiyi kaldıracaktır.`)) {
                                            deleteSupplier(supplier.name);
                                        }
                                    }}
                                    className="p-2 text-red-300 hover:text-red-500 transition-colors"
                                    title="Tedarikçiyi Sil"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default SupplierList;
