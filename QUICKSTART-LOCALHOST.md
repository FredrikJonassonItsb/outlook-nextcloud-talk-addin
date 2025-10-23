# Snabbstart - Localhost Development

## 🚀 Kom igång på 5 minuter

### Steg 1: Starta servern

```bash
cd outlook-nextcloud-addin-pages
node server.js
```

Du bör se:
```
═══════════════════════════════════════════════════════════
  Nextcloud Talk for Outlook - Localhost Development Server
═══════════════════════════════════════════════════════════

  🚀 Server running at: https://localhost:3000/
```

### Steg 2: Acceptera SSL-certifikat

1. Öppna din webbläsare
2. Gå till: `https://localhost:3000`
3. Klicka "Advanced" → "Proceed to localhost (unsafe)"
4. Du bör se en sida (kan vara tom)

**Detta är viktigt!** Outlook kan inte ladda tillägget utan detta.

### Steg 3: Uppdatera Nextcloud OAuth

1. Logga in på Nextcloud: https://itsl2.hubs.se
2. Gå till Settings → Security → OAuth 2.0
3. Hitta klienten "outlook-nextcloud-addin"
4. Lägg till Redirect URI:
   ```
   https://localhost:3000/src/taskpane/callback.html
   ```
5. Spara

### Steg 4: Installera i Outlook Web

1. Gå till: https://outlook.office.com
2. Skapa en ny kalenderhändelse
3. Klicka "..." → "Get Add-ins"
4. "My add-ins" → "Add a custom add-in" → "Add from URL"
5. Ange: `https://localhost:3000/manifest-localhost.xml`
6. Klicka "Install"

### Steg 5: Testa!

1. Öppna kalenderhändelsen igen
2. Du bör se "Nextcloud Talk for Outlook (Localhost)" i ribbonen
3. Klicka på den
4. Taskpane öppnas!

## 🔍 Felsökning

### Öppna Console

Tryck **F12** i Outlook Web → gå till "Console"-fliken

### Vanliga problem

**"This site can't be reached"**
→ Servern körs inte. Kör `node server.js`

**"Your connection is not private"**
→ Acceptera certifikatet (se Steg 2)

**"Failed to load manifest"**
→ Kontrollera att `https://localhost:3000/manifest-localhost.xml` öppnas i webbläsaren

## 📝 Gör ändringar

1. Redigera en fil (t.ex. `src/taskpane/taskpane.js`)
2. Spara
3. Ladda om taskpane i Outlook (stäng och öppna igen)
4. Ändringarna syns direkt!

## 🎯 Fördelar

- ✅ Inga väntetider (GitHub Pages tar 1-2 min)
- ✅ Se alla fel direkt i Console
- ✅ Kan debugga med breakpoints
- ✅ Snabbare utveckling

## ⏹️ Stoppa servern

Tryck **Ctrl+C** i terminalen

---

**Behöver mer hjälp?** Se README-LOCALHOST.md för detaljerad dokumentation.

