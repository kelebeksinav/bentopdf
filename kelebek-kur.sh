#!/bin/bash
# Kelebek PDF Araçları — Cloudflare derleme betiği
# Cloudflare Pages "Build command":  bash kelebek-kur.sh
set -e

# 1) Word/Excel -> PDF motoru 48 MB; Cloudflare'in 25 MB dosya sınırını aşıyor
rm -rf public/libreoffice-wasm

# 2) Güvenlik başlıkları (_headers) artık derlemeden SONRA, 7. adımda yazılır.
#    BentoPDF (2.8.10+) kendi sıkı güvenlik listesini dist/_headers'a yazıyor;
#    public/_headers varsa bunu yapmıyor. Eski sürümün dosyası kalmasın:
rm -f public/_headers

# 3) Kelebek logosu
curl -fsSL https://kelebeksinav.org/amblem.png -o public/images/kelebek.png

# 3b) Site simgesi (tarayıcı sekmesi ve Google sonuçları): BentoPDF'in simgesi yerine Kelebek amblemi.
#     İndirilemezse derleme durmaz; eski simge kalır.
simge() { curl -fsSL "https://kelebeksinav.org/$1" -o "/tmp/kb-simge" && mv /tmp/kb-simge "$2" || echo "Uyarı: $1 indirilemedi, eski simge kaldı."; }
simge favicon.ico public/favicon.ico
simge favicon-192.png public/images/favicon-192x192.png
simge logo-512.png public/images/favicon-512x512.png
simge apple-touch-icon.png public/images/apple-touch-icon.png

# 4) BentoPDF'i derle (ayarlar Cloudflare'deki ortam değişkenlerinden gelir)
npm run build

# 5) Kelebek görünümü: her sayfaya açık tema ve "çerçeve içinde" betiği.
#    Dosya adına derleme zamanı eklenir (kb-1790000000.css). BentoPDF'in çevrimdışı
#    önbelleği (sw.js) dosyaları ADINA göre saklıyor; ad değişmezse tarayıcı eskisini
#    göstermeye devam ederdi. Böylece her güncelleme herkese kendiliğinden ulaşır.
SURUM=$(date +%s)
cp public/kelebek.css "dist/kb-$SURUM.css"
cp public/kelebek.js "dist/kb-$SURUM.js"
find dist -name '*.html' -print0 | xargs -0 sed -i "s#</head>#<link rel=\"stylesheet\" href=\"/kb-$SURUM.css\"><script src=\"/kb-$SURUM.js\"></script></head>#"
echo "Kelebek görünümü (kb-$SURUM) $(grep -rl "kb-$SURUM.css" dist --include='*.html' | wc -l) sayfaya eklendi."

# 6) Sayfaları sunucuda Türkçeleştir (ilk anda "PDF Tools" görünmesin) ve
#    dil dosyalarını önden indirmeye başla (daha hızlı açılış)
node kelebek-cevir.mjs dist

# 7) Güvenlik başlıkları: BentoPDF'in hazırladığı sıkı liste (hangi adreslerden kod
#    yüklenebilir, nereye bağlanılabilir) + PDF araçları kelebeksinav.org içinde
#    çerçevede açılabilsin. BentoPDF'in listesi yalnız kendi sitesinde çerçeveye
#    izin veriyor ("frame-ancestors 'self'", "X-Frame-Options: SAMEORIGIN"); bu iki
#    kural Kelebek'teki PDF Araçları sekmesini boş bırakırdı, onları değiştiriyoruz.
#    Bir şey beklendiği gibi değilse derleme durur: Cloudflare yeni sürümü yayına
#    almaz, canlıdaki sürüm olduğu gibi kalır.
IZIN="frame-ancestors 'self' https://kelebeksinav.org https://www.kelebeksinav.org"
if [ -f dist/_headers ] && grep -q "Content-Security-Policy: default-src" dist/_headers; then
  sed -i "s#frame-ancestors 'self'#$IZIN#g; /X-Frame-Options/d" dist/_headers
else
  echo "HATA: BentoPDF güvenlik listesini (dist/_headers) üretmedi." >&2
  exit 1
fi
if grep -q "X-Frame-Options" dist/_headers \
   || grep "Content-Security-Policy:" dist/_headers | grep -v -q "https://kelebeksinav.org"; then
  echo "HATA: dist/_headers'ta Kelebek çerçeve izni eksik." >&2
  exit 1
fi
echo "Güvenlik başlıkları hazır ($(grep -c 'Content-Security-Policy:' dist/_headers) kural, Kelebek çerçeve izni var)."
