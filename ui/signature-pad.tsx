'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './button';

export type SignaturePadRef = {
  getSignature: () => string | null;
  clearSignature: () => void;
};

const SignaturePad = forwardRef<SignaturePadRef>((props, ref) => {
  const sigPad = useRef<SignatureCanvas>(null);

  useImperativeHandle(ref, () => ({
    getSignature: () => {
      if (sigPad.current?.isEmpty()) {
        return null;
      }
      return sigPad.current?.toDataURL() || null;
    },
    clearSignature: () => {
      sigPad.current?.clear();
    },
  }));

  return (
    <div className="relative rounded-lg border bg-white">
      <SignatureCanvas
        ref={sigPad}
        penColor="black"
        canvasProps={{ className: 'w-full h-32 rounded-lg' }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 h-7 text-xs"
        onClick={() => sigPad.current?.clear()}
      >
        Hapus
      </Button>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';

export { SignaturePad };
