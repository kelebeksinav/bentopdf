// Kelebek PDF Araçları — derleme sonrası Türkçeleştirme
// BentoPDF sayfaları önce İngilizce açılıp, dil dosyası indirilince Türkçeye dönüyordu
// (ekranda bir an "PDF Tools" görünüyordu). Bu betik derlenmiş sayfalardaki
// data-i18n metinlerini daha sunucuda Türkçe yazar; tarayıcı ilk anda Türkçe görür.
// Ayrıca dil dosyaları ve config.json için "önden yükle" satırı ekler (daha hızlı açılış).
// Kullanım: node kelebek-cevir.mjs dist
import fs from 'node:fs';
import path from 'node:path';

const kok = process.argv[2] || 'dist';
const oku = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; } };
const tr = { common: oku(path.join(kok, 'locales/tr/common.json')), tools: oku(path.join(kok, 'locales/tr/tools.json')) };
const en = { common: oku(path.join(kok, 'locales/en/common.json')), tools: oku(path.join(kok, 'locales/en/tools.json')) };

function bul(sozluk, anahtar) {
  let ns = 'common', yol = anahtar;
  const i = anahtar.indexOf(':');
  if (i > 0) { ns = anahtar.slice(0, i); yol = anahtar.slice(i + 1); }
  let d = sozluk[ns];
  for (const p of yol.split('.')) { if (d && typeof d === 'object' && p in d) d = d[p]; else return null; }
  return typeof d === 'string' ? d : null;
}
function ceviri(anahtar) {
  const t = bul(tr, anahtar);
  if (!t || t.includes('{{')) return null;
  return t;
}
const kacir = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const kacirOz = (s) => kacir(s).replace(/"/g, '&quot;');

function sayfalar(dizin) {
  const l = [];
  for (const g of fs.readdirSync(dizin, { withFileTypes: true })) {
    const p = path.join(dizin, g.name);
    if (g.isDirectory()) { if (!['locales', 'assets'].includes(g.name)) l.push(...sayfalar(p)); }
    else if (g.name.endsWith('.html')) l.push(p);
  }
  return l;
}

/* ------------------------------------------------------------------
   Arama motorları (7 Ekim 2026)
   BentoPDF'in sayfaları kendi sitesini gösterir: açıklamalar İngilizce, "canonical" ve paylaşım adresleri
   www.bentopdf.com, simge BentoPDF'in simgesi. Google bu yüzden pdf.kelebeksinav.org'u İngilizce açıklamayla
   gösteriyor, araç sayfalarını da bentopdf.com'un kopyası sayıyordu. Burada her sayfada:
     - açıklama Türkçe (aracın kendi alt yazısı), başlık Türkçe
     - canonical / og:url bizim adresimiz (dil klasöründeki kopyalar da kökteki Türkçe sayfayı gösterir)
     - yalnızca ana sayfa ve kökteki araç sayfaları dizine girer; BentoPDF'in kendi şirket sayfaları
       (hakkında, lisans, iletişim, blog…) ve 20'den çok dildeki kopyalar "noindex"
     - BentoPDF'e ait yapısal veri (JSON-LD), anahtar kelimeler ve Twitter hesabı kaldırılır
     - simge: Kelebek amblemi (dosyaları kelebek-kur.sh indirir)
   Sonunda sitemap.xml ve robots.txt bizim adresimizle yeniden yazılır.
   ------------------------------------------------------------------ */
const SITE = (process.env.KELEBEK_PDF_SITE || 'https://pdf.kelebeksinav.org').replace(/\/+$/, '');
const ANA_SITE = 'https://kelebeksinav.org';
const GENEL_ACIKLAMA = 'Ücretsiz PDF araçları: birleştir, böl, sıkıştır, dönüştür, imzala, düzenle. Dosyalarınız bilgisayarınızdan çıkmaz, her şey tarayıcınızda yapılır. Üyelik gerekmez, reklam yok.';
const diller = new Set(fs.existsSync(path.join(kok, 'locales')) ? fs.readdirSync(path.join(kok, 'locales')) : []);
const dizindekiler = [];
// kapatılan araçlar (DISABLE_TOOLS ortam değişkeni: "word-to-pdf,excel-to-pdf,…" ve config.json): sayfaları dizine girmez
const kapali = new Set((process.env.DISABLE_TOOLS || '').split(',').map((x) => x.trim()).filter(Boolean)
  .concat(Array.isArray(oku(path.join(kok, 'config.json')).disabledTools) ? oku(path.join(kok, 'config.json')).disabledTools : []));
// re ile eşleşen ilk etiketi yenisiyle değiştirir, ötekileri siler; hiç yoksa </head> önüne ekler
function etiket(h, re, yeni) {
  let ilk = true, vardi = false;
  h = h.replace(re, () => { vardi = true; if (ilk) { ilk = false; return yeni; } return ''; });
  if (!vardi && yeni) h = h.replace(/<\/head>/i, yeni + '</head>');
  return h;
}
const sil = (h, re) => h.replace(re, '');
function aramaMotoru(h, dosya, arac, baslik, marka) {
  if (!/<\/head>/i.test(h)) return h;
  const parca = path.relative(kok, dosya).split(path.sep);
  const dilde = parca.length > 1 && diller.has(parca[0]);
  const kokAd = (dilde ? parca.slice(1) : parca).join('/');
  const anaSayfa = kokAd === 'index.html';
  const aracSayfasi = !anaSayfa && !!arac && !kokAd.includes('/');
  const yol = '/' + kokAd.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
  const adres = SITE + yol;
  const dizine = !dilde && (anaSayfa || aracSayfasi) && !kapali.has(kokAd.replace(/\.html$/, ''));
  let aciklama = GENEL_ACIKLAMA;
  if (aracSayfasi) {
    const alt = (ceviri(arac[1] + '.subtitle') || '').trim();
    if (alt) aciklama = alt + (/[.!?]$/.test(alt) ? '' : '.') + ' Ücretsiz, üyelik gerekmez; dosyanız bilgisayarınızdan çıkmaz.';
  }
  const B = kacirOz(anaSayfa ? marka + ' - Ücretsiz, üyeliksiz, tarayıcıda' : baslik), A = kacirOz(aciklama), M = kacirOz(marka);
  const resim = ANA_SITE + '/logo-512.png';
  h = etiket(h, /<meta\b[^>]*\bname="description"[^>]*>/gi, '<meta name="description" content="' + A + '">');
  h = etiket(h, /<meta\b[^>]*\bname="title"[^>]*>/gi, '<meta name="title" content="' + B + '">');
  h = etiket(h, /<meta\b[^>]*\bname="author"[^>]*>/gi, '<meta name="author" content="Kelebek Sistemi">');
  h = etiket(h, /<meta\b[^>]*\bname="robots"[^>]*>/gi, '<meta name="robots" content="' + (dizine ? 'index, follow, max-image-preview:large' : 'noindex, follow') + '">');
  h = etiket(h, /<link\b[^>]*\brel="canonical"[^>]*>/gi, '<link rel="canonical" href="' + adres + '">');
  h = etiket(h, /<meta\b[^>]*\bproperty="og:type"[^>]*>/gi, '<meta property="og:type" content="website">');
  h = etiket(h, /<meta\b[^>]*\bproperty="og:url"[^>]*>/gi, '<meta property="og:url" content="' + adres + '">');
  h = etiket(h, /<meta\b[^>]*\bproperty="og:title"[^>]*>/gi, '<meta property="og:title" content="' + B + '">');
  h = etiket(h, /<meta\b[^>]*\bproperty="og:description"[^>]*>/gi, '<meta property="og:description" content="' + A + '">');
  h = etiket(h, /<meta\b[^>]*\bproperty="og:image"[^>]*>/gi, '<meta property="og:image" content="' + resim + '">');
  h = etiket(h, /<meta\b[^>]*\bproperty="og:site_name"[^>]*>/gi, '<meta property="og:site_name" content="' + M + '">');
  h = etiket(h, /<meta\b[^>]*\bproperty="og:locale"[^>]*>/gi, '<meta property="og:locale" content="tr_TR">');
  h = etiket(h, /<meta\b[^>]*\bname="twitter:card"[^>]*>/gi, '<meta name="twitter:card" content="summary">');
  h = etiket(h, /<meta\b[^>]*\bname="twitter:url"[^>]*>/gi, '<meta name="twitter:url" content="' + adres + '">');
  h = etiket(h, /<meta\b[^>]*\bname="twitter:title"[^>]*>/gi, '<meta name="twitter:title" content="' + B + '">');
  h = etiket(h, /<meta\b[^>]*\bname="twitter:description"[^>]*>/gi, '<meta name="twitter:description" content="' + A + '">');
  h = etiket(h, /<meta\b[^>]*\bname="twitter:image"[^>]*>/gi, '<meta name="twitter:image" content="' + resim + '">');
  h = etiket(h, /<meta\b[^>]*\bname="apple-mobile-web-app-title"[^>]*>/gi, '<meta name="apple-mobile-web-app-title" content="' + M + '">');
  h = sil(h, /<meta\b[^>]*\b(?:name="(?:keywords|twitter:site|twitter:creator)"|property="og:image:(?:width|height|alt)")[^>]*>\s*/gi);
  h = sil(h, /<link\b(?=[^>]*\brel="alternate")(?=[^>]*\bhreflang=)[^>]*>\s*/gi);
  h = sil(h, /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi);
  h = sil(h, /<link\b[^>]*\brel="(?:icon|shortcut icon|apple-touch-icon|mask-icon)"[^>]*>\s*/gi);
  h = h.replace(/<\/head>/i, '<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" type="image/png" sizes="192x192" href="/images/favicon-192x192.png"><link rel="apple-touch-icon" href="/images/apple-touch-icon.png"></head>');
  if (dizine) dizindekiler.push({ adres, ana: anaSayfa });
  return h;
}

let toplamSayfa = 0, toplamMetin = 0;
for (const dosya of sayfalar(kok)) {
  let h = fs.readFileSync(dosya, 'utf8'), n = 0;
  // 1) <etiket ... data-i18n="anahtar" ...>metin</etiket>  (içinde başka etiket olmayanlar)
  h = h.replace(/(<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2\s*>)/g, (tum, ac, etiket, k, ic, kap) => {
    const t = ceviri(k); if (!t) return tum;
    n++; const bas = ic.match(/^\s*/)[0], son = ic.match(/\s*$/)[0];
    return ac + bas + kacir(t) + son + kap;
  });
  // 2) placeholder ve title öznitelikleri
  for (const [oz, veri] of [['placeholder', 'data-i18n-placeholder'], ['title', 'data-i18n-title']]) {
    h = h.replace(new RegExp('<[a-zA-Z][^>]*\\s' + veri + '="([^"]+)"[^>]*>', 'g'), (etiket, k) => {
      const t = ceviri(k); if (!t) return etiket;
      n++;
      const re = new RegExp('\\s' + oz + '="[^"]*"');
      return re.test(etiket) ? etiket.replace(re, ' ' + oz + '="' + kacirOz(t) + '"')
                             : etiket.replace(/\s*\/?>$/, (m) => ' ' + oz + '="' + kacirOz(t) + '"' + m);
    });
  }
  // 3) dil ve sekme başlığı
  h = h.replace(/<html\b([^>]*)\slang="[^"]*"/, '<html$1 lang="tr"');
  const arac = h.match(/data-i18n="(tools:[A-Za-z0-9]+)\.name"/);
  const marka = process.env.VITE_BRAND_NAME || 'Kelebek PDF Araçları';
  const baslik = arac && ceviri(arac[1] + '.name') ? ceviri(arac[1] + '.name') + ' - ' + marka : marka;
  h = h.replace(/<title>[^<]*<\/title>/, '<title>' + kacir(baslik) + '</title>');
  // 3b) arama motorları (Google'da İngilizce açıklama ve bentopdf.com adresi görünmesin)
  h = aramaMotoru(h, dosya, arac, baslik, marka);
  // 4) dil dosyalarını HTML okunurken indirmeye başla (JS'in açılmasını beklemeden)
  if (!h.includes('locales/tr/common.json')) {
    const on = ['locales/tr/common.json', 'locales/tr/tools.json', 'config.json']
      .map((u) => '<link rel="preload" href="/' + u + '" as="fetch" crossorigin="anonymous">').join('');
    h = h.replace(/<head>/i, '<head>' + on);
  }
  fs.writeFileSync(dosya, h);
  toplamSayfa++; toplamMetin += n;
}
console.log('Türkçeleştirme: ' + toplamSayfa + ' sayfa, ' + toplamMetin + ' metin önceden çevrildi.');

// 5) site haritası, robots.txt ve uygulama bildirimi bizim adresimizle
try {
  const bugun = new Date().toISOString().slice(0, 10);
  dizindekiler.sort((a, b) => (b.ana - a.ana) || a.adres.localeCompare(b.adres));
  const harita = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    dizindekiler.map((s) => '  <url><loc>' + s.adres + '</loc><lastmod>' + bugun + '</lastmod><priority>' + (s.ana ? '1.0' : '0.8') + '</priority></url>').join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(kok, 'sitemap.xml'), harita);
  fs.writeFileSync(path.join(kok, 'robots.txt'), '# Kelebek PDF Araçları\nUser-agent: *\nAllow: /\nDisallow: /*.wasm$\nDisallow: /*.wasm.gz$\nDisallow: /*.data.gz$\n\nSitemap: ' + SITE + '/sitemap.xml\n');
  const bp = path.join(kok, 'site.webmanifest');
  if (fs.existsSync(bp)) {
    const b = oku(bp), marka = process.env.VITE_BRAND_NAME || 'Kelebek PDF Araçları';
    if (b && typeof b === 'object' && Object.keys(b).length) {
      b.name = marka; b.short_name = 'Kelebek PDF'; b.description = GENEL_ACIKLAMA; b.lang = 'tr';
      fs.writeFileSync(bp, JSON.stringify(b, null, 2));
    }
  }
  console.log('Arama motorları: ' + dizindekiler.length + ' sayfa dizine açık (site haritasında), ötekiler noindex. Adres: ' + SITE);
} catch (e) { console.log('Uyarı: site haritası yazılamadı: ' + e.message); }
