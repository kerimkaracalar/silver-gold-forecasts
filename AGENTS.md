# Emtia Öngörü — Kurulum ve Deploy Rehberi

## Ne Yapıyor?
- Altın ve gümüş fiyatlarını otomatik çeker (60 saniyede bir)
- Seçtiğin vade için (kısa / orta / uzun) yapay zeka analizi üretir
- Karşılaştırmalı analiz: hangisi daha cazip?
- Canlı veri alınamazsa manuel giriş destekler

---

## VERCEL DEPLOY (Önerilen — Ücretsiz, 5 dakika)

### 1. GitHub'a yükle
```bash
git init && git add . && git commit -m "init"
# GitHub'da yeni repo aç, sonra:
git remote add origin https://github.com/KULLANICI/REPO.git
git push -u origin main
```

### 2. Vercel'e bağla
1. https://vercel.com → GitHub ile giriş
2. "Add New Project" → repoyu seç
3. Environment Variables ekle:
   - `ANTHROPIC_API_KEY` = `sk-ant-...`
4. Deploy

### 3. API Key al
https://console.anthropic.com/settings/keys → "Create Key"

---

## YEREL TEST
```bash
echo "ANTHROPIC_API_KEY=sk-ant-xxxx" > .env.local
npm install && npm run dev
# → http://localhost:3000
```

---

## SORUN GİDERME
- **Analiz hatası**: Vercel'de ANTHROPIC_API_KEY tanımlı mı?
- **Fiyat alınamadı**: Normal, manuel giriş yap — analiz yine çalışır
