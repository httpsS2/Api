import { createCanvas, loadImage } from 'canvas';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ 
                error: 'Método no permitido. Usa GET' 
            });
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
                ejemplo: '/api/generar?nombres=Juan&apellidos=Perez&nuip=12345678&nacionalidad=Colombiana&estatura=175&sexo=M&fecha_nacimiento=01/01/1990&grupo_sanguineo=O+&lugar_nacimiento=Bogota&fecha_expiracion=01/01/2030&foto_url=https://i.pravatar.cc/150'
            });
        }

        const plantilla = await loadImage('./plantillas/base.png');
        const canvas = createCanvas(plantilla.width, plantilla.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(plantilla, 0, 0);
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';

        const fotoX = 47;
        const fotoY = 40;
        const fotoWidth = 222;
        const fotoHeight = 247;

        if (foto_url) {
            try {
                const foto = await loadImage(foto_url);
                
                let drawWidth = fotoWidth;
                let drawHeight = fotoHeight;
                let offsetX = 0;
                let offsetY = 0;

                const imgRatio = foto.width / foto.height;
                const boxRatio = fotoWidth / fotoHeight;

                if (imgRatio > boxRatio) {
                    drawWidth = fotoHeight * imgRatio;
                    offsetX = (drawWidth - fotoWidth) / 2;
                } else {
                    drawHeight = fotoWidth / imgRatio;
                    offsetY = (drawHeight - fotoHeight) / 2;
                }

                ctx.save();
                ctx.beginPath();
                ctx.rect(fotoX, fotoY, fotoWidth, fotoHeight);
                ctx.clip();
                ctx.drawImage(foto, fotoX - offsetX, fotoY - offsetY, drawWidth, drawHeight);
                ctx.restore();
                
            } catch (error) {
                console.error('Error cargando foto:', error);
            }
        }
        ctx.font = '22px Arial';
        ctx.fillText(nombres.toUpperCase(), 325, 68);
        ctx.fillText(nuip, 670, 68);
        ctx.fillText(apellidos.toUpperCase(), 325, 142);     
        ctx.font = '20px Arial';
        ctx.fillText(nacionalidad, 325, 216);
        ctx.fillText(estatura, 540, 216);
        ctx.fillText(sexo, 667, 216);
        ctx.fillText(fecha_nacimiento, 325, 278);
        ctx.fillText(grupo_sanguineo, 542, 278);
        ctx.fillText(lugar_nacimiento, 325, 340);
        ctx.fillText(fecha_expiracion, 325, 402);
        const buffer = canvas.toBuffer('image/png');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.status(200).send(buffer);

    } catch (error) {
        console.error('Error generando imagen:', error);
        res.status(500).json({ 
            error: 'Error al generar la imagen',
            detalles: error.message
        });
    }
}