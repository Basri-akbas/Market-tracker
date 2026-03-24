import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
}

const SCANNER_ELEMENT_ID = 'barcode-scanner-container';

const SUPPORTED_FORMATS = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
];

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const stopScanning = async () => {
        try {
            if (scannerRef.current && scannerRef.current.isScanning) {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            }
        } catch (err) {
            console.error('Stop error:', err);
        } finally {
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    const startScanning = async () => {
        setError(null);
        setIsScanning(true);
    };

    // Start scanner after isScanning=true causes DOM to render the container
    useEffect(() => {
        if (!isScanning) return;

        let cancelled = false;

        const init = async () => {
            try {
                // Small delay to ensure DOM element is mounted
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (cancelled) return;

                const element = document.getElementById(SCANNER_ELEMENT_ID);
                if (!element) {
                    throw new Error('Scanner container bulunamadı.');
                }

                const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
                    formatsToSupport: SUPPORTED_FORMATS,
                    verbose: false,
                });
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 15,
                        qrbox: { width: 280, height: 160 },
                        aspectRatio: 1.333,
                    },
                    (decodedText) => {
                        if (!cancelled) {
                            onScan(decodedText);
                            stopScanning();
                        }
                    },
                    () => {
                        // frame-level scan errors are normal, ignore
                    }
                );
            } catch (err: unknown) {
                if (cancelled) return;
                console.error('Scanner init error:', err);
                const msg =
                    err instanceof Error ? err.message : String(err);
                if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
                    setError('Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini verin.');
                } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('no camera')) {
                    setError('Kamera bulunamadı. Cihazınızda kamera olduğundan emin olun.');
                } else {
                    setError('Kamera başlatılamadı: ' + msg);
                }
                scannerRef.current = null;
                setIsScanning(false);
            }
        };

        init();

        return () => {
            cancelled = true;
            if (scannerRef.current) {
                const s = scannerRef.current;
                scannerRef.current = null;
                if (s.isScanning) {
                    s.stop().then(() => s.clear()).catch(console.error);
                }
            }
        };
    }, [isScanning]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            {/* Camera button — always visible when not scanning */}
            {!isScanning && (
                <button
                    type="button"
                    onClick={startScanning}
                    className="btn btn-secondary p-2"
                    title="Barkod Tara"
                >
                    <Camera size={20} />
                </button>
            )}

            {/* Full-screen scanner overlay */}
            {isScanning && (
                <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 bg-slate-900">
                        <h3 className="text-white text-lg font-semibold">Barkod Tara</h3>
                        <button
                            onClick={stopScanning}
                            className="text-white p-2 hover:bg-slate-800 rounded"
                            title="Kapat"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scanner area — always in DOM when overlay is open */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
                        <div
                            id={SCANNER_ELEMENT_ID}
                            className="w-full max-w-md rounded-xl overflow-hidden"
                        />
                        {error && (
                            <div className="w-full max-w-md p-4 bg-red-600 text-white text-center rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="p-4 bg-slate-900 text-slate-300 text-center text-sm">
                        📦 Ürün barkodunu kamera önüne tutun (EAN-13, CODE-128 vb.)
                    </div>
                </div>
            )}
        </>
    );
};

export default BarcodeScanner;
