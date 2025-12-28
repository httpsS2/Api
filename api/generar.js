import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function escapeXml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

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

        const nombresSafe = escapeXml(nombres.toUpperCase());
        const apellidosSafe = escapeXml(apellidos.toUpperCase());
        const nuipSafe = escapeXml(nuip);
        const nacionalidadSafe = escapeXml(nacionalidad);
        const estaturaSafe = escapeXml(estatura);
        const sexoSafe = escapeXml(sexo);
        const fechaNacSafe = escapeXml(fecha_nacimiento);
        const grupoSangSafe = escapeXml(grupo_sanguineo);
        const lugarNacSafe = escapeXml(lugar_nacimiento);
        const fechaExpSafe = escapeXml(fecha_expiracion);

        const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style type="text/css">
              @import url('https://fonts.googleapis.com/css2?family=Arial:wght@400;700&amp;display=swap');
            </style>
          </defs>
          
          <!-- NOMBRES -->
          <text x="325" y="68" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#000000">${nombresSafe}</text>
          
          <!-- NUIP -->
          <text x="670" y="68" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#000000">${nuipSafe}</text>
          
          <!-- APELLIDOS -->
          <text x="325" y="142" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#000000">${apellidosSafe}</text>
          
          <!-- NACIONALIDAD -->
          <text x="325" y="216" font-family="Arial, sans-serif" font-size="20" fill="#000000">${nacionalidadSafe}</text>
          
          <!-- ESTATURA -->
          <text x="540" y="216" font-family="Arial, sans-serif" font-size="20" fill="#000000">${estaturaSafe}</text>
          
          <!-- SEXO -->
          <text x="667" y="216" font-family="Arial, sans-serif" font-size="20" fill="#000000">${sexoSafe}</text>
          
          <!-- FECHA NACIMIENTO -->
          <text x="325" y="278" font-family="Arial, sans-serif" font-size="20" fill="#000000">${fechaNacSafe}</text>
          
          <!-- GRUPO SANGUÍNEO -->
          <text x="542" y="278" font-family="Arial, sans-serif" font-size="20" fill="#000000">${grupoSangSafe}</text>
          
          <!-- LUGAR NACIMIENTO -->
          <text x="325" y="340" font-family="Arial, sans-serif" font-size="20" fill="#000000">${lugarNacSafe}</text>
          
          <!-- FECHA EXPIRACIÓN -->
          <text x="325" y="402" font-family="Arial, sans-serif" font-size="20" fill="#000000">${fechaExpSafe}</text>
        </svg>
        `;

        const svgBuffer = Buffer.from(svg, 'utf-8');

        let composites = [];
        
        if (foto_url) {
            try {
                const fotoResponse = await fetch(foto_url);
                const fotoArrayBuffer = await fotoResponse.arrayBuffer();
                const fotoBuffer = Buffer.from(fotoArrayBuffer);

                // Redimensionar foto
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
            input: svgBuffer,
            top: 0,
            left: 0
        });

        const resultado = await sharp(plantillaBuffer)
            .composite(composites)
            .png()
            .toBuffer();

        console.log('✅ Imagen generada');

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
