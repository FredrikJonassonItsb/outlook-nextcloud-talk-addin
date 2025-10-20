# Version History

## Version 2.0.0 (2025-10-20)

**GitHub Pages Hosted Version**

### Nytt i denna version

- ✅ **GitHub Pages hosting** - Tillägget hostas nu på GitHub Pages istället för extern CDN
- ✅ **Nytt Manifest ID** - `a9d8f7e6-5c4b-3a2d-1e0f-9b8a7c6d5e4f` (kan installeras parallellt med v1)
- ✅ **Förbättrad stabilitet** - Inga CORS-problem med GitHub Pages
- ✅ **Enklare installation** - Installera direkt från URL
- ✅ **Automatiska uppdateringar** - Uppdateringar pushas direkt till GitHub

### Tekniska förändringar

- **Hosting URL**: `https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/`
- **OAuth Redirect URI**: `https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/src/taskpane/callback.html`
- **CORS Domain**: `https://fredrikjonassonitsb.github.io`

### Uppgradering från v1

Om du har v1 installerad:

1. **Avinstallera v1** (valfritt - de kan köras parallellt)
   - Gå till Microsoft 365 Admin Center
   - Settings → Integrated apps
   - Hitta "Nextcloud Talk for Outlook" (v1)
   - Klicka Remove

2. **Installera v2**
   - Följ instruktionerna i QUICKSTART-GITHUB-PAGES.md
   - Använd nya OAuth Redirect URI
   - Uppdatera CORS-konfiguration

### Kända begränsningar

- OAuth Client Secret måste fortfarande anges av användare (client-side begränsning)
- Första deployment av GitHub Pages kan ta 1-2 minuter

---

## Version 1.0.0 (2025-10-20)

**Initial Release - CDN Hosted**

### Funktioner

- Skapa Nextcloud Talk-möten från Outlook
- Automatisk infogning av möteslänk
- Kalenderintegration med Nextcloud
- Borttagning av Teams-länkar
- OAuth2/OIDC-autentisering
- Deltagarspecifika säkerhetsinställningar
- Flerspråkigt stöd (svenska/engelska)
- Plattformsoberoende (Windows, Mac, Web)

### Tekniska detaljer

- **Hosting**: Extern CDN (files.manuscdn.com)
- **Manifest ID**: `f8c7d9e2-4a6b-4f3e-9d8c-1a2b3c4d5e6f`
- **Version**: 1.0.0.0

### Problem i v1

- CORS-problem med vissa Outlook-konfigurationer
- Content Security Policy-begränsningar
- Extern CDN-beroende

---

**Rekommendation**: Använd alltid senaste versionen (v2) för bästa stabilitet och prestanda.

