# Nextcloud Talk for Outlook - Localhost Development

Detta är localhost-versionen av Outlook-tillägget för utveckling och felsökning.

## Fördelar med localhost-versionen

- ✅ **Enklare felsökning** - Se alla felmeddelanden direkt i konsolen
- ✅ **Snabbare iteration** - Inga väntetider för GitHub Pages deployment
- ✅ **Bättre debugging** - Kan sätta breakpoints och debugga i realtid
- ✅ **Full kontroll** - Kan ändra kod och ladda om direkt

## Förutsättningar

- Node.js installerat (v14 eller senare)
- OpenSSL installerat (för att generera SSL-certifikat)
- Tillgång till Nextcloud-servern (https://itsl2.hubs.se)

## Installation

### 1. Installera beroenden

```bash
cd outlook-nextcloud-addin-pages
npm install
```

### 2. Starta lokal HTTPS-server

```bash
node server.js
```

Servern startar på `https://localhost:3000`

### 3. Acceptera självsignerat certifikat

1. Öppna `https://localhost:3000` i din webbläsare
2. Klicka på "Advanced" eller "Avancerat"
3. Klicka på "Proceed to localhost (unsafe)" eller "Fortsätt till localhost (osäkert)"
4. Du bör nu se en sida (kan vara tom eller index.html)

**Detta måste göras** för att Outlook ska kunna ladda tillägget!

### 4. Uppdatera OAuth Redirect URI i Nextcloud

Logga in på Nextcloud som admin och uppdatera OAuth-klienten:

**Redirect URI:**
```
https://localhost:3000/src/taskpane/callback.html
```

**Så här gör du:**
1. Gå till Nextcloud → Settings → Security → OAuth 2.0
2. Hitta klienten "outlook-nextcloud-addin"
3. Lägg till den nya Redirect URI (eller ersätt den gamla)
4. Spara

### 5. Sideload manifest i Outlook

#### Outlook Web (enklast för utveckling)

1. Gå till Outlook Web (https://outlook.office.com)
2. Skapa en ny kalenderhändelse
3. Klicka på "..." (More options)
4. Välj "Get Add-ins"
5. Välj "My add-ins" → "Add a custom add-in" → "Add from URL"
6. Ange: `https://localhost:3000/manifest-localhost.xml`
7. Klicka "Install"

#### Outlook Desktop (Windows/Mac)

1. Öppna Outlook Desktop
2. Gå till "File" → "Get Add-ins"
3. Välj "My add-ins" → "Add a custom add-in" → "Add from file"
4. Välj filen `manifest-localhost.xml`
5. Klicka "Install"

## Användning

### Starta utvecklingsserver

```bash
node server.js
```

### Testa tillägget

1. Öppna Outlook (Web eller Desktop)
2. Skapa en ny kalenderhändelse
3. Tillägget "Nextcloud Talk for Outlook (Localhost)" bör synas i ribbonen
4. Klicka på tillägget för att öppna taskpane

### Felsökning

#### Öppna Developer Console

**I Outlook Web:**
- Tryck `F12` eller högerklicka och välj "Inspect"
- Gå till "Console"-fliken

**I Outlook Desktop:**
- Windows: `Ctrl+Shift+I`
- Mac: `Cmd+Option+I`

#### Vanliga problem

**Problem: "This site can't be reached"**
- Lösning: Kontrollera att servern körs (`node server.js`)

**Problem: "Your connection is not private"**
- Lösning: Acceptera självsignerat certifikat (se steg 3 ovan)

**Problem: "Failed to load manifest"**
- Lösning: Kontrollera att du kan öppna `https://localhost:3000/manifest-localhost.xml` i webbläsaren

**Problem: OAuth-inloggning fungerar inte**
- Lösning: Kontrollera att Redirect URI är uppdaterad i Nextcloud

### Logga ändringar

När du gör ändringar i koden:

1. Spara filen
2. Ladda om Outlook-tillägget:
   - Stäng taskpane
   - Öppna den igen
   - Eller tryck `Ctrl+F5` i taskpane (force reload)

## Filer som är ändrade för localhost

- `manifest-localhost.xml` - Manifest med localhost-URL:er
- `src/utils/config-localhost.js` - Konfiguration för localhost
- `server.js` - HTTPS-server för localhost
- `README-LOCALHOST.md` - Denna fil

## Skillnader mot GitHub Pages-versionen

| Aspekt | GitHub Pages | Localhost |
|--------|--------------|-----------|
| URL | `https://fredrikjonassonitsb.github.io/...` | `https://localhost:3000/...` |
| Deployment | Push till GitHub → vänta 1-2 min | Spara fil → ladda om |
| SSL | Automatiskt (GitHub) | Självsignerat certifikat |
| OAuth Redirect | GitHub Pages URL | Localhost URL |
| Debugging | Svårare | Enklare |

## Nästa steg efter felsökning

När allt fungerar lokalt:

1. Uppdatera GitHub Pages-versionen med fixarna
2. Uppdatera OAuth Redirect URI tillbaka till GitHub Pages
3. Testa i produktion

## Stoppa servern

Tryck `Ctrl+C` i terminalen där servern körs.

## Support

Om du stöter på problem:
1. Kontrollera Console-loggen (F12)
2. Kontrollera att servern körs
3. Kontrollera att certifikatet är accepterat
4. Kontrollera OAuth-konfiguration i Nextcloud

