import Jimp from 'jimp';
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
                error: 'Los parámetros "nombres" y "apellidos" son obligatorios',
                ejemplo: '/api/generar?nombres=Juan&apellidos=Perez&nuip=12345678&nacionalidad=Colombiana&estatura=175&sexo=M&fecha_nacimiento=01/01/1990&grupo_sanguineo=O+&lugar_nacimiento=Bogota&fecha_expiracion=01/01/2030'
            });
        }

        console.log('📝 Generando documento para:', nombres, apellidos);

        const plantillaPath = join(__dirname, '..', 'plantillas', 'base.png');
        const imagen = await Jimp.read(plantillaPath);

        console.log('✅ Plantilla cargada:', imagen.bitmap.width, 'x', imagen.bitmap.height);

        const font22 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); 
        const font20 = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK); 

        console.log('✅ Fuentes cargadas');

        if (foto_url) {
            try {
                const foto = await Jimp.read(foto_url);
                
                foto.cover(222, 247);
                
                imagen.composite(foto, 47, 40);
                
                console.log('✅ Foto agregada');
            } catch (error) {
                console.error('⚠️ Error con foto:', error.message);
            }
        }

        imagen.print(font22, 325, 50, nombres.toUpperCase());
        imagen.print(font22, 670, 50, nuip);

        imagen.print(font22, 325, 124, apellidos.toUpperCase());

        imagen.print(font20, 325, 200, nacionalidad);
        imagen.print(font20, 540, 200, estatura);
        imagen.print(font20, 667, 200, sexo);

        imagen.print(font20, 325, 262, fecha_nacimiento);
        imagen.print(font20, 542, 262, grupo_sanguineo);

        imagen.print(font20, 325, 324, lugar_nacimiento);

        imagen.print(font20, 325, 386, fecha_expiracion);

        console.log('✅ Textos agregados');

        const buffer = await imagen.getBufferAsync(Jimp.MIME_PNG);

        console.log('✅ Buffer generado:', buffer.length, 'bytes');

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(buffer);

        console.log('✅ Imagen enviada');

    } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Error al generar imagen',
            detalles: error.message,
            tipo: error.name
        });
    }
}
