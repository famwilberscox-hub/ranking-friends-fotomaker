import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 15 * 1024 * 1024 } });
app.use(express.static('.'));

app.post('/api/cartoonize', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Geen foto ontvangen.' });
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Transformeer deze foto naar de vaste Ranking the Friends-look: een rijke, kleurrijke, cinematic 3D-cartoon/CGI illustratie met warme oranje-roze-paars-blauwe partybelichting, zachte glossy huid- en materiaalrendering, expressieve maar herkenbare gezichten, levendige ogen, subtiele filmische depth of field en een premium animatiefilm/poster-uitstraling. Behoud exact het aantal personen, hun identiteit, kapsels, huidskleur, kleding, pose, onderlinge positie, gezichtsuitdrukking, accessoires en de belangrijkste elementen van de originele locatie. Maak niemand jonger of ouder. Voeg geen extra personen, tekst, logo's of objecten toe. De foto moet duidelijk dezelfde gebeurtenis blijven, alleen volledig gerenderd in de Ranking the Friends cartoonstijl. Houd de compositie en uitsnede zo dicht mogelijk bij het origineel.`;

    const result = await client.images.edit({
      model: 'gpt-image-2',
      image: await OpenAI.toFile(
  fs.createReadStream(req.file.path),
  req.file.originalname,
  { type: req.file.mimetype }
),
      prompt,
      size: 'auto',
      quality: 'high',
      output_format: 'png'
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error('Geen afbeelding teruggekregen.');
    res.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Genereren mislukt.' });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Ranking the Friends Foto Maker: http://localhost:${port}`));
