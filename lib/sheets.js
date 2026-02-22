function parseDate(val) {
  if (!val) return '';
  if (typeof val === 'string' && !val.includes('Date')) return val;
  const match = String(val).match(/Date\((\d+),(\d+),(\d+)\)/);
  if (match) {
    const [, y, m, d] = match;
    return `${String(d).padStart(2,'0')}/${String(parseInt(m)+1).padStart(2,'0')}/${y}`;
  }
  return String(val);
}

function isExpired(expiryStr) {
  if (!expiryStr) return false;
  // Support dd/mm/yyyy or dd/mm/yy
  const parts = expiryStr.split('/');
  if (parts.length !== 3) return false;
  const [d, m, y] = parts;
  const fullYear = y.length === 2 ? '20' + y : y;
  const expiryDate = new Date(`${fullYear}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
  expiryDate.setHours(23, 59, 59); // expires end of day
  return expiryDate < new Date();
}

export async function getCoupons() {
  const SHEET_ID = '1nTS9SuMhhfKGt7UIYUU-YPgAfp-NIFdlQtfJ4Ft_Vbc';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));

  if (!json.table?.rows) return [];

  return json.table.rows.map((row, i) => {
    const c = row.c;
    const expiryRaw = c[6]?.f || c[6]?.v || '';
    const expiry = parseDate(expiryRaw);
    const expired = isExpired(expiry);

    return {
      id:          String(i),
      name:        c[0]?.v || '',
      code:        c[1]?.v || '',
      discount:    c[2]?.v || '',
      chain:       c[3]?.v || '',
      category:    c[4]?.v || '',
      status:      expired ? 'פג תוקף' : (c[5]?.v || ''),
      expiry,
      expired,
      badge:       c[7]?.v || '',
      image:       c[8]?.v || '',
      pdf:         c[9]?.v || '',
      description: c[10]?.v || '',
    };
  }).filter(c => c.name); // show all, including expired (greyed out)
}
