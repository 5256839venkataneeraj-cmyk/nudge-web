import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import {
  QrCode,
  Smartphone,
  Wifi,
  Globe,
  Copy,
  Check,
  X,
  Sparkles,
  Key,
  Download,
} from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<"apk" | "wifi" | "tunnel">(
    "apk"
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
  const [hasCopiedPass, setHasCopiedPass] = useState(false);

  // Network URLs
  const host = typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" 
    ? window.location.origin 
    : "http://172.16.80.55:3000";

  const apkUrl = `${host}/nudge.apk`;
  const wifiUrl = host;
  const tunnelUrl = "https://spicy-nights-dig.loca.lt";
  const tunnelPassword = "136.233.9.105";

  const activeUrl = 
    selectedNetwork === "apk" 
      ? apkUrl 
      : selectedNetwork === "wifi" 
      ? wifiUrl 
      : tunnelUrl;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(activeUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#141211",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [activeUrl, isOpen]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setHasCopiedUrl(true);
      setTimeout(() => setHasCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyPass = async () => {
    try {
      await navigator.clipboard.writeText(tunnelPassword);
      setHasCopiedPass(true);
      setTimeout(() => setHasCopiedPass(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-sm bg-[#FAF8F5] dark:bg-[#1C1917] rounded-3xl border border-[#E7DFD7] dark:border-[#332C29] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EAE2DA] dark:border-[#332C29] bg-[#F4EFEA]/80 dark:bg-[#24201E]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A33C1B] to-[#C85D36] text-white flex items-center justify-center shadow-xs">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#2D2522] dark:text-[#F5EBE6]">
                    Open on Phone
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FCEEEA] dark:bg-[#2D1B14] text-[#A33C1B] dark:text-[#E07A5F] border border-[#F6D5CB] dark:border-[#4D2D20]">
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-[#70645D] dark:text-[#A89B95]">
                  Scan with your phone's camera
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#70645D] dark:text-[#A89B95] hover:bg-white dark:hover:bg-[#2E2824] hover:text-[#2D2522] dark:hover:text-[#F5EBE6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Switcher Tab */}
          <div className="px-4 pt-4">
            <div className="grid grid-cols-3 p-1 bg-[#EAE2DA]/70 dark:bg-[#24201E] rounded-2xl border border-[#E0D7CE] dark:border-[#332C29]">
              <button
                onClick={() => setSelectedNetwork("apk")}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  selectedNetwork === "apk"
                    ? "bg-white dark:bg-[#1C1917] text-[#A33C1B] dark:text-[#E07A5F] shadow-xs"
                    : "text-[#70645D] dark:text-[#A89B95] hover:text-[#2D2522]"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>APK File</span>
              </button>

              <button
                onClick={() => setSelectedNetwork("wifi")}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  selectedNetwork === "wifi"
                    ? "bg-white dark:bg-[#1C1917] text-[#A33C1B] dark:text-[#E07A5F] shadow-xs"
                    : "text-[#70645D] dark:text-[#A89B95] hover:text-[#2D2522]"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Wi-Fi (PWA)</span>
              </button>

              <button
                onClick={() => setSelectedNetwork("tunnel")}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  selectedNetwork === "tunnel"
                    ? "bg-white dark:bg-[#1C1917] text-[#A33C1B] dark:text-[#E07A5F] shadow-xs"
                    : "text-[#70645D] dark:text-[#A89B95] hover:text-[#2D2522]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Tunnel</span>
              </button>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="p-4 flex flex-col items-center text-center space-y-3">
            <div className="p-3.5 bg-white rounded-3xl border-2 border-[#E7DFD7] shadow-md flex items-center justify-center relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan to open Nudge on mobile"
                  className="w-52 h-52 rounded-xl object-contain"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-xs text-[#8F827A] animate-pulse">
                  Generating QR Code...
                </div>
              )}
            </div>

            {/* Direct APK Download Button */}
            {selectedNetwork === "apk" && (
              <a
                href="/nudge.apk"
                download="nudge.apk"
                className="w-full py-2.5 px-4 rounded-2xl bg-[#1E3A34] hover:bg-[#284C44] dark:bg-[#5B8A82] dark:hover:bg-[#4E7972] text-[#F9F6F0] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Direct Download APK (7.1 MB)</span>
              </a>
            )}

            {/* Instruction Callout */}
            <p className="text-xs text-[#5C5049] dark:text-[#C4B8B0] max-w-[280px] leading-relaxed">
              {selectedNetwork === "apk" ? (
                <>
                  Scan with your phone's camera to <strong>directly download & install the Android APK</strong> (no Play Store needed).
                </>
              ) : selectedNetwork === "wifi" ? (
                <>
                  Connect phone to <strong>same Wi-Fi</strong>, scan to open in Chrome or Safari, then tap <strong>"Add to Home Screen"</strong>.
                </>
              ) : (
                <>
                  Works on <strong>cellular data / anywhere</strong>. Enter the password below if prompted on first visit.
                </>
              )}
            </p>

            {/* Tunnel Password callout if Tunnel is active */}
            {selectedNetwork === "tunnel" && (
              <div className="w-full p-2.5 rounded-2xl bg-[#FFF8F5] dark:bg-[#251A15] border border-[#F4CCC1] dark:border-[#4D2D20] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-left">
                  <Key className="w-3.5 h-3.5 text-[#A33C1B] dark:text-[#E07A5F] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#8F827A] dark:text-[#A89B95] block">
                      Tunnel Password:
                    </span>
                    <span className="font-mono font-bold text-[#2D2522] dark:text-[#F5EBE6]">
                      {tunnelPassword}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyPass}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1C1917] hover:bg-[#FAF7F5] dark:hover:bg-[#2E2824] border border-[#EAE2DA] dark:border-[#3D3430] text-[11px] font-semibold text-[#A33C1B] dark:text-[#E07A5F] flex items-center gap-1 shadow-2xs"
                >
                  {hasCopiedPass ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* URL Chip & Copy Button */}
            <div className="w-full flex items-center gap-1.5 p-1.5 pl-3 rounded-2xl bg-white dark:bg-[#24201E] border border-[#EAE2DA] dark:border-[#332C29] text-xs">
              <span className="font-mono text-[11px] text-[#70645D] dark:text-[#A89B95] truncate flex-1 text-left">
                {activeUrl}
              </span>

              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-xl bg-[#FCEEEA] dark:bg-[#2D1B14] hover:bg-[#F9DDD5] text-[#A33C1B] dark:text-[#E07A5F] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                title="Copy Link"
              >
                {hasCopiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-[#EAE2DA] dark:border-[#332C29] bg-[#F4EFEA]/80 dark:bg-[#24201E]/80 flex items-center justify-between text-xs text-[#70645D] dark:text-[#A89B95]">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#A33C1B] dark:text-[#E07A5F]" />
              <span>Full touch gestures & Dark Mode</span>
            </span>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1C1917] hover:bg-[#FAF7F5] dark:hover:bg-[#24201E] text-[#2D2522] dark:text-[#F5EBE6] font-semibold border border-[#D9CEC6] dark:border-[#332C29] shadow-2xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
