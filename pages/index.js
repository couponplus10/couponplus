import Head from 'next/head';
import { useState } from 'react';
import { getCoupons } from '../lib/sheets';
import Layout from '../components/Layout';
import CouponCard from '../components/CouponCard';

const CATEGORIES = [
  { key: 'all',              label: '🛒 הכל' },
  { key: 'hot',              label: '🔥 חמים עכשיו' },
  { key: 'סופרמרקט',         label: '🛍️ סופרמרקט' },
  { key: 'פארם ובריאות',     label: '💊 פארם' },
  { key: 'טיפוח וקוסמטיקה', label: '💄 טיפוח' },
  { key: 'טואלטיקה',         label: '🧴 טואלטיקה' },
  { key: 'אלקטרוניקה',       label: '📱 אלקטרוניקה' },
  { key: 'בית ומטבח',        label: '🏠 בית ומטבח' },
  { key: 'אופנה',            label: '👗 אופנה' },
  { key: 'חיות מחמד',        label: '🐾 חיות מחמד' },
];

export default function Home({ coupons }) {
  const [search,    setSearch]    = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filtered = coupons.filter(c => {
    const ms = !search || c.name.includes(search) || c.chain.includes(search) || (c.code && c.code.includes(search));
    const mc = activeCat === 'all' ? true : activeCat === 'hot' ? c.badge === 'חם' : c.category === activeCat;
    return ms && mc;
  });

  const chains   = [...new Set(coupons.map(c => c.chain))];
  const catLabel = search ? `תוצאות עבור "${search}"` : (CATEGORIES.find(c => c.key === activeCat)?.label || 'הכל');

  function catCount(key) {
    if (key === 'all') return coupons.length;
    if (key === 'hot') return coupons.filter(c => c.badge === 'חם').length;
    return coupons.filter(c => c.category === key).length;
  }

  return (
    <Layout>
      <Head>
        <title>קופון+ | כל הקופונים והמבצעים במקום אחד</title>
        <meta name="description" content="אלפי קופונים ומבצעים מכל הרשתות הגדולות" />
      </Head>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-badge">✂ <span>מתעדכן כל שעה</span></div>
            <h1>חסכו יותר<br />בכל <em>קנייה בסופר</em></h1>
            <p className="hero-sub">אלפי מבצעים וקופונים מכל הרשתות — במקום אחד.</p>
            <a href="#coupons" className="hero-cta">🔥 לכל המבצעים</a>
            <div className="hero-stats">
              <div className="hstat"><strong>{coupons.length}+</strong><span>מבצעים</span></div>
              <div className="hstat"><strong>{chains.length}</strong><span>רשתות</span></div>
              <div className="hstat"><strong>{coupons.filter(c => c.badge === 'חם').length}</strong><span>חמים</span></div>
            </div>
          </div>
          <div className="hero-chains">
            <div className="hc-title">בחר רשת</div>
            <div className="hc-grid">
              {chains.slice(0, 6).map((chain, i) => (
                <div key={chain} className={`hc-btn hc-${i}`} onClick={() => setActiveCat(chain)}>
                  <span className="hc-name">{chain}</span>
                  <span className="hc-count">{coupons.filter(c => c.chain === chain).length} מבצעים</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AD */}
      <div className="pg-ad-wrap">
        <div className="pg-ad"><span className="pg-ad-tag">פרסומת</span><span>🎯</span><b>Google Ads — 728×90</b></div>
      </div>

      {/* CHIPS */}
      <div className="pg-chips" id="coupons">
        <div className="chips-scroll">
          {CATEGORIES.map(cat => (
            <button key={cat.key} className={`chip${activeCat === cat.key ? ' on' : ''}`} onClick={() => setActiveCat(cat.key)}>
              {cat.label} <span className="chip-n">{catCount(cat.key)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* GRID — always shows, always correct */}
      <div className="pg-section">
        <div className="pg-head">
          <div className="pg-title"><span className="pg-bar"></span>{catLabel}</div>
          <span className="pg-count">{filtered.length} קופונים</span>
        </div>
        <div className="pg-grid">
          {filtered.map(c => (
            <div key={c.id} className="pg-cell">
              <CouponCard coupon={c} />
            </div>
          ))}
          {filtered.length === 0 && <p className="pg-empty">לא נמצאו קופונים</p>}
        </div>
      </div>

      {/* AD BOTTOM */}
      <div className="pg-ad-wrap">
        <div className="pg-ad"><span className="pg-ad-tag">פרסומת</span><span>🎯</span><b>Google Ads — 728×90</b></div>
      </div>

      <style jsx>{`
        /* ── HERO ── */
        .hero { background: linear-gradient(135deg,#1A1A2E,#2D1B4E); padding: 48px 20px 56px; position: relative; overflow: hidden; }
        .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 20% 50%,rgba(232,50,26,.2),transparent 55%); pointer-events:none; }
        .hero-inner { max-width:1280px; margin:0 auto; position:relative; display:flex; align-items:center; gap:48px; }
        .hero-copy { flex:1; min-width:0; }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:50px; padding:5px 16px; font-size:12px; font-weight:700; color:rgba(255,255,255,.65); margin-bottom:16px; }
        .hero-badge span { color:#FF5A3D; }
        .hero h1 { font-family:'Rubik',sans-serif; font-size:46px; font-weight:900; color:#fff; line-height:1.1; margin-bottom:14px; }
        .hero h1 em { color:#FF5A3D; font-style:normal; }
        .hero-sub { font-size:16px; color:rgba(255,255,255,.5); line-height:1.6; max-width:400px; margin-bottom:28px; }
        .hero-cta { display:inline-flex; align-items:center; gap:8px; background:#E8321A; color:#fff; border-radius:50px; padding:13px 28px; font-size:15px; font-weight:800; box-shadow:0 6px 20px rgba(232,50,26,.35); transition:all .2s; font-family:'Heebo',sans-serif; }
        .hero-cta:hover { background:#FF5A3D; transform:translateY(-2px); }
        .hero-stats { display:flex; gap:32px; margin-top:28px; }
        .hstat strong { font-family:'Rubik',sans-serif; font-size:28px; font-weight:900; color:#fff; display:block; }
        .hstat span { font-size:11px; color:rgba(255,255,255,.35); }
        .hero-chains { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:18px; padding:18px; min-width:260px; flex-shrink:0; }
        .hc-title { font-size:10px; font-weight:800; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px; }
        .hc-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .hc-btn { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:10px 8px; text-align:center; cursor:pointer; transition:all .2s; }
        .hc-btn:hover { transform:scale(1.03); }
        .hc-0:hover{background:#F5A623;border-color:#F5A623}.hc-1:hover{background:#2DB86A;border-color:#2DB86A}
        .hc-2:hover{background:#1565C0;border-color:#1565C0}.hc-3:hover{background:#E53935;border-color:#E53935}
        .hc-4:hover{background:#7B1FA2;border-color:#7B1FA2}.hc-5:hover{background:#FF6F00;border-color:#FF6F00}
        .hc-name { font-size:12px; font-weight:700; color:#fff; display:block; }
        .hc-count { font-size:10px; color:rgba(255,255,255,.35); margin-top:2px; display:block; }

        /* ── AD ── */
        .pg-ad-wrap { padding:10px 20px; max-width:1280px; margin:0 auto; }
        .pg-ad { background:#F0F4FF; border:1.5px dashed #C0CFEA; border-radius:10px; padding:14px 20px; display:flex; align-items:center; justify-content:center; gap:10px; position:relative; font-size:13px; color:#536070; }
        .pg-ad-tag { position:absolute; top:5px; right:10px; background:#C0CFEA; color:#536070; font-size:9px; font-weight:800; text-transform:uppercase; padding:1px 5px; border-radius:3px; }

        /* ── CHIPS ── */
        .pg-chips { padding:20px 20px 0; max-width:1280px; margin:0 auto; }
        .chips-scroll { display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:none; }
        .chips-scroll::-webkit-scrollbar { display:none; }
        .chip { flex-shrink:0; display:flex; align-items:center; gap:6px; background:#fff; border:2px solid #E8E0D8; border-radius:50px; padding:7px 14px; font-size:13px; font-weight:700; color:#1A1A2E; cursor:pointer; white-space:nowrap; transition:all .18s; font-family:'Heebo',sans-serif; }
        .chip:hover,.chip.on { background:#1A1A2E; border-color:#1A1A2E; color:#fff; }
        .chip-n { background:#F5F0EC; color:#7A6E68; font-size:11px; font-weight:700; padding:1px 7px; border-radius:50px; transition:all .18s; }
        .chip.on .chip-n,.chip:hover .chip-n { background:rgba(255,255,255,.15); color:rgba(255,255,255,.7); }

        /* ── GRID ── */
        .pg-section { padding:24px 20px 32px; max-width:1280px; margin:0 auto; }
        .pg-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .pg-title { font-family:'Rubik',sans-serif; font-size:20px; font-weight:900; color:#1A1A2E; display:flex; align-items:center; gap:10px; }
        .pg-bar { width:6px; height:24px; background:#E8321A; border-radius:3px; display:block; flex-shrink:0; }
        .pg-count { font-size:12px; color:#7A6E68; font-weight:600; }
        .pg-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:16px; }
        .pg-cell { display:flex; flex-direction:column; min-width:0; }
        .pg-empty { text-align:center; color:#7A6E68; padding:48px; font-size:16px; grid-column:1/-1; }

        /* ── RESPONSIVE ── */
        @media (max-width:900px) { .hero-chains { display:none; } .hero h1 { font-size:36px; } }
        @media (max-width:600px) {
          .hero { padding:32px 16px 40px; }
          .hero h1 { font-size:28px; }
          .hero-stats { gap:20px; }
          .hstat strong { font-size:22px; }
          .pg-chips { padding:16px 16px 0; }
          .pg-section { padding:16px 16px 28px; }
          .pg-grid { grid-template-columns:repeat(2, 1fr); gap:10px; }
          .pg-ad-wrap { padding:8px 16px; }
        }
        @media (max-width:380px) { .pg-grid { grid-template-columns:1fr; } }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps() {
  const coupons = await getCoupons();
  return { props: { coupons }, revalidate: 3600 };
}
