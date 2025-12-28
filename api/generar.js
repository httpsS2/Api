import { createCanvas, loadImage } from '@napi-rs/canvas';
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
            nombres = 'TEST',
            apellidos = 'PRUEBA',
            nuip = '000',
            nacionalidad = 'TEST',
            estatura = '0',
            sexo = 'M',
            fecha_nacimiento = '00/00/0000',
            grupo_sanguineo = 'O+',
            lugar_nacimiento = 'TEST',
            fecha_expiracion = '00/00/0000',
            foto_url = null
        } = req.query;

        console.log('📊 Parámetros recibidos:', { nombres, apellidos, nuip });

        const plantillaPath = join(__dirname, '..', 'plantillas', 'base.png');
        console.log('📂 Ruta plantilla:', plantillaPath);
        
        let plantilla;
        try {
            plantilla = await loadImage(plantillaPath);
            console.log('✅ Plantilla cargada:', plantilla.width, 'x', plantilla.height);
        } catch (err) {
            console.error('❌ Error cargando plantilla:', err);
            return res.status(500).json({ 
                error: 'No se pudo cargar la plantilla',
                ruta: plantillaPath,
                detalles: err.message 
            });
        }
        
        const canvas = createCanvas(plantilla.width, plantilla.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(plantilla, 0, 0);
        console.log('✅ Plantilla dibujada');

        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(300, 50, 400, 400);
        console.log('✅ Rectángulo rojo agregado');

        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'left';

        ctx.font = 'bold 40px Arial';
        ctx.fillText(`NOMBRES: ${nombres.toUpperCase()}`, 325, 100);
        console.log('✅ Nombre dibujado:', nombres);
        
        ctx.fillText(`NUIP: ${nuip}`, 670, 100);
        ctx.fillText(`APELLIDOS: ${apellidos.toUpperCase()}`, 325, 180);
        
        ctx.font = 'bold 30px Arial';
        ctx.fillText(`NACION: ${nacionalidad}`, 325, 260);
        ctx.fillText(`EST: ${estatura}`, 540, 260);
        ctx.fillText(`SEXO: ${sexo}`, 667, 260);
        ctx.fillText(`F.NAC: ${fecha_nacimiento}`, 325, 330);
        ctx.fillText(`G.S: ${grupo_sanguineo}`, 542, 330);
        ctx.fillText(`LUGAR: ${lugar_nacimiento}`, 325, 400);
        ctx.fillText(`EXPIRA: ${fecha_expiracion}`, 325, 470);

        console.log('✅ Todos los textos dibujados');
        
        if (foto_url) {
            try {
                const foto = await loadImage(foto_url);
                ctx.drawImage(foto, 47, 40, 222, 247);
                console.log('✅ Foto agregada');
            } catch (error) {
                console.error('⚠️ Error con foto:', error.message);
            }
        }

        const buffer = canvas.toBuffer('image/png');
        console.log('✅ Buffer creado, tamaño:', buffer.length, 'bytes');
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(buffer);
        
        console.log('✅ Imagen enviada correctamente');

    } catch (error) {
        console.error('❌ Error general:', error);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Error al generar imagen',
            detalles: error.message,
            stack: error.stack
        });
    }
}
