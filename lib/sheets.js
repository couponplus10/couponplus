function parseDate(val) {
  if (!val) return '';
  const s = String(val);
  const match = s.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (match) {
    const [, y, m, d] = match;
    return `${String(d).padStart(2,'0')}/${String(parseInt(m)+1).padStart(2,'0')}/${y}`;
  }
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }
  return s;
}

function isExpired(expiryStr) {
  if (!expiryStr) return false;
  const parts = expiryStr.split('/');
  if (parts.length !== 3) return false;
  const [d, m, y] = parts;
  const fullYear = y.length === 2 ? '20' + y : y;
  const expiryDate = new Date(`${fullYear}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
  expiryDate.setHours(23, 59, 59);
  return expiryDate < new Date();
}

function parseDiscount(cell) {
  if (!cell) return '';
  if (cell.f) return cell.f;
  if (typeof cell.v === 'number') {
    if (cell.v > 0 && cell.v <= 1) return Math.round(cell.v * 100) + '%';
    return cell.v + '%';
  }
  return cell.v || '';
}

export async function getCoupons() {
  // ── NEW SHEET ──
  const SHEET_ID = '1o-ByAQ62O-QHM3DcUAPzGak8PdjaLwWpoYAwcfmlRTM';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=קופונים`;

  const res  = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));

  if (!json.table?.rows) return [];

  // New column order (from couponplus-sheet.xlsx):
  // 0:id | 1:name | 2:chain | 3:category | 4:discount | 5:code | 6:expiry | 7:badge | 8:image | 9:description | 10:pdf
  return json.table.rows
    .filter(row => row.c && row.c[1]?.v) // must have name
    .map((row, i) => {
      const c = row.c;
      const expiryRaw = c[6]?.f || c[6]?.v || '';
      const expiry    = parseDate(expiryRaw);
      const expired   = isExpired(expiry);

      return {
        id:          c[0]?.v ? String(c[0].v) : String(i),
        name:        c[1]?.v || '',
        chain:       c[2]?.v || '',
        category:    c[3]?.v || '',
        discount:    parseDiscount(c[4]),
        code:        c[5]?.v ? String(c[5].v) : '',
        expiry,
        expired,
        badge:       c[7]?.v || '',
        image:       c[8]?.v || '',
        description: c[9]?.v || '',
        pdf:         c[10]?.v || '',
      };
    });
}
