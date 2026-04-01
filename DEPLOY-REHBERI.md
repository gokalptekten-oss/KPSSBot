# KPSSBot — Canlıya Alma Rehberi

Bu rehber seni adım adım yönlendirecek. Kodlama bilgisine gerek yok.

---

## ADIM 1: GitHub Hesabı Aç (5 dakika)

1. https://github.com adresine git
2. "Sign up" butonuna tıkla
3. E-posta, şifre ve kullanıcı adı belirle
4. Hesabını doğrula (e-postana kod gelecek)

---

## ADIM 2: Projeyi GitHub'a Yükle (10 dakika)

1. GitHub'a giriş yaptıktan sonra sağ üstteki "+" butonuna tıkla
2. "New repository" seç
3. Repository name: `kpssbot` yaz
4. "Public" seçili kalsın
5. "Create repository" butonuna tıkla
6. Açılan sayfada "uploading an existing file" linkine tıkla
7. Bu ZIP dosyasını bilgisayarında çıkart (extract et)
8. Çıkan klasörün İÇİNDEKİ tüm dosya ve klasörleri sürükle-bırak ile GitHub'a yükle:
   - package.json
   - vite.config.js
   - index.html
   - public/ klasörü
   - src/ klasörü
9. Altta "Commit changes" butonuna tıkla
10. Dosyaların yüklendiğini gör

---

## ADIM 3: Vercel'e Bağla ve Deploy Et (5 dakika)

1. https://vercel.com adresine git
2. "Sign Up" → "Continue with GitHub" seç
3. GitHub hesabınla giriş yap
4. "Add New Project" butonuna tıkla
5. GitHub repository listesinden "kpssbot" seç
6. "Import" butonuna tıkla
7. Framework Preset: "Vite" seçili olmalı (otomatik algılar)
8. "Deploy" butonuna tıkla
9. 1-2 dakika bekle — Vercel otomatik olarak:
   - npm install çalıştırır
   - npm run build çalıştırır
   - Siteyi yayınlar
10. "Congratulations!" mesajı gelecek
11. Sana bir URL verecek: kpssbot-xxxxx.vercel.app — sitenin canlı!

---

## ADIM 4: Kendi Domain Adını Bağla (10 dakika)

1. Domain satın al (birini seç):
   - https://www.namecheap.com → "kpssbot.com" veya "kpssbot.com.tr" ara
   - https://www.godaddy.com → aynı şekilde
   - Fiyat: ~150-300 TL/yıl

2. Vercel'de domain bağla:
   - Vercel dashboard → projenin sayfası → "Settings" → "Domains"
   - Domain adını yaz (örn: kpssbot.com) → "Add"
   - Vercel sana DNS ayarlarını gösterecek (A record veya CNAME)

3. Domain sağlayıcında DNS ayarla:
   - Namecheap/GoDaddy'de "DNS Management" bölümüne git
   - Vercel'in verdiği değerleri gir:
     - Type: A, Name: @, Value: 76.76.21.21
     - Type: CNAME, Name: www, Value: cname.vercel-dns.com
   - Kaydet

4. 5-30 dakika içinde domain aktif olur
5. https://kpssbot.com çalışıyor!

---

## ADIM 5: Google Analytics Ekle (opsiyonel, 5 dakika)

Kaç kişi girdi, hangi sayfayı gördü, nereden geldi — bunları takip etmek için:

1. https://analytics.google.com → hesap oluştur
2. Yeni bir "property" ekle, site URL'ni gir
3. Measurement ID al (G-XXXXXXX formatında)
4. index.html dosyasına <head> bölümüne ekle:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

5. GitHub'da dosyayı güncelle → Vercel otomatik deploy eder

---

## SORUN GİDERME

**"Build failed" hatası alıyorum:**
- package.json dosyasının doğru yüklendiğinden emin ol
- Vercel'de "Framework Preset" kısmında "Vite" seçili mi kontrol et

**Site açılmıyor:**
- DNS değişikliği 30 dakikaya kadar sürebilir, bekle
- Vercel dashboard'da "Deployments" sekmesinde son deploy'un durumunu kontrol et

**Dosya güncelleme:**
- GitHub'da dosyayı düzenle veya yeni dosya yükle
- "Commit" et → Vercel otomatik olarak yeniden deploy eder (1-2 dakika)

---

## MALİYET

- Vercel hosting: ÜCRETSİZ (ayda 100GB bant genişliği)
- Domain: ~150-300 TL/yıl
- GitHub: ÜCRETSİZ
- Toplam başlangıç: sadece domain ücreti

---

Herhangi bir adımda takılırsan bana sor — ekran görüntüsü atarsan daha hızlı yardımcı olurum.
