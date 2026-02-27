import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const GRADIENTS = [
  'linear-gradient(120deg,#1A1A2E 35%,#C0321A)',
  'linear-gradient(120deg,#0D2137 35%,#1565C0)',
  'linear-gradient(120deg,#1A0D2E 35%,#6A1B9A)',
];

export default function HeroSlider({ slides = [] }) {
  const [cur, setCur]       = useState(0);
  const [copied, setCopied] = useState(false);
  const [revIdx, setRevIdx] = useState(null); // which slide has code revealed

  const total = slides.length;

  const goTo = useCallback((i) => {
    setCur(((i % total) + total) % total);
    setCopied(false);
    setRevIdx(null);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const t = setTimeout(() => goTo(cur + 1), 4500);
    return () => clearTimeout(t);
  }, [cur, total, goTo]);

  if (!slides.length) return null;

  function handleCode(e, slide) {
    e.preventDefault();
    e.stopPropagation();
    if (revIdx !== cur) { setRevIdx(cur); return; }
    navigator.clipboard.writeText(slide.code).catch(() => {});
    setCopied(true);
    setTimeout(() => { setCopied(false); setRevIdx(null); }, 2000);
  }

  const slide = slides[cur];
  const revealed = revIdx === cur;

  return (
    <div className="hs-wrap">
      <div className="hs-header">
        <div className="hs-bar" />
        <div className="hs-title">המבצעים הכי חמים 🔥</div>
      </div>

      <div className="hs-slider">
        <div className="hs-hot">🔥 חם עכשיו</div>

        {total > 1 && <>
          <button className="hs-arr hs-arr-r" onClick={() => goTo(cur - 1)}>‹</button>
          <button className="hs-arr hs-arr-l" onClick={() => goTo(cur + 1)}>›</button>
        </>}

        <div className="hs-track" style={{ transform: `translateX(${cur * 100}%)` }}>
          {slides.map((s, i) => (
            <div key={i} className="hs-slide" style={{ background: GRADIENTS[i % 3] }}>
              <div className="hs-img">
                {s.image
                  ? <img src={s.image} alt={s.title} />
                  : <span className="hs-emoji">
                      {s.tag === 'סופרמרקט' ? '🛒' : s.tag === 'אלקטרוניקה' ? '📱' : s.tag === 'טיפוח' ? '💄' : s.tag === 'פארם' ? '💊' : '🎫'}
                    </span>
                }
              </div>
              <div className="hs-body">
                {s.tag && <span className="hs-tag">{s.tag}</span>}
                <div className="hs-name">{s.title}</div>
                {s.subtitle && <div className="hs-sub">{s.subtitle}</div>}
                {s.discount && <div className="hs-discount">{s.discount}</div>}
                <div className="hs-btns">
                  {/* URL button */}
                  {s.url && s.type !== 'קוד קופון' && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="hs-cta hs-cta-url">
                      🔗 לקבלת ההטבה
                    </a>
                  )}
                  {/* Code sticker */}
                  {s.code && s.type !== 'קישור להטבה' && (
                    <button className={`hs-sticker${i === cur && revealed ? ' rev' : ''}${i === cur && copied ? ' cop' : ''}`}
                      onClick={(e) => handleCode(e, s)}>
                      {i === cur && copied ? (
                        <span className="hs-cop">✅ הועתק!</span>
                      ) : i === cur && revealed ? (
                        <span className="hs-code-full">{s.code}</span>
                      ) : (
                        <span className="hs-mask">
                          <span className="hs-vis">{s.code.slice(0, 3)}</span>
                          <span className="hs-peel">
                            <span className="hs-dots">••••</span>
                            <span className="hs-tap">הצג</span>
                          </span>
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className="hs-dots">
          {slides.map((_, i) => (
            <button key={i} className={`hs-dot${i === cur ? ' on' : ''}`} onClick={() => goTo(i)} />
          ))}
        </div>
      )}

      <style jsx>{`
        .hs-wrap { padding: 0 20px; max-width: 1280px; margin: 28px auto 0; }
        .hs-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .hs-bar { width:5px; height:22px; background:#E8321A; border-radius:3px; flex-shrink:0; }
        .hs-title { font-family:'Rubik',sans-serif; font-size:20px; font-weight:900; color:#1A1A2E; }

        .hs-slider { position:relative; border-radius:20px; overflow:hidden; box-shadow:0 6px 32px rgba(0,0,0,.14); height:210px; }
        .hs-track { display:flex; transition:transform .45s cubic-bezier(.4,0,.2,1); height:100%; }
        .hs-slide { min-width:100%; display:flex; align-items:stretch; }

        .hs-img { width:220px; flex-shrink:0; overflow:hidden; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,.06); }
        .hs-img img { width:100%; height:100%; object-fit:cover; }
        .hs-emoji { font-size:80px; }

        .hs-body { flex:1; padding:24px 28px; display:flex; flex-direction:column; justify-content:center; gap:8px; }
        .hs-tag { display:inline-flex; background:rgba(255,255,255,.15); color:#fff; font-size:10px; font-weight:800; padding:2px 11px; border-radius:20px; width:fit-content; letter-spacing:.5px; }
        .hs-name { font-family:'Rubik',sans-serif; font-size:22px; font-weight:900; color:#fff; line-height:1.25; }
        .hs-sub { font-size:13px; color:rgba(255,255,255,.55); }
        .hs-discount { font-family:'Rubik',sans-serif; font-size:17px; font-weight:900; background:rgba(255,255,255,.15); color:#fff; border-radius:8px; padding:3px 12px; width:fit-content; }

        .hs-btns { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:2px; }
        .hs-cta-url { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.12); border:1.5px solid rgba(255,255,255,.25); color:#fff; border-radius:50px; padding:8px 18px; font-size:12px; font-weight:800; cursor:pointer; transition:all .18s; text-decoration:none; font-family:'Heebo',sans-serif; }
        .hs-cta-url:hover { background:rgba(255,255,255,.22); }

        /* Sticker */
        .hs-sticker { border:none; cursor:pointer; border-radius:9px; padding:0; background:transparent; font-family:'Rubik',sans-serif; transition:transform .15s; white-space:nowrap; flex-shrink:0; }
        .hs-sticker:hover { transform:scale(1.04); }
        .hs-mask { display:flex; align-items:stretch; height:36px; border-radius:9px; overflow:hidden; }
        .hs-vis { display:flex; align-items:center; padding:0 9px; background:rgba(255,255,255,.9); color:#1A1A2E; font-size:12px; font-weight:900; letter-spacing:1px; border-radius:9px 0 0 9px; }
        .hs-peel { display:flex; align-items:center; gap:4px; padding:0 10px; background:#E8321A; color:#fff; border-radius:0 9px 9px 0; }
        .hs-dots-span { font-size:13px; letter-spacing:2px; opacity:.85; }
        .hs-tap { font-size:9px; font-weight:800; text-transform:uppercase; background:rgba(255,255,255,.2); padding:2px 5px; border-radius:4px; }
        .hs-code-full { display:flex; align-items:center; padding:0 14px; height:36px; background:rgba(255,255,255,.95); color:#E65100; font-size:13px; font-weight:900; letter-spacing:2px; border-radius:9px; border:1.5px dashed #E65100; }
        .hs-cop { display:flex; align-items:center; padding:0 14px; height:36px; background:#E8F5E9; color:#2E7D32; font-size:12px; font-weight:800; border-radius:9px; }

        /* Nav */
        .hs-hot { position:absolute; top:14px; right:14px; background:#E8321A; color:#fff; font-size:10px; font-weight:800; padding:3px 12px; border-radius:20px; z-index:5; letter-spacing:.5px; }
        .hs-arr { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,.12); backdrop-filter:blur(6px); border:none; color:#fff; width:36px; height:36px; border-radius:50%; font-size:20px; cursor:pointer; transition:background .18s; z-index:10; display:flex; align-items:center; justify-content:center; line-height:1; }
        .hs-arr:hover { background:rgba(255,255,255,.26); }
        .hs-arr-r { right:12px; }
        .hs-arr-l { left:12px; }

        .hs-dots { display:flex; justify-content:center; gap:8px; margin-top:12px; }
        .hs-dot { width:8px; height:8px; border-radius:50%; background:#C8C8C8; cursor:pointer; transition:all .22s; border:none; padding:0; }
        .hs-dot.on { background:#E8321A; width:26px; border-radius:4px; }

        /* Mobile */
        @media (max-width:700px) {
          .hs-wrap { padding:0 14px; margin-top:20px; }
          .hs-slider { height:140px; }
          .hs-img { width:120px; }
          .hs-emoji { font-size:52px; }
          .hs-body { padding:14px 16px; gap:6px; }
          .hs-name { font-size:14px; }
          .hs-sub { display:none; }
          .hs-discount { font-size:13px; }
          .hs-vis, .hs-tap, .hs-peel { font-size:10px; }
          .hs-mask, .hs-code-full, .hs-cop { height:30px; }
          .hs-cta-url { padding:6px 12px; font-size:11px; }
        }
      `}</style>
    </div>
  );
}
