import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
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

        const metadata = await sharp(plantillaBuffer).metadata();
        const width = metadata.width;
        const height = metadata.height;

        console.log(`📐 Dimensiones: ${width}x${height}`);

        const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <style>
            text {
              font-family: Arial, Helvetica, sans-serif;
              fill: #000000;
            }
          </style>
          
          <text x="325" y="68" font-size="22" font-weight="bold">${nombres.toUpperCase()}</text>
          <text x="670" y="68" font-size="22" font-weight="bold">${nuip}</text>
          <text x="325" y="142" font-size="22" font-weight="bold">${apellidos.toUpperCase()}</text>
          
          <text x="325" y="216" font-size="20">${nacionalidad}</text>
          <text x="540" y="216" font-size="20">${estatura}</text>
          <text x="667" y="216" font-size="20">${sexo}</text>
          
          <text x="325" y="278" font-size="20">${fecha_nacimiento}</text>
          <text x="542" y="278" font-size="20">${grupo_sanguineo}</text>
          
          <text x="325" y="340" font-size="20">${lugar_nacimiento}</text>
          <text x="325" y="402" font-size="20">${fecha_expiracion}</text>
        </svg>
        `;

        const resvg = new Resvg(svg, {
            fitTo: {
                mode: 'width',
                value: width
            }
        });

        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        console.log('✅ SVG renderizado a PNG');

        let composites = [];

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

                composites.push({
                    input: fotoProcessed,
                    top: 40,
                    left: 47
                });

                console.log('✅ Foto agregada');
            } catch (error) {
                console.error('⚠️ Error con foto:', error.message);
            }
        }

        composites.push({
            input: pngBuffer,
            top: 0,
            left: 0
        });

        const resultado = await sharp(plantillaBuffer)
            .composite(composites)
            .png()
            .toBuffer();

        console.log('✅ Imagen final generada');

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(resultado);

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            error: 'Error al generar imagen',
            detalles: error.message
        });
    }
}
