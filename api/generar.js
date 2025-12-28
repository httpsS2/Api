import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Método no permitido' });
        }

        const {
            nombres = '',
            apellidos = '',
            nuip = '',
            nacionalidad = '',
            estatura = '',
            sexo = '',
            fecha_nacimiento = '',
            grupo_sanguineo = '',
            lugar_nacimiento = '',
            fecha_expiracion = '',
            foto_url = null
        } = req.query;

        if (!nombres || !apellidos) {
            return res.status(400).json({ 
                error: 'Los parámetros "nombres" y "apellidos" son obligatorios'
            });
        }

        const plantillaPath = join(__dirname, '..', 'plantillas', 'base.png');
        const plantillaBuffer = readFileSync(plantillaPath);

        const svg = `
        <svg width="800" height="600">
          <!-- TEXTOS -->
          <text x="325" y="68" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#000000">${nombres.toUpperCase()}</text>
          <text x="670" y="68" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#000000">${nuip}</text>
          <text x="325" y="142" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#000000">${apellidos.toUpperCase()}</text>
          
          <text x="325" y="216" font-family="Arial, sans-serif" font-size="20" fill="#000000">${nacionalidad}</text>
          <text x="540" y="216" font-family="Arial, sans-serif" font-size="20" fill="#000000">${estatura}</text>
          <text x="667" y="216" font-family="Arial, sans-serif" font-size="20" fill="#000000">${sexo}</text>
          
          <text x="325" y="278" font-family="Arial, sans-serif" font-size="20" fill="#000000">${fecha_nacimiento}</text>
          <text x="542" y="278" font-family="Arial, sans-serif" font-size="20" fill="#000000">${grupo_sanguineo}</text>
          
          <text x="325" y="340" font-family="Arial, sans-serif" font-size="20" fill="#000000">${lugar_nacimiento}</text>
          <text x="325" y="402" font-family="Arial, sans-serif" font-size="20" fill="#000000">${fecha_expiracion}</text>
        </svg>
        `;

        const svgBuffer = Buffer.from(svg);

        let composites = [
            {
                input: svgBuffer,
                top: 0,
                left: 0
            }
        ];

        if (foto_url) {
            try {
                const fotoResponse = await fetch(foto_url);
                const fotoArrayBuffer = await fotoResponse.arrayBuffer();
                const fotoBuffer = Buffer.from(fotoArrayBuffer);

                const fotoProcessed = await sharp(fotoBuffer)
                    .resize(222, 247, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .toBuffer();

                composites.unshift({
                    input: fotoProcessed,
                    top: 40,
                    left: 47
                });
            } catch (error) {
                console.error('Error procesando foto:', error);
            }
        }

        const resultado = await sharp(plantillaBuffer)
            .composite(composites)
            .png()
            .toBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(resultado);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Error al generar imagen',
            detalles: error.message
        });
    }
}
