import sharp from 'sharp';
import { readFileSync } from 'fs';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Método no permitido' });
        }

        const {
            nombres = '', apellidos = '', nuip = '',
            nacionalidad = '', estatura = '', sexo = '',
            fecha_nacimiento = '', grupo_sanguineo = '',
            lugar_nacimiento = '', fecha_expiracion = '',
            foto_url = null
        } = req.query;

        if (!nombres || !apellidos) {
            return res.status(400).json({ 
                error: 'Los parámetros "nombres" y "apellidos" son obligatorios'
            });
        }

        const plantillaBuffer = readFileSync('./plantillas/base.png');
        const svg = `
        <svg width="800" height="600">
          <!-- Texto -->
          <text x="325" y="68" font-family="Arial" font-size="22" fill="black">${nombres.toUpperCase()}</text>
          <text x="670" y="68" font-family="Arial" font-size="22" fill="black">${nuip}</text>
          <text x="325" y="142" font-family="Arial" font-size="22" fill="black">${apellidos.toUpperCase()}</text>
          <text x="325" y="216" font-family="Arial" font-size="20" fill="black">${nacionalidad}</text>
          <text x="540" y="216" font-family="Arial" font-size="20" fill="black">${estatura}</text>
          <text x="667" y="216" font-family="Arial" font-size="20" fill="black">${sexo}</text>
          <text x="325" y="278" font-family="Arial" font-size="20" fill="black">${fecha_nacimiento}</text>
          <text x="542" y="278" font-family="Arial" font-size="20" fill="black">${grupo_sanguineo}</text>
          <text x="325" y="340" font-family="Arial" font-size="20" fill="black">${lugar_nacimiento}</text>
          <text x="325" y="402" font-family="Arial" font-size="20" fill="black">${fecha_expiracion}</text>
        </svg>
        `;

        let image = sharp(plantillaBuffer);
        image = image.composite([{
            input: Buffer.from(svg),
            top: 0,
            left: 0
        }]);

        if (foto_url) {
            try {
                const fotoResponse = await fetch(foto_url);
                const fotoBuffer = await fotoResponse.arrayBuffer();
                
                const fotoResized = await sharp(Buffer.from(fotoBuffer))
                    .resize(222, 247, { fit: 'cover' })
                    .toBuffer();

                image = image.composite([{
                    input: fotoResized,
                    top: 40,
                    left: 47
                }]);
            } catch (err) {
                console.error('Error con foto:', err);
            }
        }

        const buffer = await image.png().toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(buffer);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Error al generar imagen',
            detalles: error.message
        });
    }
}
