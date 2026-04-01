import { useState, useCallback, useEffect, useRef } from "react";

// ─── SUBJECTS ───
const SUBJECTS = {
  tarih:{name:"Tarih",icon:"⏳",color:"#854F0B",bg:"#FAEEDA",kpss:26,
    topics:["İslamiyet Öncesi Türk Devletleri","İlk Türk-İslam Devletleri","Osmanlı Kuruluş Dönemi","Osmanlı Yükselme Dönemi","Osmanlı Duraklama ve Islahatlar","Osmanlı Gerileme ve Dağılma","Tanzimat ve Meşrutiyet","I. Dünya Savaşı","Kurtuluş Savaşı Hazırlık","TBMM ve Muharebeler","Atatürk İlkeleri ve İnkılapları","Çağdaş Türk ve Dünya Tarihi"]},
  turkce:{name:"Türkçe",icon:"📖",color:"#534AB7",bg:"#EEEDFE",kpss:30,
    topics:["Sözcükte Anlam","Cümlede Anlam","Paragraf Yorumlama","Yazım Kuralları","Noktalama İşaretleri","Sözcük Türleri","Cümle Ögeleri","Anlatım Bozuklukları","Sözel Mantık"]},
  matematik:{name:"Matematik",icon:"📐",color:"#185FA5",bg:"#E6F1FB",kpss:30,
    topics:["Sayı Problemleri","Kesir ve Ondalık","Oran-Orantı","Yüzde Problemleri","Denklem ve Eşitsizlik","Kümeler","Hız-Zaman-Yol","İşçi-Havuz","Yaş Problemleri","İstatistik ve Olasılık","Geometri"]},
  cografya:{name:"Coğrafya",icon:"🌍",color:"#0F6E56",bg:"#E1F5EE",kpss:21,
    topics:["Harita Bilgisi","İklim ve Bitki Örtüsü","Türkiye Yer Şekilleri","Nüfus ve Yerleşme","Türkiye Tarım ve Hayvancılık","Madenler ve Enerji","Ulaşım Ticaret Turizm","Bölgeler Coğrafyası"]},
  vatandaslik:{name:"Vatandaşlık",icon:"⚖️",color:"#993556",bg:"#FBEAF0",kpss:7,
    topics:["Hukukun Temel Kavramları","Anayasa Hukuku","Temel Hak ve Özgürlükler","Yasama","Yürütme","Yargı","İdare Hukuku"]},
};

const LEVELS=[{n:"Aday",min:0,max:50},{n:"Stajyer",min:50,max:150},{n:"Asistan",min:150,max:300},{n:"Uzman",min:300,max:500},{n:"Profesör",min:500,max:800},{n:"Üstat",min:800,max:9999}];
const GOAL=15, TL=65;

// ─── SORU BANKASI (ÖSYM FORMATI) ───
// Her soru: t=konu, q=soru, o=şıklar, a=cevap, e=kısa açıklama, d=detaylı açıklama (KPSSBot notu)
const Q={
tarih:[
{t:"İslamiyet Öncesi Türk Devletleri",q:"Aşağıdakilerden hangisi, İslamiyet öncesi Türk devletlerinde devlet işlerinin görüşülüp karara bağlandığı meclisin adıdır?",o:{"A":"Pankuş","B":"Divan-ı Mezalim","C":"Kurultay (Toy)","D":"Kengeş","E":"Senato"},a:"C",e:"Kurultay (Toy), hükümdar dahil boy beylerinin katıldığı devlet meclisidir.",d:"ÖSYM bu soruyu sıkça farklı şekillerde sorar. Pankuş → Hitit, Divan-ı Mezalim → İslam devletleri, Senato → Roma. 'Toy' ve 'Kurultay' eş anlamlıdır. Hatırla: Kurultay'da kağanın kararları tartışmaya açıktı, bu yüzden Türklerde mutlak monarşi yoktu denir."},
{t:"İslamiyet Öncesi Türk Devletleri",q:"Aşağıdakilerden hangisi Göktürk Devleti'ne ait bir özellik değildir?",o:{"A":"Orhun Yazıtları'nı dikmişlerdir","B":"Türk adını kullanan ilk devlettir","C":"İkili teşkilat (doğu-batı) uygulamışlardır","D":"İlk Türk-İslam devleti olma özelliği taşır","E":"Bumin Kağan tarafından kurulmuştur"},a:"D",e:"İlk Türk-İslam devleti Karahanlılardır, Göktürkler İslamiyet öncesidir.",d:"Bu soru 'değildir/yoktur' formatı — ÖSYM'nin favori kalıbı. Göktürkler hakkında emin olman gereken 4 şey: (1) 552 kuruluş, (2) Türk adıyla kurulan İLK devlet, (3) Orhun Yazıtları, (4) İkili yönetim. Bunları bilen D'yi hemen eler."},
{t:"İslamiyet Öncesi Türk Devletleri",q:"Tarihte bilinen ilk yazılı antlaşma olan Kadeş Antlaşması'nı imzalayan devlet aşağıdakilerden hangisidir?",o:{"A":"Göktürkler","B":"Büyük Hun Devleti","C":"Uygurlar","D":"Hititler","E":"Lidyalılar"},a:"D",e:"Kadeş Antlaşması MÖ 1280'de Hititler ile Mısır arasında imzalanmıştır.",d:"Bu soru Anadolu uygarlıkları kapsamında gelir. Hititler = ilk yazılı antlaşma (Kadeş) + Pankuş meclisi + Anal denilen yıllıklar. Lidyalılar = ilk parayı kullanan. ÖSYM bunları karıştırarak sorar."},
{t:"İlk Türk-İslam Devletleri",q:"Aşağıdakilerden hangisi, İslamiyet'i resmi din olarak kabul eden ilk Türk devletinin adıdır?",o:{"A":"Gazneliler","B":"Karahanlılar","C":"Büyük Selçuklular","D":"Harzemşahlar","E":"Babürler"},a:"B",e:"Karahanlılar (840-1212), Türkçeyi resmi dil olarak kullanan ilk Müslüman Türk devletidir.",d:"ÖSYM 'ilk' sorularını çok sever. Karahanlılar = ilk Müslüman Türk devleti + Türkçe resmi dil. Gazneliler = Hindistan seferleri + Sultan unvanı. Selçuklular = Nizamiye + Malazgirt. Bu üçlüyü karıştırma."},
{t:"İlk Türk-İslam Devletleri",q:"Büyük Selçuklu Devleti döneminde kurulan ve İslam dünyasının ilk büyük medreseleri olarak kabul edilen eğitim kurumları aşağıdakilerden hangisidir?",o:{"A":"Enderun Mektebi","B":"Dar'ül-Fünun","C":"Nizamiye Medreseleri","D":"Sahn-ı Seman","E":"Sıbyan Mektebi"},a:"C",e:"Nizamiye Medreseleri, vezir Nizamülmülk tarafından Bağdat'ta kurulmuştur.",d:"Medrese soruları KPSS'de sürekli gelir. Eşleştirmeyi bil: Nizamiye → Büyük Selçuklu/Nizamülmülk. Enderun → Osmanlı (Fatih). Sahn-ı Seman → Osmanlı (Fatih). Dar'ül-Fünun → Tanzimat dönemi."},
{t:"Osmanlı Kuruluş Dönemi",q:"Osmanlı Devleti'nin kısa sürede büyümesini sağlayan etkenlerden hangisinin etkisi diğerlerine göre en azdır?",o:{"A":"Bizans İmparatorluğu'nun zayıf durumda olması","B":"Coğrafi konumun uç beyliği olarak avantaj sağlaması","C":"Fethedilen yerlerde istimalet politikası izlenmesi","D":"Kuruluş döneminde denizaşırı seferler düzenlenmesi","E":"Anadolu beyliklerinin kendi aralarındaki çatışmalar"},a:"D",e:"Kuruluş döneminde Osmanlı henüz deniz gücüne sahip değildi ve denizaşırı sefer düzenlememiştir.",d:"'En az etkilidir/etkisi yoktur' soruları ÖSYM'de çok yaygın. Kuruluş dönemi = kara odaklı genişleme. Denizcilik ancak Yükselme döneminde (Fatih, Barbaros) öne çıkar. Bu tür sorularda dönem bilgisi kritik."},
{t:"Osmanlı Kuruluş Dönemi",q:"Osmanlı Devleti'nde devlet işlerinin görüşüldüğü Divan-ı Hümayun ilk olarak hangi padişah döneminde kurulmuştur?",o:{"A":"Osman Bey","B":"Orhan Bey","C":"I. Murad","D":"Fatih Sultan Mehmet","E":"Yıldırım Bayezid"},a:"B",e:"Divan-ı Hümayun Orhan Bey döneminde oluşturulmuştur.",d:"Orhan Bey dönemi 'ilk'leri: İlk divan, ilk medrese (İznik), ilk vezir (Alaeddin Paşa), ilk düzenli ordu. I. Murad dönemi: Devşirme, Yeniçeri, Rumeli Beylerbeyliği. Bu ayrımı ÖSYM sever."},
{t:"Osmanlı Yükselme Dönemi",q:"Fatih Sultan Mehmet döneminde gerçekleştirilen aşağıdaki uygulamalardan hangisi, doğrudan merkezî otoritenin güçlendirilmesine yönelik değildir?",o:{"A":"Kanunname-i Âli Osman'ın hazırlanması","B":"Kardeş katli uygulamasının yasallaştırılması","C":"Sahn-ı Seman medreselerinin açılması","D":"Sadrazamın yetkilerinin genişletilmesi","E":"Divan başkanlığının sadrazama devredilmesi"},a:"C",e:"Sahn-ı Seman medreseleri eğitim amacıyla açılmıştır, merkezi otorite ile doğrudan ilişkisi yoktur.",d:"Fatih dönemi merkezileşme sorusu klasiktir. Kanunname = hukuki merkez, kardeş katli = taht kavgasını önleme, sadrazam yetkileri = padişahın divanı bırakması. Sahn-ı Seman İstanbul'un fethinden sonra kurulan eğitim kurumudur — farklı kategori."},
{t:"Osmanlı Yükselme Dönemi",q:"Kanuni Sultan Süleyman'ın Fransa'ya kapitülasyonlar tanımasının temel amacı aşağıdakilerden hangisidir?",o:{"A":"Fransa ile ticaret hacmini artırmak","B":"Avrupa'daki Hristiyan birliğini (Haçlı ittifakını) parçalamak","C":"Akdeniz'de üstünlük sağlamak","D":"Fransa'yı Osmanlı'ya bağımlı kılmak","E":"Avrupa'da toprak kazanmak"},a:"B",e:"Kapitülasyonlar, Avrupa'daki Hristiyan birliğini (özellikle Kutsal Roma-Germen) parçalama amacı taşımıştır.",d:"Kapitülasyon sorusu KPSS'de her yıl bir şekilde gelir. Anahtar: Kanuni döneminde tek taraflı ve geçiciydi, padişah değişince yenilenmeliydi. Kalıcı hale gelmesi 1740 (I. Mahmud). Kaldırılması Lozan 1923."},
{t:"Osmanlı Duraklama ve Islahatlar",q:"XVII. yüzyıl Osmanlı ıslahatçılarından Tarhuncu Ahmet Paşa, aşağıdaki alanlardan hangisinde ıslahat yapmıştır?",o:{"A":"Askerî","B":"Eğitim","C":"Malî","D":"Hukuk","E":"Toprak düzeni"},a:"C",e:"Tarhuncu Ahmet Paşa, Osmanlı tarihinde ilk tahmini bütçeyi (denk bütçe) hazırlamıştır.",d:"XVII. yüzyıl ıslahatçıları KPSS'de tablo sorusu olarak gelir. Ezberle: Kuyucu Murad Paşa = Celali isyanları bastırma (askerî). Tarhuncu = bütçe (malî). Koçi Bey = risale/rapor (danışma). IV. Murad = yasaklar + Revan/Bağdat."},
{t:"Osmanlı Duraklama ve Islahatlar",q:"Aşağıdakilerden hangisi IV. Murad dönemine ait gelişmelerden biri değildir?",o:{"A":"Tütün ve içki yasaklanmıştır","B":"Koçi Bey Risalesi hazırlanmıştır","C":"Revan ve Bağdat seferleri yapılmıştır","D":"Osmanlı'da matbaa ilk kez kullanılmaya başlanmıştır","E":"Yeniçeri Ocağı'nda düzenlemeler yapılmıştır"},a:"D",e:"Matbaa ilk kez III. Ahmed döneminde (Lale Devri, 1727) İbrahim Müteferrika tarafından kurulmuştur.",d:"Matbaa = Lale Devri (1718-1730) = III. Ahmed + Nevşehirli Damat İbrahim Paşa. IV. Murad = XVII. yüzyıl. Yüzyıl farkını bilen bu soruyu 5 saniyede çözer."},
{t:"Osmanlı Gerileme ve Dağılma",q:"1699 yılında imzalanan Karlofça Antlaşması'nın Osmanlı Devleti açısından en önemli sonucu aşağıdakilerden hangisidir?",o:{"A":"Osmanlı Devleti tarihinde ilk kez toprak kaybetmiştir","B":"Osmanlı Devleti ilk kez saldırı (taarruz) politikasını bırakarak savunmaya geçmiştir","C":"Osmanlı Devleti Avrupa'dan tamamen çekilmiştir","D":"Osmanlı Devleti ilk kez savaş tazminatı ödemiştir","E":"Osmanlı donanması tamamen imha edilmiştir"},a:"B",e:"Karlofça ile Osmanlı, Batı'da büyük çapta toprak kaybederek savunma politikasına geçmek zorunda kalmıştır.",d:"Karlofça çeldiricileri: A şıkkı yanlış çünkü daha önce de küçük toprak kayıpları var. Asıl önemli sonuç TAARRUZDAN SAVUNMAYA GEÇİŞ. Ayrıca: ilk çok taraflı antlaşma + arabulucu devlet (İngiltere/Hollanda) kullanılması."},
{t:"Tanzimat ve Meşrutiyet",q:"I. Meşrutiyet'in (1876) ilan edilmesinde aşağıdakilerden hangisinin doğrudan etkisi olmuştur?",o:{"A":"Yeniçeri Ocağı'nın kaldırılması","B":"Genç Osmanlılar (Jön Türkler) hareketinin yoğun baskısı","C":"Rusya'nın Osmanlı Devleti'ne savaş açması","D":"Islahat Fermanı'nın yetersiz bulunması","E":"Halkın padişaha karşı ayaklanması"},a:"B",e:"Genç Osmanlılar (Namık Kemal, Ziya Paşa vb.) anayasal düzen için baskı yapmıştır.",d:"I. Meşrutiyet kronolojisi: Genç Osmanlılar baskısı → Abdülaziz tahttan indirildi → V. Murad (kısa) → II. Abdülhamid tahta çıktı ve Kanun-i Esasi'yi ilan etti (23 Aralık 1876). 93 Harbi bahane edilerek 1878'de meclis kapatıldı."},
{t:"I. Dünya Savaşı",q:"Osmanlı Devleti'nin I. Dünya Savaşı'na fiilen girmesine doğrudan neden olan olay aşağıdakilerden hangisidir?",o:{"A":"Balkan Savaşları'nda uğranılan ağır yenilgiler","B":"İttihat ve Terakki Cemiyeti'nin iktidara gelmesi","C":"Goeben ve Breslau adlı Alman savaş gemilerinin Osmanlı bayrağı altında Rus limanlarını bombalaması","D":"İngiltere'nin sipariş edilen Osmanlı savaş gemilerine el koyması","E":"Osmanlı-Alman ittifak antlaşmasının imzalanması"},a:"C",e:"Yavuz (Goeben) ve Midilli (Breslau) gemileri Karadeniz'de Rus limanlarını bombalayarak Osmanlı'yı fiilen savaşa sokmuştur.",d:"'Fiilen girmesi' ifadesi anahtar. İttifak antlaşması (E) savaşa girme kararı, ama FİİLEN giriş = bombalama eylemi. ÖSYM bu nüansı test eder. Gemilerin Türk adları da sorulabilir: Goeben=Yavuz, Breslau=Midilli."},
{t:"Kurtuluş Savaşı Hazırlık",q:"Amasya Genelgesi'nin (22 Haziran 1919) Millî Mücadele açısından önemi aşağıdakilerden hangisidir?",o:{"A":"Türkiye Büyük Millet Meclisi ilk kez açılmıştır","B":"Kurtuluş Savaşı'nın gerekçesi, amacı ve yöntemi ilk kez belirlenmiştir","C":"Osmanlı Hükümeti ile bağlar resmen kesilmiştir","D":"Misakımillî kararları kabul edilmiştir","E":"Düzenli ordu kurulmuştur"},a:"B",e:"Amasya Genelgesi, Millî Mücadele'nin adeta manifestosudur: gerekçe, amaç ve yöntem açıkça ortaya konmuştur.",d:"Amasya Genelgesi'nin kilit cümleleri: 'Vatanın bütünlüğü, milletin istiklali tehlikededir' (gerekçe), 'Milletin istiklalini yine milletin azim ve kararı kurtaracaktır' (amaç+yöntem=milli irade). Bu cümle ayrıca milli egemenlik fikrinin ilk açık ifadesidir."},
{t:"TBMM ve Muharebeler",q:"Sakarya Meydan Muharebesi'nin (1921) kazanılmasının ardından TBMM tarafından Mustafa Kemal'e verilen unvan aşağıdakilerden hangisidir?",o:{"A":"Başkomutan","B":"Mareşal rütbesi ve Gazi unvanı","C":"Cumhurbaşkanı","D":"Müşir","E":"Atabey"},a:"B",e:"TBMM, Sakarya Zaferi sonrasında Mustafa Kemal'e Mareşal rütbesi ve Gazi unvanını vermiştir.",d:"Kronoloji karıştırılır: Başkomutanlık yetkisi Sakarya'dan ÖNCE (5 Ağustos 1921) verildi. Sakarya Zaferi SONRA (13 Eylül 1921) Mareşal+Gazi verildi. ÖSYM bu sıralamayı test eder."},
{t:"Atatürk İlkeleri ve İnkılapları",q:"Aşağıdaki inkılaplardan hangisi, Atatürk'ün 'Milliyetçilik' ilkesinin doğal bir sonucu olarak gerçekleşmemiştir?",o:{"A":"Türk Tarih Kurumunun kurulması","B":"Kabotaj Kanunu'nun çıkarılması","C":"Aşar (öşür) vergisinin kaldırılması","D":"Türk Dil Kurumunun kurulması","E":"Kapitülasyonların kaldırılması"},a:"C",e:"Aşar vergisinin kaldırılması doğrudan 'Halkçılık' ilkesiyle ilişkilidir.",d:"İlke-inkılap eşleştirmesi KPSS'de en az 2-3 soru gelir. Kısa formül: TTK/TDK/Kabotaj/Kapitülasyon kaldırma = MİLLİYETÇİLİK. Aşar kaldırma/soyadı = HALKÇILIK. Halifelik/tekke/şapka = LAİKLİK. KİT'ler/devlet bankaları = DEVLETÇİLİK."},
{t:"Atatürk İlkeleri ve İnkılapları",q:"Aşağıdaki inkılaplardan hangisi doğrudan 'Laiklik' ilkesiyle ilişkilendirilemez?",o:{"A":"Halifeliğin kaldırılması","B":"Türk Medeni Kanunu'nun kabulü","C":"Tekke ve zaviyelerin kapatılması","D":"Soyadı Kanunu'nun çıkarılması","E":"Tevhid-i Tedrisat Kanunu'nun çıkarılması"},a:"D",e:"Soyadı Kanunu toplumsal eşitlik amacı taşır ve Halkçılık/İnkılapçılık ile ilişkilidir.",d:"Laiklik inkılapları: Halifelik kaldırma + Medeni Kanun + Tekke/zaviye + Tevhid-i Tedrisat + şapka + takvim/saat değişikliği. Soyadı Kanunu din-devlet ayrımı ile ilgili değil, toplumsal modernleşme ile ilgili."},
{t:"Çağdaş Türk ve Dünya Tarihi",q:"Soğuk Savaş döneminde kurulan NATO'nun (Kuzey Atlantik Antlaşması Örgütü) temel kuruluş amacı aşağıdakilerden hangisidir?",o:{"A":"Üye ülkelerin ekonomik kalkınmasını sağlamak","B":"Sömürge topraklarını yönetmek","C":"Sovyet tehdidine karşı kolektif savunma oluşturmak","D":"Nükleer silahların yayılmasını sağlamak","E":"Birleşmiş Milletler'i güçlendirmek"},a:"C",e:"NATO (1949), SSCB tehdidine karşı Batı blokunun kolektif güvenlik/savunma örgütü olarak kurulmuştur.",d:"Soğuk Savaş örgütleri: NATO (1949)=Batı savunma. Varşova Paktı (1955)=Doğu savunma. Marshall Planı=ekonomik yardım. Truman Doktrini=ABD dış politika değişikliği. Türkiye NATO'ya 1952'de Kore Savaşı katkısıyla girdi."},
{t:"İslamiyet Öncesi Türk Devletleri",q:"Uygurlar, diğer İslamiyet öncesi Türk devletlerinden farklı olarak aşağıdaki alanlardan hangisinde öne çıkmışlardır?",o:{"A":"Denizcilik","B":"Yerleşik hayata geçiş ve matbaa kullanımı","C":"Demir madenciliği","D":"Deniz ticareti","E":"Piramit yapımı"},a:"B",e:"Uygurlar yerleşik hayata geçen, matbaa ve kâğıt kullanan ilk Türk devletidir.",d:"Uygur farkları: Yerleşik hayat + Maniheizm/Budizm + matbaa + hareketli harf + kâğıt para. Diğer Türk devletleri göçebe. Bu 'farklılık' sorusu ÖSYM'nin klasik kalıbı."},
{t:"Osmanlı Kuruluş Dönemi",q:"Osmanlı Devleti'nde tımar sisteminin temel amacı aşağıdakilerden hangisidir?",o:{"A":"Padişahın otoritesini sınırlamak","B":"Toprağın işlenmesini ve asker yetiştirilmesini sağlamak","C":"Ticaret gelirlerini artırmak","D":"Deniz kuvvetlerini güçlendirmek","E":"Medreseleri finanse etmek"},a:"B",e:"Tımar sistemi hem tarımsal üretimi sürdürmeyi hem de savaşa hazır atlı asker (sipahi) yetiştirmeyi amaçlamıştır.",d:"Tımar sistemi KPSS'de çok çıkar. Tımar = maaş yerine toprak geliri. Sipahi = tımarlı asker. Hazineye yük olmadan ordu beslenir + toprak boş kalmaz. Sistem bozulması = Celali isyanları."},
{t:"Osmanlı Duraklama ve Islahatlar",q:"Lale Devri'nde (1718-1730) aşağıdaki gelişmelerden hangisi yaşanmamıştır?",o:{"A":"İlk Türk matbaasının kurulması","B":"Avrupa'ya geçici elçilerin gönderilmesi","C":"Çiçek aşısının uygulanması","D":"Yeniçeri Ocağı'nın kaldırılması","E":"İtfaiye teşkilatının kurulması"},a:"D",e:"Yeniçeri Ocağı II. Mahmud döneminde 1826'da (Vaka-i Hayriye) kaldırılmıştır.",d:"Lale Devri = barış + batılılaşma başlangıcı. İbrahim Müteferrika matbaası, çiçek aşısı, Yalova kâğıt fabrikası, itfaiye, çini atölyeleri. Patrona Halil İsyanı ile sona erdi (1730). Yeniçeri kaldırma çok sonra."},
{t:"Osmanlı Gerileme ve Dağılma",q:"Osmanlı Devleti'nde XIX. yüzyılda görülen milliyetçilik hareketlerinden ilk bağımsızlığını kazanan topluluk aşağıdakilerden hangisidir?",o:{"A":"Bulgarlar","B":"Sırplar","C":"Rumlar (Yunanlılar)","D":"Arnavutlar","E":"Araplar"},a:"C",e:"Yunanistan 1829 Edirne Antlaşması ile bağımsızlığını kazanan ilk topluluktur.",d:"Bağımsızlık kronolojisi: Yunanistan (1829) → Sırbistan, Karadağ, Romanya (1878 Berlin) → Bulgaristan (1908) → Arnavutluk (1912). ÖSYM 'ilk' olanı sever."},
{t:"Tanzimat ve Meşrutiyet",q:"Tanzimat Fermanı (1839) ile aşağıdakilerden hangisi ilk kez güvence altına alınmıştır?",o:{"A":"Padişahın mutlak yetkisi","B":"Can, mal ve namus güvenliği","C":"Meclis açılması","D":"Seçim hakkı","E":"Basın özgürlüğü"},a:"B",e:"Tanzimat Fermanı ile can, mal ve namus güvenliği hukuki güvenceye kavuşturulmuştur.",d:"Tanzimat Fermanı (Gülhane Hatt-ı Hümayunu) = padişah kendi yetkilerini kısıtladı. Can-mal-namus güvencesi + yargılanmadan ceza verilmemesi + vergi adaleti. Hazırlayan: Mustafa Reşid Paşa. Meclis açılması I. Meşrutiyet'te (1876)."},
{t:"I. Dünya Savaşı",q:"Aşağıdakilerden hangisi Osmanlı Devleti'nin I. Dünya Savaşı'nda savaştığı cephelerden biri değildir?",o:{"A":"Çanakkale Cephesi","B":"Kafkas Cephesi","C":"Batı (Avrupa) Cephesi","D":"Kanal Cephesi","E":"Irak Cephesi"},a:"C",e:"Batı Cephesi Almanya-Fransa arasındadır, Osmanlı bu cephede savaşmamıştır.",d:"Osmanlı cepheleri: Taarruz = Kafkas, Kanal, Çanakkale (savunma ama sonuç taarruz). Savunma = Irak, Suriye-Filistin, Çanakkale, Hicaz-Yemen. Batı Cephesi = Almanya vs Fransa/İngiltere → Osmanlı yok."},
{t:"Kurtuluş Savaşı Hazırlık",q:"Erzurum Kongresi (1919) ile ilgili aşağıdaki bilgilerden hangisi yanlıştır?",o:{"A":"Doğu illerinin haklarını savunmak için toplanmıştır","B":"Misakımillî sınırları ilk kez çizilmiştir","C":"Ulusal sınırlar içinde vatanın bütünlüğü vurgulanmıştır","D":"Millî iradeyi temsil edecek bir heyet seçilmiştir","E":"Manda ve himaye kesinlikle reddedilmiştir"},a:"B",e:"Misakımillî kararları Erzurum'da değil, son Osmanlı Mebusan Meclisi'nde (28 Ocak 1920) kabul edilmiştir.",d:"Erzurum Kongresi = bölgesel ama ulusal kararlar aldı. Sivas Kongresi = tüm cemiyetleri birleştirdi. Misakımillî = Mebusan Meclisi. Bu üçlü kronoloji ve içerik farkı KPSS'de sürekli sorulur."},
{t:"TBMM ve Muharebeler",q:"Aşağıdakilerden hangisi I. İnönü Muharebesi'nin sonuçlarından biridir?",o:{"A":"İstiklal Marşı'nın kabulü","B":"Moskova Antlaşması'nın imzalanması","C":"Londra Konferansı'na TBMM'nin davet edilmesi","D":"Hepsi","E":"Teşkilat-ı Esasiye'nin kabulü"},a:"D",e:"I. İnönü Zaferi sonrasında hem İstiklal Marşı kabul edilmiş, hem Moskova Antlaşması imzalanmış, hem Londra Konferansı daveti gelmiş, hem Teşkilat-ı Esasiye kabul edilmiştir.",d:"I. İnönü sonrası gelişmeler zinciri KPSS'de sıkça sorulur. Hepsi birbiriyle bağlantılı: Zafer → uluslararası meşruiyet → SSCB tanıma (Moskova) → Batı'nın muhatap alması (Londra) → anayasal düzen (Teşkilat-ı Esasiye)."},
{t:"Atatürk İlkeleri ve İnkılapları",q:"Türk Medeni Kanunu'nun 1926'da İsviçre'den alınarak kabul edilmesinin temel gerekçesi aşağıdakilerden hangisidir?",o:{"A":"İsviçre'nin Türkiye'ye en yakın Avrupa ülkesi olması","B":"İsviçre Medeni Kanunu'nun en yeni ve laik nitelikte olması","C":"Osmanlı'nın daha önce İsviçre ile antlaşma yapması","D":"İsviçre'nin NATO üyesi olması","E":"Türk hukukçuların tamamının İsviçre'de eğitim görmüş olması"},a:"B",e:"İsviçre Medeni Kanunu dönemin en modern, laik ve eşitlikçi kanunu olarak değerlendirilmiştir.",d:"Medeni Kanun KPSS'de hem Tarih hem Vatandaşlık'ta çıkar. Getirdiği yenilikler: Resmi nikâh zorunluluğu, tek eşlilik, kadın-erkek eşitliği, miras hakkında eşitlik. Laiklik ilkesiyle doğrudan bağlantılı."},
{t:"Çağdaş Türk ve Dünya Tarihi",q:"Türkiye'nin Kore Savaşı'na (1950-1953) asker göndermesinin en önemli sonucu aşağıdakilerden hangisidir?",o:{"A":"BM'ye üye olması","B":"NATO'ya kabul edilmesi","C":"AB'ye üye olması","D":"Varşova Paktı'na girmesi","E":"Marshall yardımı alması"},a:"B",e:"Türkiye, Kore'deki başarılı performansı sonucunda 1952'de NATO üyeliğine kabul edilmiştir.",d:"Kore Savaşı → NATO ilişkisi KPSS'de klasik soru. Türkiye BM'ye 1945'te zaten üyeydi. Marshall yardımı 1948'de başlamıştı. NATO'ya alınma 1952. AB üyeliği hâlâ gerçekleşmedi."},
],
turkce:[
{t:"Sözcükte Anlam",q:"'Göz' sözcüğü, aşağıdaki cümlelerin hangisinde mecaz anlamıyla kullanılmıştır?",o:{"A":"Gözleri çok güzel bir renkteydi.","B":"Bu kumaşın gözleri oldukça iri.","C":"İğnenin gözünden ipliği zor geçirdi.","D":"Çocuğun gözü hafifçe iltihaplandı.","E":"Gözlerimi kısarak okumaya çalıştım."},a:"B",e:"'Kumaşın gözleri' ifadesinde göz, organ anlamı dışında (kumaştaki delikler) mecaz anlamda kullanılmıştır.",d:"Mecaz anlam: Sözcüğün gerçek anlamından uzaklaşarak kazandığı yeni anlam. İğnenin gözü de mecaz ama ÖSYM'de 'ad aktarması / deyim' kapsamında da sorulabilir. Kumaşın gözü daha net bir mecaz örnektir."},
{t:"Sözcükte Anlam",q:"Aşağıdaki cümlelerin hangisinde altı çizili sözcük somut anlamda kullanılmıştır?",o:{"A":"Derin düşüncelere daldı.","B":"Sert bir üslupla konuşuyordu.","C":"Ağır bir yük taşıyordu.","D":"Tatlı sözlerle herkesi ikna etti.","E":"Keskin bir zekâsı vardı."},a:"C",e:"'Ağır bir yük' fiziksel olarak ağır anlamında somut kullanımdır.",d:"Somut/soyut ayrımı: Beş duyuyla algılanabiliyorsa somut. Derin düşünce (soyut), sert üslup (soyut), tatlı söz (soyut), keskin zekâ (soyut). Ağır yük = elde tutulup tartılabilir → somut."},
{t:"Cümlede Anlam",q:"'Yalnızca okuyan değil, okuduğunu anlayan toplumlar ilerler.'\n\nBu cümlede anlatılmak istenen düşünce aşağıdakilerden hangisidir?",o:{"A":"Okumak tek başına yeterli değildir, anlamak da gereklidir.","B":"Her okuyan toplum mutlaka ilerler.","C":"İlerleme yalnızca eğitimle mümkündür.","D":"Anlama yeteneği doğuştan gelir.","E":"Toplumlar her koşulda ilerler."},a:"A",e:"'Yalnızca okuyan değil' ifadesi, salt okumanın yetmeyeceğini, anlamanın da şart olduğunu vurgular.",d:"ÖSYM cümle yorumlama soruları: Cümledeki 'değil...da/de' yapısı = bir şeyin yetmeyip başka şeyin de gerektiği anlamı. Bu yapıyı gördüğünde cevap genellikle 'ikisi birden gerekli' formatında olur."},
{t:"Paragraf Yorumlama",q:"Bir paragrafın ana düşüncesini belirlemek için aşağıdakilerden hangisine dikkat edilmelidir?",o:{"A":"Yalnızca paragrafın ilk cümlesine","B":"Paragraftaki ayrıntı bilgilere","C":"Paragrafın bütününde anlatılmak istenen temel mesaja","D":"Son cümledeki bağlaca","E":"Kullanılan sözcük sayısına"},a:"C",e:"Ana düşünce, paragrafın tamamında vurgulanan temel mesajdır.",d:"Ana düşünce soruları KPSS Türkçe'nin en ağırlıklı kısmıdır (~10-12 soru). Teknik: Her cümleyi oku ve 'bu paragraf kalksa ne eksilir?' diye sor. Kaldırılamayan, paragrafı özetleyen cümle = ana düşünce."},
{t:"Yazım Kuralları",q:"Aşağıdaki cümlelerin hangisinde bir yazım yanlışı yapılmıştır?",o:{"A":"Herkes sınava zamanında geldi.","B":"Hiç kimse bu sonucu beklemiyordu.","C":"Birdenbire kapı açılıverdi.","D":"Her halde yarın yağmur yağacak.","E":"Bugünkü toplantı ertelendi."},a:"D",e:"'Herhalde' (galiba/muhtemelen anlamında) bitişik yazılmalıdır.",d:"ÖSYM yazım soruları: 'herhalde' vs 'her halde' farkı → herhalde=galiba (bitişik), her halde=her durumda (ayrı). Benzer: hiçbir (bitişik), her bir (ayrı). Ki bağlacı: oysaki, mademki, halbuki, sanki = bitişik. Öyle ki, yeter ki = ayrı."},
{t:"Yazım Kuralları",q:"Aşağıdaki cümlelerin hangisinde 'ki' bağlacının yazımı doğrudur?",o:{"A":"Madem ki gelmeyecektin bari haber verseydin.","B":"Öyle ki herkes bu duruma şaşırdı.","C":"Halbuki onu bu konuda defalarca uyarmıştım.","D":"Çünkü ki o hiçbir zaman gelmez.","E":"Belki ki yarın hava güzel olur."},a:"C",e:"'Halbuki' bitişik yazılır. 'Öyle ki' ayrı yazılmalıdır.",d:"'Ki' kuralı formülü: SOMiBaHÇeM (Sanki, Oysaki, Mademki, Belki, Halbuki, Çünkü, Meğerki) = bitişik yazılanlar. Bunların dışındakiler ayrı. 'Öyle ki', 'yeter ki', 'kaldı ki' = ayrı."},
{t:"Noktalama İşaretleri",q:"Aşağıdaki cümlelerin hangisinde virgül (,) yanlış kullanılmıştır?",o:{"A":"Evet, bu konuda kesinlikle haklısın.","B":"Kitapları, defterleri ve kalemleri topladı.","C":"Ali, dün akşam eve geç geldi.","D":"Ancak, bu durum çok uzun sürmedi.","E":"Güzel, temiz ve bakımlı bir evdi."},a:"C",e:"Özne (Ali) ile yüklem arasına virgül konulmaz.",d:"KPSS virgül soruları: (1) Özne-yüklem arası virgül KONMAZ. (2) Hitap/seslenme sonrası KONUR. (3) Sıralı ögelerde KONUR (son öge hariç). (4) Cümle başı bağlaçlardan sonra KONABİLİR (ancak, fakat)."},
{t:"Sözcük Türleri",q:"'Bazı insanlar her şeyi çok ciddiye alır.'\n\nBu cümlede kaç tane sıfat kullanılmıştır?",o:{"A":"1","B":"2","C":"3","D":"4","E":"Sıfat kullanılmamıştır"},a:"B",e:"'Bazı' (belgisiz sıfat → insanları niteler) ve 'her' (belgisiz sıfat → şeyi niteler) olmak üzere 2 sıfat vardır.",d:"Sıfat testi: Sözcük bir isimden önce gelip onu niteliyorsa veya belirtiyorsa sıfattır. 'Çok' burada 'ciddiye almak' fiilini etkilediği için ZARF. Sıfat mı zarf mı sorusu ÖSYM'nin favori tuzaklarından."},
{t:"Cümle Ögeleri",q:"'Dün akşam arkadaşlarımla birlikte sinemaya gittik.'\n\nBu cümlede 'dün akşam' söz grubu hangi cümle ögesi görevindedir?",o:{"A":"Özne","B":"Belirtisiz nesne","C":"Zarf tümleci","D":"Dolaylı tümleç","E":"Yüklem"},a:"C",e:"'Dün akşam' zaman bildiren bir zarf tümlecidir; 'Ne zaman?' sorusuna yanıt verir.",d:"Cümle ögeleri soru formülü: Yüklem = Ne yaptı? Özne = Kim? Nesne = Neyi/Ne? Dolaylı tümleç = Nereye/Nerede/Nereden/Kime? Zarf tümleci = Ne zaman/Nasıl/Niçin/Ne kadar? 'Dün akşam' = Ne zaman? → Zarf tümleci."},
{t:"Anlatım Bozuklukları",q:"'Öğrenciler hem sınava hazırlanıyor hem de derse çalışıyorlardı.'\n\nBu cümledeki anlatım bozukluğunun türü aşağıdakilerden hangisidir?",o:{"A":"Tamlama yanlışlığı","B":"Anlamca çelişki (gereksiz kullanım)","C":"Özne-yüklem uyumsuzluğu","D":"Gereksiz sözcük kullanımı","E":"Bağlantı kopukluğu"},a:"B",e:"Sınava hazırlanmak ve derse çalışmak özünde aynı eylemi ifade ettiğinden anlamca çelişki/gereksizlik vardır.",d:"Anlatım bozuklukları KPSS'de 2-3 soru gelir. Ana türler: (1) Anlam belirsizliği, (2) Anlamca çelişki, (3) Gereksiz sözcük, (4) Özne-yüklem uyumsuzluğu, (5) Tamlama yanlışı, (6) Bağlantı eksikliği. Bu soruda 'hem...hem de' farklı iki eylem bağlamalıdır."},
{t:"Sözel Mantık",q:"'Tüm doktorlar üniversite mezunudur. Bazı üniversite mezunları yurt dışında yaşamaktadır.'\n\nBuna göre aşağıdaki yargılardan hangisine kesinlikle ulaşılabilir?",o:{"A":"Tüm doktorlar yurt dışında yaşamaktadır.","B":"Bazı doktorlar yurt dışında yaşamaktadır.","C":"Yurt dışında yaşayanların hepsi doktordur.","D":"Doktorlar üniversite mezunudur.","E":"Hiçbir doktor yurt dışında yaşamamaktadır."},a:"D",e:"Birinci öncülden 'tüm doktorlar üniversite mezunudur' kesin bir yargıdır.",d:"Sözel mantık formülü: 'Tüm A, B'dir' → KESİN. 'Bazı B, C'dir' → A'dan C'ye geçiş KESİN DEĞİL. D birinci öncülün tekrarı → KESİN."},
{t:"Sözcükte Anlam",q:"'Yüz' sözcüğü aşağıdaki cümlelerin hangisinde terim anlamıyla kullanılmıştır?",o:{"A":"Yüzüne bakamadım.","B":"Bu kumaştan yüz metre aldık.","C":"Binanın yüzü boyandı.","D":"Üçgenin yüz ölçümünü hesapladık.","E":"Yüzme havuzuna gittik."},a:"D",e:"'Yüz ölçümü' matematik/geometri terimi olarak terim anlamında kullanılmıştır.",d:"Terim anlamı = bir bilim dalına ait özel anlam. Günlük dilde 'yüz' = surat. Geometride 'yüz' = alan/yüzey. ÖSYM terim anlamı sorularını gerçek anlam/mecaz anlamla karıştırarak sorar."},
{t:"Cümlede Anlam",q:"'Bilgi paylaştıkça çoğalan tek hazinedir.'\n\nBu cümleyle anlatılmak istenen aşağıdakilerden hangisidir?",o:{"A":"Bilgi maddi bir değerdir.","B":"Hazine saklanmalıdır.","C":"Bilgi başkalarıyla paylaşıldığında değer kazanır ve artar.","D":"Her bilgi değerlidir.","E":"Paylaşmak her zaman zararlıdır."},a:"C",e:"'Paylaştıkça çoğalan' ifadesi bilginin paylaşıldığında artma özelliğini vurgular.",d:"Bu tip özdeyiş/atasözü yorumlama soruları KPSS Türkçe'de sık gelir. Teknik: Mecazı somuta çevir. 'Hazine' = değerli şey. 'Paylaştıkça çoğalma' = maddi olmayan artış. İkisini birleştir → C."},
{t:"Paragraf Yorumlama",q:"Bir paragrafta yazar önce genel bir yargı bildirip sonra örneklerle destekliyorsa bu anlatım tekniği aşağıdakilerden hangisidir?",o:{"A":"Tümevarım","B":"Tümdengelim","C":"Analoji","D":"Betimleme","E":"Öyküleme"},a:"B",e:"Genelden özele gidiş tümdengelim yöntemidir.",d:"Anlatım teknikleri: Tümdengelim = genel → özel (önce kural, sonra örnek). Tümevarım = özel → genel (önce örnekler, sonra sonuç). Analoji = benzetme ile açıklama. KPSS'de paragraf yapısını tanıma sorusu çok gelir."},
{t:"Sözcük Türleri",q:"'Çocuk çok güzel bir resim çizmiş.'\n\nBu cümlede kaç tane zarf vardır?",o:{"A":"1","B":"2","C":"3","D":"4","E":"Zarf yoktur"},a:"A",e:"'Çok' sözcüğü 'güzel' sıfatını pekiştirdiği için zarftır. 'Güzel' ve 'bir' sıfattır, zarf değildir.",d:"Zarf-sıfat ayrımı KPSS tuzağı: 'Çok güzel' → çok zarftır (sıfatı niteliyor). 'Çok kitap' → çok sıfattır (ismi niteliyor). Aynı sözcük bağlama göre sıfat veya zarf olabilir. 'Ne kadar?' sorusuna cevap = zarf."},
{t:"Anlatım Bozuklukları",q:"'Sınav sonuçları beklediğimizden daha iyi olumlu çıktı.'\n\nBu cümledeki anlatım bozukluğu aşağıdakilerden hangisidir?",o:{"A":"Özne eksikliği","B":"Yüklem eksikliği","C":"Gereksiz sözcük kullanımı","D":"Anlamca çelişki","E":"Tamlama yanlışı"},a:"C",e:"'İyi' ve 'olumlu' aynı anlamı taşıdığından birinin kullanımı gereksizdir.",d:"Gereksiz sözcük = eş anlamlı iki sözcüğün bir arada kullanılması. 'İyi olumlu' = ikisi de aynı yönü gösteriyor. Diğer yaygın örnekler: 'ilk önce', 'en son sonuç', 'eski antik'."},
{t:"Yazım Kuralları",q:"Aşağıdaki cümlelerin hangisinde büyük harf kullanımı ile ilgili bir yanlışlık yapılmıştır?",o:{"A":"Türk Dil Kurumu 1932'de kurulmuştur.","B":"Marmara denizi Türkiye'nin en küçük denzidir.","C":"Kurtuluş Savaşı 1919'da başlamıştır.","D":"Atatürk, Ankara'ya geldi.","E":"Cumhuriyet Bayramı 29 Ekim'de kutlanır."},a:"B",e:"'Marmara Denizi' ifadesinde 'Denizi' sözcüğü büyük harfle yazılmalıdır çünkü özel adın parçasıdır.",d:"Coğrafi özel adlarda her sözcük büyük harfle başlar: Karadeniz, Marmara Denizi, Van Gölü, Ağrı Dağı. ÖSYM bu kuralı sıkça test eder."},
{t:"Noktalama İşaretleri",q:"Aşağıdaki cümlelerin hangisinde iki nokta (:) yanlış kullanılmıştır?",o:{"A":"Şunları aldım: ekmek, süt, yumurta.","B":"Atatürk diyor ki: 'Yurtta barış, dünyada barış.'","C":"Sınıfta: öğrenciler sessizce oturuyordu.","D":"İki şey unutma: dürüstlük ve çalışkanlık.","E":"Toplantının gündemi: bütçe ve personel."},a:"C",e:"C cümlesinde iki noktanın kullanımı gereksiz ve yanlıştır; açıklama veya örnekleme amacı taşımamaktadır.",d:"İki nokta kullanımı: (1) Örnekleme öncesinde, (2) Açıklama öncesinde, (3) Alıntı (söz) öncesinde. C'de hiçbiri yok, sadece yer bildiriyor — bu durumda iki nokta kullanılmaz."},
{t:"Sözel Mantık",q:"'Hiçbir balık uçamaz. Bazı canlılar uçabilir.'\n\nBuna göre aşağıdakilerden hangisi kesinlikle doğrudur?",o:{"A":"Bazı balıklar canlı değildir.","B":"Uçabilen canlılar balık değildir.","C":"Tüm canlılar uçabilir.","D":"Bazı balıklar uçabilir.","E":"Canlılar balıklardan oluşur."},a:"B",e:"Hiçbir balık uçamaz + bazı canlılar uçabilir → uçabilen canlılar kesinlikle balık değildir.",d:"'Hiçbir A, B değildir' = A ve B kesişmez. Uçabilen canlılar varsa ve hiçbir balık uçamıyorsa, uçan canlılar balık olamaz. Bu 'hiçbir' + 'bazı' kombinasyonu KPSS sözel mantıkta çok gelir."},
],
matematik:[
{t:"Sayı Problemleri",q:"Ardışık üç çift sayının toplamı 78'dir.\n\nBuna göre bu sayıların en büyüğü kaçtır?",o:{"A":"24","B":"26","C":"28","D":"30","E":"32"},a:"C",e:"n + (n+2) + (n+4) = 78 → 3n + 6 = 78 → n = 24. En büyük: 24 + 4 = 28.",d:"Ardışık çift sayı formülü: n, n+2, n+4. Toplamları 3n+6. Ardışık tek de aynı formül. Ardışık tam sayı: n, n+1, n+2 → toplam 3n+3. KPSS'de genellikle en büyük veya en küçük sorulur."},
{t:"Sayı Problemleri",q:"İki basamaklı bir sayının rakamları toplamı 11'dir. Bu sayının rakamları yer değiştirdiğinde elde edilen yeni sayı, ilk sayıdan 27 fazladır.\n\nBuna göre ilk sayı kaçtır?",o:{"A":"47","B":"56","C":"38","D":"74","E":"65"},a:"A",e:"a + b = 11 ve (10b + a) - (10a + b) = 27 → 9(b - a) = 27 → b - a = 3. Çözüm: a = 4, b = 7 → Sayı: 47.",d:"İki basamaklı sayı problemleri: ab = 10a + b. Yer değiştirme: ba = 10b + a. Fark her zaman 9(b-a) veya 9(a-b). Bu yüzden fark 9'un katı olmalı. 27/9 = 3 → rakamlar farkı 3."},
{t:"Kesir ve Ondalık",q:"1/2 + 1/3 + 1/6 işleminin sonucu kaçtır?",o:{"A":"1/2","B":"2/3","C":"1","D":"5/6","E":"3/4"},a:"C",e:"Payda eşitleme: 3/6 + 2/6 + 1/6 = 6/6 = 1.",d:"EKOK bularak payda eşitle: 2, 3, 6'nın EKOK'u = 6. Bu tür sorularda hesap makinesi yok, hızlı EKOK bulmak kritik."},
{t:"Oran-Orantı",q:"Bir sınıftaki kız ve erkek öğrenci sayılarının oranı 3/5'tir. Sınıfta toplam 40 öğrenci bulunduğuna göre kaç kız öğrenci vardır?",o:{"A":"10","B":"12","C":"15","D":"20","E":"25"},a:"C",e:"Toplam oran: 3 + 5 = 8 birim. 40 / 8 = 5 (bir birim). Kız: 3 × 5 = 15.",d:"Oran soruları: Oranı toplama çevir, sonra birim bul. Kız:Erkek = 3:5 → toplam 8 birim. 40/8=5 → her birim 5 kişi."},
{t:"Yüzde Problemleri",q:"Bir ürünün fiyatı önce %20 artırılmış, ardından %20 indirim yapılmıştır.\n\nBuna göre ürünün fiyatında yüzde kaç değişim olmuştur?",o:{"A":"Fiyat değişmemiştir","B":"%4 azalmıştır","C":"%4 artmıştır","D":"%2 azalmıştır","E":"%2 artmıştır"},a:"B",e:"100 → %20 artış → 120 → %20 indirim → 120 × 0.80 = 96. Net değişim: %4 azalma.",d:"Ardışık yüzde değişimi KPSS'de çok çıkar. Kural: %a artış sonra %a azalış = başa dönmez, her zaman %a²/100 kadar zarar edersin. %20 için: 20²/100 = %4 zarar."},
{t:"Denklem ve Eşitsizlik",q:"3x - 7 = 2x + 5 denkleminin çözüm kümesi aşağıdakilerden hangisidir?",o:{"A":"{10}","B":"{12}","C":"{-2}","D":"{8}","E":"{14}"},a:"B",e:"3x - 2x = 5 + 7 → x = 12.",d:"Birinci derece denklem: Bilinmeyenleri bir tarafa, sabitleri diğer tarafa topla. Taraf değiştirince işaret değişir."},
{t:"Kümeler",q:"A = {1, 2, 3, 4, 5} ve B = {3, 4, 5, 6, 7} kümeleri veriliyor.\n\nBuna göre A ∩ B kümesinin eleman sayısı kaçtır?",o:{"A":"2","B":"3","C":"4","D":"5","E":"7"},a:"B",e:"A ∩ B (kesişim) = {3, 4, 5} → 3 eleman.",d:"Küme işlemleri: ∩ (kesişim) = ortak elemanlar. ∪ (birleşim) = tüm elemanlar. A\\B (fark) = A'da olup B'de olmayan. s(A∪B) = s(A) + s(B) - s(A∩B)."},
{t:"Hız-Zaman-Yol",q:"Saatte 60 km hızla giden bir araç, aynı yolu saatte 80 km hızla giderse 1 saat erken varıyor.\n\nBuna göre yolun uzunluğu kaç km'dir?",o:{"A":"200","B":"220","C":"240","D":"260","E":"280"},a:"C",e:"60t = 80(t - 1) → 60t = 80t - 80 → 20t = 80 → t = 4 saat. Yol = 60 × 4 = 240 km.",d:"Hız problemi formülü: Yol = Hız × Süre. İki hız karşılaştırma: Yol sabittir. v₁t₁ = v₂t₂. Süre farkı verildiyse: t₂ = t₁ - fark. Bu kalıbı ezberle."},
{t:"İşçi-Havuz",q:"Bir işi A tek başına 6 günde, B tek başına 12 günde bitirebilmektedir.\n\nA ve B birlikte çalışırlarsa bu işi kaç günde bitirirler?",o:{"A":"3","B":"4","C":"5","D":"6","E":"8"},a:"B",e:"A'nın günlük işi: 1/6, B'nin: 1/12. Birlikte: 1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4 → 4 gün.",d:"İşçi-havuz temel formül: Birlikte çalışma hızı = tek tek hızların toplamı. İşin tamamı = 1. Günlük iş = 1/toplam gün."},
{t:"Yaş Problemleri",q:"Bir baba, oğlundan 24 yaş büyüktür. 4 yıl sonra babanın yaşı, oğlunun yaşının 3 katı olacaktır.\n\nBuna göre oğlun şimdiki yaşı kaçtır?",o:{"A":"6","B":"8","C":"10","D":"12","E":"14"},a:"B",e:"Oğul: x, Baba: x + 24. 4 yıl sonra: (x + 28) = 3(x + 4) → x + 28 = 3x + 12 → 16 = 2x → x = 8.",d:"Yaş problemi altın kuralı: Yaş farkı HİÇ değişmez. Şimdi 24 yaş fark varsa, 4 yıl sonra da 24 yaş fark olacak. Denklem kurarken her iki yaşa da aynı süreyi ekle."},
{t:"İstatistik ve Olasılık",q:"5, 8, 3, 12, 7 sayılarının aritmetik ortalaması kaçtır?",o:{"A":"5","B":"6","C":"7","D":"8","E":"9"},a:"C",e:"Toplam: 5 + 8 + 3 + 12 + 7 = 35. Ortalama: 35 / 5 = 7.",d:"Aritmetik ortalama = toplam / adet. Medyan = sıralandığında ortadaki değer. Mod = en çok tekrarlanan. KPSS'de üçü de sorulabilir."},
{t:"Geometri",q:"Bir dik üçgenin birbirine dik olan kenarlarının uzunlukları 6 cm ve 8 cm'dir.\n\nBuna göre bu üçgenin hipotenüs uzunluğu kaç cm'dir?",o:{"A":"9","B":"10","C":"11","D":"12","E":"14"},a:"B",e:"Pisagor teoremi: c² = 6² + 8² = 36 + 64 = 100 → c = 10 cm.",d:"Pisagor üçlüleri ezberle: 3-4-5, 5-12-13, 6-8-10, 8-15-17. KPSS'de genellikle bu üçlülerden biri verilir."},
{t:"Sayı Problemleri",q:"Üç basamaklı en küçük çift sayı ile iki basamaklı en büyük tek sayının toplamı kaçtır?",o:{"A":"198","B":"199","C":"200","D":"201","E":"202"},a:"B",e:"Üç basamaklı en küçük çift sayı: 100. İki basamaklı en büyük tek sayı: 99. Toplam: 199.",d:"'En küçük/en büyük' sorularında dikkat: En küçük 3 basamaklı = 100. En küçük 3 basamaklı tek = 101. En büyük 2 basamaklı = 99. Bu tür sorularda çift/tek ayrımını kaçırmamak kritik."},
{t:"Yüzde Problemleri",q:"Bir mağaza 200 TL'lik bir ürüne önce %25 indirim, ardından kalan fiyata %10 indirim daha uygulamıştır.\n\nÜrünün son fiyatı kaç TL'dir?",o:{"A":"130","B":"135","C":"140","D":"145","E":"150"},a:"B",e:"200 × 0.75 = 150 TL. 150 × 0.90 = 135 TL.",d:"Ardışık indirim: Yüzdeleri TOPLAYAMAZSIN. %25 + %10 ≠ %35 indirim. Her indirimi sırayla uygula. Bu hata ÖSYM'nin en sevdiği tuzak."},
{t:"Oran-Orantı",q:"Bir işi 4 işçi 12 günde bitiriyor.\n\nAynı işi 6 işçi kaç günde bitirir?",o:{"A":"6","B":"7","C":"8","D":"9","E":"10"},a:"C",e:"Ters orantı: 4 × 12 = 6 × x → x = 8 gün.",d:"İşçi-gün ilişkisi TERS orantıdır. İşçi arttıkça süre azalır. Formül: İşçi₁ × Gün₁ = İşçi₂ × Gün₂. Doğru orantı: biri artarken diğeri de artar. Ters orantı: biri artarken diğeri azalır."},
{t:"Kesir ve Ondalık",q:"Bir bidonun 3/4'ü su ile doludur. Bidondan 6 litre su alındığında bidon yarıya iniyor.\n\nBidonun kapasitesi kaç litredir?",o:{"A":"18","B":"20","C":"24","D":"28","E":"30"},a:"C",e:"3/4 - 1/2 = 1/4 bidon = 6 litre. Bidon = 6 × 4 = 24 litre.",d:"Kesir problemlerinde strateji: Verilen bilgiyi kesir farkına çevir. 3/4 - 1/2 = 3/4 - 2/4 = 1/4. Bu 1/4 = 6 litre → tam = 24 litre. Karalama tahtasını kullan!"},
{t:"Denklem ve Eşitsizlik",q:"Bir sayının 3 katının 5 fazlası 26'dır.\n\nBu sayı kaçtır?",o:{"A":"5","B":"6","C":"7","D":"8","E":"9"},a:"C",e:"3x + 5 = 26 → 3x = 21 → x = 7.",d:"Sözel ifadeyi denkleme çevirme: '3 katının 5 fazlası' = 3x + 5. 'Eksik' = çıkarma, 'fazla' = toplama, 'katı' = çarpma. KPSS'de sözel problem → denklem dönüşümü sık gelir."},
{t:"İstatistik ve Olasılık",q:"Bir zarın atılmasında üst yüze tek sayı gelme olasılığı kaçtır?",o:{"A":"1/6","B":"1/3","C":"1/2","D":"2/3","E":"5/6"},a:"C",e:"Tek sayılar: 1, 3, 5 → 3 sonuç. Toplam: 6. Olasılık: 3/6 = 1/2.",d:"Olasılık = İstenen sonuç sayısı / Toplam sonuç sayısı. Zar soruları: Tek={1,3,5}, Çift={2,4,6}, Asal={2,3,5}. Asal sayılar çeldirici olarak sıkça kullanılır (2 hem çift hem asal)."},
{t:"Geometri",q:"Bir dikdörtgenin uzun kenarı 12 cm, kısa kenarı 5 cm'dir.\n\nBu dikdörtgenin çevresi kaç cm'dir?",o:{"A":"30","B":"34","C":"36","D":"40","E":"42"},a:"B",e:"Çevre = 2 × (uzun + kısa) = 2 × (12 + 5) = 2 × 17 = 34 cm.",d:"Dikdörtgen formülleri: Çevre = 2(a+b). Alan = a×b. Köşegen = √(a²+b²). Kare için: Çevre = 4a, Alan = a². KPSS'de formül karıştırma tuzağı var (alan mı çevre mi sorulduğuna dikkat)."},
{t:"Hız-Zaman-Yol",q:"A şehrinden B şehrine giden bir araç gidiş yolculuğunu 80 km/h, dönüş yolculuğunu 120 km/h hızla yapmıştır.\n\nBu aracın gidiş-dönüş ortalama hızı kaç km/h'tir?",o:{"A":"96","B":"100","C":"104","D":"108","E":"110"},a:"A",e:"Ortalama hız = 2 × v₁ × v₂ / (v₁ + v₂) = 2 × 80 × 120 / 200 = 19200/200 = 96 km/h.",d:"DİKKAT: Ortalama hız ≠ hızların ortalaması! (80+120)/2=100 YANLIŞ. Doğru formül: 2v₁v₂/(v₁+v₂). Bu KPSS'nin en klasik tuzaklarından biri. Aritmetik ortalama her zaman gerçek ortalama hızdan büyüktür."},
],
cografya:[
{t:"Harita Bilgisi",q:"Ölçeği 1/500.000 olan bir haritada 4 cm olarak ölçülen iki nokta arasındaki gerçek uzaklık kaç km'dir?",o:{"A":"10","B":"15","C":"20","D":"25","E":"30"},a:"C",e:"Gerçek uzaklık = Harita uzaklığı × Payda = 4 × 500.000 = 2.000.000 cm = 20 km.",d:"Ölçek formülü: Gerçek = Harita × Payda. Birim çevirme: 1 km = 100.000 cm. KPSS'de ölçek sorusu neredeyse her yıl gelir."},
{t:"İklim ve Bitki Örtüsü",q:"Türkiye'de Karadeniz kıyılarında yıl boyunca yağış görülmesinin temel nedeni aşağıdakilerden hangisidir?",o:{"A":"Enlem etkisi","B":"Yükseltinin az olması","C":"Denizellik etkisi ve dağların kıyıya paralel uzanması","D":"Karstik arazi yapısının yaygın olması","E":"Volkanik faaliyetlerin etkisi"},a:"C",e:"Dağlar kıyıya paralel uzandığı için denizden gelen nemli hava iç kısımlara geçemez, yıl boyu orografik yağış oluşur.",d:"Karadeniz iklimi KPSS'de en çok sorulan iklim konusu. Neden yıl boyu yağış? (1) Deniz etkisi, (2) Dağlar paralel → nem engellenir, (3) Her mevsim yağış. İç Anadolu neden kurak? Aynı dağlar nemi engeller."},
{t:"Türkiye Yer Şekilleri",q:"Aşağıdaki göllerden hangisi oluşum bakımından diğerlerinden farklıdır?",o:{"A":"Burdur Gölü","B":"Eğirdir Gölü","C":"Hazar Gölü","D":"Beyşehir Gölü","E":"Nemrut Gölü"},a:"E",e:"Nemrut Gölü volkanik bir krater gölüdür; diğerleri tektonik kökenlidir.",d:"Göl oluşumları: Tektonik = fay hattında çöküntü (Burdur, Eğirdir, Hazar). Volkanik = krater/kaldera (Nemrut). Set gölü = heyelan/lav seti (Tortum, Çıldır). KPSS'de 'farklı olanı bulun' formatı sık gelir."},
{t:"Nüfus ve Yerleşme",q:"Türkiye'de nüfusun batı bölgelerinde yoğunlaşmasının en önemli nedeni aşağıdakilerden hangisidir?",o:{"A":"İklimin sert ve soğuk olması","B":"Sanayileşme, ticaret ve iş imkânlarının fazla olması","C":"Tarım alanlarının yetersiz olması","D":"Doğu'da dağlık arazinin bulunmaması","E":"Eğitim kurumlarının hiç bulunmaması"},a:"B",e:"Sanayileşme, ticaret ve hizmet sektörünün gelişmişliği en belirleyici nüfus çekici (pull) faktördür.",d:"Nüfus dağılımı faktörleri: Çekici = iş, eğitim, sağlık, iklim uygunluğu. İtici = işsizlik, terör, doğal afet. Batı'da yoğunlaşma = çekici faktörlerin baskınlığı. Bu konu iç göçle birlikte sorulur."},
{t:"Türkiye Tarım ve Hayvancılık",q:"Aşağıdaki tarım ürünlerinden hangisi Türkiye'de en çok Ege Bölgesi'nde yetiştirilmektedir?",o:{"A":"Çay","B":"Fındık","C":"Zeytin","D":"Pirinç","E":"Şeker pancarı"},a:"C",e:"Zeytin, Akdeniz ikliminin hâkim olduğu Ege Bölgesi'nin en önemli tarım ürünlerinden biridir.",d:"Bölge-ürün eşleştirmesi: Karadeniz = çay, fındık. Ege = zeytin, üzüm, pamuk, tütün, incir. Akdeniz = narenciye, muz. İç Anadolu = buğday, arpa. Güneydoğu = pamuk, antepfıstığı."},
{t:"Madenler ve Enerji",q:"Türkiye, dünya bor minerali rezervlerinin büyük bölümüne sahip olup bu madenin en önemli yatakları aşağıdaki illerin hangisinde bulunmaktadır?",o:{"A":"Zonguldak","B":"Eskişehir","C":"Batman","D":"Erzurum","E":"Muğla"},a:"B",e:"Türkiye dünya bor rezervlerinin yaklaşık %73'üne sahiptir; en önemli yataklar Eskişehir, Kütahya ve Balıkesir'dedir.",d:"Maden-şehir eşleştirmesi: Bor → Eskişehir/Kütahya. Taşkömürü → Zonguldak. Krom → Muğla/Elazığ. Petrol → Batman/Diyarbakır. Demir → Sivas/Malatya. Bakır → Artvin (Murgul)."},
{t:"Ulaşım Ticaret Turizm",q:"Aşağıdakilerden hangisi Türkiye'de denizyolu taşımacılığının gelişmesini olumsuz etkileyen bir faktördür?",o:{"A":"Üç tarafının denizlerle çevrili olması","B":"Doğal liman sayısının fazla olması","C":"Kıyıların girintili çıkıntılı olması","D":"İç bölgelerle kıyılar arasındaki dağların ulaşımı zorlaştırması","E":"Deniz turizminin gelişme potansiyeli"},a:"D",e:"Kıyı ile iç bölgeler arasındaki dağlar, limanların hinterland bağlantısını zorlaştırarak denizyolu taşımacılığını olumsuz etkiler.",d:"ÖSYM'de 'olumsuz etkileyen' sorulduğunda 4 olumlu + 1 olumsuz olacak. Dağlar = fiziksel engel = olumsuz. Diğerleri hep avantaj."},
{t:"Bölgeler Coğrafyası",q:"Aşağıdakilerden hangisi Güneydoğu Anadolu Bölgesi'nin genel özelliklerinden biri değildir?",o:{"A":"Türkiye'nin en az yağış alan bölgelerinden biridir","B":"GAP (Güneydoğu Anadolu Projesi) bu bölgede uygulanmaktadır","C":"Step (bozkır) bitki örtüsü yaygındır","D":"Kıyı turizmi gelişmiş durumdadır","E":"Ham petrol üretimi yapılmaktadır"},a:"D",e:"Güneydoğu Anadolu denize kıyısı bulunmayan bir bölgedir.",d:"Denize kıyısı olmayan bölgeler: İç Anadolu, Doğu Anadolu, Güneydoğu Anadolu. ÖSYM bunu dolaylı test eder."},
{t:"Harita Bilgisi",q:"Ekvator'dan kutuplara doğru gidildikçe aşağıdakilerden hangisi azalır?",o:{"A":"Yer çekimi","B":"Enlem dereceleri","C":"Güneş ışınlarının düşme açısı","D":"İki meridyen arası mesafe","E":"Yüzölçümü"},a:"C",e:"Kutuplara yaklaştıkça Güneş ışınlarının düşme açısı azalır, bu nedenle sıcaklık da düşer.",d:"Ekvator→kutup değişimleri: Azalanlar = ışık açısı, sıcaklık, çizgisel hız, iki meridyen arası mesafe. Artanlar = yer çekimi. ÖSYM hem artanı hem azalanı sorabilir, dikkat!"},
{t:"İklim ve Bitki Örtüsü",q:"Aşağıdakilerden hangisi Akdeniz ikliminin özelliklerinden biri değildir?",o:{"A":"Yazlar sıcak ve kurak geçer","B":"Kışlar ılık ve yağışlıdır","C":"Maki bitki örtüsü yaygındır","D":"Yıl boyunca her mevsim yağış alır","E":"Turunçgil tarımına elverişlidir"},a:"D",e:"Akdeniz ikliminde yazlar kuraktır, yıl boyu yağış almaz. Yıl boyu yağış Karadeniz iklimine aittir.",d:"İklim karşılaştırma soruları çok gelir. Akdeniz = yaz kurak, kış yağışlı + maki. Karadeniz = her mevsim yağışlı + orman. Karasal = yaz az yağışlı, kış soğuk + bozkır. Bu üçlüyü karıştırma."},
{t:"Türkiye Yer Şekilleri",q:"Türkiye'de aşağıdaki ovalardan hangisi delta ovası özelliği taşır?",o:{"A":"Konya Ovası","B":"Çukurova","C":"Muş Ovası","D":"Erzurum Ovası","E":"Ankara Ovası"},a:"B",e:"Çukurova, Seyhan ve Ceyhan nehirlerinin denize döküldüğü yerde oluşan bir delta ovasıdır.",d:"Ova türleri: Delta ovası = akarsu ağzında birikme (Çukurova, Bafra, Silifke). Tektonik ova = çöküntü (Muş, Erzurum). Karstik ova = polye (Elmalı, Burdur). Bu ayrım KPSS'de sık sorulur."},
{t:"Nüfus ve Yerleşme",q:"Aşağıdakilerden hangisi Türkiye'de kırdan kente göçün nedenlerinden biri değildir?",o:{"A":"Tarımda makineleşme","B":"İş imkânlarının kentlerde fazla olması","C":"Miras yoluyla tarım arazilerinin küçülmesi","D":"Kırsal bölgelerde hava kirliliğinin artması","E":"Eğitim ve sağlık hizmetlerinin kentlerde iyi olması"},a:"D",e:"Hava kirliliği genellikle kentlerde daha fazladır, kırsal bölgelerde göç nedeni olarak gösterilemez.",d:"Göç itici (kırsal) faktörler: İşsizlik, makineleşme, arazi bölünmesi, kan davaları, terör. Çekici (kent) faktörler: İş, eğitim, sağlık. D şıkkı hava kirliliği zaten kentin sorunu → kırdan itici faktör olamaz."},
{t:"Türkiye Tarım ve Hayvancılık",q:"Türkiye'de çay tarımının yalnızca Doğu Karadeniz kıyı şeridinde yapılmasının temel nedeni aşağıdakilerden hangisidir?",o:{"A":"Toprak yapısının farklı olması","B":"Yıl boyu yağış ve ılıman iklim koşullarının bulunması","C":"Deniz seviyesinin düşük olması","D":"Rüzgâr hızının az olması","E":"Güneşlenme süresinin fazla olması"},a:"B",e:"Çay, bol yağış ve ılıman kış koşulları gerektiren bir bitkidir; bu koşullar Türkiye'de yalnızca Doğu Karadeniz'de sağlanır.",d:"Tarım-iklim ilişkisi: Çay = bol yağış + ılık kış (Rize, Trabzon). Fındık = nemli iklim (Ordu, Giresun). Turunçgil = kışı ılık (Akdeniz). Şeker pancarı = karasal iklim (İç Anadolu). ÖSYM neden-sonuç olarak sorar."},
{t:"Madenler ve Enerji",q:"Aşağıdakilerden hangisi Türkiye'de yenilenebilir enerji kaynakları arasında yer almaz?",o:{"A":"Rüzgâr enerjisi","B":"Güneş enerjisi","C":"Jeotermal enerji","D":"Doğal gaz","E":"Hidroelektrik enerji"},a:"D",e:"Doğal gaz fosil yakıttır ve yenilenemez enerji kaynağıdır.",d:"Yenilenebilir: Güneş, rüzgâr, jeotermal, hidroelektrik, biyokütle, dalga. Yenilenemez: Petrol, doğal gaz, taşkömürü, linyit, nükleer (tartışmalı). Türkiye jeotermal'de dünyada ilk 5'te — bu detay sorulabilir."},
{t:"Ulaşım Ticaret Turizm",q:"Türkiye'de en fazla yük taşımacılığı aşağıdaki ulaşım türlerinden hangisiyle yapılmaktadır?",o:{"A":"Denizyolu","B":"Demiryolu","C":"Havayolu","D":"Karayolu","E":"Boru hattı"},a:"D",e:"Türkiye'de yük ve yolcu taşımacılığının büyük bölümü karayolu ile yapılmaktadır.",d:"Türkiye ulaşım: Karayolu yük taşımacılığında %90+ paya sahip. Bu demiryolu yatırımının yetersizliğinden kaynaklanır. ÖSYM 'en fazla' ve 'en az' kalıplarıyla sorar. Boru hattı sadece petrol/doğal gaz taşır."},
{t:"Bölgeler Coğrafyası",q:"Aşağıdaki bölgelerden hangisinin yüz ölçümü en büyüktür?",o:{"A":"Marmara Bölgesi","B":"Ege Bölgesi","C":"Doğu Anadolu Bölgesi","D":"Akdeniz Bölgesi","E":"Karadeniz Bölgesi"},a:"C",e:"Doğu Anadolu Bölgesi, Türkiye'nin yüz ölçümü en büyük bölgesidir.",d:"Bölge sıralamaları: Yüzölçümü en büyük = Doğu Anadolu. En küçük = Marmara. Nüfus en fazla = Marmara. Nüfus en az = Doğu Anadolu. Bu zıtlık ÖSYM'nin sevdiği çeldirici."},
{t:"İklim ve Bitki Örtüsü",q:"Türkiye'de fön rüzgârının etkisiyle aşağıdaki olaylardan hangisi meydana gelir?",o:{"A":"Kar yağışının artması","B":"Rüzgârın estiği yamaçta sıcaklığın artması ve nemin azalması","C":"Deniz suyu sıcaklığının düşmesi","D":"Bulut oluşumunun artması","E":"Bitki örtüsünün gürleşmesi"},a:"B",e:"Fön rüzgârı, dağın rüzgâr altı yamacında sıcaklığı artırıp nemi azaltarak kurutucu etki yapar.",d:"Fön etkisi: Nemli hava dağa çarpar → yükseldikçe soğur → yağış bırakır → dağı aştıktan sonra sıcak ve kuru iner. Güneydoğu Toroslar'ın kuzeyinde (İç Anadolu) bu etki görülür. KPSS'de süreç olarak sorulur."},
],
vatandaslik:[
{t:"Hukukun Temel Kavramları",q:"Aşağıdaki hukuk dallarından hangisi özel hukuk kapsamında yer almaz?",o:{"A":"Borçlar hukuku","B":"Ticaret hukuku","C":"Ceza hukuku","D":"Medenî hukuk","E":"İş hukuku"},a:"C",e:"Ceza hukuku, kamu hukuku dalıdır. Diğerleri özel hukuk kapsamındadır.",d:"Kamu hukuku dalları: Anayasa, İdare, Ceza, Vergi, Devletler Genel. Özel hukuk: Medenî, Borçlar, Ticaret, İş hukuku, Devletler Özel. Karma: İş hukuku bazı kaynaklarda karma sayılır ama KPSS'de genellikle özel hukukta gösterilir."},
{t:"Anayasa Hukuku",q:"1982 Anayasası'na göre, Anayasa'da değişiklik teklif etme yetkisi aşağıdakilerden hangisine aittir?",o:{"A":"Cumhurbaşkanına","B":"Bakanlar Kuruluna","C":"TBMM üye tamsayısının en az üçte birine","D":"Anayasa Mahkemesine","E":"Yargıtay Başkanına"},a:"C",e:"Anayasa değişikliği, TBMM üye tamsayısının en az 1/3'ü (200 milletvekili) tarafından yazılı olarak teklif edilebilir.",d:"Anayasa değişikliği süreci: Teklif = 1/3 (200 mv). Kabul = 3/5 (360 mv) → Cumhurbaşkanı referanduma sunabilir veya 2/3 (400 mv) → doğrudan yayımlanır. Cumhurbaşkanı geri gönderebilir → 2/3 gerekir. Bu oranları ezberle."},
{t:"Temel Hak ve Özgürlükler",q:"1982 Anayasası'na göre aşağıdakilerden hangisi 'Siyasi Haklar ve Ödevler' bölümünde yer almaz?",o:{"A":"Vatan hizmeti","B":"Seçme ve seçilme hakkı","C":"Dilekçe hakkı","D":"Mülkiyet hakkı","E":"Siyasi parti kurma ve partilere girme hakkı"},a:"D",e:"Mülkiyet hakkı, Anayasa'nın 'Kişinin Hakları ve Ödevleri' bölümünde düzenlenmiştir.",d:"Anayasa hak sınıflandırması: Kişi hakları = yaşam, mülkiyet, kişi dokunulmazlığı, özel hayat. Sosyal haklar = eğitim, sağlık, çalışma. Siyasi haklar = seçme/seçilme, parti, dilekçe, vatan hizmeti. Mülkiyetin siyasi hak sanılması yaygın hata."},
{t:"Yasama",q:"TBMM'nin tatil veya ara verme sırasında olağanüstü toplantıya çağrılabilmesi için aşağıdakilerden hangisinin talebi gerekmektedir?",o:{"A":"Başbakanın","B":"Cumhurbaşkanının veya TBMM üye tamsayısının beşte birinin","C":"Anayasa Mahkemesi Başkanının","D":"Yargıtay Cumhuriyet Başsavcısının","E":"Sayıştay Başkanının"},a:"B",e:"TBMM, Cumhurbaşkanının veya üye tamsayısının 1/5'inin (120 mv) talebiyle olağanüstü toplanır.",d:"Olağanüstü toplantı = Cumhurbaşkanı veya 1/5 üye. OHAL ilanı = Cumhurbaşkanı kararnamesi ile. 2017 sonrası Başbakanlık kaldırıldığı için A şıkkı otomatik elenir — güncel anayasa bilgisi önemli."},
{t:"Yürütme",q:"2017 Anayasa değişikliği ile Cumhurbaşkanlığı hükümet sistemine geçilmesinin ardından aşağıdakilerden hangisi kaldırılmıştır?",o:{"A":"Türkiye Büyük Millet Meclisi","B":"Başbakanlık makamı","C":"Anayasa Mahkemesi","D":"Danıştay","E":"Sayıştay"},a:"B",e:"2017 değişikliğiyle Başbakanlık makamı kaldırılmış, yürütme yetkisi doğrudan Cumhurbaşkanına verilmiştir.",d:"2017 değişikliği KPSS'de sıkça sorulur: Başbakanlık → kaldırıldı. Bakanlar Kurulu → kaldırıldı. Cumhurbaşkanlığı kararnamesi → geldi. Cumhurbaşkanı yardımcıları → geldi. TBMM = 600 üye (eskiden 550)."},
{t:"Yargı",q:"Aşağıdakilerden hangisi Türk yargı sistemindeki yüksek mahkemeler arasında yer almaz?",o:{"A":"Yargıtay","B":"Danıştay","C":"Anayasa Mahkemesi","D":"Asliye Hukuk Mahkemesi","E":"Uyuşmazlık Mahkemesi"},a:"D",e:"Asliye Hukuk Mahkemesi ilk derece (birinci basamak) mahkemesidir, yüksek mahkeme değildir.",d:"Yüksek mahkemeler: Anayasa Mahkemesi, Yargıtay, Danıştay, Uyuşmazlık Mahkemesi. Askeri yüksek mahkemeler 2017'de kaldırıldı. İlk derece mahkemeleri: Asliye (hukuk/ceza), Sulh, Ağır Ceza, İdare, Vergi."},
{t:"İdare Hukuku",q:"İdarenin eylem ve işlemlerine karşı açılacak davalarda görevli mahkeme aşağıdakilerden hangisidir?",o:{"A":"Asliye hukuk mahkemesi","B":"Sulh ceza hakimliği","C":"İdare mahkemesi","D":"Ticaret mahkemesi","E":"İcra mahkemesi"},a:"C",e:"İdari işlem ve eylemlere karşı davalar idare mahkemelerinde açılır.",d:"Yargı yolu ayrımı: Özel hukuk → adli yargı. İdari uyuşmazlıklar → idari yargı. Ceza → ceza mahkemeleri."},
{t:"Anayasa Hukuku",q:"1982 Anayasası'na göre, Anayasa'nın ilk üç maddesi ile ilgili aşağıdakilerden hangisi doğrudur?",o:{"A":"TBMM'nin 2/3 çoğunluğuyla değiştirilebilir","B":"Halkoylaması ile değiştirilebilir","C":"Değiştirilemez, değiştirilmesi teklif dahi edilemez","D":"Cumhurbaşkanının onayıyla değiştirilebilir","E":"Olağanüstü dönemlerde değiştirilebilir"},a:"C",e:"Devletin şekli (Cumhuriyet), nitelikleri ve bütünlüğüne ilişkin ilk 3 madde değiştirilemez ve değiştirilmesi teklif edilemez.",d:"İlk 3 madde = değişmez hükümler. Madde 1: Devlet şekli Cumhuriyet. Madde 2: Cumhuriyetin nitelikleri (demokratik, laik, sosyal hukuk devleti). Madde 3: Devletin bütünlüğü, dili, bayrağı, başkenti. KPSS'de çok sorulur."},
{t:"Temel Hak ve Özgürlükler",q:"1982 Anayasası'na göre temel hak ve özgürlüklerin sınırlandırılması ile ilgili aşağıdakilerden hangisi yanlıştır?",o:{"A":"Ancak kanunla sınırlandırılabilir","B":"Anayasanın sözüne ve ruhuna uygun olmalıdır","C":"Demokratik toplum düzeninin gereklerine aykırı olamaz","D":"Ölçülülük ilkesine uygun olmalıdır","E":"Cumhurbaşkanlığı kararnamesiyle sınırlandırılabilir"},a:"E",e:"Temel hak ve özgürlükler ancak KANUNLA sınırlandırılabilir, Cumhurbaşkanlığı kararnamesiyle sınırlandırılamaz.",d:"Sınırlama şartları: (1) Kanunla olmalı, (2) Anayasada öngörülen sebeplere dayanmalı, (3) Demokratik toplum düzenine uygun, (4) Ölçülü olmalı, (5) Özüne dokunulmamalı. CBK ile temel haklar düzenlenemez — bu 2017 sonrası önemli kural."},
{t:"Yasama",q:"TBMM seçimlerinin yenilenmesine (erken seçim) karar verme yetkisi aşağıdakilerden hangisine aittir?",o:{"A":"Yalnızca Cumhurbaşkanına","B":"Yalnızca TBMM'ye","C":"Hem Cumhurbaşkanına hem TBMM'ye","D":"Anayasa Mahkemesine","E":"Yüksek Seçim Kuruluna"},a:"C",e:"2017 Anayasa değişikliğine göre hem TBMM (3/5 çoğunluk) hem Cumhurbaşkanı seçimlerin yenilenmesine karar verebilir.",d:"Erken seçim kuralı: TBMM üye tamsayısının 3/5'i (360 mv) ile veya Cumhurbaşkanı tek başına karar verebilir. Ancak ikisi birlikte yenilenir — sadece TBMM veya sadece CB seçimi yenileyemez. Bu kural 2017 sonrası geldi."},
{t:"Yürütme",q:"2017 Anayasa değişikliğine göre Cumhurbaşkanı ile ilgili aşağıdakilerden hangisi yanlıştır?",o:{"A":"Cumhurbaşkanı halk tarafından seçilir","B":"Görev süresi 5 yıldır","C":"En fazla iki kez seçilebilir","D":"Parti üyeliği ile ilişkisini kesmek zorundadır","E":"Üst düzey kamu görevlilerini atar ve görevden alır"},a:"D",e:"2017 değişikliğiyle Cumhurbaşkanının parti üyeliği devam edebilir; partisiyle ilişkisini kesmesi zorunluluğu kaldırılmıştır.",d:"2017 öncesi: CB tarafsız, parti üyeliği askıya alınırdı. 2017 sonrası: CB parti genel başkanı olabilir. Bu değişiklik KPSS'de çok sorulur çünkü eski bilgiyle yanlış yapılır."},
{t:"Hukukun Temel Kavramları",q:"Aşağıdakilerden hangisi hukukun yazılı kaynaklarından biri değildir?",o:{"A":"Anayasa","B":"Kanun","C":"Örf ve âdet hukuku","D":"Tüzük","E":"Yönetmelik"},a:"C",e:"Örf ve âdet hukuku, yazılı olmayan (yazısız) hukuk kaynaklarındandır.",d:"Yazılı kaynaklar: Anayasa > Kanun > CBK > Tüzük (eski) > Yönetmelik. Yazısız kaynaklar: Örf ve âdet. Normlar hiyerarşisi = Anayasa en üstte. 2017 sonrası tüzük kaldırıldı ama KPSS'de hâlâ sorulabilir."},
{t:"Yargı",q:"Anayasa Mahkemesi'nin görevleri arasında aşağıdakilerden hangisi yer almaz?",o:{"A":"Kanunların anayasaya uygunluğunu denetlemek","B":"Cumhurbaşkanlığı kararnamelerini denetlemek","C":"Yüce Divan sıfatıyla yargılama yapmak","D":"İdari uyuşmazlıkları çözmek","E":"Bireysel başvuruları incelemek"},a:"D",e:"İdari uyuşmazlıkları çözmek Danıştay ve idare mahkemelerinin görevidir, Anayasa Mahkemesinin değil.",d:"AYM görevleri: (1) Norm denetimi (kanun, CBK, İçtüzük). (2) Yüce Divan (CB, yargıçlar, komutanlar). (3) Bireysel başvuru (2010'da geldi). (4) Parti kapatma davaları. (5) Milletvekilliği düşmesi itirazları. İdari uyuşmazlık → Danıştay."},
{t:"İdare Hukuku",q:"İdarenin bir kararından zarar gören kişinin, önce idareye başvurarak kararın geri alınmasını istemesine ne ad verilir?",o:{"A":"İptal davası","B":"Tam yargı davası","C":"İdari başvuru (itiraz)","D":"Temyiz","E":"İstinaf"},a:"C",e:"İdari başvuru, bireyin dava açmadan önce idareye başvurarak işlemin düzeltilmesini talep etmesidir.",d:"İdari başvuru yolları: (1) İdari itiraz = üst makama başvuru. (2) İptal davası = işlemin iptali için mahkemeye. (3) Tam yargı davası = tazminat talebi. Bazı durumlarda dava öncesi idari başvuru zorunludur. KPSS'de süreç sıralaması sorulur."},
{t:"Temel Hak ve Özgürlükler",q:"Aşağıdakilerden hangisi 1982 Anayasası'nda düzenlenen sosyal ve ekonomik haklar arasında yer alır?",o:{"A":"Kişi dokunulmazlığı","B":"Seçme ve seçilme hakkı","C":"Eğitim ve öğrenim hakkı","D":"Düşünce ve kanaat özgürlüğü","E":"Dilekçe hakkı"},a:"C",e:"Eğitim ve öğrenim hakkı, Anayasa'nın 'Sosyal ve Ekonomik Haklar ve Ödevler' bölümünde düzenlenmiştir.",d:"Hak kategorileri: Kişi hakları = dokunulmazlık, düşünce özgürlüğü, özel hayat, mülkiyet. Sosyal-ekonomik = eğitim, sağlık, çalışma, konut, sosyal güvenlik. Siyasi = seçme/seçilme, dilekçe, parti. Bu üçlü ayrımı KPSS her yıl sorar."},
],
};

// ─── APP ───
const CSS_VARS = `
:root {
  --color-background-primary: #ffffff;
  --color-background-secondary: #f4f4f5;
  --color-background-info: #eff6ff;
  --color-background-success: #dcfce7;
  --color-background-danger: #fee2e2;
  --color-background-warning: #fef9c3;
  --color-border-tertiary: #e4e4e7;
  --color-border-secondary: #a1a1aa;
  --color-border-primary: #71717a;
  --color-border-info: #bfdbfe;
  --color-border-success: #86efac;
  --color-border-danger: #fca5a5;
  --color-text-primary: #18181b;
  --color-text-secondary: #52525b;
  --color-text-tertiary: #a1a1aa;
  --color-text-info: #1d4ed8;
  --color-text-success: #15803d;
  --color-text-danger: #b91c1c;
  --color-text-warning: #b45309;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-primary: #18181b;
    --color-background-secondary: #27272a;
    --color-background-info: #172554;
    --color-background-success: #052e16;
    --color-background-danger: #450a0a;
    --color-border-tertiary: #3f3f46;
    --color-border-secondary: #52525b;
    --color-border-info: #1e3a5f;
    --color-border-success: #14532d;
    --color-border-danger: #7f1d1d;
    --color-text-primary: #fafafa;
    --color-text-secondary: #a1a1aa;
    --color-text-tertiary: #71717a;
    --color-text-info: #60a5fa;
    --color-text-success: #4ade80;
    --color-text-danger: #f87171;
    --color-text-warning: #fbbf24;
  }
  body { background: #09090b; color: #fafafa; }
}
`;

function App(){
  useEffect(()=>{
    const s=document.createElement("style");
    s.textContent=CSS_VARS;
    document.head.appendChild(s);
    return()=>s.remove();
  },[]);
  const [tab,setTab]=useState("home");
  const [scr,setScr]=useState("home");
  const [sk,setSk]=useState(null);
  const [tp,setTp]=useState(null);
  const [cq,setCq]=useState(null);
  const [pick,setPick]=useState(null);
  const [rev,setRev]=useState(false);
  const [ld,setLd]=useState(false);
  const [showDetail,setShowDetail]=useState(false);

  // Persisted state
  const [st,setSt]=useState(()=>{const s={};Object.keys(SUBJECTS).forEach(k=>{s[k]={c:0,w:0,t:0}});return s});
  const [xp,setXp]=useState(0);
  const [streak,setStreak]=useState(0);
  const [best,setBest]=useState(0);
  const [today,setToday]=useState(0);
  const [wb,setWb]=useState([]);
  const [bm,setBm]=useState([]);

  const [tw,setTw]=useState({});
  const [popup,setPopup]=useState(null);
  const [used,setUsed]=useState({});
  const [qs,setQs]=useState(null);
  const [el,setEl]=useState(0);
  const [qt,setQt]=useState(null);
  const [avgs,setAvgs]=useState([]);
  const [gs,setGs]=useState(false);
  const [pad,setPad]=useState(false);
  const cRef=useRef(null);
  const dRef=useRef(false);
  const tRef=useRef(null);

  const totQ=Object.values(st).reduce((s,v)=>s+v.t,0);
  const totC=Object.values(st).reduce((s,v)=>s+v.c,0);
  const avgT=avgs.length?Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length):0;
  const lv=LEVELS.find(l=>xp>=l.min&&xp<l.max)||LEVELS[5];
  const lvP=Math.min(100,Math.round(((xp-lv.min)/(lv.max-lv.min))*100));
  const lvI=LEVELS.findIndex(l=>l.n===lv.n);

  // Load from storage
  useEffect(()=>{
    try{
      const d=localStorage.getItem("kpss_data");
      if(d){
        const p=JSON.parse(d);
        if(p.st)setSt(p.st);if(p.xp)setXp(p.xp);if(p.streak)setStreak(p.streak);
        if(p.best)setBest(p.best);if(p.today!==undefined)setToday(p.today);
        if(p.wb)setWb(p.wb);if(p.bm)setBm(p.bm);
      }
    }catch(e){}
  },[]);

  // Save to storage
  const save=useCallback((data)=>{
    try{localStorage.setItem("kpss_data",JSON.stringify(data));}catch(e){}
  },[]);

  useEffect(()=>{save({st,xp,streak,best,today,wb,bm})},[st,xp,streak,best,today,wb,bm,save]);

  useEffect(()=>{
    if(qs&&!rev){tRef.current=setInterval(()=>setEl(Math.floor((Date.now()-qs)/1000)),1000);}
    return()=>{if(tRef.current)clearInterval(tRef.current)};
  },[qs,rev]);

  const fm=s=>s<60?`${s}sn`:`${Math.floor(s/60)}dk ${s%60}sn`;

  const getQ=useCallback((s,t)=>{
    setLd(true);setPick(null);setRev(false);setCq(null);setQt(null);setEl(0);setQs(null);setPad(false);setShowDetail(false);
    setTimeout(()=>{
      const pool=(Q[s]||[]).filter(q=>!t||q.t===t);
      const fb=pool.length?pool:(Q[s]||Q.tarih);
      const k=s+":"+(t||"*");const u=used[k]||[];
      let av=fb.filter((_,i)=>!u.includes(i));
      if(!av.length){setUsed(p=>({...p,[k]:[]}));av=fb;}
      const i=Math.floor(Math.random()*av.length);
      const gi=fb.indexOf(av[i]);
      setUsed(p=>({...p,[k]:[...(p[k]||[]),gi]}));
      setCq(av[i]);setLd(false);setQs(Date.now());
    },300);
  },[used]);

  const answer=(l)=>{
    if(rev)return;setPick(l);setRev(true);
    const ok=l===cq.a;const t=Math.floor((Date.now()-qs)/1000);
    setQt(t);setAvgs(p=>[...p,t]);if(tRef.current)clearInterval(tRef.current);
    const pts=ok?(t<=TL?12:8):2;setXp(p=>p+pts);
    if(ok){setStreak(p=>{const n=p+1;setBest(b=>Math.max(b,n));return n});}
    else{setStreak(0);setTw(p=>({...p,[cq.t]:(p[cq.t]||0)+1}));setWb(p=>p.find(w=>w.q===cq.q)?p:[...p,{...cq,yours:l,sub:sk,time:t}]);}
    setSt(p=>({...p,[sk]:{c:p[sk].c+(ok?1:0),w:p[sk].w+(ok?0:1),t:p[sk].t+1}}));
    setToday(p=>{const n=p+1;if(n===GOAL&&!gs){setGs(true);setTimeout(()=>setPopup("goal"),600);}return n;});
  };

  const nxt=()=>{const nt=totQ+1;if(nt>0&&nt%5===0&&popup!=="goal"){const w=Object.entries(tw).sort((a,b)=>b[1]-a[1])[0];if(w&&w[1]>=2){setPopup(w[0]);return;}}getQ(sk,tp);};
  const goQ=(s,t)=>{setSk(s);setTp(t);setScr("quiz");setTab("quiz");getQ(s,t);};
  const hasBM=q=>bm.some(b=>b.q===q?.q);
  const togBM=q=>setBm(p=>p.find(b=>b.q===q.q)?p.filter(b=>b.q!==q.q):[...p,{...q,sub:sk}]);

  // Canvas
  const cStart=e=>{dRef.current=true;const ctx=cRef.current?.getContext("2d");if(ctx){const r=cRef.current.getBoundingClientRect();ctx.beginPath();ctx.moveTo(e.clientX-r.left,e.clientY-r.top);}};
  const cMove=e=>{if(!dRef.current)return;const ctx=cRef.current?.getContext("2d");if(ctx){const r=cRef.current.getBoundingClientRect();ctx.lineWidth=2;ctx.lineCap="round";ctx.strokeStyle="#18181b";ctx.lineTo(e.clientX-r.left,e.clientY-r.top);ctx.stroke();}};
  const cEnd=()=>{dRef.current=false;};
  const cClr=()=>{const ctx=cRef.current?.getContext("2d");if(ctx)ctx.clearRect(0,0,cRef.current.width,cRef.current.height);};
  const tStart=e=>{const t=e.touches[0];dRef.current=true;const ctx=cRef.current?.getContext("2d");if(ctx){const r=cRef.current.getBoundingClientRect();ctx.beginPath();ctx.moveTo(t.clientX-r.left,t.clientY-r.top);}};
  const tMove=e=>{e.preventDefault();if(!dRef.current)return;const t=e.touches[0];const ctx=cRef.current?.getContext("2d");if(ctx){const r=cRef.current.getBoundingClientRect();ctx.lineWidth=2;ctx.lineCap="round";ctx.strokeStyle="#18181b";ctx.lineTo(t.clientX-r.left,t.clientY-r.top);ctx.stroke();}};

  // Tab bar
  const TBar=()=>(
    <div style={{display:"flex",borderTop:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",padding:"8px 0 12px"}}>
      {[{id:"home",l:"Ana Sayfa",i:"🏠"},{id:"quiz",l:"Soru Çöz",i:"✏️"},{id:"notebook",l:"Defterim",i:"📓"},{id:"profile",l:"Profilim",i:"👤"}].map(t=>(
        <div key={t.id} onClick={()=>{setTab(t.id);setScr(t.id)}} style={{flex:1,textAlign:"center",cursor:"pointer",color:tab===t.id?"#534AB7":"var(--color-text-tertiary)"}}>
          <div style={{fontSize:18,marginBottom:2,filter:tab===t.id?"none":"grayscale(100%) opacity(0.5)"}}>{t.i}</div>
          <div style={{fontSize:10,fontWeight:tab===t.id?500:400}}>{t.l}</div>
        </div>
      ))}
    </div>
  );
  const W=({children})=>(<div style={{maxWidth:600,margin:"0 auto",display:"flex",flexDirection:"column",minHeight:"100%"}}><div style={{flex:1,padding:"0.5rem 0",overflow:"auto"}}>{children}</div><TBar/></div>);

  // ── HOME ──
  if(scr==="home")return(
    <W>
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:500,letterSpacing:"-0.5px"}}>KPSSBot</div>
        <div style={{fontSize:13,color:"var(--color-text-secondary)",marginTop:2}}>{GOAL-today>0?`Bugün ${GOAL-today} soru daha`:"Günlük hedef tamam!"}</div>
      </div>
      {/* XP */}
      <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",padding:"12px 16px",marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span style={{fontWeight:500}}>{lvI<2?"🌱":lvI<4?"🌟":"👑"} {lv.n}</span><span style={{color:"var(--color-text-tertiary)"}}>{xp} XP</span></div>
        <div style={{height:6,background:"var(--color-border-tertiary)",borderRadius:3}}><div style={{height:"100%",width:`${lvP}%`,background:"#534AB7",borderRadius:3,transition:"width 0.5s"}}/></div>
      </div>
      {/* Daily */}
      <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",padding:"12px 16px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span style={{fontWeight:500}}>Günlük hedef</span><span style={{color:today>=GOAL?"var(--color-text-success)":"var(--color-text-secondary)"}}>{today}/{GOAL}</span></div>
        <div style={{height:6,background:"var(--color-border-tertiary)",borderRadius:3}}><div style={{height:"100%",width:`${Math.min(100,Math.round((today/GOAL)*100))}%`,background:today>=GOAL?"var(--color-text-success)":"#534AB7",borderRadius:3,transition:"width 0.5s"}}/></div>
        {avgT>0&&<div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:4}}>Ort. {fm(avgT)}/soru {avgT>TL?"— hızlanmalısın":"— güzel tempo"}</div>}
      </div>
      {/* Subjects */}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {Object.entries(SUBJECTS).map(([k,sub])=>{const s=st[k];const p=s.t>0?Math.round((s.c/s.t)*100):null;return(
          <div key={k} onClick={()=>{setSk(k);setScr("topics");setTab("quiz")}} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:"var(--border-radius-lg)",border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--color-border-secondary)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--color-border-tertiary)"}>
            <div style={{width:40,height:40,borderRadius:"var(--border-radius-md)",background:sub.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{sub.icon}</div>
            <div style={{flex:1}}><div style={{fontWeight:500,fontSize:14}}>{sub.name}</div><div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{(Q[k]||[]).length} soru</div></div>
            {p!==null&&<span style={{fontSize:12,fontWeight:500,color:p>=60?"var(--color-text-success)":"var(--color-text-warning)"}}>%{p}</span>}
            <span style={{color:"var(--color-text-tertiary)"}}>›</span>
          </div>
        )})}
      </div>
      <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"var(--color-text-tertiary)"}}>Toplam {Object.values(Q).reduce((s,v)=>s+v.length,0)} soru · ÖSYM formatında</div>
    </W>
  );

  // ── TOPICS ──
  if(scr==="topics"){const sub=SUBJECTS[sk];return(
    <W>
      <div onClick={()=>{setScr("home");setTab("home")}} style={{cursor:"pointer",fontSize:13,color:"var(--color-text-secondary)",marginBottom:12}}>‹ Geri</div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{width:36,height:36,borderRadius:"var(--border-radius-md)",background:sub.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{sub.icon}</div>
        <div style={{fontWeight:500,fontSize:18}}>{sub.name}</div>
      </div>
      <div onClick={()=>goQ(sk,null)} style={{padding:"10px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",cursor:"pointer",marginBottom:10,fontWeight:500,fontSize:13,color:"var(--color-text-info)",textAlign:"center"}}>Karışık çöz</div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {sub.topics.map((t,i)=>{const c=(Q[sk]||[]).filter(q=>q.t===t).length;const wc=tw[t]||0;return(
          <div key={i} onClick={()=>{if(c>0)goQ(sk,t)}} style={{padding:"10px 14px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",cursor:c>0?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"space-between",opacity:c>0?1:0.5}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:sub.color,background:sub.bg,borderRadius:6,padding:"2px 6px",fontWeight:500}}>{i+1}</span>
              <span style={{fontSize:13}}>{t}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {wc>0&&<span style={{fontSize:10,color:"var(--color-text-danger)",background:"var(--color-background-danger)",padding:"1px 5px",borderRadius:4}}>{wc}y</span>}
              <span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{c||"—"}</span>
            </div>
          </div>
        )})}
      </div>
    </W>
  );}

  // ── QUIZ ──
  if(scr==="quiz"){const sub=SUBJECTS[sk]||SUBJECTS.tarih;const isMath=sk==="matematik";
    if(!cq&&!ld)return(<W><div style={{fontWeight:500,fontSize:16,marginBottom:12}}>Hızlı başla</div>{Object.entries(SUBJECTS).map(([k,s])=>(<div key={k} onClick={()=>goQ(k,null)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)",marginBottom:6,cursor:"pointer",background:"var(--color-background-primary)"}}><span style={{fontSize:16}}>{s.icon}</span><span style={{fontSize:13,fontWeight:500}}>{s.name} — karışık</span></div>))}</W>);
    return(
    <W>
      {popup&&(<div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20,padding:"1rem"}}>
        <div style={{background:"var(--color-background-primary)",borderRadius:"var(--border-radius-lg)",padding:"1.5rem",maxWidth:340,width:"100%",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>{popup==="goal"?"🎯":"📊"}</div>
          <div style={{fontWeight:500,fontSize:15,marginBottom:6}}>{popup==="goal"?"Günlük hedef tamam!":"Zayıf konu uyarısı"}</div>
          <div style={{fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.5,marginBottom:16}}>{popup==="goal"?`${GOAL} soruyu tamamladın! +20 bonus XP.`:`"${popup}" konusunda tekrarlayan yanlışların var.`}</div>
          <button onClick={()=>{if(popup==="goal")setXp(p=>p+20);setPopup(null);if(popup!=="goal"&&sk)getQ(sk,tp);}} style={{padding:"8px 20px",borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:13,fontWeight:500,background:sub.bg,color:sub.color,border:"none",width:"100%"}}>Devam</button>
        </div>
      </div>)}
      {/* Scratchpad */}
      {pad&&(<div style={{position:"absolute",bottom:56,left:8,right:8,zIndex:15,background:"var(--color-background-primary)",borderRadius:"var(--border-radius-lg)",border:"0.5px solid var(--color-border-secondary)",padding:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:12,fontWeight:500}}>Karalama tahtası</span>
          <div style={{display:"flex",gap:6}}><span onClick={cClr} style={{fontSize:11,cursor:"pointer",color:"var(--color-text-danger)",padding:"2px 6px",borderRadius:4,border:"0.5px solid var(--color-border-danger)"}}>Temizle</span><span onClick={()=>setPad(false)} style={{fontSize:11,cursor:"pointer",color:"var(--color-text-secondary)",padding:"2px 6px",borderRadius:4,border:"0.5px solid var(--color-border-tertiary)"}}>Kapat</span></div>
        </div>
        <canvas ref={cRef} width={340} height={160} style={{width:"100%",height:160,borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",touchAction:"none"}} onMouseDown={cStart} onMouseMove={cMove} onMouseUp={cEnd} onMouseLeave={cEnd} onTouchStart={tStart} onTouchMove={tMove} onTouchEnd={cEnd}/>
      </div>)}
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div onClick={()=>{setScr("topics");if(tRef.current)clearInterval(tRef.current)}} style={{cursor:"pointer",fontSize:13,color:"var(--color-text-secondary)"}}>‹ Çıkış</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!ld&&cq&&!rev&&<span style={{fontSize:12,fontWeight:500,fontVariantNumeric:"tabular-nums",color:el>TL?"var(--color-text-danger)":el>45?"var(--color-text-warning)":"var(--color-text-tertiary)"}}>{fm(el)}</span>}
          {rev&&qt!==null&&<span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{fm(qt)}</span>}
          {streak>1&&<span style={{fontSize:10,color:"#854F0B",background:"#FAEEDA",padding:"2px 5px",borderRadius:4,fontWeight:500}}>{streak}x</span>}
          <span style={{fontSize:11,color:sub.color,background:sub.bg,borderRadius:6,padding:"2px 8px",fontWeight:500}}>{sub.name}</span>
        </div>
      </div>
      {/* Progress mini */}
      <div style={{height:2,background:"var(--color-border-tertiary)",borderRadius:1,marginBottom:10}}><div style={{height:"100%",width:`${Math.min(100,Math.round((today/GOAL)*100))}%`,background:"#534AB7",borderRadius:1,transition:"width 0.3s"}}/></div>
      {cq&&!ld&&<div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px",fontWeight:500}}>{cq.t}</div>}
      {ld&&(<div style={{textAlign:"center",padding:"3rem",color:"var(--color-text-secondary)"}}><div style={{width:28,height:28,border:"2.5px solid var(--color-border-tertiary)",borderTopColor:sub.color,borderRadius:"50%",margin:"0 auto 10px",animation:"sp .7s linear infinite"}}/><style>{`@keyframes sp{to{transform:rotate(360deg)}}`}</style><div style={{fontSize:13}}>Soru geliyor...</div></div>)}
      {cq&&!ld&&(<div>
        <div style={{fontSize:14,lineHeight:1.7,marginBottom:14,fontWeight:500,whiteSpace:"pre-line"}}>{cq.q}</div>
        {isMath&&!rev&&(<div onClick={()=>setPad(!pad)} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"var(--color-text-info)",cursor:"pointer",marginBottom:8,padding:"3px 8px",borderRadius:6,background:"var(--color-background-info)"}}>{pad?"Karalamayı gizle":"📝 Karalama tahtası"}</div>)}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {Object.entries(cq.o).map(([l,txt])=>{const isSel=pick===l,isAns=l===cq.a;let bdr="var(--color-border-tertiary)",bg="var(--color-background-primary)",col="var(--color-text-primary)";
            if(rev){if(isAns){bdr="var(--color-border-success)";bg="var(--color-background-success)";col="var(--color-text-success)";}else if(isSel){bdr="var(--color-border-danger)";bg="var(--color-background-danger)";col="var(--color-text-danger)";}}
            return(<div key={l} onClick={()=>answer(l)} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",borderRadius:"var(--border-radius-md)",border:`0.5px solid ${bdr}`,background:bg,cursor:rev?"default":"pointer",transition:"all 0.15s"}}><span style={{fontWeight:500,fontSize:13,color:rev?col:"var(--color-text-secondary)",minWidth:18}}>{l})</span><span style={{fontSize:13,lineHeight:1.5,color:rev?col:"var(--color-text-primary)"}}>{txt}</span></div>);
          })}
        </div>
        {rev&&(<div style={{marginTop:16}}>
          {qt!==null&&(<div style={{fontSize:12,marginBottom:8,padding:"6px 10px",borderRadius:6,background:qt>TL?"var(--color-background-danger)":"var(--color-background-success)",color:qt>TL?"var(--color-text-danger)":"var(--color-text-success)"}}>{qt>TL?`${fm(qt)} — KPSS hedefi ${TL}sn`:`${fm(qt)} — iyi tempo`} · +{pick===cq.a?(qt<=TL?12:8):2} XP</div>)}
          {/* Short explanation */}
          <div style={{padding:"12px 14px",borderRadius:"var(--border-radius-md)",background:"var(--color-background-secondary)",fontSize:13,lineHeight:1.6,color:"var(--color-text-secondary)",marginBottom:8}}>{cq.e}</div>
          {/* Detailed explanation toggle */}
          {cq.d&&(<div>
            <div onClick={()=>setShowDetail(!showDetail)} style={{cursor:"pointer",fontSize:12,color:"var(--color-text-info)",marginBottom:8,display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,background:"var(--color-background-info)"}}>{showDetail?"Notu gizle":"📘 KPSSBot detaylı not"}</div>
            {showDetail&&(<div style={{padding:"12px 14px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-info)",background:"var(--color-background-info)",fontSize:12,lineHeight:1.7,color:"var(--color-text-primary)",marginBottom:8}}>{cq.d}</div>)}
          </div>)}
          <div style={{display:"flex",gap:6}}>
            <button onClick={nxt} style={{flex:1,padding:"9px 14px",borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:13,fontWeight:500,background:sub.bg,color:sub.color,border:"none"}}>Sonraki</button>
            <button onClick={()=>togBM(cq)} style={{padding:"9px 12px",borderRadius:"var(--border-radius-md)",cursor:"pointer",fontSize:14,background:hasBM(cq)?"#FEE2E2":"var(--color-background-secondary)",border:"none",color:hasBM(cq)?"#EF4444":"var(--color-text-tertiary)"}}>{hasBM(cq)?"❤️":"🤍"}</button>
          </div>
          <div style={{marginTop:10,display:"flex",justifyContent:"center",gap:16,fontSize:12,color:"var(--color-text-secondary)"}}><span>{SUBJECTS[sk]?.name}: {st[sk].c}/{st[sk].t}</span><span>Bugün: {today}/{GOAL}</span></div>
        </div>)}
      </div>)}
    </W>);}

  // ── NOTEBOOK ──
  if(scr==="notebook")return(
    <W>
      <div style={{fontWeight:500,fontSize:18,marginBottom:16}}>Defterlerim</div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:14,fontWeight:500,marginBottom:8,color:"var(--color-text-danger)"}}>📕 Yanlış defteri ({wb.length})</div>
        {!wb.length&&<div style={{fontSize:12,color:"var(--color-text-tertiary)",padding:12}}>Henüz yanlışın yok!</div>}
        {wb.length>0&&<div onClick={()=>{const r=wb[Math.floor(Math.random()*wb.length)];setSk(r.sub);setTp(null);setScr("quiz");setTab("quiz");setLd(true);setPick(null);setRev(false);setQt(null);setEl(0);setShowDetail(false);setTimeout(()=>{setCq(r);setLd(false);setQs(Date.now());},300);}} style={{padding:"8px",borderRadius:"var(--border-radius-md)",background:"var(--color-background-danger)",cursor:"pointer",marginBottom:8,fontSize:12,fontWeight:500,color:"var(--color-text-danger)",textAlign:"center"}}>Yanlışlardan rastgele çöz</div>}
        {wb.slice(0,5).map((w,i)=>(<div key={i} style={{padding:"10px 12px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)",marginBottom:4}}>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:4}}>{SUBJECTS[w.sub]?.name} · {w.t}</div>
          <div style={{fontSize:12,lineHeight:1.4,marginBottom:4}}>{w.q.slice(0,80)}...</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
            <span style={{color:"var(--color-text-danger)"}}>Sen: {w.yours} → Doğru: {w.a}</span>
            <span onClick={()=>setWb(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:"var(--color-text-tertiary)",padding:"1px 4px",border:"0.5px solid var(--color-border-tertiary)",borderRadius:4}}>Kaldır</span>
          </div>
        </div>))}
      </div>
      <div>
        <div style={{fontSize:14,fontWeight:500,marginBottom:8,color:"#854F0B"}}>❤️ Kaydedilenler ({bm.length})</div>
        {!bm.length&&<div style={{fontSize:12,color:"var(--color-text-tertiary)",padding:12}}>Soru çözerken 🤍 ile kaydet.</div>}
        {bm.map((b,i)=>(<div key={i} style={{padding:"10px 12px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-tertiary)",marginBottom:4}}>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:4}}>{SUBJECTS[b.sub]?.name} · {b.t}</div>
          <div style={{fontSize:12,lineHeight:1.4,marginBottom:4}}>{b.q.slice(0,80)}...</div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
            <span style={{color:"var(--color-text-success)"}}>Doğru: {b.a}</span>
            <span onClick={()=>setBm(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:"var(--color-text-tertiary)",padding:"1px 4px",border:"0.5px solid var(--color-border-tertiary)",borderRadius:4}}>Kaldır</span>
          </div>
        </div>))}
      </div>
    </W>
  );

  // ── PROFILE ──
  if(scr==="profile")return(
    <W>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:"#EEEDFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 8px",border:"2px solid #534AB7"}}>{lvI<2?"🌱":lvI<4?"🌟":"👑"}</div>
        <div style={{fontWeight:500,fontSize:18}}>{lv.n}</div>
        <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{xp} XP · Seviye {lvI+1}/{LEVELS.length}</div>
        <div style={{height:6,background:"var(--color-border-tertiary)",borderRadius:3,marginTop:8,maxWidth:200,margin:"8px auto 0"}}><div style={{height:"100%",width:`${lvP}%`,background:"#534AB7",borderRadius:3}}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2, minmax(0, 1fr))",gap:8,marginBottom:20}}>
        {[{l:"Toplam soru",v:totQ},{l:"Başarı",v:totQ?Math.round((totC/totQ)*100)+"%":"—"},{l:"En iyi seri",v:best},{l:"Ort. süre",v:avgT?fm(avgT):"—"}].map((s,i)=>(
          <div key={i} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:12,textAlign:"center"}}>
            <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:2}}>{s.l}</div>
            <div style={{fontSize:18,fontWeight:500}}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>Ders performansı</div>
      {Object.entries(SUBJECTS).map(([k,sub])=>{const s=st[k];const p=s.t?Math.round((s.c/s.t)*100):0;return(
        <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <span style={{fontSize:12,minWidth:72}}>{sub.name}</span>
          <div style={{flex:1,height:5,background:"var(--color-border-tertiary)",borderRadius:3}}><div style={{height:"100%",width:`${p}%`,background:sub.color,borderRadius:3,minWidth:s.t?3:0}}/></div>
          <span style={{fontSize:11,color:"var(--color-text-secondary)",minWidth:32,textAlign:"right"}}>{s.t?`%${p}`:"—"}</span>
        </div>
      )})}
      <div style={{marginTop:16,fontSize:12,fontWeight:500,marginBottom:6}}>XP nasıl kazanılır?</div>
      <div style={{fontSize:11,color:"var(--color-text-secondary)",lineHeight:1.6}}>Hızlı doğru: +12 · Yavaş doğru: +8 · Her cevap: +2 · Günlük hedef: +20 bonus</div>
    </W>
  );

  return<W><div style={{padding:"2rem",textAlign:"center",color:"var(--color-text-secondary)"}}>Bir ders seçerek başla.</div></W>;
}

export default App;
