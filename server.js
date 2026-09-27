import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';

const app = express();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 15 * 1024 * 1024 }
});

// index.html en overige bestanden serveren
app.use(express.static('.'));

// Eenvoudige healthcheck
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/cartoonize', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Geen foto ontvangen.' });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
EDIT IMAGE 1.

You are given TWO images with completely different roles.

IMAGE 1 = SOURCE PHOTO
This is the photograph that must be transformed.

IMAGE 2 = RANKING THE FRIENDS STYLE REFERENCE
This image defines the visual house style ONLY.

IMPORTANT:
The final picture must depict IMAGE 1, not IMAGE 2.

Use IMAGE 1 for:
- every person's identity
- exact number of people
- facial identity and recognizable features
- hairstyle and hair color
- facial hair
- skin tone
- clothing
- accessories
- facial expression
- pose and body position
- interaction between people
- camera angle
- framing and crop
- location and background
- objects that actually occur in the source photo

Use IMAGE 2 ONLY to learn the established
"Ranking the Friends" visual language.

STYLE MATCH TO IMAGE 2:
Translate the people from IMAGE 1 into the same premium
3D animated character universe visible in IMAGE 2.

Match especially:
- large, warm, expressive animated eyes
- charming stylized facial proportions
- slightly enlarged eyes while retaining identity
- rounded, friendly facial geometry
- smooth stylized CGI skin
- clean, soft facial shading
- simplified but recognizable noses and mouths
- expressive eyebrows
- polished stylized hair
- polished stylized facial hair
- warm and appealing character expressions
- premium animated-feature-film 3D rendering
- rich saturated colors
- warm orange highlights
- pink, purple and blue accent lighting where appropriate
- soft cinematic glow
- subtle depth of field
- glossy but tasteful CGI materials
- the cheerful, polished Ranking the Friends character aesthetic

The degree of CARTOON STYLIZATION should closely match IMAGE 2.

Do NOT merely apply a subtle cartoon filter to IMAGE 1.
The people should clearly look like fully rendered
Ranking the Friends 3D animated characters.

However, every person must remain immediately recognizable
as the person from IMAGE 1.

CRITICAL CONTENT RULES:
Do NOT copy any person from IMAGE 2.
Do NOT copy the beach from IMAGE 2.
Do NOT copy the sunset from IMAGE 2.
Do NOT copy the wooden signs from IMAGE 2.
Do NOT copy drinks from IMAGE 2 unless they already exist in IMAGE 1.
Do NOT copy the Ranking the Friends title or any text from IMAGE 2.
Do NOT add party decorations unless present in IMAGE 1.
Do NOT add or remove people.
Do NOT invent additional objects.
Do NOT change people's clothing.
Do NOT change the location.
Do NOT make people younger or older.

The background and event must remain recognizably the same
real moment shown in IMAGE 1.

Only translate its VISUAL RENDERING into the house style
demonstrated by IMAGE 2.

Avoid:
- photorealistic digital painting
- photographic skin texture
- generic Instagram cartoon filters
- anime
- flat illustration
- comic-book styling
- caricature
- plastic doll appearance

FINAL GOAL:
Someone who knows the people should immediately recognize
the original photograph and every person in it, while also
immediately recognizing the finished image as belonging to
the exact same visual universe as the Ranking the Friends
characters in IMAGE 2.
`;

    // IMAGE 1: foto van de gebruiker
    const sourcePhoto = await OpenAI.toFile(
      fs.createReadStream(req.file.path),
      req.file.originalname,
      { type: req.file.mimetype }
    );

    // IMAGE 2: vaste Ranking the Friends huisstijlreferentie
    const styleReference = await OpenAI.toFile(
      fs.createReadStream('ranking-friends-style.png'),
      'ranking-friends-style.png',
      { type: 'image/png' }
    );

    const result = await client.images.edit({
      model: 'gpt-image-2',

      // Volgorde is belangrijk:
      // 1 = bronfoto
      // 2 = alleen stijlreferentie
      image: [
        sourcePhoto,
        styleReference
      ],

      prompt,
      size: 'auto',
      quality: 'medium',
      output_format: 'png'
    });

    const b64 = result.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error('Geen afbeelding teruggekregen.');
    }

    res.json({
      image: `data:image/png;base64,${b64}`
    });

  } catch (err) {
    console.error('Cartoonize error:', err);

    res.status(500).json({
      error: err?.message || 'Genereren mislukt.'
    });

  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Ranking the Friends Foto Maker draait op poort ${port}`);
});
