import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { QrCode, X } from 'lucide-react';

export default function QRCodeSection() {
  const [showQR, setShowQR] = useState(false);
  const [url] = typeof window !== 'undefined' ? [window.location.href] : [''];

  return (
    <div className="mt-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
      <button
        onClick={() => setShowQR(v => !v)}
        className="
          flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-full
          backdrop-blur-md transition-all duration-300
          hover:scale-105 active:scale-95
          text-sm font-medium
        "
        style={{
          backgroundColor: 'var(--button-bg)',
          border: '1px solid var(--button-border)',
          color: 'var(--text-secondary)',
        }}
      >
        <QrCode className="w-4 h-4" />
        <span>{showQR ? '收起二维码' : '扫码访问'}</span>
      </button>

      {showQR && (
        <div
          className="
            mt-4 p-5 rounded-2xl backdrop-blur-md
            flex flex-col items-center gap-3 mx-auto
            max-w-[200px] animate-fade-in-up
          "
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--button-border)',
            animationDelay: '0ms',
          }}
        >
          <div className="bg-white rounded-xl p-2">
            <QRCodeSVG
              value={url}
              size={140}
              level="M"
              includeMargin={false}
              fgColor="#1f2937"
            />
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            用手机扫码打开此页
          </p>
          <button
            onClick={() => setShowQR(false)}
            aria-label="关闭"
            className="
              absolute -top-2 -right-2 w-7 h-7 rounded-full
              flex items-center justify-center
              transition-colors duration-200
            "
            style={{ display: 'none' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
