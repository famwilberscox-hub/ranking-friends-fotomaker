# Ranking the Friends – Foto Maker

Mobielvriendelijke webapp die weekendfoto's via de OpenAI Image API omzet naar de vaste Ranking the Friends 3D-cartoonlook.

## Starten
1. Installeer Node.js 20+.
2. Open deze map in Terminal.
3. `npm install`
4. Maak een OpenAI API-key en zet die **alleen op de server** als omgevingsvariabele:
   - macOS/Linux: `export OPENAI_API_KEY="..."`
   - PowerShell: `$env:OPENAI_API_KEY="..."`
5. `npm start`
6. Open `http://localhost:3000`.

## Online zetten
De app kan als gewone Node/Express-app worden gedeployed (bijv. Render, Railway, Fly.io of een eigen server). Stel daar `OPENAI_API_KEY` in als secret/environment variable. Zet de API-key nooit in `public/` of in browser-JavaScript.

## Belangrijk
- De gegenereerde output is AI-rendering; gelijkenis is doorgaans goed maar niet pixel-identiek.
- Uploads worden lokaal tijdelijk opgeslagen en na de API-call verwijderd door deze app.
- Voor een publiek gedeelde versie zijn authenticatie/rate limiting verstandig om onverwachte API-kosten te voorkomen.
