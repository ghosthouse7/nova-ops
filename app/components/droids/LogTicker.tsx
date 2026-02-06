"use client";

const LOG_LINES = [
  "PACKET_TRACE: 192.168.0.1 [SUCCESS]",
  "FIREWALL: BLOCKED PORT 8080",
  "AI_CORE: OPTIMIZING NEURAL NET...",
  "SIGINT: ENCRYPTED BURST DETECTED",
  "AUTH: TOKEN ROTATION COMPLETE",
  "SATCOM: LINK STABLE // 42ms",
  "IDS: HEURISTIC SCAN RUNNING",
  "KERNEL: THREAD_POOL RESIZED -> 128",
];

export default function LogTicker() {
  const stream = LOG_LINES.map((line) => `> ${line}`).join("   //   ");

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-green-500/20 bg-black/95 px-3 py-1 font-mono text-[10px] leading-4 text-green-400 pointer-events-none"
    >
      <div className="overflow-hidden">
        <div className="tickerTrack whitespace-nowrap">
          <span className="tickerContent">{stream}</span>
          <span className="tickerContent" aria-hidden="true">
            {stream}
          </span>
        </div>
      </div>

      <style jsx>{`
        .tickerTrack {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: tickerMarquee 28s linear infinite;
        }

        .tickerContent {
          display: inline-block;
          padding-right: 3rem;
        }

        @keyframes tickerMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tickerTrack {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
