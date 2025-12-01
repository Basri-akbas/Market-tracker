import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckSquare, Square, Camera, X, Image as ImageIcon } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

const SupplierReturns: React.FC = () => {
    const { supplierName } = useParams<{ supplierName: string }>();
    const navigate = useNavigate();
    const { returns, addReturn, updateReturn, toggleReturnStatus, deleteReturn, supplierPhotos, addSupplierPhoto, deleteSupplierPhoto } = useProducts();
    const decodedName = decodeURIComponent(supplierName || '');

    const [showAddForm, setShowAddForm] = useState(false);
    const [showPhotoForm, setShowPhotoForm] = useState(false);
    const [photoName, setPhotoName] = useState('');
    const [photoImage, setPhotoImage] = useState('');
    const [newItem, setNewItem] = useState({
        brand: '',
        productName: '',
        weight: '',
        quantity: 1,
        image: '',
    });
    const [viewImage, setViewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter returns for this supplier
    const supplierReturns = returns.filter(r => r.supplierName === decodedName);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                    resolve(compressedBase64);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setNewItem({ ...newItem, image: compressed });
            } catch (error) {
                console.error('Image compression failed:', error);
                alert('Fotoğraf yüklenirken hata oluştu.');
            }
        }
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.productName) return;

        addReturn({
            supplierName: decodedName,
            brand: newItem.brand,
            productName: newItem.productName,
            weight: newItem.weight,
            quantity: newItem.quantity,
            date: Date.now(),
            isReturned: false,
            image: newItem.image || null,
        });

        setNewItem({ brand: '', productName: '', weight: '', quantity: 1, image: '' });
        setShowAddForm(false);
    };

    const handleUpdateImage = async (itemId: string) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment' as any;
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    const compressed = await compressImage(file);
                    const returnRef = returns.find(r => r.id === itemId);
                    if (returnRef) {
                        await updateReturn(itemId, {
                            image: compressed,
                        });
                    }
                } catch (error) {
                    console.error('Image update failed:', error);
                }
            }
        };
        input.click();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/returns')} className="btn btn-secondary">
                    <ArrowLeft size={20} />
                    Geri
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{decodedName}</h1>
                    <p className="text-sm text-slate-500">İade Listesi</p>
                </div>
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn btn-primary w-full mb-6 flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                Yeni İade Ekle
            </button>

            {/* Add Form */}
            {showAddForm && (
                <div className="card p-4 mb-6 bg-slate-50 border-slate-200">
                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="input-group mb-0">
                                <label className="label">Marka</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newItem.brand}
                                    onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                                    placeholder="Örn: Ülker"
                                />
                            </div>
                            <div className="input-group mb-0">
                                <label className="label">Ürün Adı</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newItem.productName}
                                    onChange={e => setNewItem({ ...newItem, productName: e.target.value })}
                                    placeholder="Örn: Çikolata"
                                    required
                                />
                            </div>
                            <div className="input-group mb-0">
                                <label className="label">Gramaj</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newItem.weight}
                                    onChange={e => setNewItem({ ...newItem, weight: e.target.value })}
                                    placeholder="Örn: 50g"
                                />
                            </div>
                            <div className="input-group mb-0">
                                <label className="label">Adet</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="input"
                                    value={newItem.quantity}
                                    onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Photo Upload */}
                        <div className="input-group mb-0">
                            <label className="label">Fotoğraf (İsteğe Bağlı)</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageCapture}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn btn-secondary flex items-center gap-2"
                                >
                                    <Camera size={20} />
                                    {newItem.image ? 'Fotoğrafı Değiştir' : 'Fotoğraf Çek'}
                                </button>
                                {newItem.image && (
                                    <>
                                        <img
                                            src={newItem.image}
                                            alt="Preview"
                                            className="w-16 h-16 object-cover rounded cursor-pointer border border-slate-200"
                                            onClick={() => setViewImage(newItem.image)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, image: '' })}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                                İptal
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Ekle
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Returns List */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th className="w-12"></th>
                                <th>Ürün</th>
                                <th>Adet</th>
                                <th>Tarih</th>
                                <th>Fotoğraf</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplierReturns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">
                                        Bu tedarikçi için iade kaydı bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                supplierReturns.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`transition-colors ${item.isReturned ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                                    >
                                        <td>
                                            <button
                                                onClick={() => toggleReturnStatus(item.id, item.isReturned)}
                                                className={`p-2 rounded-full transition-colors ${item.isReturned ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'
                                                    }`}
                                            >
                                                {item.isReturned ? <CheckSquare size={24} /> : <Square size={24} />}
                                            </button>
                                        </td>
                                        <td className={item.isReturned ? 'opacity-50 line-through' : ''}>
                                            <div className="font-medium text-slate-800">
                                                {item.brand} {item.productName}
                                            </div>
                                            <div className="text-xs text-slate-500">{item.weight}</div>
                                        </td>
                                        <td className={item.isReturned ? 'opacity-50 line-through' : ''}>
                                            <span className="badge bg-slate-100 text-slate-700">
                                                {item.quantity} Adet
                                            </span>
                                        </td>
                                        <td className={`text-sm text-slate-500 ${item.isReturned ? 'opacity-50 line-through' : ''}`}>
                                            {new Date(item.date).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td>
                                            {item.image ? (
                                                <div className="flex gap-2 items-center">
                                                    <img
                                                        src={item.image}
                                                        alt="Return"
                                                        className="w-12 h-12 object-cover rounded cursor-pointer border border-slate-200"
                                                        onClick={() => setViewImage(item.image!)}
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateImage(item.id)}
                                                        className="text-blue-500 hover:text-blue-700 text-xs"
                                                        title="Fotoğrafı Değiştir"
                                                    >
                                                        <Camera size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateImage(item.id)}
                                                    className="text-slate-400 hover:text-slate-600"
                                                    title="Fotoğraf Ekle"
                                                >
                                                    <ImageIcon size={20} />
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
                                                        deleteReturn(item.id);
                                                    }
                                                }}
                                                className="p-2 text-red-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Image Modal */}
            {viewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setViewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setViewImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={viewImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain rounded"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Photo Gallery Section */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Fotoğraflar</h2>
                    <button
                        onClick={() => setShowPhotoForm(!showPhotoForm)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Camera size={20} />
                        Fotoğraf Ekle
                    </button>
                </div>

                {/* Add Photo Form */}
                {showPhotoForm && (
                    <div className="card p-4 mb-6 bg-slate-50 border-slate-200">
                        <div className="space-y-4">
                            <div className="input-group mb-0">
                                <label className="label">Fotoğraf Adı</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={photoName}
                                    onChange={e => setPhotoName(e.target.value)}
                                    placeholder="Örn: Hasarlı Ürünler"
                                    required
                                />
                            </div>

                            <div className="input-group mb-0">
                                <label className="label">Fotoğraf</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    const compressed = await compressImage(file);
                                                    setPhotoImage(compressed);
                                                } catch (error) {
                                                    console.error('Image compression failed:', error);
                                                    alert('Fotoğraf yüklenirken hata oluştu.');
                                                }
                                            }
                                        }}
                                        className="hidden"
                                        id="photo-gallery-input"
                                    />
                                    <label
                                        htmlFor="photo-gallery-input"
                                        className="btn btn-secondary flex items-center gap-2 cursor-pointer"
                                    >
                                        <Camera size={20} />
                                        {photoImage ? 'Fotoğrafı Değiştir' : 'Fotoğraf Çek'}
                                    </label>
                                    {photoImage && (
                                        <>
                                            <img
                                                src={photoImage}
                                                alt="Preview"
                                                className="w-16 h-16 object-cover rounded cursor-pointer border border-slate-200"
                                                onClick={() => setViewImage(photoImage)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPhotoImage('')}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setShowPhotoForm(false);
                                        setPhotoName('');
                                        setPhotoImage('');
                                    }}
                                    className="btn btn-secondary"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={() => {
                                        if (!photoName || !photoImage) {
                                            alert('Lütfen fotoğraf adı ve fotoğraf seçin.');
                                            return;
                                        }
                                        addSupplierPhoto({
                                            supplierName: decodedName,
                                            name: photoName,
                                            image: photoImage,
                                            date: Date.now(),
                                        });
                                        setPhotoName('');
                                        setPhotoImage('');
                                        setShowPhotoForm(false);
                                    }}
                                    className="btn btn-primary"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Photo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {supplierPhotos
                        .filter(photo => photo.supplierName === decodedName)
                        .map(photo => (
                            <div key={photo.id} className="card p-3 relative group">
                                <img
                                    src={photo.image}
                                    alt={photo.name}
                                    className="w-full h-32 object-cover rounded cursor-pointer mb-2"
                                    onClick={() => setViewImage(photo.image)}
                                />
                                <div className="text-sm font-medium text-slate-800 truncate">{photo.name}</div>
                                <div className="text-xs text-slate-500">
                                    {new Date(photo.date).toLocaleDateString('tr-TR')}
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
                                            deleteSupplierPhoto(photo.id);
                                        }
                                    }}
                                    className="absolute top-1 right-1 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                </div>

                {supplierPhotos.filter(photo => photo.supplierName === decodedName).length === 0 && !showPhotoForm && (
                    <div className="text-center py-12 text-slate-500 card">
                        Henüz fotoğraf eklenmemiş. "Fotoğraf Ekle" butonuna tıklayarak başlayın.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierReturns;
