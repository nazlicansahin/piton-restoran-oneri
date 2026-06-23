# Fonksiyon Dokümantasyonu Görevi

Bu proje, inceleyenlerin, gelecekteki sizin ve AI agent'ların her implementasyonu okumadan davranışı anlayabilmesi için fonksiyonlar için **canlı dokümantasyon** gerektirir.

## Kim yapmalı

- **Geliştiriciler** — yeni fonksiyon eklerken veya mevcut fonksiyonu önemli ölçüde değiştirirken
- **Cursor agent'ları** — ilgili her düzenlemede `.cursor/rules/function-documentation.mdc` kuralını izleyin

## Dokümantasyon nerede

```
docs/
├── en/
│   ├── FUNCTION_DOCUMENTATION.md   ← İngilizce süreç + şablon
│   ├── functions/                  ← İngilizce fonksiyon referansı
│   └── screenshots/
└── tr/
    ├── FUNCTION_DOCUMENTATION.md   ← bu dosya (Türkçe süreç + şablon)
    ├── functions/                  ← Türkçe fonksiyon referansı
    └── screenshots/
```

- **Alan/modül başına bir dosya** (ör. `recommend`, `favorites-groups`, `auth`)
- Yeni kayıt veya güncelleme yaparken **İngilizce ve Türkçe** dosyaları senkron tutun
- Fonksiyon dokümantasyonunu yalnızca README veya satır içi yorumlara dağıtmayın — `docs/en/functions/` ve `docs/tr/functions/` kanonik kayıtlardır

## Her kayıtta bulunması gerekenler

| Alan | Açıklama |
|------|----------|
| **Ad** | Tam fonksiyon adı (dosya yolu ile) |
| **Amaç** | Ne yapar ve neden vardır |
| **Nasıl çalışır** | Adım adım mantık, algoritma veya akış |
| **Girdiler** | Parametreler ve tipler (veya “yok”) |
| **Dönüş** | Dönüş tipi ve anlamı |
| **Yan etkiler** | DB yazımı, API çağrısı, global state — veya “yok” |
| **Bağımlılıklar** | Diğer modüller, env değişkenleri, harici servisler |
| **Örnek** | Davranış belirsizse kısa kullanım parçacığı |

## Standart şablon

Aşağıdaki bloğu `docs/en/functions/<domain>.md` ve `docs/tr/functions/<domain>.md` dosyalarına kopyalayın:

```markdown
### `functionName`

- **Dosya:** `path/to/file.ts`
- **Amaç:** Fonksiyonun ne için olduğunu tek cümleyle açıklayın.
- **Nasıl çalışır:**
  1. İlk adım
  2. İkinci adım
  3. Son adım / dönüş
- **Girdiler:** `paramA: TypeA`, `paramB?: TypeB`
- **Dönüş:** `ReturnType` — çağıranın aldığı değer
- **Yan etkiler:** Yok | DB/API/state değişiklikleri listesi
- **Bağımlılıklar:** `otherModule`, `DATABASE_URL`, vb.
- **Örnek:**
  ```ts
  const result = functionName(arg1, arg2);
  ```
```

## İş akışı

1. Fonksiyonu kodda uygulayın veya değiştirin.
2. `docs/en/functions/<domain>.md` ve `docs/tr/functions/<domain>.md` dosyalarını açın veya oluşturun.
3. Şablonu kullanarak fonksiyon bölümünü ekleyin veya güncelleyin (her iki dilde).
4. Yeni bir domain dosyası eklediyseniz `docs/en/functions/README.md` ve `docs/tr/functions/README.md` indekslerini güncelleyin.
5. Kod ve dokümantasyonu mümkünse aynı commit/PR içinde gönderin.

## Kalite standardı

- **Amaç** “neden” sorusunu yanıtlar, “3. satır ne yapıyor” değil
- **Nasıl çalışır** kaynak kodu açmadan yeniden uygulama veya hata ayıklama için yeterli olmalı
- Boş girdi, auth hatası, fallback gibi kenar durumları önemliyse belirtin

## Burada dokümante edilmeyecekler

- React bileşenleri (saf helper export ediyorsa bileşen adı kullanılabilir)
- Önemsiz yardımcılar (`cn`, basit formatlayıcılar)
- Üretilmiş tipler, test mock'ları

## Örnek domain dosyası

Bkz. [functions/recommend.md](./functions/recommend.md).
