import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const ReturnsDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { getUniqueSuppliers } = useProducts();
    const suppliers = getUniqueSuppliers();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/')} className="btn btn-secondary">
                    <ArrowLeft size={20} />
                    Ana Menü
                </button>
                <h1 className="text-2xl font-bold text-slate-800">İade Yönetimi</h1>
            </div>

            <div className="card p-6 mb-6 bg-blue-50 border-blue-100">
                <p className="text-blue-800">
                    İade işlemi yapmak istediğiniz tedarikçiyi listeden seçiniz.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map((supplier) => (
                    <Link
                        key={supplier.name}
                        to={`/returns/${encodeURIComponent(supplier.name)}`}
                        className="card p-4 hover:shadow-md transition-all flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <Building2 size={20} />
                            </div>
                            <span className="font-semibold text-slate-700">{supplier.name}</span>
                        </div>
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-500" />
                    </Link>
                ))}
            </div>

            {suppliers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    Henüz kayıtlı tedarikçi bulunmuyor.
                </div>
            )}
        </div>
    );
};

export default ReturnsDashboard;
