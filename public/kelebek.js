/* ============================================================
   Kelebek PDF Araçları — kelebek.js
   1) Kelebek Sistemi'nin içinde (çerçevede) açıldıysa işaret koyar
      (kelebek.css o zaman BentoPDF'in kendi üst şeridini gizler).
   2) BentoPDF'te Türkçeye çevrilmemiş kalan yazıları çevirir.
   3) Kelebek üyelerine "Favori Araçlarım" bölümü: kartlardaki ☆ ile seçilir,
      liste Kelebek hesabında saklanır (başka bilgisayarda da gelir).
   6–8) (28 Ekim 2026) Smallpdf gibi sade kullanım: ana sayfa vitrini ve arama,
      her indirmede sonuç ekranı (büyük İndir düğmesi, "bu dosyayla devam et"),
      araç sayfasında büyük "dosya seç" düğmesi.
   ============================================================ */
(function () {
  'use strict';
  var KELEBEK = ['https://kelebeksinav.org', 'https://www.kelebeksinav.org'];
  var gomulu = true;
  try { gomulu = window.top !== window.self; } catch (e) { gomulu = true; }
  if (gomulu) document.documentElement.classList.add('kb-gomulu');

  /* ---------------- 0) Araç sayfalarının başlığı korunur (21 Ekim 2026) ----------------
     BentoPDF sade kipte her sayfanın başlığını "Kelebek PDF Araçları - PDF Araçları" yapıyordu;
     sekmede ve Google'da bütün araçlar aynı adla görünüyordu. Sunucunun yazdığı başlık
     (ör. "PDF Birleştir - Kelebek PDF Araçları") araç sayfalarında geri konur. */
  (function () {
    var ilk = document.title, yol = location.pathname.replace(/\/+$/, '').split('/').pop().replace(/\.html$/, '');
    if (!ilk || !yol || yol === 'index') return;
    var koru = function () { if (document.title !== ilk && / - PDF Araçları$| - PDF Tools$/.test(document.title)) document.title = ilk; };
    var bak = function () { var t = document.querySelector('title'); if (t) new MutationObserver(koru).observe(t, { childList: true, characterData: true, subtree: true }); koru(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bak); else bak();
  })();

  /* ---------------- 1a) Gece görünümü ----------------
     Kelebek'te Gece teması seçiliyse PDF araçları da koyu görünür (kelebek.css: html.kb-gece).
     İlk açılışta adresteki "kbt=g" işaretinden, araçlar arasında gezinirken bu sekmenin
     hafızasından, tema değişince de Kelebek'in gönderdiği mesajdan okunur. */
  function geceUygula(g) {
    document.documentElement.classList.toggle('kb-gece', !!g);
    try { sessionStorage.setItem('kbGece', g ? '1' : '0'); } catch (e) {}
  }
  if (gomulu) {
    var ilkGece = null;
    try { var kbt = new URLSearchParams(location.search).get('kbt'); if (kbt) ilkGece = (kbt === 'g'); } catch (e) {}
    if (ilkGece === null) { try { ilkGece = sessionStorage.getItem('kbGece') === '1'; } catch (e) { ilkGece = false; } }
    geceUygula(ilkGece);
  }

  /* ---------------- 1b) Çift yükleme olmasın ----------------
     BentoPDF'in hizmet çalışanı (service worker) ilk açılışta ve her güncellemede
     sayfayı kendiliğinden bir kez daha yüklüyor, güncellemede de İngilizce
     "Reload to update?" sorusu soruyordu. Yeni sürüm zaten kendiliğinden devreye
     giriyor (sw.js skipWaiting); sayfayı yeniden yüklemeye gerek yok. */
  try {
    var sw = navigator.serviceWorker;
    if (sw && sw.addEventListener) {
      var swEkle = sw.addEventListener.bind(sw);
      sw.addEventListener = function (tur, fn, sec) {
        if (tur === 'controllerchange') return;
        return swEkle(tur, fn, sec);
      };
    }
    var asilConfirm = window.confirm;
    window.confirm = function (m) {
      if (typeof m === 'string' && /new version of .* is available/i.test(m)) return false;
      return asilConfirm.apply(window, arguments);
    };
  } catch (e) {}

  /* ---------------- 2) Çeviri ---------------- */
  var SOZ = {
"Add More Files": "Daha Fazla Dosya Ekle",
"Clear All": "Tümünü Temizle",
"150 (Default)": "150 (Varsayılan)",
"Total Pages:": "Toplam sayfa:",
"Total pages:": "Toplam sayfa:",
"Processing...": "İşleniyor...",
"Alert": "Uyarı",
"OK": "Tamam",
"Convert to PDF": "PDF'e Dönüştür",
"How it works:": "Nasıl çalışır:",
"Page Range": "Sayfa Aralığı",
"Page Range (optional)": "Sayfa Aralığı (isteğe bağlı)",
"Orientation": "Yön",
"Left": "Sol",
"Right": "Sağ",
"Apply Rotations": "Döndürmeleri Uygula",
"Owner Password (Optional)": "Sahip Şifresi (isteğe bağlı)",
"What will be removed:": "Neler kaldırılacak:",
"Position": "Konum",
"Bottom Left": "Sol Alt",
"Bottom Right": "Sağ Alt",
"Bottom Center": "Orta Alt",
"Top Left": "Sol Üst",
"Top Right": "Sağ Üst",
"Top Center": "Orta Üst",
"Top": "Üst",
"Center": "Orta",
"Bottom": "Alt",
"Format": "Biçim",
"Font Size": "Yazı Boyutu",
"Font Color": "Yazı Rengi",
"Color": "Renk",
"Background Color": "Arka Plan Rengi",
"FAQ": "SSS",
"Close": "Kapat",
"Close FAQ": "SSS'yi kapat",
"Compression Algorithm": "Sıkıştırma Yöntemi",
"Condense (Recommended)": "Yoğun (Önerilen)",
"Photon (For Photo-Heavy PDFs)": "Foton (Fotoğraf ağırlıklı PDF'ler için)",
"Condense": "Yoğun",
"uses advanced compression: removes dead-weight, optimizes images, subsets fonts. Best for most PDFs.": "gelişmiş sıkıştırma kullanır: gereksiz verileri siler, görselleri iyileştirir, yazı tiplerini küçültür. Çoğu PDF için en iyisi.",
"Photon": "Foton",
"converts pages to images. Use for photo-heavy/scanned PDFs.": "sayfaları görsele çevirir. Fotoğraf ağırlıklı ya da taranmış PDF'ler için kullanın.",
"⚠️ Warning: Text will become non-selectable and links will stop working.": "⚠️ Uyarı: Metin seçilemez olur ve bağlantılar çalışmaz.",
"Compression Level": "Sıkıştırma Düzeyi",
"Light (Preserve Quality)": "Hafif (Kaliteyi korur)",
"Balanced (Recommended)": "Dengeli (Önerilen)",
"Aggressive (Smaller Files)": "Güçlü (Daha küçük dosya)",
"Extreme (Maximum Compression)": "En yüksek (Azami sıkıştırma)",
"Convert to Grayscale": "Gri Tonlamaya Çevir",
"Reduces file size by removing color information": "Renk bilgisini kaldırarak dosya boyutunu küçültür",
"Custom Settings": "Özel Ayarlar",
"Fine-tune compression parameters:": "Sıkıştırma ayarlarını ince ayarlayın:",
"Output Quality": "Çıktı Kalitesi",
"Resize Images To": "Görselleri Şu Boyuta Getir",
"Only Process Above": "Yalnızca Şunun Üstündekileri İşle",
"Remove metadata": "Üst verileri kaldır",
"Subset fonts (remove unused glyphs)": "Yazı tiplerini küçült (kullanılmayan karakterleri kaldır)",
"Remove embedded thumbnails": "Gömülü küçük resimleri kaldır",
"Compress PDF": "PDF'i Sıkıştır",
"Inches": "İnç",
"Portrait": "Dikey",
"Landscape": "Yatay",
"Content Scaling": "İçerik Ölçekleme",
"Fit": "Sığdır",
"Preserves all content, may add margins.": "Bütün içeriği korur, kenar boşluğu ekleyebilir.",
"Fill (Crop)": "Doldur (Kırp)",
"Fills the page, may crop content.": "Sayfayı doldurur, içeriği kırpabilir.",
"PDF Quality": "PDF Kalitesi",
"High Quality (Larger file)": "Yüksek Kalite (Daha büyük dosya)",
"Medium Quality (Balanced)": "Orta Kalite (Dengeli)",
"Low Quality (Smaller file)": "Düşük Kalite (Daha küçük dosya)",
"Controls image compression when embedding into PDF": "PDF'e eklenirken görsellerin sıkıştırılmasını ayarlar",
"Header Center": "Üst Bilgi Orta",
"Header Left": "Üst Bilgi Sol",
"Header Right": "Üst Bilgi Sağ",
"Footer Center": "Alt Bilgi Orta",
"Footer Left": "Alt Bilgi Sol",
"Footer Right": "Alt Bilgi Sağ",
"Remove Annotations": "Açıklamaları Kaldır",
"Reset": "Sıfırla",
"e.g., 1-3, 5": "örn. 1-3, 5",
"e.g., 2, 4-6, 9": "örn. 2, 4-6, 9",
"e.g. 1-5, 8, 11-13": "örn. 1-5, 8, 11-13",
"e.g., 3,1,4,2": "örn. 3,1,4,2",
"Page Size": "Sayfa Boyutu",
"Letter": "Letter (ABD)",
"Text": "Metin",
"Image": "Görsel",
"Opacity:": "Saydamlık:",
"Angle:": "Açı:",
"Export": "Dışa Aktar",
"Import": "İçe Aktar",
"Modified": "Değiştirildi",
"Page 1 of 1": "Sayfa 1 / 1",
"Go to:": "Git:",
"Go": "Git",
"Bookmarks": "Yer İmleri",
"Cancel": "Vazgeç",
"Save": "Kaydet",
"Add Layer": "Katman Ekle",
"File Mode": "Dosya Modu",
"Page Mode": "Sayfa Modu",
"Click and drag the": "Dosyaların sırasını değiştirmek için",
"icon to change the order of the files.": "simgesini tutup sürükleyin.",
"In the \"Pages\" box for each file, you can specify ranges (e.g., \"1-3, 5\") to merge only those pages.": "Her dosyanın \"Sayfalar\" kutusuna aralık yazarak (örn. \"1-3, 5\") yalnızca o sayfaları birleştirebilirsiniz.",
"Leave the \"Pages\" box blank to include all pages from that file.": "Dosyanın bütün sayfalarını almak için \"Sayfalar\" kutusunu boş bırakın.",
"All pages from your uploaded PDFs are shown below.": "Yüklediğiniz PDF'lerin bütün sayfaları aşağıda.",
"Simply drag and drop the individual page thumbnails to create the exact order you want for your new file.": "Yeni dosyanızda istediğiniz sırayı oluşturmak için sayfaları sürükleyip bırakın.",
"Merge PDFs": "PDF'leri Birleştir",
"Split Mode": "Bölme Şekli",
"Extract by Page Range (Default)": "Sayfa aralığına göre ayır (Varsayılan)",
"Split by Even/Odd Pages": "Tek/Çift sayfalara göre böl",
"Split All Pages into Separate Files": "Her sayfayı ayrı dosya yap",
"Select Pages Visually": "Sayfaları görerek seç",
"Split by Bookmarks": "Yer imlerine göre böl",
"Split N Times": "Her N sayfada böl",
"Enter page numbers separated by commas (e.g., 2, 8, 14).": "Sayfa numaralarını virgülle ayırarak yazın (örn. 2, 8, 14).",
"Enter page ranges using a hyphen (e.g., 5-10).": "Aralıkları kısa çizgiyle yazın (örn. 5-10).",
"Combine them for complex selections (e.g., 1-3, 7, 12-15).": "İkisini birlikte de kullanabilirsiniz (örn. 1-3, 7, 12-15).",
"Extract all even pages (2, 4, 6...) or all odd pages (1, 3, 5...) into a new PDF.": "Bütün çift sayfaları (2, 4, 6...) ya da tek sayfaları (1, 3, 5...) yeni bir PDF'e ayırır.",
"Even Pages": "Çift Sayfalar",
"Odd Pages": "Tek Sayfalar",
"Every single page of the PDF will be saved as a separate PDF file.": "PDF'in her sayfası ayrı bir PDF dosyası olarak kaydedilir.",
"The result will be downloaded as a ZIP file containing all the pages.": "Sonuç, bütün sayfaları içeren bir ZIP dosyası olarak iner.",
"Click on the page thumbnails below to select the pages you want to extract.": "Ayırmak istediğiniz sayfaları aşağıdan tıklayarak seçin.",
"Selected pages will be highlighted.": "Seçilen sayfalar vurgulanır.",
"Split the PDF based on its bookmarks (outline).": "PDF'i yer imlerine (ana hatlarına) göre böler.",
"Select the bookmark level to split at.": "Bölünecek yer imi düzeyini seçin.",
"Bookmark Level": "Yer İmi Düzeyi",
"All Levels": "Bütün Düzeyler",
"Level 0 (Top Level Only)": "Düzey 0 (yalnızca en üst)",
"Level 1": "Düzey 1",
"Level 2": "Düzey 2",
"Level 3": "Düzey 3",
"Split the PDF into multiple files, each containing N pages.": "PDF'i her biri N sayfalık dosyalara böler.",
"Pages per file (N)": "Dosya başına sayfa (N)",
"Output": "Çıktı",
"Single combined PDF": "Tek birleşik PDF",
"One PDF per range": "Her aralık için bir PDF",
"Multiple files are downloaded together as a ZIP.": "Birden fazla dosya birlikte ZIP olarak iner.",
"Split PDF": "PDF'i Böl",
"Enter pages to delete (e.g., 2, 4-6, 9):": "Silinecek sayfaları yazın (örn. 2, 4-6, 9):",
"Delete Pages & Download": "Sayfaları Sil ve İndir",
"Batch Actions": "Toplu İşlemler",
"Rotate by Custom Degrees": "Özel Açıyla Döndür",
"Advanced Settings": "Gelişmiş Ayarlar",
"Page Order (comma-separated)": "Sayfa Sırası (virgülle)",
"Apply Order": "Sırayı Uygula",
"Flatten PDF (use the Save button below)": "PDF'i düzleştir (aşağıdaki Kaydet düğmesini kullanın)",
"Save & Download Signed PDF": "İmzalı PDF'i Kaydet ve İndir",
"Change File": "Dosyayı Değiştir",
"Preview": "Önizleme",
"Drag watermark to position": "Filigranı sürükleyerek yerleştirin",
"CONFIDENTIAL": "GİZLİ",
"Layout": "Yerleşim",
"Single": "Tek",
"Tiled": "Döşeli",
"Tiled repeats the watermark across the whole page.": "Döşeli, filigranı bütün sayfaya tekrar tekrar yayar.",
"all or 1-3, 5, 7-9": "tümü ya da 1-3, 5, 7-9",
"Use \"all\" or specify pages, e.g. 1-3, 5, 7-9": "Bütün sayfalar için \"all\" yazın ya da sayfaları belirtin, örn. 1-3, 5, 7-9",
"Watermark Image": "Filigran Görseli",
"Scale:": "Ölçek:",
"Horizontal gap:": "Yatay aralık:",
"Vertical gap:": "Dikey aralık:",
"Flatten watermark": "Filigranı sabitle",
"Bakes the watermark into page pixels, making it tamper-resistant. Text will no longer be selectable.": "Filigranı sayfaya kalıcı olarak işler, silinemez hale getirir. Metin artık seçilemez.",
"Add Watermark": "Filigran Ekle",
"Add Page Numbers": "Sayfa Numarası Ekle",
"Convert to DOCX": "Word'e (DOCX) Dönüştür",
"Convert to Excel": "Excel'e Dönüştür",
"User Password (Required)": "Açılış Şifresi (zorunlu)",
"Enter password to open PDF": "PDF'i açmak için şifre girin",
"This password will be required to open the PDF.": "PDF'i açmak için bu şifre istenecek.",
"Enter password for permissions (optional)": "İzinler için şifre girin (isteğe bağlı)",
"If provided, usage restrictions will be applied. Leave empty for no restrictions.": "Yazarsanız kullanım kısıtlamaları uygulanır. Kısıtlama istemiyorsanız boş bırakın.",
"Encryption Details:": "Şifreleme ayrıntıları:",
"256-bit AES encryption (highest security)": "256 bit AES şifreleme (en yüksek güvenlik)",
"User password required to open PDF": "PDF'i açmak için açılış şifresi gerekir",
"Owner password enables usage restrictions": "Sahip şifresi kullanım kısıtlamalarını açar",
"Without owner password: no restrictions applied": "Sahip şifresi yoksa kısıtlama uygulanmaz",
"Encrypt PDF": "PDF'i Şifrele",
"PDF Password": "PDF Şifresi",
"Enter the PDF password": "PDF şifresini girin",
"Enter the password used to protect this PDF.": "Bu PDF'i korumak için kullanılan şifreyi girin.",
"Decrypt PDF": "PDF Şifresini Kaldır",
"Enter pages to extract (e.g., 2, 4-6, 9):": "Ayrılacak sayfaları yazın (örn. 2, 4-6, 9):",
"Extract & Download ZIP": "Ayır ve ZIP İndir",
"Previous Page": "Önceki Sayfa",
"Next Page": "Sonraki Sayfa",
"Flattening Crop (converts pages to images)": "Kalıcı kırpma (sayfaları görsele çevirir)",
"Apply to all pages": "Bütün sayfalara uygula",
"Crop & Download": "Kırp ve İndir",
"Formatting Options": "Biçim Seçenekleri",
"Add Header & Footer": "Üst ve Alt Bilgi Ekle",
"What will be flattened:": "Neler düzleştirilecek:",
"Form fields (text fields, checkboxes, radio buttons, etc.)": "Form alanları (metin kutuları, onay kutuları, seçenek düğmeleri vb.)",
"Annotations and comments": "Açıklamalar ve yorumlar",
"Interactive elements": "Etkileşimli ögeler",
"Note: Flattened content cannot be edited or filled out.": "Not: Düzleştirilen içerik düzenlenemez ve doldurulamaz.",
"Flatten PDF(s)": "PDF'leri Düzleştir",
"Specify the position where blank pages should be inserted.": "Boş sayfaların ekleneceği yeri belirtin.",
"Position 0 inserts at the beginning, position equal to page count inserts at the end.": "0 yazarsanız başa, sayfa sayısını yazarsanız sona eklenir.",
"Blank pages will match the size of the first page in your document.": "Boş sayfalar belgenizin ilk sayfasıyla aynı boyutta olur.",
"Insert after page": "Şu sayfadan sonra ekle",
"Enter 0 to insert at the beginning.": "Başa eklemek için 0 yazın.",
"Number of blank pages": "Boş sayfa sayısı",
"Add Blank Pages": "Boş Sayfa Ekle",
"All pages will be reversed (first becomes last, last becomes first).": "Bütün sayfaların sırası ters çevrilir (ilk sayfa sona, son sayfa başa geçer).",
"If you upload multiple PDFs, each will be reversed and downloaded as a ZIP file.": "Birden fazla PDF yüklerseniz her biri ters çevrilir ve ZIP olarak iner.",
"Reverse Pages": "Sayfaları Ters Çevir",
"Download": "İndir",
"Upload File": "Dosya Yükle",
"Upload PDFs": "PDF Yükle",
"Process": "İşle",
"Extract Pages": "Sayfaları Ayır",
"Delete Pages": "Sayfaları Sil",
"Rotate PDF": "PDF'i Döndür",
"Merge PDF": "PDF Birleştir",
"Edit PDF": "PDF Düzenle",
"OCR PDF": "PDF'te Metin Tanıma (OCR)",
"Protect PDF": "PDF'i Koru",
"Flatten PDF": "PDF'i Düzleştir",
"PDF to JPG": "PDF'ten JPG'ye",
"PDF to PNG": "PDF'ten PNG'ye",
"Word to PDF": "Word'den PDF'e",
"Fix Page Size": "Sayfa Boyutunu Düzelt",
"Download selected": "Seçilenleri indir",
"Select All": "Tümünü Seç",
"Deselect All": "Seçimi Kaldır",
"Undo": "Geri Al",
"Redo": "Yinele",
"Rotate Left": "Sola Döndür",
"Rotate Right": "Sağa Döndür",
"Apply": "Uygula",
"Done": "Bitti",
"Next": "İleri",
"Back": "Geri",
"Loading...": "Yükleniyor...",
"Error": "Hata",
"Success": "Başarılı",
"Warning": "Uyarı",
"Pages": "Sayfalar",
"Page": "Sayfa",
"Width": "Genişlik",
"Height": "Yükseklik",
"Margin": "Kenar Boşluğu",
"Quality": "Kalite",
"Language": "Dil",
"Settings": "Ayarlar",
"Options": "Seçenekler",
/* 8.2: araç kartları ve araç sayfalarında kalan İngilizceler */
"- Additional context for RAG systems": "- Yapay zekâ sistemleri için ek bağlam",
"- Extracted text content per page": "- Her sayfadan çıkarılan metin",
"- Page number, headings, and document info": "- Sayfa numarası, başlıklar ve belge bilgisi",
"0 nodes": "0 düğüm",
"0.1° (Very Sensitive)": "0,1° (Çok hassas)",
"0.5° (Default)": "0,5° (Varsayılan)",
"1 inch = 72 points": "1 inç = 72 punto",
"1.0° (Normal)": "1,0° (Normal)",
"100 (Fast)": "100 (Hızlı)",
"1×2 (Booklet)": "1×2 (Kitapçık)",
"2.0° (Less Sensitive)": "2,0° (Daha az hassas)",
"200 (Better)": "200 (Daha iyi)",
"200 (Good)": "200 (İyi)",
"3 digits (001)": "3 hane (001)",
"300 (Best Quality)": "300 (En iyi kalite)",
"300 (Print)": "300 (Baskı)",
"4 digits (0001)": "4 hane (0001)",
"5 digits (00001)": "5 hane (00001)",
"6 digits (000001)": "6 hane (000001)",
"600 (High Quality)": "600 (Yüksek kalite)",
"72 (Screen)": "72 (Ekran)",
"Add Attachments": "Ek Dosya Ekle",
"Add Border": "Kenarlık Ekle",
"Add Custom Field": "Özel Alan Ekle",
"Add Margins": "Kenar Boşluğu Ekle",
"Add Separator Lines": "Ayırıcı Çizgi Ekle",
"Add a cryptographic digital signature to your PDF using X.509 certificates. Supports PKCS#12 (.pfx, .p12) and PEM formats. Your private key never leaves your browser.": "PDF'inize X.509 sertifikasıyla şifreli dijital imza ekleyin. PKCS#12 (.pfx, .p12) ve PEM desteklenir. Özel anahtarınız tarayıcınızdan çıkmaz.",
"Add to Page": "Sayfaya Ekle",
"Added": "Eklendi",
"Advanced Options": "Gelişmiş Seçenekler",
"All changes": "Tüm değişiklikler",
"All other security limitations": "Diğer tüm güvenlik kısıtlamaları",
"All selected PDF files will be packaged into a single ZIP archive.": "Seçilen bütün PDF dosyaları tek bir ZIP arşivinde toplanır.",
"Allow Annotating": "Not eklemeye izin ver",
"Allow Copying Text": "Metin kopyalamaya izin ver",
"Allow Document Assembly": "Belge birleştirmeye izin ver",
"Allow Filling Forms": "Form doldurmaya izin ver",
"Allow HTML tags": "HTML etiketlerine izin ver",
"Allow Modifying": "Değiştirmeye izin ver",
"Allow Page Extraction": "Sayfa ayıklamaya izin ver",
"Allow Printing": "Yazdırmaya izin ver",
"Also known as \"Fast Web View\" or \"Optimized\"": "\"Hızlı Web Görünümü\" ya da \"İyileştirilmiş\" olarak da bilinir",
"Alternate (odd→CW, even→CCW)": "Dönüşümlü (tek→saat yönü, çift→ters yön)",
"Alternating": "Dönüşümlü",
"An error occurred.": "Bir hata oluştu.",
"Any file type": "Her dosya türü",
"Apply Bates Numbers": "Bates Numarası Uygula",
"Apply Digital Signature": "Dijital İmzayı Uygula",
"Apply to All": "Tümüne Uygula",
"Area": "Alan",
"Aspect Ratio": "En-boy oranı",
"Attachment Level": "Ek düzeyi",
"Attachments": "Ekler",
"Author": "Yazar",
"Auto": "Otomatik",
"Auto (Keep Original)": "Otomatik (Orijinali koru)",
"Auto (best for layout)": "Otomatik (düzen için en iyisi)",
"Auto-convert URLs to links": "Adresleri otomatik bağlantıya çevir",
"Automatic (Recommended)": "Otomatik (Önerilen)",
"Back to Tools": "Araçlara Dön",
"Backgrounds": "Arka planlar",
"Barcode": "Barkod",
"Barcode Field": "Barkod Alanı",
"Batch Mode (": "Toplu mod (",
"Batch Operations": "Toplu İşlemler",
"Batch Rotation": "Toplu Döndürme",
"Bates Padding": "Bates hane sayısı",
"Bates Starts From": "Bates başlangıcı",
"Black & White (1-bit)": "Siyah-beyaz (1 bit)",
"Blue": "Mavi",
"Bold": "Kalın",
"Bold & Italic": "Kalın ve İtalik",
"Border Color": "Kenarlık rengi",
"Bring your PDF under 500KB while keeping images sharp.": "Resimler net kalırken PDF'inizi 500 KB'ın altına indirin.",
"Button": "Düğme",
"CBZ to PDF": "CBZ'den PDF'e",
"CBZ, CBR files": "CBZ, CBR dosyaları",
"CCITT Group 4 (B&W documents)": "CCITT Grup 4 (siyah-beyaz belgeler)",
"CSV files": "CSV dosyaları",
"CSV to PDF": "CSV'den PDF'e",
"Certificate": "Sertifika",
"Certificate Information": "Sertifika Bilgisi",
"Certificate Password": "Sertifika Şifresi",
"Change Background Color": "Arka Plan Rengini Değiştir",
"Change Permissions": "İzinleri Değiştir",
"Change Text Color": "Yazı Rengini Değiştir",
"Change Type": "Türü Değiştir",
"Change fonts, size, color, alignment and spacing, move or replace images, add new text boxes": "Yazı tipini, boyutu, rengi, hizalamayı ve aralığı değiştirin; resimleri taşıyın ya da değiştirin; yeni metin kutuları ekleyin",
"Character Spacing": "Harf aralığı",
"Checkbox": "Onay kutusu",
"Choose how many pages to fit on each sheet (2, 4, 9, or 16).": "Her kâğıda kaç sayfa sığacağını seçin (2, 4, 9 ya da 16).",
"Click on the PDF to set bookmark destination": "Yer iminin gideceği yeri seçmek için PDF'e tıklayın",
"Click or drop files to attach": "Eklemek için tıklayın ya da dosyaları bırakın",
"Click the button below to invert all colors in your PDF.": "PDF'inizdeki bütün renkleri tersine çevirmek için aşağıdaki düğmeye basın.",
"Click the button below to remove all annotations from your PDF.": "PDF'inizdeki bütün açıklamaları kaldırmak için aşağıdaki düğmeye basın.",
"Collapse All": "Tümünü Daralt",
"Color (RGB)": "Renkli (RGB)",
"Color for margins/padding": "Kenar boşluğu rengi",
"Columns": "Sütunlar",
"Combine Pages": "Sayfaları Birleştir",
"CommonMark (strict)": "CommonMark (katı)",
"Compress PDF for Email": "E-posta İçin PDF Sıkıştır",
"Compress PDF to 100KB": "PDF'i 100 KB'a Sıkıştır",
"Compress PDF to 1MB": "PDF'i 1 MB'a Sıkıştır",
"Compress PDF to 200KB": "PDF'i 200 KB'a Sıkıştır",
"Compress PDF to 2MB": "PDF'i 2 MB'a Sıkıştır",
"Compress PDF to 500KB": "PDF'i 500 KB'a Sıkıştır",
"Contact Info": "İletişim Bilgisi",
"Content only": "Yalnızca içerik",
"Conversion Options": "Dönüştürme Seçenekleri",
"Convert Adobe Photoshop (PSD) files to PDF format. Supports multiple files.": "Adobe Photoshop (PSD) dosyalarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert Apple Pages documents to PDF format. Supports multiple files.": "Apple Pages belgelerini PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert CSV spreadsheet files to PDF format. Supports multiple files.": "CSV tablo dosyalarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert EPUB e-books to PDF format. Supports multiple files.": "EPUB e-kitaplarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert Excel spreadsheets (XLSX, XLS, ODS, CSV) to PDF format. Supports multiple files.": "Excel tablolarını (XLSX, XLS, ODS, CSV) PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert FictionBook (FB2) e-books to PDF format. Supports multiple files.": "FictionBook (FB2) e-kitaplarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert MOBI e-books to PDF format. Supports multiple files.": "MOBI e-kitaplarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert Microsoft Publisher (PUB) files to PDF format. Supports multiple files.": "Microsoft Publisher (PUB) dosyalarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert Microsoft Visio (VSD, VSDX) files to PDF format. Supports multiple files.": "Microsoft Visio (VSD, VSDX) dosyalarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert OpenDocument Graphics (ODG) files to PDF format. Supports multiple files.": "OpenDocument Çizim (ODG) dosyalarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert OpenDocument Presentation (ODP) files to PDF format. Supports multiple files.": "OpenDocument Sunu (ODP) dosyalarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert OpenDocument Spreadsheet (ODS) files to PDF format. Supports multiple files.": "OpenDocument Tablo (ODS) dosyalarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert OpenDocument Text files to PDF format. Supports multiple files.": "OpenDocument Metin dosyalarını PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert PowerPoint presentations (PPTX, PPT, ODP) to PDF format. Supports multiple files.": "PowerPoint sunularını (PPTX, PPT, ODP) PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert Rich Text Format documents to PDF. Supports multiple files.": "RTF belgelerini PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert WPS Office documents to PDF format. Supports multiple files.": "WPS Office belgelerini PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert Word documents (DOCX, DOC, ODT, RTF) to PDF format. Supports multiple files.": "Word belgelerini (DOCX, DOC, ODT, RTF) PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert WordPerfect documents (WPD) to PDF format. Supports multiple files.": "WordPerfect (WPD) belgelerini PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert XML documents to PDF format. Supports multiple files.": "XML belgelerini PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert XPS/OXPS documents to PDF format. Supports multiple files.": "XPS/OXPS belgelerini PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert comic book archives (CBZ/CBR) to PDF format. Supports multiple files.": "Çizgi roman arşivlerini (CBZ/CBR) PDF'e dönüştürün. Birden fazla dosya desteklenir.",
"Convert each page of a PDF file into a scalable vector graphic (SVG) for perfect quality at any size.": "PDF'in her sayfasını her boyutta net görünen vektör çizime (SVG) dönüştürün.",
"Convert newlines to <br>": "Satır sonlarını <br>'ye çevir",
"Convert to CSV": "CSV'ye Dönüştür",
"Convert to Greyscale": "Gri Tonlamaya Dönüştür",
"Convert to Markdown": "Markdown'a Dönüştür",
"Convert to Outlines": "Çerçeveye Dönüştür",
"Convert to PDF/A": "PDF/A'ya Dönüştür",
"Convert to SVG": "SVG'ye Dönüştür",
"Converting...": "Dönüştürülüyor...",
"Converts all text to vector paths/curves": "Bütün yazıları vektör çizgilere dönüştürür",
"Converts the PDF to images first, ensuring better PDF/A compliance. Recommended if validation fails on the normal conversion.": "PDF'i önce resme çevirir; PDF/A uyumu daha iyi olur. Normal dönüştürme doğrulamadan geçmezse önerilir.",
"Copy Metadata as JSON": "Üst Veriyi JSON Olarak Kopyala",
"Copying restrictions": "Kopyalama kısıtlamaları",
"Courier (Monospace)": "Courier (Eş aralıklı)",
"Create Booklet": "Kitapçık Oluştur",
"Create N-Up PDF": "Çoklu Sayfa PDF'i Oluştur",
"Create ZIP Archive": "ZIP Arşivi Oluştur",
"Creation Date": "Oluşturma tarihi",
"Creation and Modification dates": "Oluşturma ve değiştirme tarihleri",
"Creator": "Oluşturan",
"Creator and Producer information": "Oluşturan ve üreten bilgisi",
"Current Password (if encrypted)": "Mevcut şifre (şifreliyse)",
"Custom Certificate File X.509 (Optional)": "Özel X.509 sertifika dosyası (isteğe bağlı)",
"Custom Fields": "Özel Alanlar",
"Custom style (other)": "Özel biçim (diğer)",
"Custom...": "Özel...",
"Customize Style": "Biçimi Özelleştir",
"DOCX, DOC, ODT, RTF files": "DOCX, DOC, ODT, RTF dosyaları",
"DPI (Resolution)": "DPI (Çözünürlük)",
"Date": "Tarih",
"Date Field": "Tarih Alanı",
"Default (GFM-like)": "Varsayılan (GFM benzeri)",
"Deflate / ZIP (Lossless)": "Deflate / ZIP (Kayıpsız)",
"Delete All": "Tümünü Sil",
"Delete Selected": "Seçilenleri Sil",
"Deleted": "Silindi",
"Deskew PDF": "PDF Eğriliğini Düzelt",
"Deskew Results": "Düzeltme Sonuçları",
"Detect Blank Pages": "Boş Sayfaları Bul",
"Detected Blank Pages": "Bulunan Boş Sayfalar",
"Digital Signature PDF": "PDF'e Dijital İmza",
"Dimensions": "Boyutlar",
"Divide Pages": "Sayfaları Böl",
"Document IDs": "Belge kimlikleri",
"Document Level": "Belge düzeyi",
"Document Metadata": "Belge Üst Verisi",
"Document Preview": "Belge Önizlemesi",
"Download All (ZIP)": "Tümünü İndir (ZIP)",
"Download Modified PDF": "Değiştirilen PDF'i İndir",
"Download PDF Form": "PDF Formunu İndir",
"Download a clean PDF with your edits baked in, and everything stays on your device": "Düzenlemelerinizi içeren temiz bir PDF indirin; her şey cihazınızda kalır",
"Download as PDF": "PDF Olarak İndir",
"Drag to reorder. Pages will be interleaved in this order.": "Sıralamak için sürükleyin. Sayfalar bu sırayla araya karıştırılır.",
"Dropdown": "Açılır liste",
"EPUB files": "EPUB dosyaları",
"EPUB to PDF": "EPUB'dan PDF'e",
"Each PDF will be extracted as a JSON file containing an array of LlamaIndex Document objects with:": "Her PDF, şunları içeren LlamaIndex belge nesneleriyle bir JSON dosyası olarak çıkarılır:",
"Edit All": "Tümünü Düzenle",
"Edit Metadata": "Üst Veriyi Düzenle",
"Editing restrictions": "Düzenleme kısıtlamaları",
"Eliminates font dependency issues": "Yazı tipi eksikliği sorunlarını ortadan kaldırır",
"Enables progressive loading (first page displays faster)": "Aşamalı yüklemeyi açar (ilk sayfa daha hızlı görünür)",
"Ensures consistent rendering across all devices": "Her cihazda aynı görünmesini sağlar",
"Enter certificate password": "Sertifika şifresini yazın",
"Enter name for the new layer:": "Yeni katmanın adını yazın:",
"Enter page numbers separated by commas or ranges with hyphens.": "Sayfa numaralarını virgülle, aralıkları tireyle yazın.",
"Every editable paragraph is outlined. Click one and type; text reflows live as you edit": "Düzenlenebilir her paragrafın çevresi çizilir. Birine tıklayıp yazın; metin siz yazdıkça yeniden dizilir",
"Everything runs locally in your browser, and nothing is uploaded.": "Her şey tarayıcınızda çalışır, hiçbir şey yüklenmez.",
"Excel to PDF": "Excel'den PDF'e",
"Expand All": "Tümünü Genişlet",
"Export CSV": "CSV Olarak Dışa Aktar",
"Export Format": "Dışa aktarma biçimi",
"Export JSON": "JSON Olarak Dışa Aktar",
"Export PDF": "PDF'i Dışa Aktar",
"Export as PDF": "PDF Olarak Dışa Aktar",
"Export to CSV": "CSV'ye Aktar",
"Extract Attachments": "Ekleri Çıkar",
"Extract Existing Bookmarks": "Mevcut Yer İmlerini Al",
"Extract Images": "Resimleri Çıkar",
"Extract PDF Tables": "PDF Tablolarını Çıkar",
"Extract Tables": "Tabloları Çıkar",
"Extract Text": "Metni Çıkar",
"Extract for AI": "Yapay Zekâ İçin Çıkar",
"Extract tables from PDF and convert to CSV format.": "PDF'teki tabloları çıkarıp CSV'ye dönüştürün.",
"Extract tables from PDF and convert to Excel (XLSX) format.": "PDF'teki tabloları çıkarıp Excel'e (XLSX) dönüştürün.",
"Extract tables from PDF files and export as CSV, JSON, or Markdown.": "PDF'teki tabloları çıkarıp CSV, JSON ya da Markdown olarak kaydedin.",
"Extract text from PDF files and save as plain text (.txt). Supports multiple files.": "PDF'teki yazıyı çıkarıp düz metin (.txt) olarak kaydedin. Birden fazla dosya desteklenir.",
"Extracted Images": "Çıkarılan Resimler",
"FB2 files": "FB2 dosyaları",
"FB2 to PDF": "FB2'den PDF'e",
"Fields:": "Alanlar:",
"File Counter Starts From": "Dosya sayacı başlangıcı",
"File names will be preserved in the archive.": "Dosya adları arşivde korunur.",
"Files Order": "Dosya sırası",
"Find & Replace": "Bul ve Değiştir",
"First-line Indent": "İlk satır girintisi",
"Fit to Width": "Genişliğe Sığdır",
"Flatten Forms": "Formları Düzleştir",
"Flicker": "Yanıp sönen",
"Generate Preview": "Önizleme Oluştur",
"Get your PDF under 100KB for portals with strict upload limits.": "Yükleme sınırı sıkı olan sistemler için PDF'inizi 100 KB'ın altına indirin.",
"Green": "Yeşil",
"Greyscale": "Gri tonlamalı",
"Grid Layout": "Izgara düzeni",
"Grid Mode": "Izgara Görünümü",
"Grid:": "Izgara:",
"Hanging Indent": "Asılı girinti",
"Headers": "Üst bilgiler",
"Height (pts)": "Yükseklik (pt)",
"Helvetica (Sans-serif)": "Helvetica (Tırnaksız)",
"Horizontal (Left to Right)": "Yatay (Soldan sağa)",
"Horizontal (Top & Bottom)": "Yatay (Üst ve alt)",
"Horizontal Scale %": "Yatay ölçek %",
"Horizontal:": "Yatay:",
"Ideal for print-ready PDFs": "Baskıya hazır PDF'ler için ideal",
"Ignore accents": "Aksanları yok say",
"Image Field": "Resim Alanı",
"Image Format": "Resim biçimi",
"Import CSV": "CSV İçe Aktar",
"Import JSON": "JSON İçe Aktar",
"Improves user experience for online PDFs": "İnternetteki PDF'lerde kullanımı kolaylaştırır",
"Inches (in)": "İnç (in)",
"Include CC and BCC recipients in header": "Başlığa CC ve BCC alıcılarını ekle",
"Include email attachments list": "E-posta eklerinin listesini ekle",
"Include images as base64": "Resimleri base64 olarak ekle",
"Incorrect password": "Şifre yanlış",
"Internet connection required": "İnternet bağlantısı gerekli",
"Invert Colors": "Renkleri Ters Çevir",
"Issuer": "Veren",
"Italic": "İtalik",
"JPEG (Lossy)": "JPEG (Kayıplı)",
"JPEG (Smaller file size)": "JPEG (Daha küçük dosya)",
"Keyboard Shortcuts": "Klavye Kısayolları",
"Keywords (comma-separated)": "Anahtar kelimeler (virgülle)",
"LTR": "Soldan sağa",
"LZW (Lossless)": "LZW (Kayıpsız)",
"Layout Direction": "Yerleşim yönü",
"Leave blank or use \"all\" to divide all pages.": "Bütün sayfaları bölmek için boş bırakın ya da \"all\" yazın.",
"Leave empty if the PDF has no owner password.": "PDF'in sahip şifresi yoksa boş bırakın.",
"Left Document": "Sol Belge",
"Line Spacing": "Satır aralığı",
"Linearize PDF(s)": "PDF'leri Doğrusallaştır",
"Load Layers": "Katmanları Yükle",
"Load Template": "Şablon Yükle",
"Loading PDF...": "PDF yükleniyor...",
"Loading layers...": "Katmanlar yükleniyor...",
"Location": "Konum",
"MOBI files": "MOBI dosyaları",
"MOBI to PDF": "MOBI'den PDF'e",
"Markdown Options": "Markdown Seçenekleri",
"Markdown Settings": "Markdown Ayarları",
"Markdown to PDF": "Markdown'dan PDF'e",
"Match case": "Büyük/küçük harf duyarlı",
"Meet 2MB portal limits while keeping high image quality.": "Resim kalitesini koruyarak 2 MB sınırına sığdırın.",
"Millimeters": "Milimetre",
"Millimeters (mm)": "Milimetre (mm)",
"Minimal (no features)": "En sade (özelliksiz)",
"Mix Pages": "Sayfaları Karıştır",
"Modification Date": "Değiştirme tarihi",
"Moved": "Taşındı",
"New Owner Password": "Yeni Sahip Şifresi",
"New Text Color": "Yeni Yazı Rengi",
"New User Password": "Yeni Kullanıcı Şifresi",
"Next change": "Sonraki değişiklik",
"Next page": "Sonraki sayfa",
"No bookmarks yet. Add one above!": "Henüz yer imi yok. Yukarıdan ekleyin!",
"No padding (1)": "Doldurma yok (1)",
"No rotation": "Döndürme yok",
"No saved templates yet.": "Kayıtlı şablon yok.",
"None": "Yok",
"None (Uncompressed)": "Yok (Sıkıştırmasız)",
"Note: Custom fields are not supported by all PDF readers.": "Not: Özel alanları her PDF okuyucu desteklemez.",
"Note: Text will no longer be selectable or searchable after conversion.": "Not: Dönüştürmeden sonra yazı seçilemez ve aranamaz.",
"ODG files": "ODG dosyaları",
"ODG to PDF": "ODG'den PDF'e",
"ODP files": "ODP dosyaları",
"ODP to PDF": "ODP'den PDF'e",
"ODS files": "ODS dosyaları",
"ODS to PDF": "ODS'den PDF'e",
"ODT files": "ODT dosyaları",
"ODT to PDF": "ODT'den PDF'e",
"Optimizes PDF structure for web viewing": "PDF yapısını internette görüntüleme için iyileştirir",
"Option List": "Seçenek Listesi",
"Optionally add margins and borders around each page.": "İsterseniz her sayfanın çevresine kenar boşluğu ve kenarlık ekleyin.",
"Original": "Orijinal",
"Output Format:": "Çıktı biçimi:",
"Output Page Settings": "Çıktı Sayfa Ayarları",
"Output Page Size": "Çıktı sayfa boyutu",
"Overlap (for assembly)": "Bindirme (birleştirmek için)",
"Overlay": "Üst üste bindir",
"Overlay view": "Üst üste görünüm",
"PDF Booklet": "PDF Kitapçık",
"PDF Bookmark Editor": "PDF Yer İmi Düzenleyici",
"PDF Editor": "PDF Düzenleyici",
"PDF Viewer": "PDF Görüntüleyici",
"PDF files (multiple supported)": "PDF dosyaları (birden fazla olabilir)",
"PDF signed successfully! The signature can be verified in any PDF reader.": "PDF imzalandı! İmza her PDF okuyucuda doğrulanabilir.",
"PDF to CSV": "PDF'ten CSV'ye",
"PDF to Excel": "PDF'ten Excel'e",
"PDF to SVG": "PDF'ten SVG'ye",
"PDF to Text": "PDF'ten Metne",
"PDF/A Version": "PDF/A sürümü",
"PDF/A-1b (Strict, no transparency)": "PDF/A-1b (Katı, saydamlık yok)",
"PDF/A-2b (Recommended, allows transparency)": "PDF/A-2b (Önerilen, saydamlığa izin verir)",
"PDF/A-3b (Modern, allows attachments)": "PDF/A-3b (Yeni, eke izin verir)",
"PNG (Lossless)": "PNG (Kayıpsız)",
"PPTX, PPT, ODP files": "PPTX, PPT, ODP dosyaları",
"PSD files": "PSD dosyaları",
"PSD to PDF": "PSD'den PDF'e",
"PUB files": "PUB dosyaları",
"PUB to PDF": "PUB'dan PDF'e",
"Page #": "Sayfa no",
"Page 1 / 1": "Sayfa 1 / 1",
"Page Level": "Sayfa düzeyi",
"Page Preview (": "Sayfa önizlemesi (",
"Page Range (e.g., 1,3,5-7) - Total:": "Sayfa aralığı (örn. 1,3,5-7) - Toplam:",
"Page Size:": "Sayfa boyutu:",
"Page count will be padded to multiple of 4 if needed.": "Gerekirse sayfa sayısı 4'ün katına tamamlanır.",
"Pages Corrected:": "Düzeltilen sayfa:",
"Pages files": "Pages dosyaları",
"Pages per Sheet": "Kâğıt başına sayfa",
"Pages to Divide": "Bölünecek sayfalar",
"Pages to PDF": "Pages'ten PDF'e",
"Pages will be rearranged in booklet order.": "Sayfalar kitapçık sırasına göre dizilir.",
"Pages with skew below this threshold won't be corrected.": "Eğikliği bu değerin altındaki sayfalar düzeltilmez.",
"Paper Size": "Kâğıt boyutu",
"Paragraph Spacing": "Paragraf aralığı",
"Password protect a PDF with strong AES encryption.": "PDF'inizi güçlü AES şifrelemesiyle parola korumasına alın.",
"Password protection": "Parola koruması",
"Permissions (requires owner password)": "İzinler (sahip şifresi gerekir)",
"PieceInfo (private application data)": "PieceInfo (uygulamaya özel veri)",
"Pixels (px)": "Piksel (px)",
"Placeholders: [BATES] [PAGE] [FILE] [FILENAME]": "Yer tutucular: [BATES] [PAGE] [FILE] [FILENAME]",
"Points": "Punto",
"Points (pt)": "Punto (pt)",
"Posterize PDF": "PDF'i Poster Yap",
"PowerPoint to PDF": "PowerPoint'ten PDF'e",
"Pre-flatten PDF (recommended for complex files)": "Önce düzleştir (karmaşık dosyalar için önerilir)",
"Preset": "Hazır ayar",
"Press Delete to remove selected field": "Seçili alanı silmek için Delete tuşuna basın",
"Preview:": "Önizleme:",
"Previous change": "Önceki değişiklik",
"Previous page": "Önceki sayfa",
"Print double-sided, flip on short edge, fold and staple.": "Çift taraflı yazdırın, kısa kenardan çevirin, katlayıp zımbalayın.",
"Printing restrictions": "Yazdırma kısıtlamaları",
"Processing Quality (DPI)": "İşleme kalitesi (DPI)",
"Producer": "Üreten",
"Properties": "Özellikler",
"Protected PDF": "Korumalı PDF",
"Purple": "Mor",
"RTF files": "RTF dosyaları",
"RTF to PDF": "RTF'den PDF'e",
"RTL": "Sağdan sola",
"Radio": "Seçenek düğmesi",
"Radio Button": "Seçenek Düğmesi",
"Rasterize PDF": "PDF'i Resme Çevir",
"Ready": "Hazır",
"Rearrange pages for double-sided booklet printing. Fold and staple to create a booklet.": "Sayfaları çift taraflı kitapçık baskısı için dizin. Katlayıp zımbalayınca kitapçık olur.",
"Reason": "Sebep",
"Reduce large PDFs below the most common 1MB upload limit.": "Büyük PDF'leri en yaygın 1 MB yükleme sınırının altına indirin.",
"Reduce your PDF below 200KB without losing readability.": "Okunabilirliği bozmadan PDF'inizi 200 KB'ın altına indirin.",
"Remove All Metadata": "Bütün Üst Veriyi Kaldır",
"Remove Embedded Files": "Gömülü Dosyaları Kaldır",
"Remove Embedded Fonts": "Gömülü Yazı Tiplerini Kaldır",
"Remove JavaScript": "JavaScript'i Kaldır",
"Remove Layers (OCG)": "Katmanları Kaldır (OCG)",
"Remove Links": "Bağlantıları Kaldır",
"Remove MarkInfo": "MarkInfo'yu Kaldır",
"Remove Metadata": "Üst Veriyi Kaldır",
"Remove Restrictions": "Kısıtlamaları Kaldır",
"Remove Selected Blank Pages": "Seçili Boş Sayfaları Kaldır",
"Remove Structure Tree": "Yapı Ağacını Kaldır",
"Remove duplicate fonts": "Tekrarlanan yazı tiplerini kaldır",
"Remove the password from a PDF so it opens freely.": "PDF'teki şifreyi kaldırın, dosya şifresiz açılsın.",
"Required when setting permissions or a user password. Leave all fields empty to decrypt the PDF instead.": "İzin ya da kullanıcı şifresi koyarken gerekir. PDF'in şifresini kaldırmak için bütün alanları boş bırakın.",
"Reset zoom to fit": "Yakınlaştırmayı sıfırla",
"Right Document": "Sağ Belge",
"Rotate clockwise (90°)": "Saat yönünde döndür (90°)",
"Rotate counter-clockwise (90°)": "Saat yönünün tersine döndür (90°)",
"Rotate pages by any custom angle.": "Sayfaları istediğiniz açıyla döndürün.",
"Rows": "Satırlar",
"Rulers": "Cetveller",
"Run": "Çalıştır",
"Sanitization Optionst:": "Temizleme seçenekleri:",
"Sanitization removes sensitive content permanently. Some options may affect PDF rendering.": "Temizleme, hassas içeriği kalıcı olarak kaldırır. Bazı seçenekler PDF'in görünümünü etkileyebilir.",
"Sanitize PDF": "PDF'i Temizle",
"Save & Download Filled Form": "Doldurulan Formu Kaydet ve İndir",
"Save Changes": "Değişiklikleri Kaydet",
"Save Metadata": "Üst Veriyi Kaydet",
"Save PDF with Bookmarks": "PDF'i Yer İmleriyle Kaydet",
"Save Template": "Şablonu Kaydet",
"Save this image as a PNG, edit it in any app; saved changes re-import automatically": "Bu resmi PNG olarak kaydedin, istediğiniz programda düzenleyin; değişiklikler kendiliğinden geri gelir",
"Scroll to top": "Başa dön",
"Select Files to Attach": "Eklenecek Dosyaları Seçin",
"Select Style": "Biçim Seçin",
"Select a field to edit properties": "Özelliklerini düzenlemek için bir alan seçin",
"Select or drag and drop the PDF whose text you want to edit": "Yazısını düzenlemek istediğiniz PDF'i seçin ya da sürükleyip bırakın",
"Select output page size and orientation.": "Çıktı sayfa boyutunu ve yönünü seçin.",
"Sensitivity:": "Hassasiyet:",
"Separator Color": "Ayırıcı rengi",
"Separator Thickness": "Ayırıcı kalınlığı",
"Set Color...": "Renk Seç...",
"Set Style...": "Biçim Seç...",
"Shrink PDFs to fit any email attachment limit.": "PDF'leri e-posta eki sınırına sığacak kadar küçültün.",
"Side-by-Side": "Yan yana",
"Signature": "İmza",
"Signature Details (Optional)": "İmza Ayrıntıları (isteğe bağlı)",
"Signature Validation Results": "İmza Doğrulama Sonuçları",
"Skew Threshold (degrees)": "Eğiklik sınırı (derece)",
"Skip": "Atla",
"Source Rotation": "Kaynak döndürme",
"Spacing (pixels)": "Aralık (piksel)",
"Specify which pages to divide. Other pages will be kept as-is.": "Hangi sayfaların bölüneceğini yazın. Diğer sayfalar olduğu gibi kalır.",
"Spelling": "Yazım denetimi",
"Split Direction": "Bölme yönü",
"Split each page into left and right halves.": "Her sayfayı sol ve sağ yarıya bölün.",
"Split each page into top and bottom halves.": "Her sayfayı üst ve alt yarıya bölün.",
"Split view": "Bölünmüş görünüm",
"Stamp Editor": "Damga Düzenleyici",
"Standard Size": "Standart boyut",
"Start Creating": "Oluşturmaya Başla",
"Start typing here...": "Buraya yazmaya başlayın...",
"Style": "Biçim",
"Subject": "Konu",
"Sync Scroll": "Birlikte Kaydır",
"Sync scroll": "Birlikte kaydır",
"Target Page Size": "Hedef sayfa boyutu",
"Template Name": "Şablon adı",
"Text Field": "Metin Alanı",
"The browser ran out of memory while converting. Try a lower DPI, or uncheck the multi-page TIFF option to convert pages one at a time.": "Dönüştürürken tarayıcının belleği yetmedi. Daha düşük bir DPI deneyin ya da çok sayfalı TIFF seçeneğini kaldırıp sayfaları tek tek dönüştürün.",
"This is an alert message.": "Bu bir uyarı mesajıdır.",
"Timestamping requires contacting the selected TSA server to obtain a trusted timestamp token.": "Zaman damgası için seçilen TSA sunucusuna bağlanılır.",
"Tiro (Serif)": "Tiro (Tırnaklı)",
"Times (Serif)": "Times (Tırnaklı)",
"Title": "Başlık",
"Title, Author, Subject, Keywords": "Başlık, Yazar, Konu, Anahtar kelimeler",
"Toggle Grid": "Izgarayı Aç/Kapat",
"Typographer (smart quotes, etc.)": "Tipografi (akıllı tırnak vb.)",
"Ultra (384 DPI)": "Çok yüksek (384 DPI)",
"Units": "Birim",
"Units:": "Birim:",
"Unlock": "Kilidi Aç",
"Unlock PDF": "PDF Kilidini Aç",
"Upload a PDF and click \"Generate Preview\" to see the booklet layout": "Kitapçık düzenini görmek için bir PDF yükleyip \"Önizleme Oluştur\"a basın",
"Upload a PDF file.": "Bir PDF dosyası yükleyin.",
"Upload a trusted X.509 certificate to validate against a custom trust source.": "Kendi güven kaynağınıza göre doğrulamak için güvenilir bir X.509 sertifikası yükleyin.",
"Upload certificate (.pem, .crt, .cer)": "Sertifika yükle (.pem, .crt, .cer)",
"Upload certificate (.pfx, .p12, .pem)": "Sertifika yükle (.pfx, .p12, .pem)",
"Upload two PDFs to see differences.": "Farkları görmek için iki PDF yükleyin.",
"Use the toolbar's image stamp tool to place stamps.": "Damga eklemek için araç çubuğundaki resim damgası aracını kullanın.",
"VSD to PDF": "VSD'den PDF'e",
"VSD, VSDX files": "VSD, VSDX dosyaları",
"Valid": "Geçerli",
"Validate PDF Signature": "PDF İmzasını Doğrula",
"Verify digital signatures in your PDF files. Check certificate validity, view signer details, and confirm document integrity. All processing happens in your browser.": "PDF'lerinizdeki dijital imzaları doğrulayın: sertifikanın geçerliliğini, imzalayanı ve belgenin değişmediğini görün. Her şey tarayıcınızda yapılır.",
"Vertical (Left & Right)": "Dikey (Sol ve sağ)",
"Vertical (Top to Bottom)": "Dikey (Yukarıdan aşağı)",
"Vertical:": "Dikey:",
"WPD files": "WPD dosyaları",
"WPD to PDF": "WPD'den PDF'e",
"WPS files": "WPS dosyaları",
"WPS to PDF": "WPS'den PDF'e",
"What this tool does:": "Bu araç ne yapar:",
"Whole word": "Tam kelime",
"Width (pts)": "Genişlik (pt)",
"Word Spacing": "Kelime aralığı",
"Write or paste Markdown and export it as a beautifully formatted PDF.": "Markdown yazın ya da yapıştırın, düzgün biçimli bir PDF olarak kaydedin.",
"XLSX, XLS, ODS, CSV files": "XLSX, XLS, ODS, CSV dosyaları",
"XML files": "XML dosyaları",
"XML to PDF": "XML'den PDF'e",
"XMP Metadata streams": "XMP üst veri akışları",
"XPS to PDF": "XPS'ten PDF'e",
"XPS, OXPS files": "XPS, OXPS dosyaları",
"Yellow": "Sarı",
"Zoom In": "Yakınlaştır",
"Zoom Out": "Uzaklaştır",
"Zoom in": "Yakınlaştır",
"Zoom out": "Uzaklaştır",
"e.g., I approve this document": "örn. Bu belgeyi onaylıyorum",
"e.g., New York, USA": "örn. Ankara, Türkiye",
"e.g., email@example.com": "örn. eposta@ornek.com",
"field(s)": "alan",
"or drag and drop": "ya da sürükleyip bırakın",
"selected)": "seçili)",
"Legal": "Legal",
"Letter (8.5 × 11 in)": "Letter (8,5 × 11 inç)",
/* 20 Ekim 2026: araçların içinde sabit yazılmış İngilizce iletiler */
"A template with this name already exists.": "Bu adla bir şablon zaten var.",
"Add Blank Page": "Boş Sayfa Ekle",
"Add a cryptographic digital signature using X.509 certificates.": "X.509 sertifikasıyla şifreli dijital imza ekleyin.",
"Add a text box": "Metin kutusu ekle",
"Add an RFC 3161 document timestamp using a trusted TSA server.": "Güvenilir bir TSA sunucusuyla RFC 3161 belge zaman damgası ekleyin.",
"Add at least one node to run the workflow.": "İş akışını çalıştırmak için en az bir düğüm ekleyin.",
"Add child": "Alt öğe ekle",
"Add child layer": "Alt katman ekle",
"Add image stamps to your PDF using the annotation toolbar.": "Not araç çubuğuyla PDF'inize resim damgası ekleyin.",
"Add sequential Bates numbers across one or more PDF files.": "Bir ya da birden çok PDF'e sıralı Bates numarası ekleyin.",
"Add text to the top and bottom of pages.": "Sayfaların üstüne ve altına yazı ekleyin.",
"Add, edit, import, delete and extract PDF bookmarks.": "PDF yer imlerini ekleyin, düzenleyin, içe aktarın, silin ve çıkarın.",
"Adding header & footer...": "Üst ve alt bilgi ekleniyor...",
"Adding page numbers...": "Sayfa numaraları ekleniyor...",
"Adding watermark...": "Filigran ekleniyor...",
"Adjust Colors": "Renkleri Ayarla",
"Align Objects": "Nesneleri Hizala",
"Alignment": "Hizalama",
"All files repaired successfully!": "Bütün dosyalar onarıldı.",
"Alternate Merge": "Sayfaları Karıştır & Birleştir",
"Alternating and mixing pages...": "Sayfalar karıştırılıyor...",
"An error occurred during cropping.": "Kırpma sırasında bir hata oluştu.",
"An error occurred while combining pages.": "Sayfalar birleştirilirken bir hata oluştu.",
"An error occurred while creating the N-Up PDF.": "N'li PDF oluşturulurken bir hata oluştu.",
"An error occurred while creating the booklet.": "Kitapçık oluşturulurken bir hata oluştu.",
"An error occurred while dividing the PDF.": "PDF bölünürken bir hata oluştu.",
"An error occurred while standardizing pages.": "Sayfalar eşitlenirken bir hata oluştu.",
"An error occurred while trying to remove metadata.": "Üst veri kaldırılırken bir hata oluştu.",
"An owner password is required when setting permissions": "İzinleri ayarlamak için sahip şifresi gerekir",
"An unexpected error occurred during the repair process.": "Onarım sırasında beklenmeyen bir hata oluştu.",
"An unexpected error occurred in the merge worker.": "Birleştirme sırasında beklenmeyen bir hata oluştu.",
"Analyze page size, orientation, and units.": "Sayfa boyutunu, yönünü ve birimlerini inceleyin.",
"Analyzing full PDF metadata...": "PDF üst verisi inceleniyor...",
"Analyzing signatures...": "İmzalar inceleniyor...",
"Annotate, highlight, redact, comment, add shapes/images, search, and view PDFs.": "PDF'leri görüntüleyin; not, vurgu, karartma, yorum, şekil/resim ekleyin, arayın.",
"Annotations removed successfully!": "Notlar kaldırıldı.",
"Apply PDF page labels with Roman numerals, prefixes, and custom starts.": "Roma rakamı, ön ek ve özel başlangıçla PDF sayfa etiketleri uygulayın.",
"Applying Bates numbers...": "Bates numaraları ekleniyor...",
"Applying color adjustments...": "Renk ayarları uygulanıyor...",
"Applying crop...": "Kırpılıyor...",
"Applying redactions...": "Karartmalar uygulanıyor...",
"Applying rotations...": "Döndürmeler uygulanıyor...",
"Applying scanner effect...": "Tarayıcı efekti uygulanıyor...",
"Applying timestamp...": "Zaman damgası ekleniyor...",
"Arrange multiple pages onto a single sheet.": "Birden çok sayfayı tek kâğıda dizin.",
"At least two valid PDFs are required.": "En az iki geçerli PDF gerekir.",
"Attaching files to PDF...": "Dosyalar PDF'e ekleniyor...",
"Attachments updated successfully!": "Ekler güncellendi.",
"Automatically detect and delete blank pages.": "Boş sayfaları bulup kendiliğinden silin.",
"Automatically straighten tilted scanned pages using OpenCV.": "Eğik taranmış sayfaları kendiliğinden düzeltin (OpenCV).",
"Background color changed successfully!": "Arka plan rengi değiştirildi.",
"Booklet": "Kitapçık",
"Build custom PDF processing pipelines with a visual node editor.": "Görsel düzenleyiciyle kendi PDF iş akışınızı kurun.",
"Building new PDF...": "Yeni PDF hazırlanıyor...",
"Building page pairing model...": "Sayfa eşleştirmesi hazırlanıyor...",
"Cannot access viewer controls. Please use the Download button in the PDF viewer toolbar above.": "Görüntüleyici denetimlerine erişilemiyor. Lütfen yukarıdaki PDF görüntüleyici çubuğundaki İndir düğmesini kullanın.",
"Cannot delete all pages.": "Bütün sayfalar silinemez.",
"Certificate (.pfx, .p12, .pem)": "Sertifika (.pfx, .p12, .pem)",
"Certificate unlocked": "Sertifika açıldı",
"Change the author, title, and other properties.": "Yazar, başlık ve öteki özellikleri değiştirin.",
"Change the background color of your PDF.": "PDF'inizin arka plan rengini değiştirin.",
"Change the color of text in your PDF.": "PDF'inizdeki yazının rengini değiştirin.",
"Changing background color...": "Arka plan rengi değiştiriliyor...",
"Changing text color...": "Yazı rengi değiştiriliyor...",
"Click any paragraph and edit it in place with live reflow, fonts, and styling.": "Herhangi bir paragrafa dokunup yerinde düzenleyin; yazı tipi ve biçim korunur.",
"Close (Esc)": "Kapat (Esc)",
"Color adjustments applied successfully!": "Renk ayarları uygulandı.",
"Colors inverted successfully!": "Renkler ters çevrildi.",
"Combine multiple PDFs into one file.": "Birden çok PDF'i tek dosyada birleştirin.",
"Combine multiple PDFs into one file. Preserves Bookmarks.": "Birden çok PDF'i tek dosyada birleştirin. Yer imlerini korur.",
"Combine to Single Page": "Tek Sayfada Birleştir",
"Combining pages...": "Sayfalar birleştiriliyor...",
"Comic Archives": "Çizgi roman arşivleri",
"Compare two PDFs side by side.": "İki PDF'i yan yana karşılaştırın.",
"Complete": "Tamamlandı",
"Compress": "Sıkıştır",
"Compressing multiple PDFs...": "PDF'ler sıkıştırılıyor...",
"Convert Adobe Photoshop (PSD) files to PDF. Multiple files supported.": "Adobe Photoshop (PSD) dosyalarını PDF'e dönüştürün. Birden çok dosya olur.",
"Convert Apple Pages documents to PDF.": "Apple Pages belgelerini PDF'e dönüştürün.",
"Convert CSV (Comma-Separated Values) spreadsheets to PDF.": "CSV tablolarını PDF'e dönüştürün.",
"Convert EPUB e-books to PDF.": "EPUB e-kitaplarını PDF'e dönüştürün.",
"Convert Excel spreadsheets (XLSX, XLS, ODS) to PDF.": "Excel tablolarını (XLSX, XLS, ODS) PDF'e dönüştürün.",
"Convert FictionBook (FB2) e-books to PDF.": "FictionBook (FB2) e-kitaplarını PDF'e dönüştürün.",
"Convert JPG, PNG, BMP, GIF, TIFF, PNM, PGM, PBM, PPM, PAM, JXR, JPX, JP2, PSD, SVG, HEIC, WebP to PDF.": "JPG, PNG, BMP, GIF, TIFF, PNM, PGM, PBM, PPM, PAM, JXR, JPX, JP2, PSD, SVG, HEIC, WebP dosyalarını PDF'e dönüştürün.",
"Convert JSON files to PDF format.": "JSON dosyalarını PDF'e dönüştürün.",
"Convert MOBI e-books to PDF.": "MOBI e-kitaplarını PDF'e dönüştürün.",
"Convert Markdown to PDF with live preview and syntax highlighting.": "Markdown'ı canlı önizlemeyle PDF'e dönüştürün.",
"Convert Microsoft Publisher (PUB) to PDF.": "Microsoft Publisher (PUB) dosyalarını PDF'e dönüştürün.",
"Convert Microsoft Visio (VSD, VSDX) to PDF.": "Microsoft Visio (VSD, VSDX) dosyalarını PDF'e dönüştürün.",
"Convert ODT (OpenDocument Text) files to PDF.": "ODT (OpenDocument metin) dosyalarını PDF'e dönüştürün.",
"Convert OpenDocument Graphics (ODG) to PDF.": "OpenDocument çizim (ODG) dosyalarını PDF'e dönüştürün.",
"Convert OpenDocument Presentation (ODP) to PDF.": "OpenDocument sunu (ODP) dosyalarını PDF'e dönüştürün.",
"Convert OpenDocument Spreadsheet (ODS) to PDF.": "OpenDocument tablo (ODS) dosyalarını PDF'e dönüştürün.",
"Convert PDF files to JSON format.": "PDF dosyalarını JSON biçimine dönüştürün.",
"Convert PDF files to editable Word documents.": "PDF dosyalarını düzenlenebilir Word belgelerine dönüştürün.",
"Convert PDF text and tables to Markdown format.": "PDF'teki yazı ve tabloları Markdown'a dönüştürün.",
"Convert PDF to PDF/A for long-term archiving.": "Uzun süreli arşiv için PDF'i PDF/A'ya dönüştürün.",
"Convert PDF to image-based PDF. Flatten layers and remove selectable text.": "PDF'i resim tabanlı PDF'e çevirin. Katmanlar düzleşir, seçilebilir yazı kalkar.",
"Convert PowerPoint presentations (PPTX, PPT, ODP) to PDF.": "PowerPoint sunularını (PPTX, PPT, ODP) PDF'e dönüştürün.",
"Convert RTF (Rich Text Format) documents to PDF.": "RTF belgelerini PDF'e dönüştürün.",
"Convert WPS Office documents to PDF.": "WPS Office belgelerini PDF'e dönüştürün.",
"Convert Word documents (DOCX, DOC, ODT) to PDF.": "Word belgelerini (DOCX, DOC, ODT) PDF'e dönüştürün.",
"Convert WordPerfect documents (WPD) to PDF.": "WordPerfect (WPD) belgelerini PDF'e dönüştürün.",
"Convert XML documents to PDF.": "XML belgelerini PDF'e dönüştürün.",
"Convert XPS/OXPS documents to PDF.": "XPS/OXPS belgelerini PDF'e dönüştürün.",
"Convert a PDF into a CBZ (Comic Book Archive) file for comic readers.": "PDF'i çizgi roman okuyucuları için CBZ dosyasına dönüştürün.",
"Convert a plain text file into a PDF.": "Düz metin dosyasını PDF'e dönüştürün.",
"Convert all colors to black and white.": "Bütün renkleri siyah-beyaza çevirin.",
"Convert all fonts to vector outlines for consistent rendering.": "Her yerde aynı görünsün diye yazı tiplerini çizgiye dönüştürün.",
"Convert comic book archives (CBZ/CBR) to PDF.": "Çizgi roman arşivlerini (CBZ/CBR) PDF'e dönüştürün.",
"Convert each PDF page into a BMP image.": "Her PDF sayfasını BMP resmine dönüştürün.",
"Convert each PDF page into a JPG image.": "Her PDF sayfasını JPG resmine dönüştürün.",
"Convert each PDF page into a PNG image.": "Her PDF sayfasını PNG resmine dönüştürün.",
"Convert each PDF page into a TIFF image.": "Her PDF sayfasını TIFF resmine dönüştürün.",
"Convert each PDF page into a WebP image.": "Her PDF sayfasını WebP resmine dönüştürün.",
"Convert each PDF page into a scalable vector graphic.": "Her PDF sayfasını ölçeklenebilir vektör çizime (SVG) dönüştürün.",
"Convert email files (EML, MSG) to PDF format.": "E-posta dosyalarını (EML, MSG) PDF'e dönüştürün.",
"Converting BMP to PDF...": "BMP, PDF'e dönüştürülüyor...",
"Converting HEIC to PDF...": "HEIC, PDF'e dönüştürülüyor...",
"Converting TIFF to PDF...": "TIFF, PDF'e dönüştürülüyor...",
"Converting emails...": "E-postalar dönüştürülüyor...",
"Converting files...": "Dosyalar dönüştürülüyor...",
"Converting fonts to outlines...": "Yazı tipleri çizgiye dönüştürülüyor...",
"Converting images to PDF...": "Resimler PDF'e dönüştürülüyor...",
"Converting multiple PDFs to PDF/A...": "PDF'ler PDF/A'ya dönüştürülüyor...",
"Converting multiple RTF files to PDF...": "RTF dosyaları PDF'e dönüştürülüyor...",
"Converting multiple files...": "Dosyalar dönüştürülüyor...",
"Converting to Markdown...": "Markdown'a dönüştürülüyor...",
"Converting to SVG...": "SVG'ye dönüştürülüyor...",
"Converting to greyscale...": "Gri tonlamaya çevriliyor...",
"Could not add page numbers.": "Sayfa numaraları eklenemedi.",
"Could not apply rotations.": "Döndürmeler uygulanamadı.",
"Could not change text color.": "Yazı rengi değiştirilemedi.",
"Could not change the background color.": "Arka plan rengi değiştirilemedi.",
"Could not create ZIP archive.": "ZIP arşivi oluşturulamadı.",
"Could not detect blank pages.": "Boş sayfalar bulunamadı.",
"Could not display the page.": "Sayfa gösterilemedi.",
"Could not export comparison PDF.": "Karşılaştırma PDF'i indirilemedi.",
"Could not export the signed PDF. Please try again.": "İmzalı PDF indirilemedi. Lütfen tekrar deneyin.",
"Could not fully analyze the PDF. It may be corrupted or have an unusual structure.": "PDF tam incelenemedi. Bozuk olabilir ya da alışılmadık bir yapısı olabilir.",
"Could not invert PDF colors.": "PDF renkleri ters çevrilemedi.",
"Could not load PDF. It may be corrupt or password-protected.": "PDF yüklenemedi. Bozuk ya da şifreli olabilir.",
"Could not load PDF. The file may be invalid, corrupted, or password-protected.": "PDF yüklenemedi. Dosya geçersiz, bozuk ya da şifreli olabilir.",
"Could not load the PDF engine. Please refresh the page and try again.": "PDF motoru yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.",
"Could not remove annotations.": "Notlar kaldırılamadı.",
"Could not remove blank pages.": "Boş sayfalar kaldırılamadı.",
"Could not remove the redacted text from the document data, so the file was not downloaded.": "Karartılan yazı belge verisinden silinemediği için dosya indirilmedi.",
"Could not reverse the PDF pages. Please check that your files are valid PDFs.": "PDF sayfaları ters çevrilemedi. Dosyalarınızın geçerli PDF olduğunu kontrol edin.",
"Could not update metadata. Please check that date formats are correct.": "Üst veri güncellenemedi. Tarih biçimlerinin doğru olduğunu kontrol edin.",
"Create a \"dark mode\" version of your PDF.": "PDF'inizin koyu renkli bir sürümünü oluşturun.",
"Create a PDF from one or more BMP images.": "Bir ya da birden çok BMP resminden PDF oluşturun.",
"Create a PDF from one or more HEIC images.": "Bir ya da birden çok HEIC resminden PDF oluşturun.",
"Create a PDF from one or more JPG images.": "Bir ya da birden çok JPG resminden PDF oluşturun.",
"Create a PDF from one or more PNG images.": "Bir ya da birden çok PNG resminden PDF oluşturun.",
"Create a PDF from one or more SVG images.": "Bir ya da birden çok SVG resminden PDF oluşturun.",
"Create a PDF from one or more TIFF images.": "Bir ya da birden çok TIFF resminden PDF oluşturun.",
"Create a PDF from one or more WebP images.": "Bir ya da birden çok WebP resminden PDF oluşturun.",
"Create fillable PDF forms with drag-and-drop text fields.": "Sürükle-bırak alanlarla doldurulabilir PDF formları oluşturun.",
"Creating Booklet...": "Kitapçık hazırlanıyor...",
"Creating Excel file...": "Excel dosyası hazırlanıyor...",
"Creating N-Up PDF...": "N'li PDF hazırlanıyor...",
"Creating PDF from JPGs...": "JPG'lerden PDF hazırlanıyor...",
"Creating PDF from SVG files...": "SVG dosyalarından PDF hazırlanıyor...",
"Creating PDF...": "PDF hazırlanıyor...",
"Creating ZIP archive...": "ZIP arşivi hazırlanıyor...",
"Creating ZIP file...": "ZIP dosyası hazırlanıyor...",
"Crop": "Kırp",
"Crop complete! Your download has started.": "Kırpma tamam. İndirme başladı.",
"Custom Zoom": "Özel yakınlık",
"Decrypt": "Şifreyi Çöz",
"Decrypting PDF...": "PDF şifresi çözülüyor...",
"Delete": "Sil",
"Delete Page": "Sayfayı Sil",
"Delete layer": "Katmanı sil",
"Deleting pages...": "Sayfalar siliniyor...",
"Description for screen readers": "Ekran okuyucular için açıklama",
"Deskew": "Eğikliği Düzelt",
"Destination": "Hedef",
"Detecting blank pages...": "Boş sayfalar aranıyor...",
"Digital Sign": "Dijital İmza",
"Direction": "Yön",
"Divide pages horizontally or vertically.": "Sayfaları yatay ya da dikey bölün.",
"Document Properties": "Belge Özellikleri",
"Document properties": "Belge özellikleri",
"Document-level attachment": "Belge düzeyinde ek",
"Download Edited PDF": "Düzenlenen PDF'i İndir",
"Draw, type, or upload your signature.": "İmzanızı çizin, yazın ya da yükleyin.",
"Duplicate Page": "Sayfayı Çoğalt",
"Duplicate, reorder, and delete pages.": "Sayfaları çoğaltın, sıralayın ve silin.",
"EPUB Files": "EPUB dosyaları",
"Edit": "Düzenle",
"Edit Scope": "Düzenleme kapsamı",
"Email Files": "E-posta dosyaları",
"Email to PDF": "E-postadan PDF'e",
"Embed one or more files into your PDF.": "PDF'inize bir ya da birden çok dosya gömün.",
"Embedding files into PDF...": "Dosyalar PDF'e gömülüyor...",
"Encrypt": "Şifrele",
"Encrypting PDF with 256-bit AES...": "PDF 256 bit AES ile şifreleniyor...",
"Enter bookmark title": "Yer imi başlığını yazın",
"Enter password": "Şifreyi yazın",
"Enter password...": "Şifreyi yazın...",
"Error during execution": "Çalışırken hata oluştu",
"Extract PDF content as LlamaIndex JSON for RAG/LLM pipelines.": "PDF içeriğini yapay zekâ (RAG/LLM) için LlamaIndex JSON olarak çıkarın.",
"Extract a range of pages into a new PDF.": "Bir sayfa aralığını yeni bir PDF'e çıkarın.",
"Extract all embedded files from PDF(s) as a ZIP.": "PDF'lerdeki bütün gömülü dosyaları ZIP olarak çıkarın.",
"Extract all embedded images from your PDF files.": "PDF dosyalarınızdaki bütün resimleri çıkarın.",
"Extract tables from PDF and convert to Excel (XLSX).": "PDF'teki tabloları Excel'e (XLSX) çıkarın.",
"Extract tables from PDFs as CSV, JSON, or Markdown.": "PDF'teki tabloları CSV, JSON ya da Markdown olarak çıkarın.",
"Extract text from PDF files and save as plain text (.txt).": "PDF'teki yazıyı düz metin (.txt) olarak kaydedin.",
"Extracted 1 table successfully!": "1 tablo çıkarıldı.",
"Extracting pages...": "Sayfalar çıkarılıyor...",
"Extracting tables...": "Tablolar çıkarılıyor...",
"Extracting text from multiple files...": "Dosyalardan metin çıkarılıyor...",
"Extracting text...": "Metin çıkarılıyor...",
"FB2 Files": "FB2 dosyaları",
"Failed": "Başarısız",
"Failed to add child layer": "Alt katman eklenemedi",
"Failed to add layer:": "Katman eklenemedi:",
"Failed to apply Bates numbers.": "Bates numaraları eklenemedi.",
"Failed to apply color adjustments. The file might be corrupted.": "Renk ayarları uygulanamadı. Dosya bozuk olabilir.",
"Failed to apply redactions.": "Karartmalar uygulanamadı.",
"Failed to apply scanner effect. The file might be corrupted.": "Tarayıcı efekti uygulanamadı. Dosya bozuk olabilir.",
"Failed to convert BMP to PDF. One of the files may be invalid.": "BMP, PDF'e dönüştürülemedi. Dosyalardan biri geçersiz olabilir.",
"Failed to convert HEIC to PDF. One of the files may be invalid.": "HEIC, PDF'e dönüştürülemedi. Dosyalardan biri geçersiz olabilir.",
"Failed to convert PDF to greyscale. The file might be corrupted.": "PDF gri tonlamaya çevrilemedi. Dosya bozuk olabilir.",
"Failed to convert PDF. It may be image-based or corrupted.": "PDF dönüştürülemedi. Resim tabanlı ya da bozuk olabilir.",
"Failed to convert TIFF to PDF. One of the files may be invalid.": "TIFF, PDF'e dönüştürülemedi. Dosyalardan biri geçersiz olabilir.",
"Failed to copy metadata to clipboard.": "Üst veri panoya kopyalanamadı.",
"Failed to decrypt. Try the Decrypt tool instead.": "Şifre çözülemedi. Bunun yerine Şifre Çöz aracını deneyin.",
"Failed to delete layer": "Katman silinemedi",
"Failed to delete pages.": "Sayfalar silinemedi.",
"Failed to download the edited PDF.": "Düzenlenen PDF indirilemedi.",
"Failed to edit attachments.": "Ekler düzenlenemedi.",
"Failed to extract pages.": "Sayfalar çıkarılamadı.",
"Failed to generate PDF.": "PDF oluşturulamadı.",
"Failed to load PDF file.": "PDF dosyası yüklenemedi.",
"Failed to load PDF for cropping.": "Kırpmak için PDF yüklenemedi.",
"Failed to load PDF for preview.": "Önizleme için PDF yüklenemedi.",
"Failed to load PDF form viewer.": "PDF form görüntüleyici yüklenemedi.",
"Failed to load PDF:": "PDF yüklenemedi:",
"Failed to load attachments from PDF.": "PDF'teki ekler yüklenemedi.",
"Failed to load images:": "Resimler yüklenemedi:",
"Failed to load one or more PDF files": "Bir ya da birden çok PDF dosyası yüklenemedi",
"Failed to load one or more PDF files.": "Bir ya da birden çok PDF dosyası yüklenemedi.",
"Failed to load template.": "Şablon yüklenemedi.",
"Failed to load the PDF Editor.": "PDF düzenleyici yüklenemedi.",
"Failed to load the image processor. Please ensure your browser supports SharedArrayBuffer (requires HTTPS or localhost).": "Resim işleyici yüklenemedi. Tarayıcınız bu özelliği desteklemiyor olabilir.",
"Failed to merge PDFs. Please check that all files are valid and not password-protected.": "PDF'ler birleştirilemedi. Bütün dosyaların geçerli ve şifresiz olduğunu kontrol edin.",
"Failed to parse the certificate file.": "Sertifika dosyası okunamadı.",
"Failed to render page previews": "Sayfa önizlemeleri hazırlanamadı",
"Failed to render page previews.": "Sayfa önizlemeleri hazırlanamadı.",
"Failed to render page thumbnails": "Sayfa küçük resimleri hazırlanamadı",
"Failed to render page.": "Sayfa çizilemedi.",
"Failed to save PDF:": "PDF kaydedilemedi:",
"Failed to save changes.": "Değişiklikler kaydedilemedi.",
"Failed to save the new PDF. Check console for details.": "Yeni PDF kaydedilemedi.",
"Failed to toggle layer visibility": "Katman görünürlüğü değiştirilemedi",
"Failed to validate signatures. The file may be corrupted.": "İmzalar doğrulanamadı. Dosya bozuk olabilir.",
"Field name cannot be empty": "Alan adı boş olamaz",
"Fill in forms directly in the browser. Also supports XFA forms.": "Formları doğrudan tarayıcıda doldurun. XFA formlarını da destekler.",
"Fine-tune brightness, contrast, saturation and more.": "Parlaklık, karşıtlık, doygunluk ve daha fazlasını ayarlayın.",
"Flatten": "Düzleştir",
"Flattening PDF...": "PDF düzleştiriliyor...",
"Flattening and saving PDF...": "PDF düzleştirilip kaydediliyor...",
"Flattening multiple PDFs...": "PDF'ler düzleştiriliyor...",
"Flip the order of all pages in your document.": "Belgenizdeki bütün sayfaların sırasını ters çevirin.",
"Font": "Yazı tipi",
"Font to Outline": "Yazı Tipini Çizgiye Çevir",
"Full-featured PDF editor with page management.": "Sayfa yönetimi de olan tam donanımlı PDF düzenleyici.",
"Generate a table of contents page from PDF bookmarks.": "PDF yer imlerinden içindekiler sayfası oluşturun.",
"Generating High-Quality PDF...": "Yüksek kaliteli PDF hazırlanıyor...",
"Generating PDF...": "PDF hazırlanıyor...",
"Generating ZIP file...": "ZIP dosyası hazırlanıyor...",
"Header & Footer": "Üst Bilgi & Alt Bilgi",
"Header & Footer added successfully!": "Üst ve alt bilgi eklendi.",
"Image Input": "Resim girişi",
"Images": "Resimler",
"Include this file": "Bu dosyayı ekle",
"Incorrect password. Please try again.": "Şifre yanlış. Lütfen tekrar deneyin.",
"Initializing Ghostscript...": "Ghostscript hazırlanıyor...",
"Initializing PDF engine...": "PDF motoru hazırlanıyor...",
"Initializing PyMuPDF...": "PDF motoru hazırlanıyor...",
"Initializing decryption...": "Şifre çözme hazırlanıyor...",
"Initializing encryption...": "Şifreleme hazırlanıyor...",
"Initializing repair engine...": "Onarım motoru hazırlanıyor...",
"Insert an empty page anywhere in your PDF.": "PDF'inizin istediğiniz yerine boş sayfa ekleyin.",
"Insert page numbers into your document.": "Belgenize sayfa numarası ekleyin.",
"Inspect the hidden properties of your PDF.": "PDF'inizin gizli özelliklerini inceleyin.",
"Invalid File": "Geçersiz dosya",
"Invalid Group Size": "Geçersiz grup boyutu",
"Invalid Split Point": "Geçersiz bölme noktası",
"Inverting PDF colors...": "PDF renkleri ters çevriliyor...",
"Item 1": "Öğe 1",
"JSON Files": "JSON dosyaları",
"JSON to PDF": "JSON'dan PDF'e",
"Key (e.g., Department)": "Anahtar (örn. Bölüm)",
"Layer not found": "Katman bulunamadı",
"Leave blank for all pages": "Bütün sayfalar için boş bırakın",
"Linearize": "Doğrusallaştır",
"Lists": "Listeler",
"Load": "Yükle",
"Load system fonts…": "Sistem yazı tiplerini yükle…",
"Loading Engine...": "Motor yükleniyor...",
"Loading PDF Editor...": "PDF düzenleyici yükleniyor...",
"Loading PDF Text Editor...": "PDF metin düzenleyici yükleniyor...",
"Loading PDF converter...": "PDF dönüştürücü yükleniyor...",
"Loading PDF documents...": "PDF belgeleri yükleniyor...",
"Loading PDF engine...": "PDF motoru yükleniyor...",
"Loading PDF files...": "PDF dosyaları yükleniyor...",
"Loading PDF form...": "PDF formu yükleniyor...",
"Loading PDF processor...": "PDF işleyici yükleniyor...",
"Loading PDF viewer...": "PDF görüntüleyici yükleniyor...",
"Loading PDFs...": "PDF'ler yükleniyor...",
"Loading attachments...": "Ekler yükleniyor...",
"Loading engine...": "Motor yükleniyor...",
"Loading preview...": "Önizleme yükleniyor...",
"MOBI Files": "MOBI dosyaları",
"Make a PDF searchable and copyable.": "PDF'i aranabilir ve kopyalanabilir yapın.",
"Make form fields and annotations non-editable.": "Form alanlarını ve notları düzenlenemez yapın.",
"Make your PDF look like a scanned document.": "PDF'inizi taranmış belge gibi gösterin.",
"Markdown Files": "Markdown dosyaları",
"Merge PDFs by alternating pages from each PDF. Preserves Bookmarks.": "PDF'leri sayfaları sırayla karıştırarak birleştirin. Yer imlerini korur.",
"Merge, Split, Organize, Delete, Rotate, Add Blank Pages, Extract and Duplicate in a unified interface.": "Birleştirme, bölme, düzenleme, silme, döndürme, boş sayfa ekleme, çıkarma ve çoğaltma tek ekranda.",
"Merging PDFs...": "PDF'ler birleştiriliyor...",
"Metadata copied to clipboard as JSON.": "Üst veri JSON olarak panoya kopyalandı.",
"Metadata removed successfully!": "Üst veri kaldırıldı.",
"Metadata updated successfully!": "Üst veri güncellendi.",
"Missing File": "Eksik dosya",
"More": "Daha fazla",
"N-Up PDF created successfully!": "N'li PDF hazırlandı.",
"No PDF document loaded.": "Yüklü PDF belgesi yok.",
"No PDF file loaded.": "Yüklü PDF dosyası yok.",
"No PDFs could be processed.": "Hiçbir PDF işlenemedi.",
"No attachments found in this PDF.": "Bu PDF'te ek yok.",
"No attachments selected for removal.": "Kaldırmak için ek seçilmedi.",
"No blank pages detected in this PDF.": "Bu PDF'te boş sayfa bulunmadı.",
"No configurable settings for this node.": "Bu düğümün ayarı yok.",
"No embedded images were found in the selected PDF(s).": "Seçilen PDF'lerde resim bulunmadı.",
"No files or pages selected to merge.": "Birleştirmek için dosya ya da sayfa seçilmedi.",
"No items were selected for removal or none were found in the PDF.": "Kaldırmak için öğe seçilmedi ya da PDF'te bulunamadı.",
"No pages selected for removal.": "Kaldırmak için sayfa seçilmedi.",
"No tables were detected in this PDF.": "Bu PDF'te tablo bulunmadı.",
"No valid page numbers found.": "Geçerli sayfa numarası bulunamadı.",
"No valid pages to save.": "Kaydedilecek geçerli sayfa yok.",
"ODG Files": "ODG dosyaları",
"One PDF per page": "Her sayfa ayrı PDF",
"Optimize PDF for fast web viewing.": "PDF'i web'de hızlı açılacak şekilde iyileştirin.",
"Optimizing PDFs for web view (linearizing)...": "PDF'ler web için iyileştiriliyor...",
"Outline": "Çizgi",
"Overlay or underlay pages from one PDF onto another.": "Bir PDF'in sayfalarını ötekinin üstüne ya da altına yerleştirin.",
"PDF Files": "PDF dosyaları",
"PDF Input": "PDF girişi",
"PDF converted to CSV successfully!": "PDF, CSV'ye dönüştürüldü.",
"PDF converted to SVG successfully!": "PDF, SVG'ye dönüştürüldü.",
"PDF converted to greyscale successfully!": "PDF gri tonlamaya çevrildi.",
"PDF created successfully!": "PDF hazırlandı.",
"PDF decrypted successfully! Your download has started.": "PDF şifresi çözüldü. İndirme başladı.",
"PDF has been sanitized and downloaded.": "PDF temizlendi ve indirildi.",
"PDF organized successfully!": "PDF düzenlendi.",
"PDF restrictions removed successfully! The file is now fully editable and printable.": "PDF kısıtlamaları kaldırıldı. Dosya artık düzenlenebilir ve yazdırılabilir.",
"PDF split successfully!": "PDF bölündü.",
"PDF to DOCX": "PDF'ten DOCX'e",
"PDF to Images": "PDF'ten Resme",
"PDF to Markdown": "PDF'ten Markdown'a",
"PDF to PDF/A": "PDF'ten PDF/A'ya",
"PDF to XLSX": "PDF'ten XLSX'e",
"PDF with layer changes saved!": "Katman değişiklikleriyle PDF kaydedildi.",
"PDFs have been mixed successfully!": "PDF'ler karıştırıldı.",
"PDFs merged successfully!": "PDF'ler birleştirildi.",
"Package multiple PDF files into a ZIP archive.": "Birden çok PDF'i ZIP arşivinde toplayın.",
"Page Numbers": "Sayfa Numaraları",
"Page numbers added successfully!": "Sayfa numaraları eklendi.",
"Page sizes standardized successfully!": "Sayfa boyutları eşitlendi.",
"Pages Files": "Pages dosyaları",
"Pages combined successfully!": "Sayfalar birleştirildi.",
"Pages have been divided successfully!": "Sayfalar bölündü.",
"Pages have been reordered.": "Sayfalar yeniden sıralandı.",
"Pages have been reversed successfully!": "Sayfalar ters çevrildi.",
"Password": "Şifre",
"Password Required": "Şifre gerekli",
"Password for all files": "Bütün dosyalar için şifre",
"Path Stroke": "Çizgi",
"Please draw a rectangle on at least one page to select the crop area.": "Kırpılacak alanı seçmek için en az bir sayfada dikdörtgen çizin.",
"Please ensure all page numbers in the order are unique.": "Sıradaki her sayfa numarası bir kez geçmeli.",
"Please enter a layer name": "Lütfen bir katman adı yazın",
"Please enter a name.": "Lütfen bir ad yazın.",
"Please enter a page order.": "Lütfen bir sayfa sırası yazın.",
"Please enter a password": "Lütfen bir şifre yazın",
"Please enter a user password.": "Lütfen bir kullanıcı şifresi yazın.",
"Please enter a valid number of pages (1 or more).": "Lütfen geçerli bir sayfa sayısı yazın (1 ya da daha fazla).",
"Please enter a valid page range (e.g., 1-5, 8, 11-13).": "Lütfen geçerli bir sayfa aralığı yazın (örn. 1-5, 8, 11-13).",
"Please enter page numbers to extract.": "Lütfen çıkarılacak sayfa numaralarını yazın.",
"Please enter positive numbers.": "Lütfen pozitif sayılar yazın.",
"Please enter some Markdown text.": "Lütfen biraz Markdown metni yazın.",
"Please enter some text to convert.": "Lütfen dönüştürülecek bir metin yazın.",
"Please enter the PDF password.": "Lütfen PDF şifresini yazın.",
"Please load a PDF first.": "Lütfen önce bir PDF yükleyin.",
"Please select PDF files to create a ZIP archive.": "ZIP arşivi için lütfen PDF dosyaları seçin.",
"Please select a .pem, .crt, .cer, or .der certificate file.": "Lütfen .pem, .crt, .cer ya da .der sertifika dosyası seçin.",
"Please select a PDF file.": "Lütfen bir PDF dosyası seçin.",
"Please select a valid PDF file.": "Lütfen geçerli bir PDF dosyası seçin.",
"Please select an area on at least one page to crop.": "Lütfen en az bir sayfada kırpılacak alanı seçin.",
"Please select an area to crop first.": "Lütfen önce kırpılacak alanı seçin.",
"Please select an area to crop.": "Lütfen kırpılacak alanı seçin.",
"Please select at least one BMP file.": "Lütfen en az bir BMP dosyası seçin.",
"Please select at least one CSV file.": "Lütfen en az bir CSV dosyası seçin.",
"Please select at least one Excel file.": "Lütfen en az bir Excel dosyası seçin.",
"Please select at least one HEIC file.": "Lütfen en az bir HEIC dosyası seçin.",
"Please select at least one JPG file.": "Lütfen en az bir JPG dosyası seçin.",
"Please select at least one JPG or JPEG2000 image.": "Lütfen en az bir JPG ya da JPEG2000 resmi seçin.",
"Please select at least one ODT file.": "Lütfen en az bir ODT dosyası seçin.",
"Please select at least one PDF file.": "Lütfen en az bir PDF dosyası seçin.",
"Please select at least one PowerPoint file.": "Lütfen en az bir PowerPoint dosyası seçin.",
"Please select at least one RTF file.": "Lütfen en az bir RTF dosyası seçin.",
"Please select at least one SVG file.": "Lütfen en az bir SVG dosyası seçin.",
"Please select at least one TIFF file.": "Lütfen en az bir TIFF dosyası seçin.",
"Please select at least one Word document.": "Lütfen en az bir Word belgesi seçin.",
"Please select at least one file to attach.": "Lütfen eklenecek en az bir dosya seçin.",
"Please select at least one image file.": "Lütfen en az bir resim dosyası seçin.",
"Please select at least one text file.": "Lütfen en az bir metin dosyası seçin.",
"Please select one or more PDF files.": "Lütfen bir ya da birden çok PDF dosyası seçin.",
"Please select pages to delete.": "Lütfen silinecek sayfaları seçin.",
"Please specify a page range for page-level attachments.": "Sayfa düzeyindeki ekler için lütfen bir sayfa aralığı yazın.",
"Please upload PDF files.": "Lütfen PDF dosyaları yükleyin.",
"Please upload a .docx file first.": "Lütfen önce bir .docx dosyası yükleyin.",
"Please upload a PDF file first.": "Lütfen önce bir PDF dosyası yükleyin.",
"Please upload a PDF file.": "Lütfen bir PDF dosyası yükleyin.",
"Please upload a PDF first.": "Lütfen önce bir PDF yükleyin.",
"Please upload a valid PDF file.": "Lütfen geçerli bir PDF dosyası yükleyin.",
"Please upload at least one PDF file.": "Lütfen en az bir PDF dosyası yükleyin.",
"Please upload at least two PDF files to alternate and mix.": "Karıştırmak için lütfen en az iki PDF dosyası yükleyin.",
"Please upload both a base PDF and an overlay/underlay PDF.": "Lütfen hem ana PDF'i hem de üste/alta konacak PDF'i yükleyin.",
"Please upload valid PDF files.": "Lütfen geçerli PDF dosyaları yükleyin.",
"Please use the Download button in the PDF viewer toolbar above.": "Lütfen yukarıdaki PDF görüntüleyici çubuğundaki İndir düğmesini kullanın.",
"Please wait for the PDF viewer to load.": "Lütfen PDF görüntüleyicinin yüklenmesini bekleyin.",
"Please wait for the form to finish loading.": "Lütfen formun yüklenmesini bekleyin.",
"Posterize": "Poster Yap",
"Posterizing PDF...": "PDF poster boyutuna bölünüyor...",
"Pre-flattening PDF...": "PDF hazırlanıyor (düzleştirme)...",
"Preparing PDF export...": "PDF indirmeye hazırlanıyor...",
"Preparing conversion...": "Dönüştürme hazırlanıyor...",
"Preparing download...": "İndirme hazırlanıyor...",
"Preparing preview...": "Önizleme hazırlanıyor...",
"Presentations": "Sunular",
"Processing PDF permissions...": "PDF izinleri işleniyor...",
"Processing attachments...": "Ekler işleniyor...",
"Processing images...": "Resimler işleniyor...",
"Processing multiple PDFs...": "PDF'ler işleniyor...",
"Publisher Files": "Publisher dosyaları",
"Rasterize": "Resme Çevir",
"Reading PDF...": "PDF okunuyor...",
"Reading encrypted PDF...": "Şifreli PDF okunuyor...",
"Reading files...": "Dosyalar okunuyor...",
"Reading layer configuration...": "Katman ayarları okunuyor...",
"Rearrange pages for double-sided booklet printing.": "Sayfaları çift taraflı kitapçık baskısı için dizin.",
"Recover data from corrupted or damaged PDF files.": "Bozuk ya da hasarlı PDF dosyalarındaki veriyi kurtarın.",
"Redact": "Karart",
"Reduce the file size of your PDF.": "PDF'inizin dosya boyutunu küçültün.",
"Remove": "Kaldır",
"Remove All Attachments": "Bütün Ekleri Kaldır",
"Remove Blank Pages": "Boş Sayfaları Kaldır",
"Remove attachment": "Eki kaldır",
"Remove file": "Dosyayı kaldır",
"Remove metadata, annotations, scripts, and more.": "Üst veri, notlar, betikler ve daha fazlasını kaldırın.",
"Remove password protection and security restrictions associated with digitally signed PDF files.": "Dijital imzalı PDF'lerdeki şifre korumasını ve güvenlik kısıtlamalarını kaldırın.",
"Remove specific pages from your document.": "Belgenizden istediğiniz sayfaları kaldırın.",
"Removing all metadata...": "Bütün üst veri kaldırılıyor...",
"Removing annotations...": "Notlar kaldırılıyor...",
"Removing redacted text from document data...": "Karartılan yazı belge verisinden siliniyor...",
"Removing restrictions...": "Kısıtlamalar kaldırılıyor...",
"Rendering page previews...": "Sayfa önizlemeleri hazırlanıyor...",
"Reorder front/back scan blocks into collated page order in one PDF.": "Ön/arka taranmış sayfaları doğru sırayla tek PDF'te birleştirin.",
"Repair": "Onar",
"Retry Failed": "Başarısızları Yeniden Dene",
"Reversing page order...": "Sayfa sırası ters çevriliyor...",
"Rotate": "Döndür",
"Rotate +90°": "+90° Döndür",
"Rotations applied successfully!": "Döndürmeler uygulandı.",
"Running Condense compression...": "Sıkıştırılıyor (Condense)...",
"Running Photon compression...": "Sıkıştırılıyor (Photon)...",
"SVG Files": "SVG dosyaları",
"SVG to PDF": "SVG'den PDF'e",
"Sanitize": "Temizle",
"Sanitizing PDF...": "PDF temizleniyor...",
"Save a selection of pages as new files.": "Seçtiğiniz sayfaları yeni dosyalar olarak kaydedin.",
"Saving PDF with layer changes...": "Katman değişiklikleriyle PDF kaydediliyor...",
"Scanner Effect": "Tarayıcı Efekti",
"Scanner effect applied successfully!": "Tarayıcı efekti uygulandı.",
"Search languages...": "Dil ara...",
"Set or change user permissions on a PDF.": "PDF'teki kullanıcı izinlerini ayarlayın ya da değiştirin.",
"Signed PDF downloaded successfully!": "İmzalı PDF indirildi.",
"Signed PDF saved successfully!": "İmzalı PDF kaydedildi.",
"Skip this file": "Bu dosyayı atla",
"Some files were skipped because they are not supported images.": "Bazı dosyalar desteklenen resim olmadığı için atlandı.",
"Some files were skipped. Only BMP files are allowed.": "Bazı dosyalar atlandı. Yalnız BMP dosyaları kabul edilir.",
"Some files were skipped. Only HEIC/HEIF files are allowed.": "Bazı dosyalar atlandı. Yalnız HEIC/HEIF dosyaları kabul edilir.",
"Some files were skipped. Only JPG, JPEG, JP2, and JPX files are allowed.": "Bazı dosyalar atlandı. Yalnız JPG, JPEG, JP2 ve JPX dosyaları kabul edilir.",
"Some files were skipped. Only PDF files are allowed.": "Bazı dosyalar atlandı. Yalnız PDF dosyaları kabul edilir.",
"Some files were skipped. Only PNG images are allowed.": "Bazı dosyalar atlandı. Yalnız PNG resimleri kabul edilir.",
"Some files were skipped. Only SVG graphics are allowed.": "Bazı dosyalar atlandı. Yalnız SVG çizimleri kabul edilir.",
"Some files were skipped. Only TIFF files are allowed.": "Bazı dosyalar atlandı. Yalnız TIFF dosyaları kabul edilir.",
"Some files were skipped. Only WebP images are allowed.": "Bazı dosyalar atlandı. Yalnız WebP resimleri kabul edilir.",
"Some files were skipped. Only supported image formats are allowed.": "Bazı dosyalar atlandı. Yalnız desteklenen resim biçimleri kabul edilir.",
"Some files were skipped. Only text files are allowed.": "Bazı dosyalar atlandı. Yalnız metin dosyaları kabul edilir.",
"Some pages could not be processed. Please try again.": "Bazı sayfalar işlenemedi. Lütfen tekrar deneyin.",
"Some redaction marks could not be applied, so the file was not downloaded. Apply or remove them in the editor and try again.": "Bazı karartma işaretleri uygulanamadığı için dosya indirilmedi. Düzenleyicide uygulayın ya da kaldırın, sonra tekrar deneyin.",
"Spacing": "Aralık",
"Split a large page into multiple smaller pages.": "Büyük bir sayfayı birden çok küçük sayfaya bölün.",
"Splitting PDF pages...": "PDF sayfaları bölünüyor...",
"Splitting PDF...": "PDF bölünüyor...",
"Spreadsheets": "Tablolar",
"Stamp text or an image over your PDF pages.": "PDF sayfalarınızın üstüne yazı ya da resim damgalayın.",
"Standardize all pages to a uniform size.": "Bütün sayfaları aynı boyuta getirin.",
"Standardizing pages...": "Sayfalar eşitleniyor...",
"Stitch all pages into one continuous scroll.": "Bütün sayfaları tek uzun sayfada birleştirin.",
"Strip comments, highlights, and links.": "Yorumları, vurguları ve bağlantıları kaldırın.",
"Strip hidden data from your PDF.": "PDF'inizdeki gizli verileri temizleyin.",
"Successfully extracted PDF for AI/LLM use.": "PDF yapay zekâ kullanımı için hazırlandı.",
"Supported: JPG, PNG, BMP, GIF, TIFF, WebP, HEIC, PSD, SVG, PNM, PGM, PBM, PPM, PAM, JXR, JPX, JP2": "Desteklenenler: JPG, PNG, BMP, GIF, TIFF, WebP, HEIC, PSD, SVG, PNM, PGM, PBM, PPM, PAM, JXR, JPX, JP2",
"Table of Contents": "İçindekiler",
"Text Color": "Yazı Rengi",
"Text Files": "Metin dosyaları",
"Text color changed successfully!": "Yazı rengi değiştirildi.",
"Text converted to PDF successfully!": "Metin PDF'e dönüştürüldü.",
"Text extracted successfully!": "Metin çıkarıldı.",
"Text to PDF": "Metinden PDF'e",
"The PDF file(s) do not contain any attachments to extract.": "PDF dosyalarında çıkarılacak ek yok.",
"The PDF viewer is still initializing.": "PDF görüntüleyici hâlâ hazırlanıyor.",
"The current password you entered is incorrect. Please try again.": "Yazdığınız mevcut şifre yanlış. Lütfen tekrar deneyin.",
"The password you entered is incorrect. Please try again.": "Yazdığınız şifre yanlış. Lütfen tekrar deneyin.",
"The specified page order is incomplete or contains invalid page numbers. Please ensure you provide a new position for every original page.": "Yazılan sayfa sırası eksik ya da geçersiz numara içeriyor. Her sayfa için yeni bir yer yazdığınızdan emin olun.",
"This PDF is password-protected. Please enter the current password to proceed.": "Bu PDF şifreli. Devam etmek için mevcut şifreyi yazın.",
"Timestamp": "Zaman Damgası",
"Toggle sync scroll": "Birlikte kaydırmayı aç/kapat",
"Trim the margins of every page in your PDF.": "PDF'inizdeki her sayfanın kenar boşluklarını kırpın.",
"Turn pages in 90-degree increments.": "Sayfaları 90 derecelik adımlarla döndürün.",
"Unable to decrypt the PDF with the provided password.": "Yazılan şifreyle PDF'in şifresi çözülemedi.",
"Unable to repair any of the uploaded PDF files.": "Yüklenen PDF dosyalarının hiçbiri onarılamadı.",
"Unlock All": "Hepsinin Kilidini Aç",
"Updating metadata...": "Üst veri güncelleniyor...",
"Value (e.g., Marketing)": "Değer (örn. Pazarlama)",
"Verify digital signatures and view certificate details.": "Dijital imzaları doğrulayın ve sertifika ayrıntılarını görün.",
"View or remove attachments in your PDF.": "PDF'inizdeki ekleri görün ya da kaldırın.",
"View, toggle, add, and delete OCG layers in your PDF.": "PDF'inizdeki katmanları görün, açıp kapatın, ekleyin ve silin.",
"Visio Files": "Visio dosyaları",
"WPS Files": "WPS dosyaları",
"Watermark": "Filigran",
"Watermark added successfully!": "Filigran eklendi.",
"Word Documents": "Word belgeleri",
"WordPerfect Files": "WordPerfect dosyaları",
"Worker error occurred. Check console for details.": "İşlem sırasında bir hata oluştu.",
"Workflow completed": "İş akışı tamamlandı",
"XML Files": "XML dosyaları",
"XPS Files": "XPS dosyaları",
"You cannot delete the last page of the document.": "Belgenin son sayfası silinemez.",
"Your PDF has been cropped and the download has started.": "PDF'iniz kırpıldı, indirme başladı.",
"Your PDF has been posterized.": "PDF'iniz poster boyutuna bölündü.",
"Your workflow needs at least one input node and one output node to run.": "İş akışının çalışması için en az bir giriş ve bir çıkış düğümü gerekir.",
"ZIP archive created successfully!": "ZIP arşivi oluşturuldu.",
"e.g. dd/mm/yyyy HH:MM:ss": "örn. gg/aa/yyyy SS:DD:ss"
};
  var ATTR = ['placeholder', 'title', 'aria-label'];

  /* İçinde sayı ya da dosya adı geçen İngilizce iletiler (ör. "Pages (e.g., 1-3, 5) - Total: 16").
     Birebir sözlükte bulunamayan yazı bu kalıplarla denenir; uzun (daha özel) kalıp önce. */
  var KALIP = [
[
"^The number of pages specified \\((\\d+)\\) does not match the current number of pages in the document \\((\\d+)\\)\\. Please provide a complete ordering for all pages\\.$",
"Yazılan sayfa sayısı ($1) belgedeki sayfa sayısıyla ($2) aynı değil. Lütfen bütün sayfalar için tam bir sıra yazın."
],
[
"^The PDF was downloaded, but these steps could not be completed: (.+?)\\. The content they cover may still be in the file\\.$",
"PDF indirildi, ancak şu adımlar tamamlanamadı: $1. Bu adımların kapsadığı içerik dosyada kalmış olabilir."
],
[
"^Failed to timestamp PDF: (.+?)  Please try a different TSA server or check your internet connection\\.$",
"PDF'e zaman damgası eklenemedi: $1 Başka bir TSA sunucusu deneyin ya da internet bağlantınızı kontrol edin."
],
[
"^Could not generate a preview\\. The file may be corrupt or contain unsupported features\\. Error: (.+?)$",
"Önizleme oluşturulamadı. Dosya bozuk olabilir ya da desteklenmeyen özellikler içerebilir. Hata: $1"
],
[
"^The PDF has (\\d+) pages, which is not evenly divisible by (.+?)\\. The last PDF will contain (.+?) page\\(s\\)\\.$",
"PDF $1 sayfa; $2'ye tam bölünmüyor. Son PDF $3 sayfa olacak."
],
[
"^Field name \"(.+?)\" already exists in this (?:PDF|form)\\. Please try using a unique name\\.$",
"\"$1\" alan adı zaten var. Lütfen farklı bir ad kullanın."
],
[
"^Method: (.+?)\\. Could not reduce file size further\\. Original: (.+?), New: (.+?)\\.$",
"Yöntem: $1. Dosya daha fazla küçültülemedi. Önce: $2, sonra: $3."
],
[
"^Enter 0 to insert at the beginning, or (\\d+) to insert at the end\\.$",
"Başa eklemek için 0, sona eklemek için $1 yazın."
],
[
"^Compressed (\\d+) PDF\\(s\\)\\. Total size reduced from (.+?) to (.+?) \\(Saved (\\d+)%\\)\\.$",
"$1 PDF sıkıştırıldı. Toplam boyut $2 → $3 (%$4 küçüldü)."
],
[
"^Found (\\d+) blank page\\(s\\)\\. Click on a page to deselect it\\.$",
"$1 boş sayfa bulundu. Seçimi kaldırmak için sayfaya dokunun."
],
[
"^Successfully converted (\\d+) PSD files to a single PDF\\.$",
"$1 PSD dosyası tek bir PDF'e dönüştürüldü."
],
[
"^Successfully converted (\\d+) PowerPoint file\\(s\\) to PDF\\.$",
"$1 PowerPoint dosyası PDF'e dönüştürüldü."
],
[
"^Method: (.+?)\\. File size reduced from (.+?) to (.+?) \\(Saved (.+?)%\\)\\.$",
"Yöntem: $1. Dosya boyutu $2 → $3 (%$4 küçüldü)."
],
[
"^Please select at least one (.+?) file \\(\\.eml or \\.msg\\)\\.$",
"Lütfen en az bir $1 dosyası seçin (.eml ya da .msg)."
],
[
"^Successfully converted (\\d+) Word document\\(s\\) to PDF\\.$",
"$1 Word belgesi PDF'e dönüştürüldü."
],
[
"^An error occurred during rasterization\\. Error: (.+?)$",
"Görüntüye çevirme sırasında bir hata oluştu. Hata: $1"
],
[
"^Bates numbers applied successfully! \\((\\d+) through (\\d+)\\)$",
"Bates numaraları eklendi ($1 – $2)."
],
[
"^Successfully extracted (.+?) PDF\\(s\\) for AI/LLM use\\.$",
"$1 PDF yapay zekâ kullanımı için hazırlandı."
],
[
"^An error occurred during compression\\. Error: (.+?)$",
"Sıkıştırma sırasında bir hata oluştu. Hata: $1"
],
[
"^Successfully converted (\\d+) Excel file\\(s\\) to PDF\\.$",
"$1 Excel dosyası PDF'e dönüştürüldü."
],
[
"^An error occurred during conversion\\. Error: (.+?)$",
"Dönüştürme sırasında bir hata oluştu. Hata: $1"
],
[
"^An error occurred during extraction\\. Error: (.+?)$",
"Çıkarma sırasında bir hata oluştu. Hata: $1"
],
[
"^Successfully converted (\\d+) CSV file\\(s\\) to PDF\\.$",
"$1 CSV dosyası PDF'e dönüştürüldü."
],
[
"^Successfully converted (\\d+) ODT file\\(s\\) to PDF\\.$",
"$1 ODT dosyası PDF'e dönüştürüldü."
],
[
"^Successfully converted (\\d+) PDF\\(s\\) to Markdown\\.$",
"$1 PDF, Markdown'a dönüştürüldü."
],
[
"^Successfully converted (\\d+) RTF file\\(s\\) to PDF\\.$",
"$1 RTF dosyası PDF'e dönüştürüldü."
],
[
"^Successfully converted (\\d+) (.+?) file\\(s\\) to PDF\\.$",
"$1 $2 dosyası PDF'e dönüştürüldü."
],
[
"^Successfully rasterized (.+?) PDF\\(s\\) at (.+?) DPI\\.$",
"$1 PDF $2 DPI ile görüntüye çevrildi."
],
[
"^An error occurred during sanitization: (.+?)$",
"Temizleme sırasında bir hata oluştu: $1"
],
[
"^Successfully converted (\\d+) PDF\\(s\\) to DOCX\\.$",
"$1 PDF, DOCX'e dönüştürüldü."
],
[
"^Wrong password or failed to decrypt \"(.+?)\"\\.$",
"Şifre yanlış ya da \"$1\" çözülemedi."
],
[
"^(\\d+) attachment\\(s\\) extracted successfully!$",
"$1 ek çıkarıldı."
],
[
"^Please enter a number between 0 and (\\d+)\\.$",
"Lütfen 0 ile $1 arasında bir sayı girin."
],
[
"^Repaired (\\d+) file\\(s\\)\\. Failed to repair: (.+?)$",
"$1 dosya onarıldı. Onarılamayan: $2"
],
[
"^Successfully converted (\\d+) files to PDF\\.$",
"$1 dosya PDF'e dönüştürüldü."
],
[
"^Removed (\\d+) blank page\\(s\\) successfully!$",
"$1 boş sayfa kaldırıldı."
],
[
"^Successfully converted (.+?) to Markdown\\.$",
"$1, Markdown'a dönüştürüldü."
],
[
"^Successfully rasterized PDF at (.+?) DPI\\.$",
"PDF $1 DPI ile görüntüye çevrildi."
],
[
"^Successfully converted (\\d+) PDF\\(s\\) to (.+?)\\.$",
"$1 PDF, $2 biçimine dönüştürüldü."
],
[
"^Compressed (\\d+) PDF\\(s\\)\\. Total size: (.+?)\\.$",
"$1 PDF sıkıştırıldı. Toplam boyut: $2."
],
[
"^Converted (\\d+) files \\((\\d+) pages\\) to SVG!$",
"$1 dosya ($2 sayfa) SVG'ye dönüştürüldü."
],
[
"^Please select at least one (.+?) file\\.$",
"Lütfen en az bir $1 dosyası seçin."
],
[
"^Extracted (\\d+) page\\(s\\) successfully!$",
"$1 sayfa çıkarıldı."
],
[
"^Extracting text from file (\\d+)/(\\d+): (.+?)\\.\\.\\.$",
"Metin çıkarılıyor, dosya $1/$2: $3..."
],
[
"^Failed to convert PDF to Excel\\. (.+?)$",
"PDF, Excel'e dönüştürülemedi. $1"
],
[
"^Successfully converted (.+?) to DOCX\\.$",
"$1, DOCX'e dönüştürüldü."
],
[
"^(\\d+) file\\(s\\) attached successfully\\.$",
"$1 dosya eklendi."
],
[
"^Added (\\d+) blank page(?:s|) successfully!$",
"$1 boş sayfa eklendi."
],
[
"^Extracted (\\d+) tables successfully!$",
"$1 tablo çıkarıldı."
],
[
"^Extracted text from (\\d+) PDF files!$",
"$1 PDF dosyasından metin çıkarıldı."
],
[
"^Failed to convert text to PDF\\. (.+?)$",
"Metin PDF'e dönüştürülemedi. $1"
],
[
"^Successfully converted (.+?) to PDF\\.$",
"$1, PDF'e dönüştürüldü."
],
[
"^Deleted (\\d+) page\\(s\\) successfully!$",
"$1 sayfa silindi."
],
[
"^Failed to convert PDF to CSV\\. (.+?)$",
"PDF, CSV'ye dönüştürülemedi. $1"
],
[
"^Failed to convert PDF to SVG\\. (.+?)$",
"PDF, SVG'ye dönüştürülemedi. $1"
],
[
"^Pages \\(e\\.g\\., 1\\-3, 5\\) \\- Total: (\\d+)$",
"Sayfalar (örn. 1-3, 5) - Toplam: $1"
],
[
"^Rendering preview for page (\\d+)\\.\\.\\.$",
"Sayfa $1 önizlemesi hazırlanıyor..."
],
[
"^Booklet created with (\\d+) sheets!$",
"Kitapçık $1 yaprak olarak hazırlandı."
],
[
"^Extracted (\\d+) table\\(s\\) to Excel!$",
"$1 tablo Excel'e aktarıldı."
],
[
"^(.+?) • Could not load page count$",
"$1 • Sayfa sayısı alınamadı"
],
[
"^Rasterized (.+?) PDF\\(s\\), failed (.+?)\\.$",
"$1 PDF görüntüye çevrildi, $2 başarısız."
],
[
"^Successfully converted (.+?) to (.+?)\\.$",
"$1, $2 biçimine dönüştürüldü."
],
[
"^Extracted (.+?) PDF\\(s\\), failed (.+?)\\.$",
"$1 PDF çıkarıldı, $2 başarısız."
],
[
"^Found (\\d+) image\\(s\\) in (\\d+) PDF\\(s\\)\\.$",
"$2 PDF içinde $1 resim bulundu."
],
[
"^Indexing PDF 1 page (\\d+) of (\\d+)\\.\\.\\.$",
"1. PDF taranıyor: sayfa $1/$2..."
],
[
"^Indexing PDF 2 page (\\d+) of (\\d+)\\.\\.\\.$",
"2. PDF taranıyor: sayfa $1/$2..."
],
[
"^Extracting images from (.+?)\\.\\.\\.$",
"$1 içinden resimler çıkarılıyor..."
],
[
"^Failed to extract tables\\. (.+?)$",
"Tablolar çıkarılamadı. $1"
],
[
"^Loading comparison (\\d+) of (\\d+)\\.\\.\\.$",
"Karşılaştırma yükleniyor: $1/$2..."
],
[
"^PDF (.+?) applied successfully\\.$",
"PDF $1 uygulandı."
],
[
"^Removing (\\d+) blank page\\(s\\)\\.\\.\\.$",
"$1 boş sayfa kaldırılıyor..."
],
[
"^Rendering page previews: (\\d+)/(\\d+)$",
"Sayfa önizlemeleri hazırlanıyor: $1/$2"
],
[
"^Could not add blank page(?:s|)\\.$",
"Boş sayfa eklenemedi."
],
[
"^Extracting (.+?) for AI \\((\\d+)/(\\d+)\\)\\.\\.\\.$",
"$1 yapay zekâ için hazırlanıyor ($2/$3)..."
],
[
"^Converted (\\d+) pages to SVG!$",
"$1 sayfa SVG'ye dönüştürüldü."
],
[
"^Extracting text from (.+?)\\.\\.\\.$",
"$1 içinden metin çıkarılıyor..."
],
[
"^Failed to attach files: (.+?)$",
"Dosyalar eklenemedi: $1"
],
[
"^Converting page (\\d+) of (\\d+)\\.\\.\\.$",
"Sayfa dönüştürülüyor: $1/$2..."
],
[
"^Flattening page (\\d+) of (\\d+)\\.\\.\\.$",
"Sayfa düzleştiriliyor: $1/$2..."
],
[
"^Loading layers from (.+?)\\.\\.\\.$",
"$1 katmanları yükleniyor..."
],
[
"^Processing file (\\d+) of (\\d+)\\.\\.\\.$",
"Dosya işleniyor: $1/$2..."
],
[
"^Processing page (\\d+) of (\\d+)\\.\\.\\.$",
"Sayfa işleniyor: $1/$2..."
],
[
"^Running OCR on page (\\d+)\\.\\.\\.$",
"Sayfa $1 üzerinde metin tanıma (OCR) çalışıyor..."
],
[
"^(\\d+) Files Need a Password$",
"$1 dosya şifre istiyor"
],
[
"^Failed to deskew PDF: (.+?)$",
"PDF'in eğikliği düzeltilemedi: $1"
],
[
"^Failed to load files: (.+?)$",
"Dosyalar yüklenemedi: $1"
],
[
"^(\\d+) PDF file\\(s\\) selected$",
"$1 PDF dosyası seçildi"
],
[
"^Adding (\\d+) blank page(?:s|)\\.\\.\\.$",
"$1 boş sayfa ekleniyor..."
],
[
"^Extracting (.+?) for AI\\.\\.\\.$",
"$1 yapay zekâ için hazırlanıyor..."
],
[
"^Scanning page (\\d+) of (\\d+)\\.\\.\\.$",
"Sayfa taranıyor: $1/$2..."
],
[
"^(\\d+) file(?:s|) • (\\d+) total pages$",
"$1 dosya • toplam $2 sayfa"
],
[
"^An error occurred: (.+?)\\.$",
"Bir hata oluştu: $1."
],
[
"^Processing sheet (\\d+)\\.\\.\\.$",
"Sayfa (tablo) $1 işleniyor..."
],
[
"^Wrong password for: (.+?)$",
"Şifre yanlış: $1"
],
[
"^(.+?) • Loading pages\\.\\.\\.$",
"$1 • Sayfalar yükleniyor..."
],
[
"^(\\d+) PDF files selected$",
"$1 PDF dosyası seçildi"
],
[
"^An error occurred: (.+?)$",
"Bir hata oluştu: $1"
],
[
"^Deskewed (\\d+) file\\(s\\)\\. (?:Downloads started for all files\\.|)$",
"$1 dosyanın eğikliği düzeltildi."
],
[
"^Rasterizing (.+?) \\((\\d+)/(\\d+)\\)\\.\\.\\.$",
"$1 görüntüye çevriliyor ($2/$3)..."
],
[
"^Template \"(.+?)\" loaded\\.$",
"\"$1\" şablonu yüklendi."
],
[
"^Unlock Remaining \\((.+?)\\)$",
"Kalanların kilidini aç ($1)"
],
[
"^Compressing (\\d+)/(\\d+): (.+?)\\.\\.\\.$",
"Sıkıştırılıyor $1/$2: $3..."
],
[
"^Decrypting (.+?) \\((\\d+)/(\\d+)\\)\\.\\.\\.$",
"$1 şifresi çözülüyor ($2/$3)..."
],
[
"^Optimizing (.+?) \\((\\d+)/(\\d+)\\)\\.\\.\\.$",
"$1 iyileştiriliyor ($2/$3)..."
],
[
"^Rendering Page (\\d+)\\.\\.\\.$",
"Sayfa $1 çiziliyor..."
],
[
"^Template \"(.+?)\" saved\\.$",
"\"$1\" şablonu kaydedildi."
],
[
"^Converting (\\d+)/(\\d+): (.+?)\\.\\.\\.$",
"Dönüştürülüyor $1/$2: $3..."
],
[
"^Decrypting (\\d+) of (\\d+): (.+?)$",
"Şifre çözülüyor $1/$2: $3"
],
[
"^Flattening (\\d+)/(\\d+): (.+?)\\.\\.\\.$",
"Düzleştiriliyor $1/$2: $3..."
],
[
"^Processing (\\d+)/(\\d+): (.+?)\\.\\.\\.$",
"İşleniyor $1/$2: $3..."
],
[
"^Repairing (.+?) \\((\\d+)/(\\d+)\\)\\.\\.\\.$",
"$1 onarılıyor ($2/$3)..."
],
[
"^Reversing (.+?) \\((\\d+)/(\\d+)\\)\\.\\.\\.$",
"$1 ters çevriliyor ($2/$3)..."
],
[
"^Validating (\\d+) of (\\d+): (.+?)$",
"Doğrulanıyor $1/$2: $3"
],
[
"^Loading page (\\d+)\\.\\.\\.$",
"Sayfa $1 yükleniyor..."
],
[
"^Page (\\d+) attachment$",
"Sayfa $1 eki"
],
[
"^Processed (\\d+) PDFs\\.$",
"$1 PDF işlendi."
],
[
"^Mermaid Error: (.+?)$",
"Mermaid hatası: $1"
],
[
"^Rasterizing (.+?)\\.\\.\\.$",
"$1 görüntüye çevriliyor..."
],
[
"^Reading (.+?) \\((\\d+)/(\\d+)\\)\\.\\.\\.$",
"$1 okunuyor ($2/$3)..."
],
[
"^Adding (.+?) \\((\\d+)/(\\d+)\\)\\.\\.\\.$",
"$1 ekleniyor ($2/$3)..."
],
[
"^Converting (.+?)\\.\\.\\.$",
"$1 dönüştürülüyor..."
],
[
"^File (\\d+)/(\\d+): Page (\\d+)/(\\d+)$",
"Dosya $1/$2: Sayfa $3/$4"
],
[
"^(.+?) • Loading\\.\\.\\.$",
"$1 • Yükleniyor..."
],
[
"^Deskewing (.+?)\\.\\.\\.$",
"$1 düzeltiliyor..."
],
[
"^Repairing (.+?)\\.\\.\\.$",
"$1 onarılıyor..."
],
[
"^Applying (.+?)\\.\\.\\.$",
"$1 uygulanıyor..."
],
[
"^(.+?) \\((.+?), (\\d+) pages\\)$",
"$1 ($2, $3 sayfa)"
],
[
"^Loading (.+?)\\.\\.\\.$",
"$1 yükleniyor..."
],
[
"^Parsing (.+?)\\.\\.\\.$",
"$1 okunuyor..."
],
[
"^(.+?) • (\\d+) pages$",
"$1 • $2 sayfa"
],
[
"^(.+?) • (.+?) pages$",
"$1 • $2 sayfa"
],
[
"^Page (\\d+) of (\\d+)$",
"Sayfa $1 / $2"
],
[
"^File (\\d+)/(\\d+): (.+?)$",
"Dosya $1/$2: $3"
],
[
"^Page (\\d+) / (\\d+)$",
"Sayfa $1 / $2"
],
[
"^(\\d+) node(?:s|)$",
"$1 düğüm"
],
[
"^OCR: (.+?)$",
"OCR: $1"
],
[
"^Page (\\d+)$",
"Sayfa $1"
]
].map(function (k) { return [new RegExp(k[0]), k[1]]; });
  function kalipla(t) {
    if (t.length > 400) return null;
    for (var i = 0; i < KALIP.length; i++) if (KALIP[i][0].test(t)) return t.replace(KALIP[i][0], KALIP[i][1]);
    return null;
  }
  function cevirMetin(n) {
    var v = n.nodeValue; if (!v) return;
    var t = v.replace(/\s+/g, ' ').trim(); if (!t) return;
    var c = SOZ.hasOwnProperty(t) ? SOZ[t] : kalipla(t); if (c === null || c === t) return;
    var bas = v.match(/^\s*/)[0], son = v.match(/\s*$/)[0];
    n.nodeValue = bas + c + son;
  }
  function cevirOge(el) {
    for (var i = 0; i < ATTR.length; i++) {
      var a = el.getAttribute && el.getAttribute(ATTR[i]);
      if (a) { var t = a.replace(/\s+/g, ' ').trim(); var c = SOZ.hasOwnProperty(t) ? SOZ[t] : kalipla(t); if (c !== null && c !== t) el.setAttribute(ATTR[i], c); }
    }
  }
  function cevirAgac(kok) {
    if (!kok) return;
    if (kok.nodeType === 3) { cevirMetin(kok); return; }
    if (kok.nodeType !== 1) return;
    var tag = kok.tagName; if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return;
    cevirOge(kok);
    var w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) {
        var p = n.parentNode && n.parentNode.tagName;
        if (p !== 'SCRIPT' && p !== 'STYLE' && p !== 'TEXTAREA') cevirMetin(n);
      } else cevirOge(n);
    }
  }
  var calisiyor = false;
  function gozle() {
    cevirAgac(document.body);
    new MutationObserver(function (kayitlar) {
      if (calisiyor) return; calisiyor = true;
      try {
        for (var i = 0; i < kayitlar.length; i++) {
          var k = kayitlar[i];
          if (k.type === 'childList') for (var j = 0; j < k.addedNodes.length; j++) cevirAgac(k.addedNodes[j]);
          else if (k.type === 'characterData') cevirMetin(k.target);
          else if (k.type === 'attributes') cevirOge(k.target);
        }
        favoriKartlari();
        vtSonra();
      } finally { calisiyor = false; }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
  }

  /* ---------------- 3) Favori araçlar (yalnızca Kelebek üyeleri) ---------------- */
  var uye = false, favoriler = [], favoriHazir = false;
  function ebeveyneGonder(mesaj) {
    if (!gomulu) return;
    for (var i = 0; i < KELEBEK.length; i++) { try { window.parent.postMessage(mesaj, KELEBEK[i]); } catch (e) {} }
  }
  function aracKimlik(kart) {
    if (kart.dataset && kart.dataset.toolId) return kart.dataset.toolId;
    var h = kart.getAttribute && kart.getAttribute('href'); if (!h) return null;
    var m = h.split('?')[0].split('#')[0].replace(/\/+$/, '').split('/').pop();
    return m ? m.replace(/\.html$/, '') : null;
  }
  function yildizSvg(dolu) {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="' + (dolu ? '#f5b301' : 'none') + '" stroke="' +
      (dolu ? '#f5b301' : 'currentColor') + '" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.2l2.7 5.5 6 .9-4.35 4.25 1 6L12 17l-5.35 2.85 1-6L3.3 9.6l6-.9z"/></svg>';
  }
  function kaydet() { ebeveyneGonder({ kb: 'favoriKaydet', liste: favoriler.slice(0, 40) }); }
  function yildizEkle(k, id) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'kb-yildiz'; b.setAttribute('data-arac', id);
    k.style.position = 'relative'; k.appendChild(b);
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var a = this.getAttribute('data-arac'), yer = favoriler.indexOf(a);
      if (yer >= 0) favoriler.splice(yer, 1); else favoriler.push(a);
      kaydet(); favoriCiz();
    });
  }
  function favoriKartlari() {
    var izgara = document.getElementById('tool-grid');
    if (!izgara || !uye) return;
    var kartlar = izgara.querySelectorAll('.category-group .tool-card');
    for (var i = 0; i < kartlar.length; i++) {
      var k = kartlar[i];
      if (k.querySelector('.kb-yildiz')) continue;
      var id = aracKimlik(k); if (!id) continue;
      yildizEkle(k, id);
    }
    /* 30 Ekim: yeni vitrinde kategori kartları gizli; yıldızlar vitrin satırlarına ve arama sonuçlarına */
    var vk = document.querySelectorAll('#kb-gruplar .kb-grup-a, #kb-sonuc-ara .kb-sonuc-k');
    for (var j = 0; j < vk.length; j++) {
      if (vk[j].querySelector('.kb-yildiz')) continue;
      var vid = vk[j].getAttribute('data-kbvt') || aracKimlik(vk[j]); if (!vid) continue;
      yildizEkle(vk[j], vid);
    }
    yildizlariGuncelle();
    if (!document.getElementById('kb-favori')) favoriCiz();
  }
  function yildizlariGuncelle() {
    var y = document.querySelectorAll('.kb-yildiz');
    for (var i = 0; i < y.length; i++) {
      var dolu = favoriler.indexOf(y[i].getAttribute('data-arac')) >= 0;
      if (y[i].firstChild && y[i].classList.contains('dolu') === dolu) continue;   /* değişmediyse dokunma (gözlemci döngüsü olmasın) */
      y[i].innerHTML = yildizSvg(dolu);
      y[i].title = dolu ? 'Favorilerden çıkar' : 'Favorilere ekle';
      y[i].setAttribute('aria-label', y[i].title);
      y[i].classList.toggle('dolu', dolu);
    }
  }
  function favoriCiz() {
    var izgara = document.getElementById('tool-grid'); if (!izgara || !uye) return;
    var bolum = document.getElementById('kb-favori');
    if (!bolum) {
      bolum = document.createElement('div'); bolum.id = 'kb-favori'; bolum.className = 'col-span-full';
      var ilkGrup = izgara.querySelector('.category-group');
      izgara.insertBefore(bolum, ilkGrup || null);
    }
    var kaynak = {}, kartlar = izgara.querySelectorAll('.category-group .tool-card');
    for (var i = 0; i < kartlar.length; i++) { var id = aracKimlik(kartlar[i]); if (id && !kaynak[id]) kaynak[id] = kartlar[i]; }
    var html = '<div class="kb-favori-bas"><span>' + yildizSvg(true) + ' Favori Araçlarım</span></div>';
    bolum.innerHTML = html;
    var kap = document.createElement('div');
    kap.className = 'kb-favori-kartlar grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6';
    var sayi = 0;
    /* 30 Ekim: yeni vitrinde favoriler vitrinin kendi tarzında (simge + ad), BentoPDF kartları değil */
    if (vtArac && document.getElementById('kb-gruplar')) {
      kap.className = 'kb-fav-izgara';
      favoriler.forEach(function (id) {
        var a = vtArac.l[id]; if (!a) return;
        var t = document.createElement('div'); t.innerHTML = vtBag(a, 'kb-fav-a', a.ik + '<span>' + vtEsc(a.ad) + '</span>');
        var el = t.firstChild, cik = document.createElement('button'); cik.type = 'button'; cik.className = 'kb-yildiz dolu';
        cik.setAttribute('data-arac', id); cik.innerHTML = yildizSvg(true); cik.title = 'Favorilerden çıkar'; cik.setAttribute('aria-label', cik.title);
        cik.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); favoriler = favoriler.filter(function (x) { return x !== id; }); kaydet(); favoriCiz(); });
        el.appendChild(cik); kap.appendChild(el); sayi++;
      });
      favoriler = favoriler.slice();
    } else
    favoriler.forEach(function (id) {
      var asil = kaynak[id]; if (!asil) return;
      var kopya = asil.cloneNode(true);
      var y = kopya.querySelector('.kb-yildiz'); if (y) y.remove();
      var cik = document.createElement('button'); cik.type = 'button'; cik.className = 'kb-yildiz dolu';
      cik.setAttribute('data-arac', id); cik.innerHTML = yildizSvg(true); cik.title = 'Favorilerden çıkar'; cik.setAttribute('aria-label', cik.title);
      cik.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        favoriler = favoriler.filter(function (x) { return x !== id; }); kaydet(); favoriCiz();
      });
      kopya.appendChild(cik);
      if (kopya.tagName !== 'A') kopya.addEventListener('click', function () { asil.click(); });
      kap.appendChild(kopya); sayi++;
    });
    if (!sayi) {
      var bos = document.createElement('p'); bos.className = 'kb-favori-bos';
      bos.textContent = 'Sık kullandığınız araçları, aşağıdaki listede araç adının yanındaki ☆ işaretine basarak buraya ekleyin.';
      bolum.appendChild(bos);
    } else bolum.appendChild(kap);
    yildizlariGuncelle();
  }
  window.addEventListener('message', function (e) {
    if (KELEBEK.indexOf(e.origin) < 0 || !e.data) return;
    if (e.data.kb === 'tema') { geceUygula(!!e.data.gece); return; }
    if (e.data.kb !== 'favori') return;
    if (typeof e.data.gece === 'boolean') geceUygula(e.data.gece);
    uye = !!e.data.uye;
    favoriler = Array.isArray(e.data.liste) ? e.data.liste.filter(function (x) { return typeof x === 'string'; }).slice(0, 40) : [];
    favoriHazir = true;
    if (document.body) { favoriKartlari(); favoriCiz(); }
  });

  /* ---------------- 4) Kategori aç/kapa okları ----------------
     BentoPDF kapatırken yüksekliği bir sonraki kareye (requestAnimationFrame) bırakıyor;
     bazı tarayıcılarda çerçeve içinde o kare gecikince bölüm kapanmıyordu. Kısa süre
     sonra durumu denetleyip yarım kalan kapanmayı/açılmayı tamamlıyoruz. */
  document.addEventListener('click', function (e) {
    var bas = e.target && e.target.closest && e.target.closest('.category-header'); if (!bas) return;
    var grup = bas.closest('.category-group'), kap = grup && grup.querySelector('.category-tools'); if (!kap) return;
    setTimeout(function () {
      if (grup.classList.contains('collapsed')) {
        if (kap.style.maxHeight !== '0px') { kap.style.overflow = 'hidden'; kap.style.maxHeight = '0px'; }
      } else if (kap.style.maxHeight === '0px' || (kap.style.maxHeight && kap.style.maxHeight !== 'none')) {
        kap.style.maxHeight = kap.scrollHeight + 'px';
        setTimeout(function () { if (!grup.classList.contains('collapsed')) { kap.style.maxHeight = 'none'; kap.style.overflow = 'visible'; } }, 450);
      }
    }, 120);
  }, true);


  /* ---------------- 5) Bekleme penceresi: Kanat sahneleri (20 Ekim 2026) ----------------
     BentoPDF'in dönen halkası yerine o an yapılan işe uygun bir Kanat sahnesi: birleştir (zımba),
     böl/kırp/sil (makas), sıkıştır (pres), dönüştür (sihirli değnek), okuma/tanıma (büyüteç),
     öteki bütün araçlar (masa başında yazıyor). Sahne sayfanın adresinden seçilir. */
  var KBK_SAHNE = {"birlestir": "<svg class=\"kbk-sahne\" viewBox=\"0 0 260 170\"><g transform=\"translate(100 40)\"><g class=\"kbk-b-sol\"><rect class=\"kbk-kagit\" x=\"0\" y=\"0\" width=\"56\" height=\"74\" rx=\"4\"/><path class=\"kbk-satir\" d=\"M10 16h34M10 28h30M10 40h34M10 52h22\"/></g><g class=\"kbk-b-sag\"><rect class=\"kbk-kagit\" x=\"0\" y=\"0\" width=\"56\" height=\"74\" rx=\"4\" style=\"fill:#f4f7ff\"/><path class=\"kbk-satir\" d=\"M10 16h34M10 28h26M10 40h34M10 52h28\"/></g><g class=\"kbk-zimba\"><rect x=\"6\" y=\"-14\" width=\"22\" height=\"9\" rx=\"3\" fill=\"#4f7cf0\"/><rect x=\"4\" y=\"-6\" width=\"26\" height=\"4\" rx=\"2\" fill=\"#2b4fb8\"/></g><g class=\"kbk-pat\"><path d=\"M17 2 l0 -10 M7 6 l-8 -6 M27 6 l8 -6\" stroke=\"#ffb020\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></g></g><g class=\"kbk-zipla\"><use href=\"#knKarakter\" x=\"14\" y=\"62\" width=\"96\" height=\"96\"/></g></svg>", "kes": "<svg class=\"kbk-sahne\" viewBox=\"0 0 260 170\"><g transform=\"translate(120 34)\"><g class=\"kbk-y-sol\"><path class=\"kbk-kagit\" d=\"M0 4 a4 4 0 0 1 4 -4 H32 V96 H4 a4 4 0 0 1 -4 -4Z\"/><path class=\"kbk-satir\" d=\"M9 18h18M9 30h16M9 42h18M9 54h12\"/></g><g class=\"kbk-y-sag\"><path class=\"kbk-kagit\" d=\"M32 0 H60 a4 4 0 0 1 4 4 V92 a4 4 0 0 1 -4 4 H32Z\"/><path class=\"kbk-satir\" d=\"M38 18h16M38 30h18M38 42h14M38 54h18\"/></g><path d=\"M32 0V96\" stroke=\"#9aa6c8\" stroke-width=\"1.5\" stroke-dasharray=\"4 4\"/><g class=\"kbk-makas\" transform=\"translate(20 -18)\"><g transform=\"rotate(90 12 12)\"><g class=\"kbk-agiz1\"><path d=\"M12 12 L30 6\" stroke=\"#5b6587\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"6\" cy=\"16\" r=\"5\" fill=\"none\" stroke=\"#e5484d\" stroke-width=\"3\"/></g><g class=\"kbk-agiz2\"><path d=\"M12 12 L30 18\" stroke=\"#5b6587\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"6\" cy=\"8\" r=\"5\" fill=\"none\" stroke=\"#e5484d\" stroke-width=\"3\"/></g></g></g></g><g class=\"kbk-zipla\"><use href=\"#knKarakter\" x=\"14\" y=\"62\" width=\"96\" height=\"96\"/></g></svg>", "sikistir": "<svg class=\"kbk-sahne\" viewBox=\"0 0 260 170\"><g transform=\"translate(140 30)\"><g class=\"kbk-pres\" transform=\"translate(0 22)\"><rect x=\"-8\" y=\"0\" width=\"76\" height=\"10\" rx=\"4\" fill=\"#8b5cf6\"/><rect x=\"26\" y=\"-22\" width=\"8\" height=\"24\" rx=\"3\" fill=\"#6d4bd8\"/></g><g transform=\"translate(0 40)\"><g class=\"kbk-sik\"><rect class=\"kbk-kagit\" x=\"0\" y=\"0\" width=\"60\" height=\"78\" rx=\"4\"/><path class=\"kbk-satir\" d=\"M10 16h40M10 28h34M10 40h40M10 52h26\"/></g></g><rect x=\"-14\" y=\"120\" width=\"88\" height=\"5\" rx=\"2.5\" fill=\"#d9dff0\"/></g><g class=\"kbk-zipla\"><use href=\"#knKarakter\" x=\"10\" y=\"62\" width=\"96\" height=\"96\"/><path class=\"kbk-ter\" d=\"M86 82 q4 6 0 9 q-4 -3 0 -9z\" fill=\"#5fc3ff\"/></g></svg>", "donustur": "<svg class=\"kbk-sahne\" viewBox=\"0 0 260 170\"><g transform=\"translate(150 36)\"><rect class=\"kbk-kagit\" x=\"0\" y=\"0\" width=\"64\" height=\"84\" rx=\"5\"/><rect class=\"kbk-renk\" x=\"0\" y=\"0\" width=\"64\" height=\"22\" rx=\"5\"/><rect class=\"kbk-renk\" x=\"0\" y=\"12\" width=\"64\" height=\"10\"/><text class=\"kbk-harf-w\" x=\"32\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"800\" fill=\"#fff\" font-family=\"Inter,sans-serif\">{K}</text><text class=\"kbk-harf-p\" x=\"32\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"800\" fill=\"#fff\" font-family=\"Inter,sans-serif\">{H}</text><path class=\"kbk-satir\" d=\"M10 36h44M10 48h38M10 60h44M10 72h28\"/></g><g class=\"kbk-degnek\"><path d=\"M108 112 L150 82\" stroke=\"#4a3b2a\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M150 82 l3 -7 3 7 7 1 -5 5 2 7 -7 -4 -7 4 2 -7 -5 -5z\" fill=\"#ffd34d\" transform=\"translate(-6 -6)\"/></g><path class=\"kbk-yildiz\" d=\"M222 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z\" fill=\"#ffd34d\"/><path class=\"kbk-yildiz kbk-y2\" d=\"M140 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z\" fill=\"#a78bfa\"/><path class=\"kbk-yildiz kbk-y3\" d=\"M230 112 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z\" fill=\"#6fd3a9\"/><g class=\"kbk-zipla\"><use href=\"#knKarakter\" x=\"14\" y=\"62\" width=\"96\" height=\"96\"/></g></svg>", "oku": "<svg class=\"kbk-sahne\" viewBox=\"0 0 260 170\"><g transform=\"translate(130 30)\"><rect class=\"kbk-kagit\" x=\"0\" y=\"0\" width=\"74\" height=\"96\" rx=\"5\"/><path class=\"kbk-satir\" d=\"M12 20h50M12 36h50M12 52h50M12 68h50\"/><path class=\"kbk-okunan kbk-o1\" d=\"M12 20h46\"/><path class=\"kbk-okunan kbk-o2\" d=\"M12 36h46\"/><path class=\"kbk-okunan kbk-o3\" d=\"M12 52h46\"/><path class=\"kbk-okunan kbk-o4\" d=\"M12 68h46\"/><g class=\"kbk-buyutec\" transform=\"translate(4 6)\"><g><circle cx=\"10\" cy=\"10\" r=\"11\" fill=\"rgba(160,200,255,.25)\" stroke=\"#1d2a55\" stroke-width=\"3\"/><path d=\"M18 18 L28 28\" stroke=\"#1d2a55\" stroke-width=\"4.5\" stroke-linecap=\"round\"/></g></g></g><g class=\"kbk-zipla\"><use href=\"#knKarakter\" x=\"14\" y=\"62\" width=\"96\" height=\"96\"/></g></svg>", "masa": "<svg class=\"kbk-sahne\" viewBox=\"0 0 300 184\"><path class=\"kbk-lamba\" d=\"M232 38 L196 128 L290 128 Z\" fill=\"#fff4c4\"/><path d=\"M262 128 h22\" stroke=\"#5b6587\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M272 128 L262 70 L240 46\" stroke=\"#5b6587\" stroke-width=\"3.4\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M226 30 L252 40 L242 56 Z\" fill=\"#ffb020\" stroke=\"#c97f00\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><rect x=\"64\" y=\"70\" width=\"82\" height=\"66\" rx=\"14\" fill=\"#8b5cf6\" opacity=\".85\"/><g class=\"kbk-bas-sal\"><use href=\"#knKarakterMasa\" x=\"46\" y=\"30\" width=\"118\" height=\"118\"/></g><rect x=\"20\" y=\"126\" width=\"270\" height=\"12\" rx=\"4\" fill=\"#c98b5e\"/><rect x=\"20\" y=\"126\" width=\"270\" height=\"4\" rx=\"2\" fill=\"#dba57a\"/><rect x=\"34\" y=\"138\" width=\"10\" height=\"40\" rx=\"3\" fill=\"#b07548\"/><rect x=\"266\" y=\"138\" width=\"10\" height=\"40\" rx=\"3\" fill=\"#b07548\"/><rect x=\"60\" y=\"138\" width=\"190\" height=\"30\" rx=\"4\" fill=\"#d39a6c\"/><g transform=\"translate(120 104)\"><path d=\"M0 22 L6 4 L46 4 L40 22Z\" fill=\"#fff\" stroke=\"#c9d1e6\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><path class=\"kbk-satir-y kbk-sy1\" d=\"M10 10 h30\" transform=\"skewX(-18) translate(4 0)\"/><path class=\"kbk-satir-y kbk-sy2\" d=\"M8 14.5 h30\" transform=\"skewX(-18) translate(5 0)\"/><path class=\"kbk-satir-y kbk-sy3\" d=\"M6 19 h30\" transform=\"skewX(-18) translate(6 0)\"/></g><g class=\"kbk-yaz\"><g transform=\"translate(140 112)\"><path d=\"M-6 -6 L14 -20\" stroke=\"#ffd34d\" stroke-width=\"4.5\" stroke-linecap=\"round\"/><path d=\"M14 -20 L17 -22\" stroke=\"#f19aa3\" stroke-width=\"4.5\" stroke-linecap=\"round\"/><path d=\"M-6 -6 L-9 -4\" stroke=\"#333\" stroke-width=\"2\" stroke-linecap=\"round\"/><circle cx=\"-2\" cy=\"-8\" r=\"5\" fill=\"#ffe0c4\" stroke=\"#e0a77f\" stroke-width=\"1\"/></g></g><g transform=\"translate(192 104)\"><g class=\"kbk-yigin\"><rect x=\"0\" y=\"16\" width=\"38\" height=\"6\" rx=\"1.5\" fill=\"#fff\" stroke=\"#c9d1e6\" stroke-width=\"1.3\"/><rect x=\"2\" y=\"10\" width=\"38\" height=\"6\" rx=\"1.5\" fill=\"#fff\" stroke=\"#c9d1e6\" stroke-width=\"1.3\"/><rect x=\"-1\" y=\"4\" width=\"38\" height=\"6\" rx=\"1.5\" fill=\"#fff\" stroke=\"#c9d1e6\" stroke-width=\"1.3\"/><rect x=\"3\" y=\"-2\" width=\"38\" height=\"6\" rx=\"1.5\" fill=\"#f4f7ff\" stroke=\"#c9d1e6\" stroke-width=\"1.3\"/></g></g><g transform=\"translate(40 104)\"><g class=\"kbk-buhar\"><path d=\"M6 -2 c-3 -4 3 -6 0 -10\"/><path d=\"M12 -2 c-3 -4 3 -6 0 -10\"/></g><path d=\"M0 2 L4 22 H14 L18 2Z\" fill=\"#ffe7c2\" stroke=\"#d1a36a\" stroke-width=\"1.4\" stroke-linejoin=\"round\"/><path d=\"M1.5 8 H16.5\" stroke=\"#c0392b\" stroke-width=\"4\" opacity=\".75\"/></g></svg>"};
  var KBK_KANAT = "<svg id=\"kbkKanatDefs\" width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\"><defs><linearGradient id=\"knUst\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#6ff0ff\"/><stop offset=\".45\" stop-color=\"#27a8f0\"/><stop offset=\"1\" stop-color=\"#2a4bd0\"/></linearGradient><linearGradient id=\"knAlt\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#ffb347\"/><stop offset=\"1\" stop-color=\"#ff6a2b\"/></linearGradient><radialGradient id=\"knYuz\" cx=\".45\" cy=\".4\" r=\".7\"><stop offset=\"0\" stop-color=\"#ffe6cf\"/><stop offset=\"1\" stop-color=\"#f6c9a3\"/></radialGradient><symbol id=\"knKanatSol\" viewBox=\"0 0 100 100\"><path d=\"M44 58C34 40 20 30 10 33C3 35 3 45 8 52C13 59 27 63 44 62Z\" fill=\"url(#knUst)\" stroke=\"#16306e\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><path d=\"M45 63C33 64 22 70 20 78C19 84 25 87 31 84C38 80 43 72 46 66Z\" fill=\"url(#knAlt)\" stroke=\"#16306e\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/><circle cx=\"14\" cy=\"41\" r=\"2.4\" fill=\"#fff\" opacity=\".9\"/><circle cx=\"21\" cy=\"37\" r=\"1.6\" fill=\"#fff\" opacity=\".85\"/><circle cx=\"27\" cy=\"79\" r=\"1.8\" fill=\"#fff\" opacity=\".85\"/><path d=\"M40 57C31 48 22 42 14 41\" fill=\"none\" stroke=\"#16306e\" stroke-width=\"1\" opacity=\".45\"/></symbol><!-- Kanat: kelebek kanatlı, anten bantlı küçük öğretmen --><symbol id=\"knKarakter\" viewBox=\"0 0 100 100\"><g class=\"kn-kanat\"><use href=\"#knKanatSol\" width=\"100\" height=\"100\"/></g><g class=\"kn-kanat sag\"><use href=\"#knKanatSol\" width=\"100\" height=\"100\" transform=\"matrix(-1 0 0 1 100 0)\"/></g><g class=\"kn-govde\"><!-- gövde / kazak --><path d=\"M33 92C33 78 40 70 50 70S67 78 67 92Z\" fill=\"#ff7a1a\"/><path d=\"M44 71L50 79L56 71\" fill=\"#fff\" stroke=\"#e25f00\" stroke-width=\"1.2\" stroke-linejoin=\"round\"/><!-- sallanan el --><g class=\"kn-el\"><path d=\"M64 78C70 74 74 68 76 62\" stroke=\"#ff7a1a\" stroke-width=\"6\" stroke-linecap=\"round\" fill=\"none\"/><circle cx=\"76.5\" cy=\"60.5\" r=\"4\" fill=\"url(#knYuz)\" stroke=\"#e0a77f\" stroke-width=\".8\"/></g><!-- antenler --><g class=\"kn-anten\"><path d=\"M45 31C43 23 39 18 34 16\" stroke=\"#243056\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"33.5\" cy=\"15.5\" r=\"3.2\" fill=\"#ff7a1a\"/></g><g class=\"kn-anten s\"><path d=\"M55 31C57 23 61 18 66 16\" stroke=\"#243056\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"66.5\" cy=\"15.5\" r=\"3.2\" fill=\"#27a8f0\"/></g><!-- baş --><circle cx=\"50\" cy=\"50\" r=\"20\" fill=\"url(#knYuz)\" stroke=\"#e0a77f\" stroke-width=\"1\"/><path d=\"M31 46C31 34 40 28 50 28C61 28 69 35 69 45C64 40 57 37 50 38C43 38 36 41 31 46Z\" fill=\"#3a2a22\"/><path d=\"M47 30C49 26 53 25 56 27C53 27 50 28 47 30Z\" fill=\"#3a2a22\"/><!-- gözler --><g class=\"kn-goz\"><ellipse cx=\"43\" cy=\"51\" rx=\"3\" ry=\"3.6\" fill=\"#1d2233\"/><circle cx=\"44\" cy=\"49.8\" r=\"1.1\" fill=\"#fff\"/></g><g class=\"kn-goz\"><ellipse cx=\"57\" cy=\"51\" rx=\"3\" ry=\"3.6\" fill=\"#1d2233\"/><circle cx=\"58\" cy=\"49.8\" r=\"1.1\" fill=\"#fff\"/></g><!-- gözlük --><g fill=\"none\" stroke=\"#243056\" stroke-width=\"1.4\"><circle cx=\"43\" cy=\"51\" r=\"6\"/><circle cx=\"57\" cy=\"51\" r=\"6\"/><path d=\"M49 51h2\"/></g><ellipse cx=\"37\" cy=\"58\" rx=\"3.2\" ry=\"1.9\" fill=\"#ff9d9d\" opacity=\".55\"/><ellipse cx=\"63\" cy=\"58\" rx=\"3.2\" ry=\"1.9\" fill=\"#ff9d9d\" opacity=\".55\"/><path d=\"M44.5 60C47.5 63.5 52.5 63.5 55.5 60\" stroke=\"#8a3b2a\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\"/><!-- 8.9: temaya göre aksesuar. 8.10: görünürlük \"display\" özniteliğinde; temaUygula → knAksesuar ayarlar --></g></symbol><symbol id=\"knKarakterMasa\" viewBox=\"0 0 100 100\"><g class=\"kn-kanat\"><use href=\"#knKanatSol\" width=\"100\" height=\"100\"/></g><g class=\"kn-kanat sag\"><use href=\"#knKanatSol\" width=\"100\" height=\"100\" transform=\"matrix(-1 0 0 1 100 0)\"/></g><g class=\"kn-govde\"><!-- gövde / kazak --><path d=\"M33 92C33 78 40 70 50 70S67 78 67 92Z\" fill=\"#ff7a1a\"/><path d=\"M44 71L50 79L56 71\" fill=\"#fff\" stroke=\"#e25f00\" stroke-width=\"1.2\" stroke-linejoin=\"round\"/><!-- sallanan el --><!-- antenler --><g class=\"kn-anten\"><path d=\"M45 31C43 23 39 18 34 16\" stroke=\"#243056\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"33.5\" cy=\"15.5\" r=\"3.2\" fill=\"#ff7a1a\"/></g><g class=\"kn-anten s\"><path d=\"M55 31C57 23 61 18 66 16\" stroke=\"#243056\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"66.5\" cy=\"15.5\" r=\"3.2\" fill=\"#27a8f0\"/></g><!-- baş --><circle cx=\"50\" cy=\"50\" r=\"20\" fill=\"url(#knYuz)\" stroke=\"#e0a77f\" stroke-width=\"1\"/><path d=\"M31 46C31 34 40 28 50 28C61 28 69 35 69 45C64 40 57 37 50 38C43 38 36 41 31 46Z\" fill=\"#3a2a22\"/><path d=\"M47 30C49 26 53 25 56 27C53 27 50 28 47 30Z\" fill=\"#3a2a22\"/><!-- gözler --><g class=\"kn-goz\"><ellipse cx=\"43\" cy=\"51\" rx=\"3\" ry=\"3.6\" fill=\"#1d2233\"/><circle cx=\"44\" cy=\"49.8\" r=\"1.1\" fill=\"#fff\"/></g><g class=\"kn-goz\"><ellipse cx=\"57\" cy=\"51\" rx=\"3\" ry=\"3.6\" fill=\"#1d2233\"/><circle cx=\"58\" cy=\"49.8\" r=\"1.1\" fill=\"#fff\"/></g><!-- gözlük --><g fill=\"none\" stroke=\"#243056\" stroke-width=\"1.4\"><circle cx=\"43\" cy=\"51\" r=\"6\"/><circle cx=\"57\" cy=\"51\" r=\"6\"/><path d=\"M49 51h2\"/></g><ellipse cx=\"37\" cy=\"58\" rx=\"3.2\" ry=\"1.9\" fill=\"#ff9d9d\" opacity=\".55\"/><ellipse cx=\"63\" cy=\"58\" rx=\"3.2\" ry=\"1.9\" fill=\"#ff9d9d\" opacity=\".55\"/><path d=\"M44.5 60C47.5 63.5 52.5 63.5 55.5 60\" stroke=\"#8a3b2a\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\"/><!-- 8.9: temaya göre aksesuar. 8.10: görünürlük \"display\" özniteliğinde; temaUygula → knAksesuar ayarlar --></g></symbol></defs></svg>";
  var KBK_BICIM = { word: 'DOCX', excel: 'XLSX', powerpoint: 'PPTX', image: 'RESİM', jpg: 'JPG', png: 'PNG', webp: 'WEBP', bmp: 'BMP', tiff: 'TIFF', heic: 'HEIC', svg: 'SVG', psd: 'PSD',
    txt: 'TXT', text: 'TXT', markdown: 'MD', email: 'E-POSTA', epub: 'EPUB', mobi: 'MOBI', fb2: 'FB2', cbz: 'CBZ', csv: 'CSV', json: 'JSON', xml: 'XML', xps: 'XPS', rtf: 'RTF',
    odt: 'ODT', ods: 'ODS', odp: 'ODP', odg: 'ODG', pages: 'PAGES', pub: 'PUB', vsd: 'VSD', wpd: 'WPD', wps: 'WPS', pdf: 'PDF', pdfa: 'PDF/A', greyscale: 'GRİ', zip: 'ZIP' };
  function kbkSayfa() { var p = location.pathname.replace(/\/+$/, '').split('/').pop().replace(/\.html$/, ''); return p || 'index'; }
  function kbkSahneAdi(s) {
    if (/^(merge-pdf|alternate-merge|combine-single-page|overlay-pdf|duplex-collate)$/.test(s)) return 'birlestir';
    if (/^(split-pdf|crop-pdf|delete-pages|extract-pages|divide-pages|remove-blank-pages|posterize-pdf)$/.test(s)) return 'kes';
    if (/^compress-pdf/.test(s)) return 'sikistir';
    if (/^(ocr-pdf|validate-signature-pdf|extract-tables|prepare-pdf-for-ai|compare-pdfs|view-metadata|pdf-to-text)$/.test(s)) return 'oku';
    if (/^[a-z0-9]+-to-[a-z0-9]+$/.test(s)) return 'donustur';
    return 'masa';
  }
  function kbkBicim(x) { return KBK_BICIM[x] || String(x).toUpperCase().slice(0, 5); }
  function kbkKur() {
    var modlar = document.querySelectorAll('#loader-modal'); if (!modlar.length) return;
    if (!document.getElementById('kbkKanatDefs')) { var d = document.createElement('div'); d.innerHTML = KBK_KANAT; document.body.appendChild(d.firstChild); }
    var sayfa = kbkSayfa(), ad = kbkSahneAdi(sayfa), svg = KBK_SAHNE[ad];
    if (ad === 'donustur') { var m = /^([a-z0-9]+)-to-([a-z0-9]+)$/.exec(sayfa); svg = svg.replace('{K}', kbkBicim(m[1])).replace('{H}', kbkBicim(m[2])); }
    for (var i = 0; i < modlar.length; i++) {
      var mod = modlar[i], kutu = mod.firstElementChild; if (!kutu || kutu.querySelector('.kbk-bekle')) continue;
      mod.classList.add('kbk-modal'); kutu.classList.add('kbk-kutu');
      var s = document.createElement('div'); s.className = 'kbk-bekle kbk-' + ad; s.setAttribute('aria-hidden', 'true'); s.innerHTML = svg;
      kutu.insertBefore(s, kutu.firstChild);
      var c = document.createElement('div'); c.className = 'kbk-cubuk'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<b></b>'; kutu.appendChild(c);
    }
  }

  /* ---------------- 6) Ana sayfa vitrini (28 Ekim 2026) ----------------
     Smallpdf gibi sade giriş: büyük başlık, ortada arama, en çok kullanılan 6 araç büyük kartta,
     öteki araçlar 4 başlıkta (ilk 5'i görünür, "+N araç daha" ile açılır). BentoPDF'in kendi ızgarası
     sayfada kalır (favori bölümü ve gizli kartlar için), yalnız kategori grupları gizlenir.
     Arama bizim: eş anlamlılarla ("word", "küçült", "resim"…) bütün araçlarda arar. */
  function vtSvg(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; }
  /* 31 Ekim: emoji yerine aracın kendi simgesi (vtIkon); yedek olarak çizgi simge. [id, yedek simge yolu, ad, açıklama, kutu rengi, simge rengi, rozet] */
  var VT_POP = [
    ['compress-pdf', 'M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3M9 12h6', 'Sıkıştır', 'Boyutu küçült, e-posta ve e-Okul yüklemesine hazırla', '#e0f5ea', '#127a51', 'En çok'],
    ['pdf-to-word', 'M6 3h9l5 5v13H6zM15 3v5h5M9 13l1.5 5 1.5-4 1.5 4L15 13', 'PDF → Word', 'Düzenlenebilir .docx dosyasına çevir', '#eaf0ff', '#2f5fd0', ''],
    ['merge-pdf', 'M4 6h7v12H4zM13 6h7v12h-7zM11 12h2', 'Birleştir', 'Birkaç dosyayı sırasını seçerek tek PDF yap', '#f3e8ff', '#6a1b9a', ''],
    ['split-pdf', 'M4 5h16M4 19h16M12 5v14M8 9l-3 3 3 3M16 9l3 3-3 3', 'Böl', 'Sayfa aralığı seç ya da her sayfayı ayır', '#fce7d8', '#c2410c', ''],
    ['pdf-to-jpg', 'M4 5h16v14H4zM4 15l4-4 3 3 5-6 4 4M9 9h.01', 'PDF → Resim', 'Sayfaları JPG ya da PNG olarak kaydet', '#fff3cd', '#8a5a00', ''],
    ['sign-pdf', 'M4 18c3-6 6-9 8-9s2 4 4 4 3-3 4-3M4 21h16', 'İmzala', 'Elle çiz ya da yükle, istediğin yere yerleştir', '#fae5e8', '#9d2235', '']
  ];
  var VT_GRUP = [
    { ad: 'Dönüştür', e: vtSvg('M21 12a9 9 0 1 1-3-6.7M21 4v5h-5'), r: '#e8f0fe', kat: ['convert-from-pdf', 'convert-to-pdf'],
      one: ['pdf-to-word', 'pdf-to-jpg', 'jpg-to-pdf', 'pdf-to-excel', 'word-to-pdf', 'image-to-pdf', 'pdf-to-png'] },
    { ad: 'Sayfalar', e: vtSvg('M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'), r: '#eaf6ee', kat: ['organize-manage'],
      one: ['merge-pdf', 'split-pdf', 'organize-pdf', 'delete-pages', 'rotate-pdf', 'extract-pages'] },
    { ad: 'Düzenle', e: vtSvg('M4 20h4l10-10-4-4L4 16zM13 7l4 4'), r: '#fff4e0', kat: ['edit-annotate', 'popular-tools'],
      one: ['edit-pdf', 'sign-pdf', 'add-watermark', 'page-numbers', 'form-filler', 'crop-pdf'] },
    { ad: 'Küçült ve koru', e: vtSvg('M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7zM9 12l2 2 4-4'), r: '#fdecea', kat: ['optimize-repair', 'secure-pdf'],
      one: ['compress-pdf', 'protect-pdf', 'unlock-pdf', 'ocr-pdf', 'repair-pdf', 'remove-restrictions'] }
  ];
  var VT_TASI = { 'ocr-pdf': 3 };          /* aracın gideceği grup (VT_GRUP sırası) BentoPDF'inkinden farklıysa */
  var VT_GOSTER = 5;
  var VT_ES = { compress: 'kucult sikistir boyut kucuk mb', word: 'docx doc word', docx: 'word', jpg: 'resim foto fotograf jpeg', jpeg: 'resim', png: 'resim',
    image: 'resim foto gorsel', webp: 'resim', merge: 'birlestir birles tek', split: 'bol ayir parcala', rotate: 'dondur cevir', sign: 'imza imzala',
    protect: 'sifre kilit koru parola', unlock: 'sifre kaldir ac kilit', excel: 'xlsx tablo', csv: 'tablo', ocr: 'yazi tanima tarama taranmis', delete: 'sil',
    watermark: 'filigran', crop: 'kirp', organize: 'sirala duzenle', extract: 'ayikla cikar', edit: 'duzenle yaz', text: 'yazi metin', form: 'form doldur',
    numbers: 'numara sayfa', repair: 'onar bozuk', powerpoint: 'pptx sunum', markdown: 'md', compare: 'karsilastir', metadata: 'bilgi' };
  var vtArac = null, vtKurulu = '';
  /* 28 Ekim: ana sayfada BentoPDF'in eski başlığı bir an görünüp sonra yeni görünüme geçiyordu.
     Ana sayfa adresindeysek sayfa, vitrin kurulana kadar gizli bekler (en çok 2,5 sn; sonra her durumda açılır). */
  if (/^\/(?:[a-z]{2}(?:-[a-zA-Z]{2})?\/)?(?:index(?:\.html)?)?$/.test(location.pathname)) {
    document.documentElement.classList.add('kb-vitrin-bekle');
    setTimeout(function () { document.documentElement.classList.remove('kb-vitrin-bekle'); }, 2500);
  }
  function vtNorm(s) {
    return String(s || '').toLocaleLowerCase('tr').replace(/[çğıöşüâî]/g, function (c) { return { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i' }[c]; })
      .replace(/[→’'`]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function vtEsc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function vtTopla(izgara) {
    var l = {}, sira = [];
    var gruplar = izgara.querySelectorAll('.category-group');
    for (var g = 0; g < gruplar.length; g++) {
      var m = /is-cat-([a-z0-9-]+)/.exec(gruplar[g].className), kat = m ? m[1] : '';
      var kartlar = gruplar[g].querySelectorAll('.tool-card');
      for (var i = 0; i < kartlar.length; i++) {
        var k = kartlar[i], id = aracKimlik(k); if (!id) continue;
        var h3 = k.querySelector('h3'), p = k.querySelector('p');
        if (!l[id]) { l[id] = { id: id, kart: k, href: k.getAttribute('href'), ad: h3 ? h3.textContent.trim() : id, alt: p ? p.textContent.trim() : '', kat: [], ik: vtIkon(k) }; sira.push(id); }
        if (kat && l[id].kat.indexOf(kat) < 0) l[id].kat.push(kat);
      }
    }
    sira.forEach(function (id) {
      var a = l[id];
      a.ara = vtNorm(a.ad + ' ' + a.alt + ' ' + id.replace(/-/g, ' ')) + ' ' + id.split('-').map(function (p) { return VT_ES[p] || ''; }).join(' ');
    });
    return { l: l, sira: sira };
  }
  /* aracın kendi simgesi (BentoPDF kartından: lucide svg ya da Phosphor yazı simgesi) */
  function vtIkon(k) {
    var e = k.querySelector('svg, i.ph, i[class*="ph-"]'); if (!e) return '';
    var c = e.cloneNode(true); c.removeAttribute('id');
    if (c.tagName.toLowerCase() === 'svg') { c.setAttribute('width', '18'); c.setAttribute('height', '18'); c.setAttribute('class', 'kb-ik-s'); }
    else c.className = (c.className || '').replace(/\b(text-\S+|mb-\d+|w-\d+|h-\d+)\b/g, '').trim() + ' kb-ik-f';
    c.setAttribute('aria-hidden', 'true');
    return '<span class="kb-ik">' + c.outerHTML + '</span>';
  }
  function vtBag(a, sinif, ic) {
    if (a.href) return '<a class="' + sinif + '" href="' + vtEsc(a.href) + '">' + ic + '</a>';
    return '<button type="button" class="' + sinif + '" data-kbvt="' + vtEsc(a.id) + '">' + ic + '</button>';
  }
  function vtGrupDagit(A) {
    var gr = VT_GRUP.map(function () { return []; }), ata = {};
    A.sira.forEach(function (id) {
      var a = A.l[id], yer = VT_TASI.hasOwnProperty(id) ? VT_TASI[id] : -1;
      if (yer < 0) for (var g = 0; g < VT_GRUP.length && yer < 0; g++) for (var k = 0; k < VT_GRUP[g].kat.length; k++)
        if (a.kat.indexOf(VT_GRUP[g].kat[k]) >= 0 && (VT_GRUP[g].kat[k] !== 'popular-tools' || a.kat.length === 1)) { yer = g; break; }
      if (yer < 0) yer = 2;
      if (!ata[id]) { ata[id] = 1; gr[yer].push(id); }
    });
    return gr.map(function (l, g) {
      var one = VT_GRUP[g].one;
      return l.sort(function (x, y) { var a = one.indexOf(x), b = one.indexOf(y); return (a < 0 ? 99 : a) - (b < 0 ? 99 : b); });
    });
  }
  function vtKur() {
    var izgara = document.getElementById('tool-grid'), gv = document.getElementById('grid-view');
    if (!izgara || !gv || !izgara.querySelector('.category-group .tool-card')) return;
    var A = vtTopla(izgara), imza = A.sira.join(',') + '|' + izgara.querySelectorAll('.tool-card svg').length;   /* simgeler sonradan çizilince yeniden */
    if (imza === vtKurulu && document.getElementById('kb-gruplar')) return;
    vtKurulu = imza; vtArac = A;
    document.documentElement.classList.add('kb-vitrin');
    setTimeout(function () { document.documentElement.classList.remove('kb-vitrin-bekle'); }, 0);
    var ara = document.getElementById('search-bar'), araKap = ara && ara.closest('.mb-8');
    var kah = document.getElementById('kb-kahraman');
    if (!kah) {
      kah = document.createElement('div'); kah.id = 'kb-kahraman';
      kah.innerHTML = '<span class="kb-rozet">' + vtSvg('M8 11V7a4 4 0 0 1 8 0v4M5 11h14v10H5z') + 'Dosyalar bilgisayarından çıkmaz · ücretsiz · üyelik gerekmez</span>' +
        '<h1>PDF ile ne yapmak istiyorsun?</h1><p>Birleştir, sıkıştır, böl, çevir, imzala. Her şey tarayıcında çalışır; dosyan hiçbir sunucuya yüklenmez.</p>';
      gv.insertBefore(kah, gv.firstChild);
      if (araKap) { araKap.classList.add('kb-ara-kap'); kah.appendChild(araKap); }
      if (ara) ara.setAttribute('placeholder', 'Ne yapmak istiyorsun? (ör. word, küçült)');
    }
    var pop = document.getElementById('kb-populer');
    if (!pop) { pop = document.createElement('div'); pop.id = 'kb-populer'; gv.insertBefore(pop, izgara); }
    pop.innerHTML = VT_POP.filter(function (p) { return A.l[p[0]]; }).map(function (p) {
      var ik = A.l[p[0]].ik ? A.l[p[0]].ik.replace('<span class="kb-ik">', '') .replace(/<\/span>$/, '') : vtSvg(p[1]);
      return vtBag(A.l[p[0]], 'kb-pop', '<span class="kb-pop-ik" style="background:' + p[4] + ';color:' + p[5] + '">' + ik + '</span>' + (p[6] ? '<span class="kb-pop-roz">' + p[6] + '</span>' : '') + '<b>' + p[2] + '</b><small>' + p[3] + '</small>');
    }).join('');
    var sonuc = document.getElementById('kb-sonuc-ara');
    if (!sonuc) { sonuc = document.createElement('div'); sonuc.id = 'kb-sonuc-ara'; gv.insertBefore(sonuc, izgara); }
    var gr = document.getElementById('kb-gruplar');
    if (!gr) { gr = document.createElement('div'); gr.id = 'kb-gruplar'; izgara.parentNode.insertBefore(gr, izgara.nextSibling); }
    var dag = vtGrupDagit(A), acik = [].map.call(gr.querySelectorAll('.kb-grup-ek'), function (e) { return !e.hidden; });
    gr.innerHTML = '<p class="kb-bas">Tüm araçlar <span>' + A.sira.length + ' araç</span></p><div class="kb-grup-izgara">' + VT_GRUP.map(function (G, g) {
      var l = dag[g]; if (!l.length) return '';
      var ilk = l.slice(0, VT_GOSTER), kalan = l.slice(VT_GOSTER);
      return '<div class="kb-grup"><h3><i style="background:' + G.r + '">' + G.e + '</i>' + G.ad + '</h3>' +
        ilk.map(function (id) { return vtBag(A.l[id], 'kb-grup-a', A.l[id].ik + '<span>' + vtEsc(A.l[id].ad) + '</span>'); }).join('') +
        (kalan.length ? '<div class="kb-grup-ek" hidden>' + kalan.map(function (id) { return vtBag(A.l[id], 'kb-grup-a', A.l[id].ik + '<span>' + vtEsc(A.l[id].ad) + '</span>'); }).join('') + '</div>' +
          '<button type="button" class="kb-grup-tum" data-kbek="' + kalan.length + '">+ ' + kalan.length + ' araç daha</button>' : '') + '</div>';
    }).join('') + '</div><p class="kb-dip">Aradığını bulamadın mı? Üstteki kutuya yaz: “word”, “küçült”, “döndür”…</p>';
    [].forEach.call(gr.querySelectorAll('.kb-grup-ek'), function (e, i) { if (acik[i]) { e.hidden = false; var b = e.nextElementSibling; if (b) b.textContent = 'Daha az göster'; } });
    if (ara && ara.value.trim()) vtAra(ara.value);
    if (uye && favoriHazir) favoriCiz();   /* 30 Ekim: favoriler vitrin tarzında yeniden */
  }
  function vtAra(q) {
    var s = document.getElementById('kb-sonuc-ara'); if (!s || !vtArac) return;
    var n = vtNorm(q), html = document.documentElement;
    html.classList.toggle('kb-ariyor', !!n);
    if (!n) { s.innerHTML = ''; return; }
    var parca = n.split(' '), bulunan = vtArac.sira.filter(function (id) {
      var h = vtArac.l[id].ara; return parca.every(function (p) { return h.indexOf(p) >= 0; });
    });
    bulunan.sort(function (x, y) {
      var a = vtNorm(vtArac.l[x].ad).indexOf(parca[0]) >= 0 ? 0 : 1, b = vtNorm(vtArac.l[y].ad).indexOf(parca[0]) >= 0 ? 0 : 1; return a - b;
    });
    s.innerHTML = bulunan.length
      ? '<p class="kb-bas">' + bulunan.length + ' araç bulundu</p><div class="kb-sonuc-izgara">' + bulunan.map(function (id) {
          var a = vtArac.l[id]; return vtBag(a, 'kb-sonuc-k', a.ik + '<span class="kb-sk-y"><b>' + vtEsc(a.ad) + '</b><small>' + vtEsc(a.alt) + '</small></span>');
        }).join('') + '</div>'
      : '<p class="kb-bos">“' + vtEsc(q.trim()) + '” için araç bulunamadı. Başka bir kelime dene: “word”, “resim”, “küçült”…</p>';
  }
  /* BentoPDF'in kendi aramasından önce yakalanır (belge yakalama evresi) */
  document.addEventListener('input', function (e) {
    if (!e.target || e.target.id !== 'search-bar' || !vtArac) return;
    e.stopImmediatePropagation();
    vtAra(e.target.value);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (!e.target || e.target.id !== 'search-bar' || e.key !== 'Enter') return;
    var ilk = document.querySelector('#kb-sonuc-ara .kb-sonuc-k'); if (ilk) { e.preventDefault(); ilk.click(); }
  }, true);
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest; if (!t) return;
    var ek = e.target.closest('.kb-grup-tum');
    if (ek) { var kut = ek.previousElementSibling, ac = kut.hidden; kut.hidden = !ac; ek.textContent = ac ? 'Daha az göster' : '+ ' + ek.getAttribute('data-kbek') + ' araç daha'; return; }
    var b = e.target.closest('[data-kbvt]');
    if (b && vtArac && vtArac.l[b.getAttribute('data-kbvt')]) { e.preventDefault(); vtArac.l[b.getAttribute('data-kbvt')].kart.click(); }
  });

  /* ---------------- 7) Sonuç ekranı: büyük "İndir" düğmesi (28 Ekim 2026) ----------------
     BentoPDF sonucu yalnız kendiliğinden indiriyordu; tarayıcı ya da kurum ağı bu indirmeyi
     engelleyince kullanıcı hiçbir şey görmüyordu. Artık her indirmede tam sayfa bir sonuç ekranı
     açılır: dosya adı ve boyutu, büyük İndir düğmesi (kullanıcının kendi tıklaması; engellenmez),
     Baştan başla ve PDF sonuçlarında "Bu dosyayla devam et" (dosya sıradaki araca kendiliğinden yüklenir).
     Dosya cihazdan çıkmaz: yalnız bu tarayıcının belleğinde ve devam için kısa süre IndexedDB'de durur. */
  var SN_BLOB = {}, SN_SIRA = [], snListe = [], snAn = 0;
  try {
    var asilUrl = URL.createObjectURL.bind(URL);
    URL.createObjectURL = function (o) {
      var u = asilUrl(o);
      try { if (o instanceof Blob) { SN_BLOB[u] = o; SN_SIRA.push(u); if (SN_SIRA.length > 30) delete SN_BLOB[SN_SIRA.shift()]; } } catch (e) {}
      return u;
    };
    var asilTik = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      try {
        if (this.hasAttribute('download') && !this.hasAttribute('data-kbsn') && /^blob:/.test(this.href) && SN_BLOB[this.href])
          snEkle(SN_BLOB[this.href], this.getAttribute('download') || 'dosya');
      } catch (e) {}
      return asilTik.apply(this, arguments);
    };
  } catch (e) {}
  function snBoyut(n) { return n < 1024 ? n + ' B' : n < 1048576 ? Math.round(n / 1024) + ' KB' : (n / 1048576).toFixed(1).replace('.', ',') + ' MB'; }
  function snUzanti(ad) { var m = /\.([a-z0-9]+)$/i.exec(ad || ''); return m ? m[1].toLowerCase() : ''; }
  var SN_TUR = { docx: ['Word belgen hazır', 'DOCX', '#2b5fbf', 'Word dosyasını indir'], doc: ['Word belgen hazır', 'DOC', '#2b5fbf', 'Word dosyasını indir'],
    xlsx: ['Excel dosyan hazır', 'XLSX', '#1e7b45', 'Excel dosyasını indir'], csv: ['Tablon hazır', 'CSV', '#1e7b45', 'Dosyayı indir'],
    pptx: ['Sunumun hazır', 'PPTX', '#c4501f', 'Sunumu indir'], pdf: ['PDF’in hazır', 'PDF', '#e5483a', 'PDF’i indir'],
    zip: ['Dosyaların hazır', 'ZIP', '#5b6587', 'ZIP dosyasını indir'], jpg: ['Resmin hazır', 'JPG', '#7b4fd6', 'Resmi indir'], jpeg: ['Resmin hazır', 'JPG', '#7b4fd6', 'Resmi indir'],
    png: ['Resmin hazır', 'PNG', '#7b4fd6', 'Resmi indir'], webp: ['Resmin hazır', 'WEBP', '#7b4fd6', 'Resmi indir'], txt: ['Metnin hazır', 'TXT', '#5b6587', 'Dosyayı indir'] };
  var SN_DEVAM = [['compress-pdf', '🗜️', 'Sıkıştır'], ['merge-pdf', '➕', 'Başka PDF’le birleştir'], ['pdf-to-jpg', '🖼️', 'Resme çevir'], ['sign-pdf', '✍️', 'İmzala'], ['pdf-to-word', '📄', 'Word’e çevir'], ['protect-pdf', '🔒', 'Şifre koy']];
  function snAdres(id) {
    var y = location.pathname, uz = /\.html$/.test(y) ? '.html' : '';
    return y.replace(/[^\/]*$/, id + uz) + location.search;
  }
  function snEkle(blob, ad) {
    var simdi = Date.now();
    if (simdi - snAn > 4000) snListe = [];
    snAn = simdi; snListe.push({ blob: blob, ad: ad });
    snCiz();
  }
  function snCiz() {
    var ek = document.getElementById('kb-sonuc');
    if (!ek) { ek = document.createElement('div'); ek.id = 'kb-sonuc'; ek.setAttribute('role', 'dialog'); ek.setAttribute('aria-modal', 'true'); document.body.appendChild(ek); }
    var tek = snListe.length === 1, ilk = snListe[0], uz = snUzanti(ilk.ad), tur = tek ? (SN_TUR[uz] || ['Dosyan hazır', (uz || 'DOSYA').toUpperCase().slice(0, 5), '#5b6587', 'Dosyayı indir']) : ['Dosyaların hazır', '', '', 'İndir'];
    var buSayfa = kbkSayfa();
    var dosyalar = snListe.map(function (d, i) {
      var u2 = snUzanti(d.ad), t2 = SN_TUR[u2] || [0, (u2 || 'DOSYA').toUpperCase().slice(0, 5), '#5b6587', 'Dosyayı indir'];
      return '<div class="kb-sn-dosya"><div class="kb-sn-on"><i></i><i></i><i></i><i style="width:60%"></i><i></i><i style="width:80%"></i><b style="background:' + t2[2] + '">' + vtEsc(t2[1]) + '</b></div>' +
        '<div class="kb-sn-bilgi"><div class="kb-sn-ad">' + vtEsc(d.ad) + '</div><small>' + snBoyut(d.blob.size) + '</small>' +
        '<div class="kb-sn-dug"><button type="button" class="kb-sn-indir" data-kbsni="' + i + '">⬇ ' + (tek ? tur[3] : 'İndir') + '</button>' +
        (i === 0 ? '<button type="button" class="kb-sn-yeni" data-kbsnyeni>↺ Baştan başla</button>' : '') + '</div></div></div>';
    }).join('');
    var devam = (tek && uz === 'pdf') ? '<p class="kb-bas">Bu dosyayla devam et</p><div class="kb-sn-devam">' + SN_DEVAM.filter(function (d) { return d[0] !== buSayfa; }).slice(0, 4).map(function (d) {
      return '<button type="button" data-kbsndevam="' + d[0] + '"><span>' + d[1] + '</span>' + d[2] + '</button>'; }).join('') + '</div>' : '';
    ek.innerHTML = '<div class="kb-sn-ic"><button type="button" class="kb-sn-kapat" data-kbsnkapat aria-label="Kapat">✕</button>' +
      '<div class="kb-sn-tik">✓</div><div class="kb-sn-adim"><span>Dosyalar</span><em>›</em><span>İşlendi</span><em>›</em><span>İndir</span></div><h2>' + tur[0] + '</h2><p class="kb-sn-alt">İndirme kendiliğinden başlamadıysa aşağıdaki düğmeye bas.</p>' +
      dosyalar + devam + '<button type="button" class="kb-sn-baska" data-kbsnyeni>+ Başka bir dosyayla devam et</button></div>';
    ek.classList.add('acik'); document.documentElement.classList.add('kb-sonuc-acik');
    try { ek.scrollTop = 0; ek.querySelector('.kb-sn-indir').focus({ preventScroll: true }); } catch (e) {}
  }
  function snKapat() { var ek = document.getElementById('kb-sonuc'); if (ek) ek.classList.remove('acik'); document.documentElement.classList.remove('kb-sonuc-acik'); }
  function snIndir(d) {
    var u = URL.createObjectURL(d.blob), a = document.createElement('a');
    a.href = u; a.download = d.ad; a.setAttribute('data-kbsn', '1'); a.style.display = 'none'; document.body.appendChild(a);
    HTMLAnchorElement.prototype.click.call(a); a.remove();
    setTimeout(function () { try { URL.revokeObjectURL(u); } catch (e) {} }, 60000);
  }
  /* devam: dosya kısa süre IndexedDB'de bekler, sıradaki araç açılınca dosya kutusuna konur */
  function snDb(fn) {
    try {
      var r = indexedDB.open('kb-devam', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('f'); };
      r.onsuccess = function () { try { fn(r.result); } catch (e) {} };
    } catch (e) {}
  }
  function snDevamGit(id) {
    var d = snListe[0]; if (!d) return;
    var git = function () { location.href = snAdres(id); };
    var bitti = false, son = function () { if (!bitti) { bitti = true; git(); } };
    snDb(function (db) {
      var tx = db.transaction('f', 'readwrite'); tx.objectStore('f').put({ blob: d.blob, ad: d.ad, t: Date.now() }, 'son');
      tx.oncomplete = son; tx.onerror = son;
    });
    setTimeout(son, 1500);
  }
  function snDevamAl() {
    snDb(function (db) {
      var tx = db.transaction('f', 'readwrite'), st = tx.objectStore('f'), r = st.get('son');
      r.onsuccess = function () {
        var v = r.result; st.delete('son');
        if (!v || !v.blob || Date.now() - v.t > 180000) return;
        var dene = 0;
        (function koy() {
          var g = document.getElementById('file-input') || document.querySelector('input[type=file]');
          if (!g) { if (++dene < 40) setTimeout(koy, 150); return; }
          try {
            var dt = new DataTransfer(); dt.items.add(new File([v.blob], v.ad, { type: v.blob.type || 'application/pdf' }));
            g.files = dt.files; g.dispatchEvent(new Event('change', { bubbles: true }));
            snBildir('“' + v.ad + '” yüklendi');
          } catch (e) {}
        })();
      };
    });
  }
  function snBildir(m) {
    var b = document.createElement('div'); b.className = 'kb-sn-bildir'; b.textContent = m; document.body.appendChild(b);
    setTimeout(function () { b.classList.add('git'); }, 2600); setTimeout(function () { b.remove(); }, 3200);
  }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('[data-kbsni],[data-kbsnyeni],[data-kbsnkapat],[data-kbsndevam]'); if (!t) return;
    e.preventDefault();
    if (t.hasAttribute('data-kbsni')) { var d = snListe[+t.getAttribute('data-kbsni')]; if (d) snIndir(d); return; }
    if (t.hasAttribute('data-kbsnkapat')) { snKapat(); return; }
    if (t.hasAttribute('data-kbsndevam')) { snDevamGit(t.getAttribute('data-kbsndevam')); return; }
    snKapat(); location.href = location.pathname + location.search;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.documentElement.classList.contains('kb-sonuc-acik')) snKapat(); });
  /* İndirmeden hemen sonra BentoPDF'in "tamamlandı" penceresi açılırsa onu kapat (sonuç ekranı zaten açık). Hata pencereleri dokunulmaz. */
  /* 8.46: hata pencereleri Kelebek'in hata kaydına da gider (yalnız hata yazısı ve araç adı; dosya bilgisi yok) */
  var hkGiden = {}, hkSay = 0;
  function hataBildir(ileti) {
    try {
      ileti = String(ileti || '').replace(/\s+/g, ' ').trim().slice(0, 400); if (!ileti || hkGiden[ileti] || hkSay >= 10) return;
      hkGiden[ileti] = 1; hkSay++;
      var ek = kbkSayfa();
      if (gomulu) { ebeveyneGonder({ kb: 'hata', ileti: ileti, ek: ek }); return; }
      fetch('https://tezbaarzufwsqerswmce.supabase.co/rest/v1/rpc/hata_ekle', { method: 'POST', keepalive: true,
        headers: { 'apikey': 'sb_publishable_C57vRFSFcZ2p9AgnB2x4eA_mrYFCUID', 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_liste: [{ surum: 'pdf', kaynak: 'pdf', ileti: ileti, ek: ek, tarayici: (navigator.userAgent.match(/(Edg|OPR|Chrome|Firefox|Safari)\/\d+/) || [''])[0].slice(0, 60) }] }) }).catch(function () {});
    } catch (e) {}
  }
  function snUyariGozle() {
    var m = document.getElementById('alert-modal'); if (!m) return;
    new MutationObserver(function () {
      if (!m.classList.contains('hidden')) {
        var bt = (document.getElementById('alert-title') || {}).textContent || '';
        if (/hata|error|başarısız|failed/i.test(bt)) setTimeout(function () { hataBildir((document.getElementById('alert-message') || {}).textContent); }, 300);
      }
      if (m.classList.contains('hidden') || Date.now() - snAn > 5000 || !document.documentElement.classList.contains('kb-sonuc-acik')) return;
      var bas = (document.getElementById('alert-title') || {}).textContent || '';
      if (/hata|error|uyarı|warning|başarısız|failed/i.test(bas)) return;
      var ok = document.getElementById('alert-ok'); if (ok) ok.click(); else m.classList.add('hidden');
    }).observe(m, { attributes: true, attributeFilter: ['class'] });
  }
  /* Dönüştürücü (PyMuPDF, Ghostscript…) internetten inemezse açık bir açıklama */
  KALIP.unshift([/^.*(Failed to fetch dynamically imported module|NetworkError when attempting to fetch|Load failed).*$/, 'Gerekli dosya internetten indirilemedi. Bağlantını kontrol et; okul ya da kurum ağındaysan başka bir ağda yeniden dene.']);
  KALIP.unshift([/^.*Failed to load [A-Za-z0-9.\- ]+ from CDN.*$/, 'Dönüştürücü indirilemedi. Bu araç ilk kullanımda dönüştürme motorunu cdn.jsdelivr.net adresinden indirir; bulunduğun ağ (okul ya da kurum ağı) bu adresi engelliyor olabilir. Başka bir ağda (ör. telefonun internetiyle) yeniden dene.']);

  /* Araç sayfası: büyük "dosya seç" düğmesi artık kelebek.css'te (::before) çizilir; sayfa açılırken titremez */
  function aracSayfaKur() { if (document.getElementById('drop-zone')) document.documentElement.classList.add('kb-arac'); }

  /* ---------------- 9) Satır içi ilerleme (28 Ekim 2026) ----------------
     Araç sayfalarında işlem sürerken ekranı kaplayan pencere yerine, dosyanın hemen altında bir ilerleme kartı:
     küçük Kanat sahnesi, ne yapıldığı ve yüzde. BentoPDF yüzde bildiriyorsa o, bildirmiyorsa süreye göre tahmin
     (en çok %95'e kadar; iş bitince %100). Sayfa bu sırada tıklanamaz (pencere saydam olarak arkada durur). */
  var ilk = { kart: null, bas: 0, z: 0, son: 0 };
  function ilerlemeKart() {
    var tu = document.getElementById('tool-uploader'); if (!tu) return null;
    if (ilk.kart && document.body.contains(ilk.kart)) return ilk.kart;
    var k = document.createElement('div'); k.id = 'kb-ilerle'; k.setAttribute('role', 'status'); k.setAttribute('aria-live', 'polite');
    var sahne = document.querySelector('#loader-modal .kbk-bekle');
    k.innerHTML = '<div class="kb-il-sahne"></div><div class="kb-il-sag"><div class="kb-il-adim"><span class="ok">Dosyalar</span><em>›</em><span class="simdi">İşleniyor</span><em>›</em><span>İndir</span></div><div class="kb-il-ust"><b class="kb-il-yazi"></b><span class="kb-il-yuzde">%0</span></div>' +
      '<div class="kb-il-cubuk"><i></i></div><small class="kb-il-alt"></small></div>';
    if (sahne) k.querySelector('.kb-il-sahne').appendChild(sahne.cloneNode(true));
    var yer = document.getElementById('file-display-area') || document.getElementById('drop-zone');
    if (yer && yer.parentNode === tu) tu.insertBefore(k, yer.nextSibling); else tu.appendChild(k);
    ilk.kart = k; return k;
  }
  function ilerlemeYaz() {
    var k = ilk.kart, m = document.getElementById('loader-modal'); if (!k || !m) return;
    var bar = m.querySelector('.loader-progress-bar'), kap = m.querySelector('.loader-progress-container'), y;
    var gercek = bar && kap && !kap.classList.contains('hidden') && /\d/.test(bar.style.width || '');
    if (gercek) y = Math.max(0, Math.min(100, parseFloat(bar.style.width)));
    else { var t = (Date.now() - ilk.bas) / 1000; y = 95 * (1 - Math.exp(-t / 7)); }
    y = Math.max(ilk.son, y); ilk.son = y;
    k.querySelector('.kb-il-cubuk i').style.width = y.toFixed(1) + '%';
    k.querySelector('.kb-il-yuzde').textContent = '%' + Math.round(y);
    var lt = (document.getElementById('loader-text') || {}).textContent || 'İşleniyor…';
    k.querySelector('.kb-il-yazi').textContent = lt.replace(/\s+/g, ' ').trim();
    var sn = Math.round((Date.now() - ilk.bas) / 1000);
    k.querySelector('.kb-il-alt').textContent = (gercek ? '' : 'Tahmini · ') + (sn >= 3 ? sn + ' sn' : 'başladı') +
      (sn >= 8 && /to-|ocr|word|excel|powerpoint/i.test(kbkSayfa()) ? ' · ilk kullanımda dönüştürücü indirilir, biraz sürebilir' : '');
  }
  function ilerlemeBasla() {
    var k = ilerlemeKart(); if (!k) return false;
    clearTimeout(ilk.bitZ); ilk.bas = Date.now(); ilk.son = 0;
    document.documentElement.classList.add('kb-ilerleme');
    k.classList.remove('bitti'); k.hidden = false;
    clearInterval(ilk.z); ilk.z = setInterval(ilerlemeYaz, 200); ilerlemeYaz();
    try { k.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    return true;
  }
  function ilerlemeBit() {
    var k = ilk.kart; clearInterval(ilk.z); document.documentElement.classList.remove('kb-ilerleme');
    if (!k || k.hidden) return;
    k.querySelector('.kb-il-cubuk i').style.width = '100%'; k.querySelector('.kb-il-yuzde').textContent = '%100'; k.classList.add('bitti');
    ilk.bitZ = setTimeout(function () { k.hidden = true; }, 900);
  }
  function ilerlemeGozle() {
    var m = document.getElementById('loader-modal'); if (!m || !document.getElementById('tool-uploader') || !document.getElementById('drop-zone')) return;
    var acik = false;
    new MutationObserver(function () {
      var simdi = !m.classList.contains('hidden');
      if (simdi && !acik) { acik = true; if (!ilerlemeBasla()) document.documentElement.classList.remove('kb-ilerleme'); }
      else if (!simdi && acik) { acik = false; ilerlemeBit(); }
    }).observe(m, { attributes: true, attributeFilter: ['class'] });
  }

  var vtZ = 0;
  function vtSonra() {
    clearTimeout(vtZ);
    var hemen = !vtArac && document.querySelector('#tool-grid .category-group .tool-card');   /* ilk kurulum beklemeden */
    vtZ = setTimeout(function () { try { vtKur(); aracSayfaKur(); } catch (e) {} }, hemen ? 0 : 60);
  }
  function basla() {
    try { kbkKur(); } catch (e) {}
    gozle();
    vtSonra();
    try { snUyariGozle(); snDevamAl(); ilerlemeGozle(); } catch (e) {}
    ebeveyneGonder({ kb: 'hazir' });
    /* arama yapılırken favori bölümünü gizle (BentoPDF kategorileri gizlediği gibi) */
    document.addEventListener('input', function (e) {
      if (!e.target || e.target.id !== 'search-bar') return;
      var b = document.getElementById('kb-favori');
      if (b) b.style.display = e.target.value.trim() ? 'none' : '';
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla);
  else basla();
})();
