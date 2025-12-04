import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import BarcodeScanner from '../components/BarcodeScanner';
import type { Product, Supplier } from '../types';
import { v4 as uuidv4 } from 'uuid';

const AddProduct: React.FC = () => {
    const navigate = useNavigate();
    const { addProduct, suppliers: availableSuppliers, addSupplier, getUniqueSuppliers } = useProducts();
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    // Combine suppliers from collection and products
    const allSuppliers = React.useMemo(() => {
        const supplierNames = new Set<string>();

        // Add from suppliers collection
        availableSuppliers.forEach(s => supplierNames.add(s.name));

        // Add from products (legacy suppliers)
        getUniqueSuppliers().forEach(s => supplierNames.add(s.name));

        return Array.from(supplierNames).sort();
    }, [availableSuppliers, getUniqueSuppliers]);

    const [formData, setFormData] = useState({
        barcode: '',
        brand: '',
        name: '',
        weight: '',
        salesPrice: '',
    });

    const [suppliers, setSuppliers] = useState<Omit<Supplier, 'id'>[]>([
        { name: '', price: 0 },
        { name: '', price: 0 },
        { name: '', price: 0 },
        { name: '', price: 0 },
    ]);

    const [error, setError] = useState<string | null>(null);
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');
    const [currentSupplierIndex, setCurrentSupplierIndex] = useState<number | null>(null);

    useEffect(() => {
        // Auto-focus barcode input on mount
        barcodeInputRef.current?.focus();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierChange = (index: number, field: keyof Omit<Supplier, 'id'>, value: string | number) => {
        // Check if user selected "+ Yeni Tedarikçi"
        if (field === 'name' && value === '__new__') {
            setCurrentSupplierIndex(index);
            setShowAddSupplierModal(true);
            return;
        }

        const newSuppliers = [...suppliers];
        newSuppliers[index] = { ...newSuppliers[index], [field]: value };
        setSuppliers(newSuppliers);
    };

    const addSupplierRow = () => {
        setSuppliers([...suppliers, { name: '', price: 0 }]);
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

        // Get valid suppliers (optional - can be 0 or more)
        const validSuppliers = suppliers.filter(s => s.name.trim() !== '' && s.price > 0);

        const newProduct: Product = {
            id: uuidv4(),
            barcode: formData.barcode,
            brand: formData.brand,
            name: formData.name,
            weight: formData.weight,
            salesPrice: Number(formData.salesPrice),
            suppliers: validSuppliers.map(s => ({ ...s, id: uuidv4() })),
            createdAt: Date.now(),
        };

        addProduct(newProduct);
        navigate('/');
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-secondary">
                    <ArrowLeft size={20} />
                    Geri
                </button>
                <h1>Yeni Ürün Ekle</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

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
                            <label className="label">Gramaj</label>
                            <input
                                type="text"
                                name="weight"
                                value={formData.weight}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="Örn: 50g"
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">Satış Fiyatı (TL)</label>
                            <input
                                type="number"
                                name="salesPrice"
                                value={formData.salesPrice}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
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
                            <div key={index} className="flex gap-3 items-end">
                                <div className="input-group flex-1 mb-0">
                                    <label className="label text-xs mb-1">Firma Adı</label>
                                    <select
                                        value={supplier.name}
                                        onChange={(e) => handleSupplierChange(index, 'name', e.target.value)}
                                        className="input py-2"
                                    >
                                        <option value="">Seçiniz...</option>
                                        {allSuppliers.map((name) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                        <option value="__new__">+ Yeni Tedarikçi</option>
                                    </select>
                                </div>
                                <div className="input-group w-32 mb-0">
                                    <label className="label text-xs mb-1">Alış Fiyatı</label>
                                    <input
                                        type="number"
                                        value={supplier.price || ''}
                                        onChange={(e) => handleSupplierChange(index, 'price', parseFloat(e.target.value))}
                                        className="input py-2"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
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

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
                        İptal
                    </button>
                    <button type="submit" className="btn btn-primary">
                        <Save size={20} />
                        Kaydet
                    </button>
                </div>
            </form>

            {/* Add Supplier Modal */}
            {showAddSupplierModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="card max-w-md w-full mx-4">
                        <h2 className="text-xl font-semibold mb-4">Yeni Tedarikçi Ekle</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (newSupplierName.trim()) {
                                await addSupplier(newSupplierName.trim());

                                // Set the new supplier name in the current dropdown
                                if (currentSupplierIndex !== null) {
                                    const newSuppliers = [...suppliers];
                                    newSuppliers[currentSupplierIndex] = {
                                        ...newSuppliers[currentSupplierIndex],
                                        name: newSupplierName.trim()
                                    };
                                    setSuppliers(newSuppliers);
                                }

                                setNewSupplierName('');
                                setShowAddSupplierModal(false);
                                setCurrentSupplierIndex(null);
                            }
                        }}>
                            <div className="input-group">
                                <label className="label">Tedarikçi Adı</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Tedarikçi adını girin"
                                    value={newSupplierName}
                                    onChange={(e) => setNewSupplierName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddSupplierModal(false);
                                        setNewSupplierName('');
                                        setCurrentSupplierIndex(null);
                                    }}
                                    className="btn btn-secondary"
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Ekle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddProduct;
