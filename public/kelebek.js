/* ============================================================
   Kelebek PDF Araçları — kelebek.js
   1) Kelebek Sistemi'nin içinde (çerçevede) açıldıysa işaret koyar
      (kelebek.css o zaman BentoPDF'in kendi üst şeridini gizler).
   2) BentoPDF'te Türkçeye çevrilmemiş kalan yazıları çevirir.
   3) Kelebek üyelerine "Favori Araçlarım" bölümü: kartlardaki ☆ ile seçilir,
      liste Kelebek hesabında saklanır (başka bilgisayarda da gelir).
   ============================================================ */
(function () {
  'use strict';
  var KELEBEK = ['https://kelebeksinav.org', 'https://www.kelebeksinav.org'];
  var gomulu = true;
  try { gomulu = window.top !== window.self; } catch (e) { gomulu = true; }
  if (gomulu) document.documentElement.classList.add('kb-gomulu');

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
"Letter (8.5 × 11 in)": "Letter (8,5 × 11 inç)"
};
  var ATTR = ['placeholder', 'title', 'aria-label'];
  function cevirMetin(n) {
    var v = n.nodeValue; if (!v) return;
    var t = v.replace(/\s+/g, ' ').trim(); if (!t || !SOZ.hasOwnProperty(t)) return;
    var bas = v.match(/^\s*/)[0], son = v.match(/\s*$/)[0];
    n.nodeValue = bas + SOZ[t] + son;
  }
  function cevirOge(el) {
    for (var i = 0; i < ATTR.length; i++) {
      var a = el.getAttribute && el.getAttribute(ATTR[i]);
      if (a) { var t = a.replace(/\s+/g, ' ').trim(); if (SOZ.hasOwnProperty(t)) el.setAttribute(ATTR[i], SOZ[t]); }
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
  function favoriKartlari() {
    var izgara = document.getElementById('tool-grid');
    if (!izgara || !uye) return;
    var kartlar = izgara.querySelectorAll('.category-group .tool-card');
    for (var i = 0; i < kartlar.length; i++) {
      var k = kartlar[i];
      if (k.querySelector('.kb-yildiz')) continue;
      var id = aracKimlik(k); if (!id) continue;
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
      bos.textContent = 'Sık kullandığınız araçları, kartların sağ üstündeki ☆ işaretine basarak buraya ekleyin.';
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

  function basla() {
    gozle();
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
