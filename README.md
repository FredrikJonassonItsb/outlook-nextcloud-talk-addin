# Nextcloud Talk for Outlook

Ett Office Web Add-in som integrerar Nextcloud Talk och Nextcloud Kalender med Microsoft Outlook. Användare kan enkelt boka videomöten i Nextcloud Talk direkt från Outlook med samma enkelhet som Teams-möten.

## Funktioner

- **Skapa Nextcloud Talk-möten**: Generera Talk-rum med ett klick direkt i Outlook
- **Automatisk infogning**: Möteslänk och instruktioner läggs automatiskt till i kalenderinbjudan
- **Kalenderintegration**: Synkroniserar möten till Nextcloud Kalender
- **Borttagning av Teams-länkar**: Tar automatiskt bort Teams-mötesuppgifter
- **OAuth2/OIDC-autentisering**: Säker inloggning med stöd för SSO
- **Deltagarspecifika säkerhetsinställningar**: 
  - Autentiseringsnivåer (Ingen, SMS, LOA-3/BankID)
  - Säker e-post
  - Personnummer och SMS-nummer för verifiering
  - Notifieringsval (E-post eller E-post + SMS)
- **Flerspråkigt stöd**: Svenska och engelska
- **Plattformsoberoende**: Fungerar i Outlook för Windows, Mac och webben

## Teknisk översikt

### Arkitektur

- **Frontend**: Office Web Add-in (HTML/JavaScript)
- **API-integration**: Nextcloud Talk API och Calendar API (CalDAV)
- **Autentisering**: OAuth2/OIDC
- **Plattform**: Office.js API

### Projektstruktur

```
outlook-nextcloud-addin/
├── manifest.xml              # Office Add-in manifest
├── package.json             # Node.js dependencies
├── README.md                # Denna fil
├── INSTALLATION.md          # Installationsinstruktioner
├── src/
│   ├── taskpane/
│   │   ├── taskpane.html    # Huvudgränssnitt
│   │   ├── taskpane.js      # Huvudlogik
│   │   ├── taskpane.css     # Styling
│   │   └── callback.html    # OAuth callback
│   ├── commands/
│   │   ├── commands.html    # Ribbon commands
│   │   └── commands.js      # Command handlers
│   ├── services/
│   │   ├── nextcloud-api.js # Nextcloud API-klient
│   │   ├── auth-service.js  # Autentiseringstjänst
│   │   └── outlook-service.js # Outlook-integration
│   ├── utils/
│   │   ├── config.js        # Konfiguration
│   │   ├── storage.js       # Datalagring
│   │   └── i18n.js          # Internationalisering
│   └── assets/
│       └── icon-*.png       # Ikoner
└── dist/                    # Build output (genereras)
```

## Förutsättningar

### Outlook-miljö
- Microsoft 365 / Exchange Online
- Outlook för Windows, Mac eller Outlook Web
- Modern Outlook-klient (stöd för Office Web Add-ins)

### Nextcloud-miljö
- Nextcloud Hub med Nextcloud Talk installerat
- Nextcloud Calendar installerat och aktiverat
- Nextcloud Talk API v4 eller senare
- OAuth2-app konfigurerad i Nextcloud

### Utvecklingsmiljö
- Node.js 14 eller senare
- npm eller pnpm
- HTTPS-server för hosting (utveckling och produktion)

## Installation

Se [INSTALLATION.md](INSTALLATION.md) för detaljerade installationsinstruktioner.

### Snabbstart för utveckling

1. **Klona repository**
   ```bash
   git clone https://github.com/FredrikJonassonItsb/ITSLyzer.git
   cd outlook-nextcloud-addin
   ```

2. **Installera dependencies**
   ```bash
   npm install
   ```

3. **Konfigurera Nextcloud-server**
   
   Redigera `src/utils/config.js` och uppdatera:
   ```javascript
   nextcloud: {
     serverUrl: 'https://your-nextcloud-server.com'
   }
   ```

4. **Konfigurera OAuth2 i Nextcloud**
   
   - Gå till Nextcloud Admin → Security → OAuth 2.0
   - Skapa ny OAuth2-klient
   - Redirect URI: `https://localhost:8080/src/taskpane/callback.html`
   - Kopiera Client ID och Client Secret till `config.js`

5. **Starta utvecklingsserver**
   ```bash
   npm run serve
   ```

6. **Sideload add-in i Outlook**
   
   - Öppna Outlook Web
   - Gå till Settings → Manage add-ins → My add-ins
   - Klicka "+ Add a custom add-in" → "Add from URL"
   - Ange: `https://localhost:8080/manifest.xml`

## Konfiguration

### Nextcloud-serverkonfiguration

Redigera `src/utils/config.js`:

```javascript
const CONFIG = {
  nextcloud: {
    serverUrl: 'https://nextcloud.example.com',
    defaultCalendar: 'personal'
  },
  oauth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'https://your-domain.com/src/taskpane/callback.html'
  }
};
```

### Manifest-konfiguration

Uppdatera `manifest.xml` för produktion:

1. Ändra `<Id>` till ett unikt GUID
2. Uppdatera alla URL:er från `localhost:8080` till din produktions-URL
3. Lägg till din domän i `<AppDomains>`

## Användning

### Skapa ett Nextcloud Talk-möte

1. Öppna eller skapa en kalenderhändelse i Outlook
2. Klicka på "Add Nextcloud Meeting" i ribbonen eller öppna taskpane
3. Logga in på Nextcloud (första gången)
4. Konfigurera deltagarinställningar vid behov
5. Klicka "Add Nextcloud Talk Meeting"
6. Möteslänk läggs automatiskt till i inbjudan

### Deltagarinställningar

För varje deltagare kan du konfigurera:

- **Autentiseringsnivå**: Ingen, SMS eller LOA-3 (BankID)
- **Säker e-post**: Krypterad e-postkanal
- **Personnummer**: För LOA-3-verifiering
- **SMS-nummer**: För SMS-autentisering/notifiering
- **Notifiering**: E-post eller E-post + SMS

**OBS**: Dessa inställningar lagras endast i Nextcloud, inte i Outlook.

## API-dokumentation

### Nextcloud Talk API

```javascript
// Skapa Talk-rum
POST /ocs/v2.php/apps/spreed/api/v4/room
Headers:
  Authorization: Bearer {access_token}
  OCS-APIRequest: true
Body:
  {
    "roomType": 3,
    "roomName": "Meeting Name"
  }
```

### Nextcloud Calendar API (CalDAV)

```javascript
// Skapa kalenderhändelse
PUT /remote.php/dav/calendars/{username}/{calendar}/{event_uid}.ics
Headers:
  Authorization: Bearer {access_token}
  Content-Type: text/calendar
Body: (iCalendar format)
```

## Säkerhet

- All kommunikation sker över HTTPS
- OAuth2/OIDC för säker autentisering
- Tokens lagras säkert i Office.context.roamingSettings
- Känsliga deltagaruppgifter lagras endast i Nextcloud
- Ingen känslig data exponeras i Outlook-inbjudningar

## Felsökning

### Add-in laddas inte

- Kontrollera att alla URL:er i manifest.xml är korrekta
- Verifiera att HTTPS-servern är tillgänglig
- Kontrollera webbläsarens konsol för felmeddelanden

### Autentisering misslyckas

- Verifiera att OAuth2-klienten är korrekt konfigurerad i Nextcloud
- Kontrollera att redirect URI matchar exakt
- Se till att Nextcloud-servern är tillgänglig

### Möte skapas inte

- Kontrollera att Nextcloud Talk är installerat och aktiverat
- Verifiera att användaren har behörighet att skapa Talk-rum
- Kontrollera nätverksanslutning och CORS-inställningar

### Kalenderhändelse skapas inte

- Verifiera att Nextcloud Calendar är installerat
- Kontrollera att användaren har en kalender
- Se CalDAV-loggarna i Nextcloud

## Utveckling

### Köra tester

```bash
npm test
```

### Validera manifest

```bash
npm run validate
```

### Bygga för produktion

```bash
npm run build
```

## Distribution

### Centraliserad distribution (Microsoft 365 Admin Center)

1. Hosta add-in-filerna på en HTTPS-server
2. Uppdatera alla URL:er i manifest.xml
3. Logga in på Microsoft 365 Admin Center
4. Gå till Settings → Integrated apps → Upload custom apps
5. Ladda upp manifest.xml
6. Tilldela till användare eller grupper

### AppSource (offentlig distribution)

1. Förbered add-in enligt Microsofts riktlinjer
2. Skapa Partner Center-konto
3. Skicka in add-in för granskning
4. Vänta på godkännande

## Bidra

Bidrag är välkomna! Vänligen:

1. Forka repository
2. Skapa en feature branch
3. Commit dina ändringar
4. Skapa en Pull Request

## Licens

MIT License - se LICENSE-filen för detaljer

## Support

För support och frågor:

- GitHub Issues: https://github.com/FredrikJonassonItsb/ITSLyzer/issues
- Nextcloud Community: https://help.nextcloud.com

## Författare

ITSLyzer

## Tack till

- Nextcloud-communityn
- Microsoft Office Add-ins-teamet
- Sendent för inspiration

## Changelog

### Version 1.0.0 (2025-10-20)

- Första release
- Grundläggande Talk-integration
- Kalendersynkronisering
- Deltagarspecifika säkerhetsinställningar
- Flerspråkigt stöd (svenska/engelska)
- OAuth2/OIDC-autentisering

