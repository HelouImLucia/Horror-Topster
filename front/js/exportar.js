const ANCHO = 1500
const ALTO = 1250

const FONDO = "#1b242e"
const ROSA = "#f09a9b"
const ROSA_FUERTE = "#c4465f"
const CLARO = "#f4ece6"

const TONOS = ["#3d1322", "#5b1a2c", "#1f3443", "#4a2a1c"]

function partirEnLineas(ctx, texto, anchoMaximo) {
    const palabras = texto.split(" ")
    const lineas = []
    let linea = ""

    palabras.forEach((palabra) => {
        const prueba = linea === "" ? palabra : linea + " " + palabra
        if (ctx.measureText(prueba).width > anchoMaximo && linea !== "") {
            lineas.push(linea)
            linea = palabra
        } else {
            linea = prueba
        }
    })
    lineas.push(linea)
    return lineas
}

function dibujarPoster(ctx, pelicula, x, y, ancho, alto) {
    const degrade = ctx.createLinearGradient(0, y, 0, y + alto)
    degrade.addColorStop(0, "#0d1218")
    degrade.addColorStop(0.35, "#0d1218")
    degrade.addColorStop(1, TONOS[pelicula.anio % 4])
    ctx.fillStyle = degrade
    ctx.fillRect(x, y, ancho, alto)

    ctx.fillStyle = CLARO
    ctx.textAlign = "left"
    ctx.font = '16px "Space Mono"'
    ctx.fillText(String(pelicula.anio), x + 18, y + 34)

    ctx.textAlign = "center"
    ctx.font = '26px "Young Serif"'
    const lineas = partirEnLineas(ctx, pelicula.nombre.toUpperCase(), ancho - 30)
    const altoLinea = 28
    let renglonY = y + alto - 22 - (lineas.length - 1) * altoLinea
    lineas.forEach((linea) => {
        ctx.fillText(linea, x + ancho / 2, renglonY)
        renglonY = renglonY + altoLinea
    })
}

function cargarImagen(ruta) {
    return new Promise((terminar) => {
        const img = new Image()
        img.addEventListener("load", () => {
            terminar(img)
        })
        img.addEventListener("error", () => {
            terminar(null)
        })
        img.src = ruta
    })
}

function dibujarImagen(ctx, img, x, y, ancho, alto) {
    ctx.fillStyle = "#0f1419"
    ctx.fillRect(x, y, ancho, alto)

    const escala = Math.min(ancho / img.width, alto / img.height)
    const anchoImg = img.width * escala
    const altoImg = img.height * escala
    const imgX = x + (ancho - anchoImg) / 2
    const imgY = y + (alto - altoImg) / 2
    ctx.drawImage(img, imgX, imgY, anchoImg, altoImg)
}

export async function exportarTopPNG(peliculas) {
    await document.fonts.load('76px "Young Serif"')
    await document.fonts.load('800 76px "Archivo"')
    await document.fonts.load('16px "Space Mono"')
    await document.fonts.load('bold 26px "Space Mono"')

    const canvas = document.createElement("canvas")
    canvas.width = ANCHO
    canvas.height = ALTO
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = FONDO
    ctx.fillRect(0, 0, ANCHO, ALTO)

    ctx.textAlign = "left"
    ctx.font = '76px "Young Serif"'
    const parte1 = "Mi Top "
    const anchoParte1 = ctx.measureText(parte1).width
    ctx.font = '800 76px "Archivo"'
    ctx.fontStretch = "expanded"
    const parte2 = "10 Del Terror"
    const anchoParte2 = ctx.measureText(parte2).width

    const inicioTitulo = (ANCHO - anchoParte1 - anchoParte2) / 2
    ctx.font = '76px "Young Serif"'
    ctx.fontStretch = "normal"
    ctx.fillStyle = ROSA
    ctx.fillText(parte1, inicioTitulo, 140)
    ctx.font = '800 76px "Archivo"'
    ctx.fontStretch = "expanded"
    ctx.fillStyle = ROSA_FUERTE
    ctx.fillText(parte2, inicioTitulo + anchoParte1, 140)
    ctx.fontStretch = "normal"

    const margen = 90
    const espacio = 40
    const anchoPoster = (ANCHO - margen * 2 - espacio * 4) / 5
    const altoPoster = anchoPoster * 1.5

    for (let i = 0; i < peliculas.length; i++) {
        const pelicula = peliculas[i]
        const columna = i % 5
        const fila = Math.floor(i / 5)
        const x = margen + columna * (anchoPoster + espacio)
        const y = 250 + fila * (altoPoster + 120)

        const numero = i + 1 < 10 ? "0" + (i + 1) : String(i + 1)
        ctx.fillStyle = ROSA_FUERTE
        ctx.textAlign = "left"
        ctx.font = 'bold 26px "Space Mono"'
        ctx.fillText(numero + ".", x, y - 14)

        let img = null
        if (pelicula.imagen) {
            img = await cargarImagen(pelicula.imagen)
        }
        if (img) {
            dibujarImagen(ctx, img, x, y, anchoPoster, altoPoster)
        } else {
            dibujarPoster(ctx, pelicula, x, y, anchoPoster, altoPoster)
        }

        ctx.strokeStyle = ROSA_FUERTE
        ctx.lineWidth = 3
        ctx.strokeRect(x, y, anchoPoster, altoPoster)
    }

    ctx.textAlign = "center"
    ctx.fillStyle = ROSA
    ctx.font = '28px "Young Serif"'
    ctx.fillText("Horror Topster", ANCHO / 2, ALTO - 40)

    const enlace = document.createElement("a")
    enlace.href = canvas.toDataURL("image/png")
    enlace.download = "mi-top-10-del-terror.png"
    enlace.click()
}
