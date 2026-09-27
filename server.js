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
    const prompt = `Transform this exact photograph into the established
"Ranking the Friends" visual house style.

STYLE:
Create a polished, charming, high-end 3D animated feature-film character
illustration. The people must look clearly CARTOONED and STYLIZED, not
photorealistic.

Use the same visual language as the Ranking the Friends characters:
- large, warm, highly expressive animated eyes
- softly exaggerated but attractive facial proportions
- rounded and friendly facial geometry
- smooth stylized skin with subtle soft shading
- simplified but recognizable noses, mouths, eyebrows and jawlines
- beautifully rendered stylized hair and facial hair
- expressive, cheerful animated-character appearance
- premium glossy 3D CGI rendering
- warm cinematic orange, pink, purple and blue lighting
- soft highlights and atmospheric glow
- rich saturated colors
- subtle cinematic depth of field
- polished animated movie poster quality

IDENTITY IS ESSENTIAL:
Every person must remain immediately recognizable as the same individual
from the source photograph. Preserve their distinctive face shape,
hairstyle, hair color, facial hair, skin tone, clothing, accessories and
expression while translating them into the Ranking the Friends character
design.

COMPOSITION:
Preserve exactly the number of people, their poses, positions, clothing,
interaction, camera angle, crop and the important elements of the original
location. The result must clearly depict the same photograph and same
moment.

Do not add or remove people.
Do not add text, logos or unrelated objects.
Do not make people younger or older.
Do not turn the result into a realistic digital painting.
Do not retain photographic skin texture.
Do not produce anime, comic-book, flat illustration or caricature styling.

The final result should look like these real friends were cast as characters
in the same premium 3D animated universe used throughout the
Ranking the Friends visual identity.`;

    const result = await client.images.edit({
      model: 'gpt-image-2',
      image: await OpenAI.toFile(
  fs.createReadStream(req.file.path),
  req.file.originalname,
  { type: req.file.mimetype }
),
      prompt,
      size: 'auto',
      quality: 'medium',
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
