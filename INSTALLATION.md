# Installationsguide: Nextcloud Talk for Outlook (GitHub Pages)

Denna version av Outlook-tillägget hostas på GitHub Pages och är redo att installeras direkt i din Microsoft 365-instans.

## Snabbstart

Tillägget är hostat på: `https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/`

Du behöver bara:
1. Konfigurera OAuth2 i Nextcloud
2. Ladda upp manifest.xml till Microsoft 365 Admin Center
3. Användare konfigurerar sin Nextcloud-server vid första användningen

## Steg 1: Konfigurera Nextcloud

### 1.1 Installera nödvändiga appar

1. Logga in som Nextcloud-administratör
2. Gå till **Apps** → **Office & text**
3. Installera följande appar om de inte redan är installerade:
   - **Nextcloud Talk**
   - **Calendar**

### 1.2 Konfigurera OAuth2

1. Gå till **Settings** → **Security** → **OAuth 2.0**
2. Klicka på **Add client**
3. Fyll i följande information:
   - **Name**: `Outlook Nextcloud Add-in`
   - **Redirection URI**: 
     ```
     https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/src/taskpane/callback.html
     ```
   - **Confidential**: Ja (markera)
4. Klicka **Add**
5. **Spara Client ID och Client Secret** - användare kommer behöva dessa

### 1.3 Konfigurera CORS

Lägg till CORS-headers för att tillåta requests från GitHub Pages:

**Apache (.htaccess eller VirtualHost):**
```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://fredrikjonassonitsb.github.io"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Authorization, Content-Type, OCS-APIRequest, Accept"
    Header set Access-Control-Allow-Credentials "true"
    Header set Access-Control-Max-Age "3600"
</IfModule>
```

**Nginx:**
```nginx
add_header Access-Control-Allow-Origin "https://fredrikjonassonitsb.github.io" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type, OCS-APIRequest, Accept" always;
add_header Access-Control-Allow-Credentials "true" always;
add_header Access-Control-Max-Age "3600" always;

# Handle OPTIONS requests (preflight)
if ($request_method = OPTIONS) {
    add_header Access-Control-Allow-Origin "https://fredrikjonassonitsb.github.io" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, OCS-APIRequest, Accept" always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Access-Control-Max-Age "3600" always;
    add_header Content-Length 0;
    add_header Content-Type "text/plain";
    return 204;
}
```

**Spara och starta om webbservern:**
```bash
# Apache
sudo systemctl restart apache2

# Nginx
sudo systemctl reload nginx
```

## Steg 2: Installera i Microsoft 365

### Metod 1: Centraliserad distribution (rekommenderas)

1. **Logga in på Microsoft 365 Admin Center**
   - Gå till https://admin.microsoft.com
   - Logga in som Global Admin

2. **Navigera till Integrated apps**
   - Klicka på **Settings** → **Integrated apps**
   - Klicka på **Upload custom apps**

3. **Ladda upp från URL (enklast)**
   - Välj **Upload custom apps**
   - Välj **Add from URL**
   - Ange: 
     ```
     https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/manifest.xml
     ```
   - Klicka **Upload**

   **ELLER ladda upp fil:**
   - Välj **Upload manifest file**
   - Ladda upp `manifest.xml` från detta repository
   - Klicka **Upload**

4. **Konfigurera deployment**
   - **Users**: Välj användare eller grupper som ska ha tillgång
   - **Deployment method**: Välj "Fixed" (automatisk installation) eller "Available" (användare kan välja att installera)
   - Klicka **Deploy**

5. **Vänta på deployment**
   - Det kan ta upp till 24 timmar för add-in att bli tillgängligt
   - Användare kan behöva starta om Outlook

### Metod 2: Sideloading (testning)

För snabb testning kan du sideload add-in:

**Outlook Web:**
1. Öppna Outlook Web (outlook.office.com)
2. Klicka på **Settings** (kugghjul) → **View all Outlook settings**
3. Gå till **General** → **Manage add-ins**
4. Klicka **+ My add-ins** → **+ Add a custom add-in** → **Add from URL**
5. Ange: `https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/manifest.xml`
6. Klicka **Install**

**Outlook Desktop:**
1. Öppna Outlook
2. Gå till **File** → **Get Add-ins**
3. Välj **My add-ins** → **Add a custom add-in** → **Add from URL**
4. Ange manifest-URL
5. Klicka **OK**

## Steg 3: Användarinstruktioner

### Första gången användaren använder tillägget

1. **Öppna Outlook** (Desktop, Mac eller Web)

2. **Skapa eller öppna en kalenderhändelse**

3. **Hitta Nextcloud Talk-knappen**
   - I ribbonen under kalenderhändelsen
   - Eller klicka på "..." → "Nextcloud Talk"

4. **Logga in på Nextcloud**
   - Första gången visas inloggningsskärm
   - Ange din Nextcloud server-URL (t.ex. `https://nextcloud.example.com`)
   - Klicka "Login"
   - Du omdirigeras till Nextclouds inloggningssida
   - Logga in med dina Nextcloud-uppgifter
   - Godkänn åtkomst för add-in
   - Du omdirigeras tillbaka till Outlook

5. **Lägg till Nextcloud Talk-möte**
   - Fyll i mötesdetaljer (titel, tid, deltagare) i Outlook som vanligt
   - Klicka "Add Nextcloud Talk Meeting" i taskpane eller ribbon
   - Konfigurera deltagarinställningar vid behov (valfritt)
   - Möteslänk läggs automatiskt till i inbjudan

6. **Skicka inbjudan**
   - Klicka "Send" för att skicka kalenderinbjudan
   - Deltagare får inbjudan med Nextcloud Talk-länk

### Deltagarinställningar (avancerat)

För möten med högre säkerhetskrav kan organisatören konfigurera:

- **Autentiseringsnivå**: Ingen, SMS eller LOA-3 (BankID)
- **Säker e-post**: Krypterad e-postkanal
- **Personnummer**: För LOA-3 eller säker e-post
- **SMS-nummer**: För SMS-autentisering/notifiering
- **Notifiering**: E-post eller E-post + SMS

**OBS**: Dessa inställningar lagras endast i Nextcloud, inte i Outlook-inbjudan.

## Teknisk information

### Hosted URL:er

Tillägget använder följande GitHub Pages-URL:er:

- **Base URL**: https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/
- **Manifest**: https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/manifest.xml
- **Taskpane**: https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/src/taskpane/taskpane.html
- **Commands**: https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/src/commands/commands.html
- **Callback**: https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/src/taskpane/callback.html

### Manifest ID

Detta manifest använder ID: `f8c7d9e2-4a6b-4f3e-9d8c-1a2b3c4d5e6f`

### OAuth2 Redirect URI

Använd denna Redirect URI när du konfigurerar OAuth2 i Nextcloud:
```
https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/src/taskpane/callback.html
```

### CORS Domain

Tillåt requests från:
```
https://fredrikjonassonitsb.github.io
```

## Felsökning

### Add-in visas inte i Outlook

**Lösningar**:
- Vänta upp till 24 timmar efter deployment
- Starta om Outlook
- Kontrollera att användaren är inkluderad i deployment
- Verifiera att manifest.xml är korrekt uppladdad

### Autentisering misslyckas

**Lösningar**:
- Verifiera OAuth2 Redirect URI i Nextcloud (måste matcha exakt)
- Kontrollera att Nextcloud-servern är tillgänglig via HTTPS
- Se till att CORS är korrekt konfigurerat
- Testa OAuth-flödet manuellt

### CORS-fel

**Problem**: "CORS policy" eller "Access-Control-Allow-Origin" i konsolen

**Lösningar**:
- Lägg till CORS-headers på Nextcloud-servern (se ovan)
- Verifiera att `https://fredrikjonassonitsb.github.io` är tillåten
- Starta om webbservern efter ändringar
- Testa med curl:
  ```bash
  curl -I -X OPTIONS \
    -H "Origin: https://fredrikjonassonitsb.github.io" \
    https://din-nextcloud-server.com/ocs/v2.php/apps/spreed/api/v4/room
  ```

### Möte skapas inte

**Lösningar**:
- Kontrollera att Nextcloud Talk är installerat och aktiverat
- Verifiera att användaren har behörighet att skapa Talk-rum
- Kontrollera nätverksanslutning (öppna Developer Tools → Network)
- Se Nextcloud-loggar: `/var/www/nextcloud/data/nextcloud.log`

### Debugging

**Browser Console** (F12):
- Kontrollera nätverkstrafik (Network tab)
- Se JavaScript-fel (Console tab)
- Inspektera Office.js-anrop

**Nextcloud Logs**:
```bash
tail -f /var/www/nextcloud/data/nextcloud.log
```

## Säkerhet

- All kommunikation sker över HTTPS
- OAuth2/OIDC för säker autentisering
- Tokens lagras säkert i Office.context.roamingSettings
- Känsliga deltagaruppgifter lagras endast i Nextcloud
- Ingen känslig data exponeras i Outlook-inbjudningar

### Säkerhetsnotering

I denna version måste användare ange OAuth Client Secret vid första inloggningen. För produktionsmiljöer med höga säkerhetskrav rekommenderas att implementera en backend-proxy för OAuth-flödet.

## Support

För support och frågor:

- **GitHub Repository**: https://github.com/FredrikJonassonItsb/outlook-nextcloud-talk-addin
- **Issues**: https://github.com/FredrikJonassonItsb/outlook-nextcloud-talk-addin/issues
- **Nextcloud Community**: https://help.nextcloud.com

## Checklista för installation

- [ ] Nextcloud Talk och Calendar installerade
- [ ] OAuth2-klient skapad i Nextcloud med korrekt Redirect URI
- [ ] CORS konfigurerat på Nextcloud-servern
- [ ] manifest.xml uppladdad till Microsoft 365 Admin Center (eller URL använd)
- [ ] Deployment tilldelad till användare
- [ ] Testat i Outlook Web
- [ ] Testat i Outlook Desktop
- [ ] Dokumentation delad med användare

---

**Version**: 1.0.0 (GitHub Pages)  
**Senast uppdaterad**: 2025-10-20  
**Författare**: ITSLyzer

