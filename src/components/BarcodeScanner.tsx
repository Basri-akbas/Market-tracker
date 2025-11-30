import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isInitializedRef = useRef(false);

    const startScanning = async () => {
        try {
            setError(null);
            setIsScanning(true);

            if (!scannerRef.current && !isInitializedRef.current) {
                isInitializedRef.current = true;
                scannerRef.current = new Html5Qrcode('barcode-scanner');
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0,
            };

            await scannerRef.current!.start(
                { facingMode: 'environment' },
                config,
                (decodedText) => {
                    onScan(decodedText);
                    stopScanning();
                },
                () => {
                    // Ignore scan errors (happens frequently while scanning)
                }
            );
        } catch (err) {
            console.error('Scanner error:', err);
            setError('Kamera erişimi reddedildi veya desteklenmiyor.');
            setIsScanning(false);
            isInitializedRef.current = false;
            scannerRef.current = null;
        }
    };

    const stopScanning = async () => {
        try {
            if (scannerRef.current?.isScanning) {
                await scannerRef.current.stop();
            }
        } catch (err) {
            console.error('Stop error:', err);
        } finally {
            setIsScanning(false);
        }
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    if (!isScanning) {
        return (
            <button
                type="button"
                onClick={startScanning}
                className="btn btn-secondary p-2"
                title="Barkod Tara"
            >
                <Camera size={20} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 bg-slate-900">
                <h3 className="text-white text-lg font-semibold">Barkod Tara</h3>
                <button
                    onClick={stopScanning}
                    className="text-white p-2 hover:bg-slate-800 rounded"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div id="barcode-scanner" className="w-full max-w-md"></div>
            </div>

            {error && (
                <div className="p-4 bg-red-600 text-white text-center">
                    {error}
                </div>
            )}

            <div className="p-4 bg-slate-900 text-white text-center text-sm">
                Barkodu kamera önüne tutun
            </div>
        </div>
    );
};

export default BarcodeScanner;
