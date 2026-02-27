// AliExpress Affiliate API — fetches active coupons automatically
// https://developers.aliexpress.com

import crypto from 'crypto';

const APP_KEY     = process.env.ALIEXPRESS_APP_KEY;
const APP_SECRET  = process.env.ALIEXPRESS_APP_SECRET;
const TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID || '';

function sign(params, secret) {
  const str = secret + Object.keys(params).sort().map(k => `${k}${params[k]}`).join('') + secret;
  return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

async function fetchCoupons() {
  const timestamp = new Date().toISOString().replace('T',' ').slice(0,19);
  const params = {
    app_key:      APP_KEY,
    timestamp,
    sign_method:  'md5',
    v:            '2.0',
    method:       'aliexpress.affiliate.hotproduct.query',
    fields:       'productId,productTitle,salePrice,discount,couponAmount,couponEndTime,productUrl,imageUrl,shopName',
    sort:         'SALE_PRICE_ASC',
    page_no:      '1',
    page_size:    '50',
    tracking_id:  TRACKING_ID,
  };
  params.sign = sign(params, APP_SECRET);

  const res  = await fetch('https://api-sg.aliexpress.com/sync?' + new URLSearchParams(params));
  const data = await res.json();
  const products = data
    ?.aliexpress_affiliate_hotproduct_query_response
    ?.resp_result?.result?.products?.traffic_product_dto || [];

  return products
    .filter(p => p.coupon_amount > 0 || p.discount)
    .map(p => ({
      id:          `ali_${p.product_id}`,
      name:        (p.product_title || '').slice(0, 80),
      chain:       'AliExpress',
      category:    'בינלאומי',
      discount:    p.coupon_amount ? `$${p.coupon_amount} הנחה` : `${p.discount}%`,
      type:        'קישור להטבה',
      code:        '',
      url:         p.product_url || '',
      expiry:      formatDate(p.coupon_end_time),
      badge:       'חם',
      image:       p.image_url || '',
      description: `${p.shop_name || 'AliExpress'} | מחיר: $${p.sale_price}`,
      pdf:         '',
      expired:     false,
    }));
}

// 1-hour memory cache
let cache = { data: null, ts: 0 };

export default async function handler(req, res) {
  if (!APP_KEY || !APP_SECRET) {
    return res.status(500).json({ error: 'הגדר ALIEXPRESS_APP_KEY ו-ALIEXPRESS_APP_SECRET ב-.env.local' });
  }
  try {
    if (!cache.data || Date.now() - cache.ts > 3_600_000) {
      cache.data = await fetchCoupons();
      cache.ts   = Date.now();
    }
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ coupons: cache.data, count: cache.data.length });
  } catch (err) {
    console.error('AliExpress error:', err);
    res.status(500).json({ error: err.message });
  }
}
