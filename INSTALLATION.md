# Installationsguide: Nextcloud Talk for Outlook

Denna guide beskriver hur du installerar och konfigurerar Outlook-tillägget för Nextcloud Talk och Kalender i din Microsoft 365-instans.

## Innehållsförteckning

1. [Förutsättningar](#förutsättningar)
2. [Nextcloud-konfiguration](#nextcloud-konfiguration)
3. [Add-in hosting](#add-in-hosting)
4. [Manifest-konfiguration](#manifest-konfiguration)
5. [Distribution i Microsoft 365](#distribution-i-microsoft-365)
6. [Användarinstruktioner](#användarinstruktioner)
7. [Felsökning](#felsökning)

## Förutsättningar

### Nextcloud-miljö

- Nextcloud Hub (version 25 eller senare rekommenderas)
- Nextcloud Talk installerat och aktiverat
- Nextcloud Calendar installerat och aktiverat
- HTTPS aktiverat (SSL-certifikat)
- Administratörsåtkomst till Nextcloud

### Microsoft 365-miljö

- Microsoft 365 Business eller Enterprise-prenumeration
- Exchange Online aktiverat
- Global administratör eller Exchange-administratör
- Outlook för Windows, Mac eller Outlook Web

### Tekniska krav

- Webbserver med HTTPS-stöd för hosting av add-in
- Domännamn med giltigt SSL-certifikat
- Möjlighet att konfigurera CORS på Nextcloud-servern

## Nextcloud-konfiguration

### Steg 1: Installera nödvändiga appar

1. Logga in som Nextcloud-administratör
2. Gå till **Apps** → **Office & text**
3. Installera följande appar om de inte redan är installerade:
   - **Nextcloud Talk**
   - **Calendar**

### Steg 2: Konfigurera OAuth2

1. Gå till **Settings** → **Security** → **OAuth 2.0**
2. Klicka på **Add client**
3. Fyll i följande information:
   - **Name**: `Outlook Nextcloud Add-in`
   - **Redirection URI**: `https://your-addin-domain.com/src/taskpane/callback.html`
     (Ersätt med din faktiska domän där add-in hostas)
   - **Confidential**: Ja (markera)
4. Klicka **Add**
5. **Spara Client ID och Client Secret** - dessa behövs senare

### Steg 3: Konfigurera CORS (om nödvändigt)

Om add-in hostas på en annan domän än Nextcloud-servern, lägg till CORS-headers:

**Apache (.htaccess eller VirtualHost):**
```apache
Header set Access-Control-Allow-Origin "https://your-addin-domain.com"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Authorization, Content-Type, OCS-APIRequest"
Header set Access-Control-Allow-Credentials "true"
```

**Nginx:**
```nginx
add_header Access-Control-Allow-Origin "https://your-addin-domain.com" always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type, OCS-APIRequest" always;
add_header Access-Control-Allow-Credentials "true" always;
```

### Steg 4: Verifiera API-åtkomst

Testa att Talk API är tillgängligt:

```bash
curl -X GET "https://your-nextcloud.com/ocs/v2.php/apps/spreed/api/v4/room" \
  -H "OCS-APIRequest: true" \
  -H "Accept: application/json"
```

## Add-in hosting

### Alternativ 1: Intern webbserver

1. **Förbered webbserver**
   - Installera Apache, Nginx eller annan webbserver
   - Konfigurera HTTPS med giltigt SSL-certifikat
   - Skapa dokumentrot för add-in

2. **Ladda upp filer**
   ```bash
   # Kopiera alla filer till webbservern
   scp -r outlook-nextcloud-addin/* user@webserver:/var/www/outlook-addin/
   ```

3. **Konfigurera webbserver**
   
   **Apache VirtualHost:**
   ```apache
   <VirtualHost *:443>
       ServerName outlook-addin.your-domain.com
       DocumentRoot /var/www/outlook-addin
       
       SSLEngine on
       SSLCertificateFile /path/to/cert.pem
       SSLCertificateKeyFile /path/to/key.pem
       
       <Directory /var/www/outlook-addin>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```
   
   **Nginx:**
   ```nginx
   server {
       listen 443 ssl;
       server_name outlook-addin.your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       root /var/www/outlook-addin;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

### Alternativ 2: Azure Static Web Apps / GitHub Pages

1. **Skapa Azure Static Web App**
   - Logga in på Azure Portal
   - Skapa ny Static Web App
   - Koppla till GitHub repository
   - Konfigurera build settings

2. **Eller använd GitHub Pages**
   - Aktivera GitHub Pages i repository settings
   - Välj branch och mapp
   - Konfigurera custom domain med HTTPS

## Manifest-konfiguration

### Steg 1: Uppdatera manifest.xml

Redigera `manifest.xml` och uppdatera följande:

1. **Unikt ID**
   ```xml
   <Id>GENERERA-ETT-NYTT-GUID-HÄR</Id>
   ```
   Generera GUID på: https://www.guidgenerator.com/

2. **URL:er**
   Ersätt alla `https://localhost:8080` med din produktions-URL:
   ```xml
   <IconUrl DefaultValue="https://your-addin-domain.com/assets/icon-64.png"/>
   <HighResolutionIconUrl DefaultValue="https://your-addin-domain.com/assets/icon-128.png"/>
   ```

3. **App Domains**
   ```xml
   <AppDomains>
     <AppDomain>https://your-addin-domain.com</AppDomain>
     <AppDomain>https://your-nextcloud.com</AppDomain>
   </AppDomains>
   ```

4. **Source Locations**
   Uppdatera alla `SourceLocation` och `bt:Url`:
   ```xml
   <bt:Url id="Taskpane.Url" DefaultValue="https://your-addin-domain.com/src/taskpane/taskpane.html"/>
   <bt:Url id="Commands.Url" DefaultValue="https://your-addin-domain.com/src/commands/commands.html"/>
   ```

### Steg 2: Uppdatera config.js

Redigera `src/utils/config.js`:

```javascript
const CONFIG = {
  nextcloud: {
    serverUrl: 'https://your-nextcloud.com',
    defaultCalendar: 'personal'
  },
  oauth: {
    clientId: 'DIN-OAUTH-CLIENT-ID',
    clientSecret: 'DIN-OAUTH-CLIENT-SECRET',
    redirectUri: 'https://your-addin-domain.com/src/taskpane/callback.html'
  }
};
```

**VIKTIGT**: I produktion bör `clientSecret` inte lagras i frontend-kod. Överväg att använda en backend-proxy för OAuth-flödet.

### Steg 3: Validera manifest

```bash
npm install -g office-addin-manifest
office-addin-manifest validate manifest.xml
```

## Distribution i Microsoft 365

### Metod 1: Centraliserad distribution (rekommenderas)

1. **Logga in på Microsoft 365 Admin Center**
   - Gå till https://admin.microsoft.com
   - Logga in som Global Admin

2. **Navigera till Integrated apps**
   - Klicka på **Settings** → **Integrated apps**
   - Klicka på **Upload custom apps**

3. **Ladda upp manifest**
   - Välj **Upload custom apps**
   - Klicka **Upload manifest file**
   - Välj din `manifest.xml`
   - Klicka **Upload**

4. **Konfigurera deployment**
   - **Users**: Välj användare eller grupper
   - **Deployment method**: Välj "Fixed" eller "Available"
   - Klicka **Deploy**

5. **Vänta på deployment**
   - Det kan ta upp till 24 timmar för add-in att bli tillgängligt
   - Användare kan behöva starta om Outlook

### Metod 2: Sideloading (testning)

För utveckling och testning:

**Outlook Web:**
1. Öppna Outlook Web (outlook.office.com)
2. Klicka på **Settings** (kugghjul) → **View all Outlook settings**
3. Gå till **General** → **Manage add-ins**
4. Klicka **+ My add-ins** → **+ Add a custom add-in** → **Add from URL**
5. Ange URL till manifest: `https://your-addin-domain.com/manifest.xml`
6. Klicka **Install**

**Outlook Desktop (Windows/Mac):**
1. Öppna Outlook
2. Gå till **File** → **Get Add-ins** eller **Store**
3. Välj **My add-ins** → **Add a custom add-in** → **Add from URL**
4. Ange manifest-URL
5. Klicka **OK**

## Användarinstruktioner

### Första gången

1. **Öppna Outlook** (Desktop, Mac eller Web)

2. **Skapa eller öppna en kalenderhändelse**

3. **Hitta Nextcloud Talk-knappen**
   - I ribbonen under kalenderhändelsen
   - Eller klicka på "..." → "Nextcloud Talk"

4. **Logga in på Nextcloud**
   - Första gången visas inloggningsskärm
   - Ange Nextcloud server-URL (om inte förinställd)
   - Klicka "Login"
   - Logga in med dina Nextcloud-uppgifter
   - Godkänn åtkomst för add-in

5. **Lägg till Nextcloud Talk-möte**
   - Fyll i mötesdetaljer (titel, tid, deltagare)
   - Konfigurera deltagarinställningar vid behov
   - Klicka "Add Nextcloud Talk Meeting"
   - Möteslänk läggs automatiskt till

6. **Skicka inbjudan**
   - Klicka "Send" för att skicka kalenderinbjudan
   - Deltagare får inbjudan med Nextcloud Talk-länk

### Deltagarinställningar (avancerat)

För möten med högre säkerhetskrav:

1. **Öppna taskpane** (sidopanel)
2. **Expandera deltagarinställningar**
3. **För varje deltagare, konfigurera:**
   - **Autentiseringsnivå**: Ingen, SMS eller LOA-3 (BankID)
   - **Säker e-post**: Markera för krypterad utskick
   - **Personnummer**: Fyll i för LOA-3 eller säker e-post
   - **SMS-nummer**: Fyll i för SMS-autentisering
   - **Notifiering**: Välj E-post eller E-post + SMS

**OBS**: Dessa inställningar lagras endast i Nextcloud, inte i Outlook-inbjudan.

## Felsökning

### Add-in visas inte i Outlook

**Problem**: Add-in syns inte i ribbonen eller menyn

**Lösningar**:
- Vänta upp till 24 timmar efter deployment
- Starta om Outlook
- Kontrollera att användaren är inkluderad i deployment
- Verifiera att manifest.xml är korrekt uppladdad
- Kontrollera Office 365-licensstatus

### Autentisering misslyckas

**Problem**: "Authentication failed" eller inloggning fungerar inte

**Lösningar**:
- Verifiera OAuth2 Client ID och Secret
- Kontrollera att Redirect URI matchar exakt
- Se till att Nextcloud-servern är tillgänglig via HTTPS
- Kontrollera CORS-inställningar
- Testa OAuth-flödet manuellt

### Möte skapas inte

**Problem**: "Failed to create Talk room" eller inget händer

**Lösningar**:
- Kontrollera att Nextcloud Talk är installerat och aktiverat
- Verifiera att användaren har behörighet att skapa Talk-rum
- Kontrollera nätverksanslutning (öppna Developer Tools → Network)
- Se Nextcloud-loggar: `/var/www/nextcloud/data/nextcloud.log`
- Testa Talk API manuellt med curl

### Kalenderhändelse skapas inte i Nextcloud

**Problem**: Möte finns i Outlook men inte i Nextcloud Calendar

**Lösningar**:
- Verifiera att Nextcloud Calendar är installerat
- Kontrollera att användaren har en kalender (skapa en om nödvändigt)
- Testa CalDAV-åtkomst
- Kontrollera CalDAV-loggar i Nextcloud
- Verifiera att kalenderns namn matchar `defaultCalendar` i config

### CORS-fel

**Problem**: "CORS policy" eller "Access-Control-Allow-Origin" i konsolen

**Lösningar**:
- Lägg till CORS-headers på Nextcloud-servern (se ovan)
- Verifiera att add-in-domänen är korrekt konfigurerad
- Kontrollera att både HTTP och HTTPS används konsekvent
- Testa med browser developer tools

### SSL/TLS-certifikatfel

**Problem**: "Certificate error" eller "NET::ERR_CERT_AUTHORITY_INVALID"

**Lösningar**:
- Använd giltigt SSL-certifikat (Let's Encrypt rekommenderas)
- Undvik self-signed certificates i produktion
- Kontrollera att certifikatet inte har gått ut
- Verifiera att hela certifikatkedjan är korrekt

## Support och ytterligare hjälp

### Loggar

**Outlook Web (Browser Console)**:
```
F12 → Console
```

**Nextcloud-loggar**:
```bash
tail -f /var/www/nextcloud/data/nextcloud.log
```

**Webbserver-loggar**:
```bash
# Apache
tail -f /var/log/apache2/error.log

# Nginx
tail -f /var/log/nginx/error.log
```

### Kontakt

- GitHub Issues: https://github.com/FredrikJonassonItsb/ITSLyzer/issues
- Nextcloud Community: https://help.nextcloud.com
- Microsoft Office Add-ins: https://docs.microsoft.com/office/dev/add-ins/

### Användbara länkar

- [Office Add-ins dokumentation](https://docs.microsoft.com/office/dev/add-ins/)
- [Nextcloud Talk API](https://nextcloud-talk.readthedocs.io/)
- [Nextcloud CalDAV](https://docs.nextcloud.com/server/latest/user_manual/pim/calendar.html)
- [OAuth 2.0 i Nextcloud](https://docs.nextcloud.com/server/latest/admin_manual/configuration_server/oauth2.html)

## Checklista för installation

- [ ] Nextcloud Talk och Calendar installerade
- [ ] OAuth2-klient skapad i Nextcloud
- [ ] CORS konfigurerat (om nödvändigt)
- [ ] Add-in hostad på HTTPS-server
- [ ] manifest.xml uppdaterat med korrekta URL:er
- [ ] config.js uppdaterat med Nextcloud-detaljer
- [ ] Manifest validerat
- [ ] Add-in uppladdad till Microsoft 365 Admin Center
- [ ] Deployment tilldelad till användare
- [ ] Testat i Outlook Web
- [ ] Testat i Outlook Desktop
- [ ] Dokumentation delad med användare

## Säkerhetsrekommendationer

1. **Använd alltid HTTPS** för både add-in och Nextcloud
2. **Lagra inte Client Secret i frontend** - använd backend-proxy
3. **Begränsa OAuth-scope** till minimum nödvändigt
4. **Aktivera Two-Factor Authentication** för Nextcloud-administratörer
5. **Granska regelbundet** vilka användare som har åtkomst
6. **Håll Nextcloud uppdaterat** med senaste säkerhetspatchar
7. **Övervaka loggar** för misstänkt aktivitet
8. **Backup** Nextcloud-data regelbundet

---

**Version**: 1.0.0  
**Senast uppdaterad**: 2025-10-20  
**Författare**: ITSLyzer

