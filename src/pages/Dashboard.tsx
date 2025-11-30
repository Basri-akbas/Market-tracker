import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, BarChart3, Users, RotateCcw } from 'lucide-react';

const Dashboard: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="mb-8 text-center">Market Yönetim Paneli</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/add" className="card hover:shadow-lg transition-shadow flex flex-col items-center text-center p-8 group">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlusCircle size={32} />
                    </div>
                    <h2 className="text-xl mb-2">Ürün Kayıt</h2>
                    <p className="text-slate-500">Barkod ile yeni ürün girişi yapın ve fiyatları belirleyin.</p>
                </Link>

                <Link to="/search" className="card hover:shadow-lg transition-shadow flex flex-col items-center text-center p-8 group">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Search size={32} />
                    </div>
                    <h2 className="text-xl mb-2">Ürün Arama</h2>
                    <p className="text-slate-500">Barkod veya isim ile ürün arayın ve detayları görüntüleyin.</p>
                </Link>

                <Link to="/suppliers" className="card hover:shadow-lg transition-shadow flex flex-col items-center text-center p-8 group">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users size={32} />
                    </div>
                    <h2 className="text-xl mb-2">Tedarikçiler</h2>
                    <p className="text-slate-500">Tedarikçileri görüntüleyin ve ürünlerini inceleyin.</p>
                </Link>

                <Link to="/stats" className="card hover:shadow-lg transition-shadow flex flex-col items-center text-center p-8 group">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BarChart3 size={32} />
                    </div>
                    <h2 className="text-xl mb-2">Genel Durum</h2>
                    <p className="text-slate-500">Genel kar oranlarını ve istatistikleri inceleyin.</p>
                </Link>

                <Link to="/returns" className="card hover:shadow-lg transition-shadow flex flex-col items-center text-center p-8 group">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <RotateCcw size={32} />
                    </div>
                    <h2 className="text-xl mb-2">İade Yönetimi</h2>
                    <p className="text-slate-500">Tedarikçi iadelerini takip edin ve yönetin.</p>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
