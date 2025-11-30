import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import BarcodeScanner from '../components/BarcodeScanner';
import type { Product, Supplier } from '../types';

const EditProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products, updateProduct } = useProducts();
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Product>>({
        barcode: '',
        brand: '',
        name: '',
        weight: '',
        salesPrice: 0,
    });

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const product = products.find(p => p.id === id);
        if (product) {
            setFormData({
                barcode: product.barcode,
                brand: product.brand,
                name: product.name,
                weight: product.weight,
                salesPrice: product.salesPrice,
            });
            setSuppliers(product.suppliers);
        } else {
            setError('Ürün bulunamadı');
        }
    }, [id, products]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSupplierChange = (index: number, field: keyof Supplier, value: string | number) => {
        const newSuppliers = [...suppliers];
        newSuppliers[index] = {
            ...newSuppliers[index],
            [field]: value,
        };
        setSuppliers(newSuppliers);
    };

    const addSupplierRow = () => {
        setSuppliers([
            ...suppliers,
            { id: crypto.randomUUID(), name: '', price: 0 },
        ]);
    };

    const removeSupplierRow = (index: number) => {
        if (suppliers.length <= 1) {
            setError('En az 1 tedarikçi satırı olmalı.');
            return;
        }
        const newSuppliers = suppliers.filter((_, i) => i !== index);
        setSuppliers(newSuppliers);
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (!formData.brand || !formData.name || !formData.salesPrice) {
            setError('Lütfen marka, ürün adı ve satış fiyatı alanlarını doldurun.');
            return;
        }

        // Get valid suppliers (optional)
        const validSuppliers = suppliers.filter(s => s.name.trim() !== '' && s.price > 0);

        if (id) {
            updateProduct(id, {
                ...formData,
                salesPrice: Number(formData.salesPrice),
                suppliers: validSuppliers,
            });
            navigate(`/product/${id}`);
        }
    };

    if (!id) return <div>Geçersiz ID</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-secondary">
                    <ArrowLeft size={20} />
                    Geri
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Ürün Düzenle</h1>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card space-y-4">
                    <h2 className="text-lg border-b pb-2 mb-4">Ürün Bilgileri</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="label">Barkod (İsteğe Bağlı)</label>
                            <div className="flex gap-2">
                                <input
                                    ref={barcodeInputRef}
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleInputChange}
                                    className="input flex-1"
                                    placeholder="Barkod okutun veya girin"
                                />
                                <BarcodeScanner
                                    onScan={(barcode) => {
                                        setFormData(prev => ({ ...prev, barcode }));
                                        barcodeInputRef.current?.focus();
                                    }}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Marka</label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="Örn: Ülker"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">Ürün Adı</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="Örn: Çikolatalı Gofret"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">Gramaj / Boyut</label>
                            <input
                                type="text"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="Örn: 36g"
                            />
                        </div>

                        <div className="input-group md:col-span-2">
                            <label className="label">Satış Fiyatı (₺)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="salesPrice"
                                value={formData.salesPrice}
                                onChange={handleInputChange}
                                className="input text-lg font-bold text-emerald-600"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="text-lg">Tedarikçi Fiyatları (İsteğe Bağlı)</h2>
                        <button type="button" onClick={addSupplierRow} className="btn btn-secondary text-sm">
                            <Plus size={16} /> Ekle
                        </button>
                    </div>

                    <div className="space-y-3">
                        {suppliers.map((supplier, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={supplier.name}
                                        onChange={(e) => handleSupplierChange(index, 'name', e.target.value)}
                                        className="input"
                                        placeholder="Tedarikçi Adı"
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={supplier.price}
                                        onChange={(e) => handleSupplierChange(index, 'price', Number(e.target.value))}
                                        className="input text-right"
                                        placeholder="0.00"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSupplierRow(index)}
                                    className="btn btn-danger p-2 mb-[1px]"
                                    title="Sil"
                                    disabled={suppliers.length <= 1}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary w-full md:w-auto px-8 py-3 text-lg">
                        <Save size={20} />
                        Değişiklikleri Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;
