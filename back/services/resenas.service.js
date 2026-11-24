import { buscarPorPelicula, buscarPorUsuario, buscarPorId, guardar, actualizar, eliminar} from "../repositories/resenas.repository.js"
import { obtenerPelicula } from "./peliculas.service.js"
import { errorCon } from "./errores.js"

function validar(datos) {
    const texto = datos.texto ? datos.texto.trim() : ""
    const puntaje = Number(datos.puntaje)

    if (texto === "") {
        throw errorCon(400, "La reseña no puede estar vacía")
    }
    if (texto.length > 500) {
        throw errorCon(400, "La reseña puede tener hasta 500 caracteres")
    }
    if (isNaN(puntaje) || puntaje < 1 || puntaje > 5) {
        throw errorCon(400, "El puntaje tiene que ser un número del 1 al 5")
    }
    return { texto: texto, puntaje: puntaje }
}

const TIEMPO_PARA_EDITAR = 2 * 60 * 60 * 1000

function chequearQueSeaEditable(resena) {
    const pasado = Date.now() - new Date(resena.fechaDeCreacion).getTime()
    if (pasado > TIEMPO_PARA_EDITAR) {
        throw errorCon(403, "Pasaron más de 2 horas desde que la publicaste: ya no se puede editar")
    }
}

function chequearQueSeaTuya(resena, usuarioId) {
    if (!resena.usuario || resena.usuario.toString() !== usuarioId) {
        throw errorCon(403, "Esa reseña no es tuya")
    }
}

export async function listarResenas(peliculaId) {
    if (!peliculaId) {
        throw errorCon(400, "Falta la película: /resenas?pelicula=<id>")
    }
    return await buscarPorPelicula(peliculaId)
}

export async function listarMisResenas(usuarioId) {
    return await buscarPorUsuario(usuarioId)
}

export async function crearResena(datos, usuario) {
    const limpios = validar(datos)
    await obtenerPelicula(datos.pelicula) 


    return await guardar({
        pelicula: datos.pelicula,
        usuario: usuario.id,                
        nombreUsuario: usuario.nombre,
        texto: limpios.texto,
        puntaje: limpios.puntaje
    })
}

export async function editarResena(id, datos, usuarioId) {
    const limpios = validar(datos)

    const resena = await buscarPorId(id)
    if (!resena) {
        throw errorCon(404, "No existe esa reseña")
    }
    chequearQueSeaTuya(resena, usuarioId)
    chequearQueSeaEditable(resena)

    return await actualizar(id, limpios)
}

export async function borrarResena(id, usuarioId) {
    const resena = await buscarPorId(id)
    if (!resena) {
        throw errorCon(404, "No existe esa reseña")
    }
    chequearQueSeaTuya(resena, usuarioId)

    return await eliminar(id)
}
