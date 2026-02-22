import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { getCoupons } from '../../lib/sheets';

const CHAIN_COLORS = {
  'רמי לוי':    { dot: '#F5A623', bg: 'linear-gradient(135deg,#fff8e1,#fff0b3)', emoji: '🛒' },
  'שופרסל':     { dot: '#2DB86A', bg: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', emoji: '🧴' },
  'מגה':        { dot: '#2196F3', bg: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', emoji: '🥩' },
  'ויקטורי':    { dot: '#E53935', bg: 'linear-gradient(135deg,#ffebee,#ffcdd2)', emoji: '🥛' },
  'יינות ביתן': { dot: '#BA68C8', bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', emoji: '🍷' },
  'חצי חינם':   { dot: '#FF9800', bg: 'linear-gradient(135deg,#fff3e0,#ffe0b2)', emoji: '🏷️' },
  'סופר-פארם':  { dot: '#9C27B0', bg: 'linear-gradient(135deg,#f3e5f5,#e1bee7)', emoji: '💊' },
};
const DEFAULT_CHAIN = { dot: '#E8321A', bg: 'linear-gradient(135deg,#fff0e6,#ffddd0)', emoji: '🎫' };
const BADGE_MAP = { 'חם': { cls: 'hot', label: '🔥 חם' }, 'חדש': { cls: 'new', label: '✨ חדש' }, 'מוגבל': { cls: 'lim', label: '⚡ מוגבל' } };

const CATEGORY_META = {
  'סופרמרקט':         { emoji: '🛍️', title: 'סופרמרקט', color: '#1A1A2E' },
  'פארם ובריאות':     { emoji: '💊', title: 'פארם ובריאות', color: '#4A148C' },
  'טיפוח וקוסמטיקה': { emoji: '💄', title: 'טיפוח וקוסמטיקה', color: '#880E4F' },
  'טואלטיקה':         { emoji: '🧴', title: 'טואלטיקה', color: '#006064' },
  'אלקטרוניקה':       { emoji: '📱', title: 'אלקטרוניקה', color: '#1565C0' },
  'בית ומטבח':        { emoji: '🏠', title: 'בית ומטבח', color: '#4E342E' },
  'אופנה':            { emoji: '👗', title: 'אופנה', color: '#AD1457' },
  'חיות מחמד':        { emoji: '🐾', title: 'חיות מחמד', color: '#2E7D32' },
};

function CouponCard({ coupon }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const chain = CHAIN_COLORS[coupon.chain] || DEFAULT_CHAIN;
  const badge = BADGE_MAP[coupon.badge];
  const masked = coupon.code ? coupon.code.slice(0, 3) + '•••' : '';

  function handleCode(e) {
    e.preventDefault(); e.stopPropagation();
    if (!revealed) { setRevealed(true); return; }
    navigator.clipboard.writeText(coupon.code).catch(() => {});
    setCopied(true);
    setTimeout(() => { setCopied(false); setRevealed(false); }, 2000);
  }

  return (
    <Link href={`/coupon/${coupon.id}`} style={{ textDecoration: 'none' }}>
      <div className="coupon-card">
        <div className="card-img">
          {coupon.image ? <img src={coupon.image} alt={coupon.name} className="card-img-photo" /> : <div className="card-img-bg" style={{ background: chain.bg }}>{chain.emoji}</div>}
          <div className="card-badge-chain"><div className="chain-dot" style={{ background: chain.dot }}></div>{coupon.chain}</div>
          {badge && <div className={`card-badge-status ${badge.cls}`}>{badge.label}</div>}
          {coupon.discount && <div className="card-discount-badge">{coupon.discount}</div>}
        </div>
        <div className="card-body">
          <div className="card-title">{coupon.name}</div>
          {coupon.expiry && <div className="card-meta">📅 עד {coupon.expiry}</div>}
        </div>
        <div className="card-footer">
          <button className="btn-details">לפרטים ולקוד →</button>
          {coupon.code && <button className={`btn-code ${revealed ? 'revealed' : ''} ${copied ? 'copied' : ''}`} onClick={handleCode}>{copied ? '✅ הועתק!' : revealed ? coupon.code : masked}</button>}
        </div>
      </div>
    </Link>
  );
}

export default function CategoryPage({ coupons, category }) {
  const [search, setSearch] = useState('');
  const meta = CATEGORY_META[category] || { emoji: '🏷️', title: category, color: '#1A1A2E' };
  const filtered = coupons.filter(c => !search || c.name.includes(search) || c.chain.includes(search));

  return (
    <>
      <Head><title>{meta.emoji} {meta.title} | קופון+</title></Head>

      <header>
        <div className="header-inner">
          <Link href="/" className="logo">קופון<span>+</span></Link>
          <div className="search-wrap">
            <input type="text" placeholder={`חפש ב${meta.title}...`} value={search} onChange={e => setSearch(e.target.value)} />
            <span className="search-ico">🔍</span>
          </div>
          <nav className="main-nav">
            <Link href="/" className="nav-link">קופונים</Link>
            <Link href="/deals" className="nav-link">מבצעים</Link>
            <Link href="/pharm" className="nav-link">פארם</Link>
            <Link href="/contact" className="nav-link">צור קשר</Link>
          </nav>
        </div>
      </header>

      <div className="page-hero" style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}>
        <Link href="/" className="back-btn">→ חזרה לראשי</Link>
        <h1>{meta.emoji} {meta.title}</h1>
        <p>{filtered.length} מבצעים פעילים</p>
      </div>

      <div className="section">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{meta.emoji}</div>
            <p>עדיין אין קופונים בקטגוריה זו</p>
            <Link href="/" className="empty-back">← חזרה לכל הקופונים</Link>
          </div>
        ) : (
          <div className="cards-grid">
            {filtered.map((c, i) => (
              <div key={c.id}>
                <CouponCard coupon={c} />
                {(i + 1) % 8 === 0 && (
                  <div className="ad-inline"><span className="ad-lbl">פרסומת</span>Google Ads — 300×250</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-bottom">
            <span>© 2025 קופון+</span>
            <div className="footer-links">
              <Link href="/privacy">פרטיות</Link>
              <Link href="/terms">תנאים</Link>
              <Link href="/contact">צור קשר</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&family=Rubik:wght@400;500;700;900&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Heebo',sans-serif;background:#FFF8F3;color:#1A1A1A;direction:rtl}
        a{text-decoration:none;color:inherit}
        button{font-family:'Heebo',sans-serif;cursor:pointer;border:none;background:none}
        :root{--red:#E8321A;--navy:#1A1A2E;--gray:#F5F0EC;--gray2:#E8E0D8;--muted:#7A6E68}
        header{background:#fff;border-bottom:1px solid var(--gray2);position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,.06)}
        .header-inner{max-width:1280px;margin:0 auto;padding:0 24px;height:68px;display:flex;align-items:center;gap:24px}
        .logo{font-family:'Rubik',sans-serif;font-size:26px;font-weight:900;color:var(--navy)}
        .logo span{color:var(--red)}
        .search-wrap{flex:1;max-width:440px;position:relative}
        .search-wrap input{width:100%;background:var(--gray);border:2px solid transparent;border-radius:50px;padding:11px 20px 11px 48px;font-family:'Heebo',sans-serif;font-size:14px;outline:none;transition:all .2s}
        .search-wrap input:focus{border-color:var(--red);background:#fff;box-shadow:0 0 0 4px rgba(232,50,26,.08)}
        .search-ico{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:16px;opacity:.4}
        .main-nav{display:flex;gap:4px;margin-right:auto}
        .nav-link{padding:8px 16px;border-radius:10px;font-size:14px;font-weight:600;color:var(--muted);transition:all .18s;white-space:nowrap}
        .nav-link:hover{background:var(--gray);color:var(--navy)}
        .nav-link.active{background:var(--red);color:#fff}
        .page-hero{padding:48px 24px;text-align:center;color:#fff}
        .back-btn{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:#fff;padding:8px 20px;border-radius:50px;font-size:13px;font-weight:700;margin-bottom:20px;transition:all .2s}
        .back-btn:hover{background:rgba(255,255,255,.25)}
        .page-hero h1{font-family:'Rubik',sans-serif;font-size:40px;font-weight:900;margin-bottom:8px}
        .page-hero p{color:rgba(255,255,255,.6);font-size:15px}
        .section{padding:40px 24px;max-width:1280px;margin:0 auto}
        .cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px}
        .empty{text-align:center;padding:80px 24px}
        .empty-icon{font-size:64px;margin-bottom:16px}
        .empty p{font-size:18px;color:var(--muted);margin-bottom:20px}
        .empty-back{display:inline-block;background:var(--red);color:#fff;padding:12px 28px;border-radius:50px;font-weight:700;font-size:14px}
        .coupon-card{background:#fff;border-radius:20px;overflow:visible;border:2px solid var(--gray2);box-shadow:0 2px 12px rgba(0,0,0,.06);transition:transform .25s,box-shadow .25s,border-color .25s;cursor:pointer;display:flex;flex-direction:column}
        .coupon-card .card-img{border-radius:18px 18px 0 0;overflow:hidden}
        .coupon-card .card-footer{border-radius:0 0 18px 18px;overflow:hidden}
        .coupon-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,.16);border-color:var(--red)}
        .card-img{width:100%;height:160px;position:relative;flex-shrink:0}
        .card-img-bg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:60px;transition:transform .4s}
        .card-img-photo{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .coupon-card:hover .card-img-bg,.coupon-card:hover .card-img-photo{transform:scale(1.08)}
        .card-badge-chain{position:absolute;top:12px;right:12px;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);color:#fff;font-size:11px;font-weight:800;padding:4px 10px;border-radius:20px;display:flex;align-items:center;gap:5px;z-index:2}
        .chain-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .card-badge-status{position:absolute;top:12px;left:12px;font-size:10px;font-weight:800;padding:4px 10px;border-radius:20px;z-index:2}
        .hot{background:#FFE8E5;color:#D42B0F}.new{background:#E5FFE8;color:#0F8A1E}.lim{background:#FFF5E5;color:#B06000}
        .card-discount-badge{position:absolute;bottom:12px;right:12px;background:var(--red);color:#fff;font-family:'Rubik',sans-serif;font-size:20px;font-weight:900;padding:6px 14px;border-radius:12px;box-shadow:0 4px 12px rgba(232,50,26,.4);z-index:2}
        .card-body{padding:16px;flex:1}
        .card-title{font-size:15px;font-weight:700;color:var(--navy);line-height:1.4;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .card-meta{font-size:11.5px;color:var(--muted)}
        .card-footer{padding:12px 16px;border-top:1px solid var(--gray);display:flex;gap:10px;background:#fff}
        .btn-details{flex:1;background:var(--navy);color:#fff;border-radius:10px;padding:10px;font-size:13px;font-weight:800;text-align:center;transition:background .18s}
        .btn-details:hover{background:var(--red)}
        .btn-code{background:var(--gray);color:var(--navy);border-radius:10px;padding:10px 14px;font-size:12px;font-weight:800;font-family:'Rubik',sans-serif;letter-spacing:1px;transition:all .18s;white-space:nowrap}
        .btn-code.revealed{background:#FFF3E0;color:#E65100;letter-spacing:2px}
        .btn-code.copied{background:#E8F5E9;color:#2E7D32;letter-spacing:normal}
        .ad-inline{background:#F0F4FF;border:1.5px dashed #C0CFEA;border-radius:12px;padding:16px;text-align:center;font-size:12px;color:#536070}
        .ad-lbl{display:block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#96AABF;margin-bottom:4px}
        footer{background:var(--navy);padding:24px;margin-top:40px}
        .footer-inner{max-width:1280px;margin:0 auto}
        .footer-bottom{display:flex;justify-content:space-between;font-size:12px;color:rgba(255,255,255,.6)}
        .footer-links{display:flex;gap:20px}
        .footer-links a{color:rgba(255,255,255,.6)}
        .footer-links a:hover{color:#fff}
      `}</style>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { slug: 'סופרמרקט' } },
      { params: { slug: 'פארם ובריאות' } },
      { params: { slug: 'טיפוח וקוסמטיקה' } },
      { params: { slug: 'טואלטיקה' } },
      { params: { slug: 'אלקטרוניקה' } },
      { params: { slug: 'בית ומטבח' } },
      { params: { slug: 'אופנה' } },
      { params: { slug: 'חיות מחמד' } },
    ],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const all = await getCoupons();
  const coupons = all.filter(c => c.category === params.slug);
  return { props: { coupons, category: params.slug }, revalidate: 3600 };
}
