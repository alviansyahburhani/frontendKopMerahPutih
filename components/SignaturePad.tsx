// components/SignaturePad.tsx
"use client"; // WAJIB: Menandakan ini adalah Client Component

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type SignaturePadProps = {
  onChange: (value: string | null) => void;
  value: string | null;
};

const SignaturePad: React.FC<SignaturePadProps> = ({ onChange, value }) => {
  const sigPadRef = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    sigPadRef.current?.clear();
    onChange(null); // Kirim 'null' ke react-hook-form
  };

  // FUNGSI PERBAIKAN UTAMA ADA DI SINI
  const handleEndDrawing = () => {
    if (sigPadRef.current) {
      // BUKAN 'trim_canvas', TAPI panggil method .getTrimmedCanvas()
      const signatureData = sigPadRef.current
        .getTrimmedCanvas()
        .toDataURL('image/png');
      
      // Kirim data Base64 (diawali dengan "data:image/png;base64,...")
      onChange(signatureData);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <div className="relative w-full h-48 bg-gray-50 border">
        <SignatureCanvas
          ref={sigPadRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-full',
          }}
          onEnd={handleEndDrawing} // Panggil fungsi saat selesai menggambar
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-600">
          Tanda tangan di area di atas.
        </p>
        <button
          type="button"
          // Ganti styling 'className' ini sesuai dengan styling/UI library Anda
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleClear}
        >
          Bersihkan
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;