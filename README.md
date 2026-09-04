# Axiom AI Carbon Coach

[Sunum Linki](https://axiom-26.netlify.app/)

![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)
![Gemini](https://img.shields.io/badge/Google%20Gemini-API-4285F4?logo=google&logoColor=white)

> **Bu depo hakkinda / About this repository**
>
> Bu depo, ekip deposu [Hamzaalhadithy/axiom](https://github.com/Hamzaalhadithy/axiom)
> ana dalinin bir anlik goruntusudur. Kaynak arsivinden ice aktarildigi icin
> orijinal commit gecmisi korunamamistir - koddaki katkilarin sahipligi icin
> ust depoya bakiniz. Uygulama, HAMZAH AL-HADEETHI ve Ziyad Alboghdady
> tarafindan bir ekip projesi olarak gelistirilmistir.
>
> *A snapshot of the team repository linked above. It was imported from a
> source archive with no git history, so the original per-commit authorship
> lives upstream, not here.*

Axiom AI Carbon Coach, kullanıcıların günlük karbon ayak izlerini takip etmelerine, anlamalarına ve azaltmalarına yardımcı olan yapay zeka destekli akıllı bir mobil uygulamadır. React Native, Expo ve Firebase kullanılarak geliştirilmiştir.

## 🌟 Önemli Özellikler

### 🤖 Yapay Zeka Koçu (AI Coach)
Gemini AI entegrasyonu sayesinde sadece verilerinizi göstermekle kalmaz, onları analiz eder. Karbon ayak izinizi azaltmanız için size özel, uygulanabilir tavsiyeler ve kişiselleştirilmiş içgörüler sunar.

### 📊 Kapsamlı Karbon Takibi
- Ulaşım, yiyecek, enerji ve diğer harcamalarınızın karbon emisyonlarını kolayca kaydedin.
- Anlık karbon skorunuzu ve emisyon çubuklarınızı detaylı bir şekilde görüntüleyin.
- Kamera entegrasyonu ile hızlıca yiyecek/ürün taraması yapın.

### 🏆 Sosyal ve Liderlik Tablosu
- Arkadaşlarınızla ve toplulukla rekabet edin.
- Puan kazanın (XP), seviye atlayın ve başarı rozetleri toplayın.
- İlk 3 için özel podyum görünümü ile motivasyonunuzu yüksek tutun.

### 🎨 Premium Tasarım Sistemi (Dark Base + Light Cards)
Özel olarak hazırlanmış modern tasarım sistemi sayesinde göz yormayan, derinlik hissi veren şık bir kullanıcı deneyimi. "Karanlık arka plan üzerinde süzülen açık renkli kartlar" felsefesiyle yüksek okunabilirlik ve premium bir his sunar.

### ⚙️ Akıllı Entegrasyonlar
- **Google Takvim:** Uçuş ve seyahat etkinliklerinizi otomatik olarak algılar ve karbon emisyonunu hesaplar.
- **Konum:** Ulaşım alışkanlıklarınızı daha iyi anlamak için konum servislerinden faydalanır.
- **Bildirimler:** Günlük hatırlatıcılar ve yapay zeka önerileri için anlık bildirimler gönderir.

## 🛠️ Teknolojiler
- **Frontend:** React Native, Expo Router, Tailwind CSS, Zustand (State Management)
- **Backend & Auth:** Firebase (Authentication, Firestore Veritabanı)
- **AI:** Google Gemini API
- **Harici API'ler:** Google Calendar API, Expo Location, Expo Notifications

## 🚀 Başlangıç

**Gereksinimler:** Node.js 18+, bir Firebase projesi ve bir Google Gemini API anahtarı.

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Ortam değişkenlerini ayarlayın:
   ```bash
   cp .env.example .env
   ```
   `.env` dosyasını açıp Firebase ve Gemini değerlerinizi girin. Hangi değerin
   nereden alındığı [Ortam Değişkenleri](#-ortam-değişkenleri) bölümünde
   listelenmiştir. `.env` dosyası git tarafından yok sayılır.

3. Projeyi başlatın:
   ```bash
   npx expo start
   ```

Expo Go uygulaması ile karekodu okutarak uygulamayı fiziksel cihazınızda deneyimleyebilirsiniz.

## 🔑 Ortam Değişkenleri

| Değişken | Nereden alınır |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project settings → Your apps |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Aynı ekran (`proje-adi.firebaseapp.com`) |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Aynı ekran |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Aynı ekran |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Aynı ekran |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Aynı ekran |
| `EXPO_PUBLIC_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `EXPO_PUBLIC_GEMINI_TEXT_MODELS` | Virgülle ayrılmış model listesi; sırayla denenir |
| `EXPO_PUBLIC_GEMINI_VISION_MODELS` | Görsel analizi için aynı mantık |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials → OAuth client ID |

> ⚠️ `EXPO_PUBLIC_` önekli her değer derleme sırasında uygulama paketine gömülür
> ve uygulamayı kuran herkes tarafından okunabilir. Bu anahtarları sağlayıcı
> tarafında kısıtlayın (Firebase güvenlik kuralları, Google Cloud API anahtarı
> kısıtlamaları) ve sunucu tarafı sırlarını buraya koymayın.

## 📁 Proje Yapısı

```
app/              Expo Router ekranları (sekmeler, onboarding, özellik sayfaları)
src/components/   Yeniden kullanılabilir arayüz bileşenleri
src/hooks/        Veri ve iş mantığı hook'ları (karbon skoru, AI koç, takvim)
src/services/     Firebase, Gemini, kimlik doğrulama ve takvim servisleri
src/store/        Zustand durum yönetimi (auth, karbon, ilerleme)
src/constants/    Renkler, emisyon faktörleri, seviye tanımları
src/i18n/         Çoklu dil desteği
src/utils/        Yardımcı fonksiyonlar
assets/           İkonlar ve açılış ekranı görselleri
```

## 👥 Ekip

- [HAMZAH AL-HADEETHI](https://github.com/Hamzaalhadithy)
- [Ziyad Alboghdady](https://github.com/ziyad-alboghdady)

## 📄 Lisans

Henüz bir lisans seçilmemiştir. Kod ortak yazarlı olduğu için lisans kararı
yazarların ortak onayına bağlıdır — o zamana kadar **tüm hakları saklıdır**.
Yeniden kullanmadan önce lütfen sorunuz.
