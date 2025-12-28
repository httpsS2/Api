# 🎨 API Generador de Documentos

API para generar documentos de identidad personalizados con Node.js y Canvas.

## 🚀 Uso
```bash
GET /api/generar?nombres=JUAN&apellidos=PEREZ&nuip=123456...
```

## 📋 Parámetros requeridos

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `nombres` | Nombres | Juan Carlos |
| `apellidos` | Apellidos | Perez Lopez |
| `nuip` | Número de identificación | 1234567890 |
| `nacionalidad` | Nacionalidad | Colombiana |
| `estatura` | Estatura en cm | 175 |
| `sexo` | Sexo (M/F) | M |
| `fecha_nacimiento` | DD/MM/AAAA | 15/03/1990 |
| `grupo_sanguineo` | Tipo de sangre | O+ |
| `lugar_nacimiento` | Ciudad | Bogotá |
| `fecha_expiracion` | DD/MM/AAAA | 15/03/2035 |
| `foto_url` | URL de foto (opcional) | https://... |

## 🛠️ Instalación local
```bash
npm install
npx vercel dev
```

## 🌐 Ejemplo de uso
```
https://tu-api.vercel.app/api/generar?nombres=JUAN%20CARLOS&apellidos=PEREZ%20LOPEZ&nuip=1234567890&nacionalidad=COLOMBIANA&estatura=175&sexo=M&fecha_nacimiento=15/03/1990&grupo_sanguineo=O%2B&lugar_nacimiento=BOGOTA&fecha_expiracion=15/03/2035&foto_url=https://i.pravatar.cc/300
```

## 📦 Tecnologías

- Node.js 18.x
- Canvas (node-canvas)
- Vercel Serverless Functions

## 📄 Licencia

MIT