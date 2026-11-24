import { buscarDelUsuario, buscarRepetida, buscarPorId, guardar, eliminar, cambiarPosicion} from "../repositories/top.repository.js"
import { obtenerPelicula } from "./peliculas.service.js"
import { errorCon } from "./errores.js"

const MAXIMO = 10


function chequearQueSeaTuyo(item, usuarioId) {
    if (item.usuario.toString() !== usuarioId) {
        throw errorCon(403, "Ese puesto no es de tu Top")
    }
}

export async function listarMiTop(usuarioId) {
    return await buscarDelUsuario(usuarioId)
}

export async function agregarAlTop(datos, usuarioId) {

    if (!datos.pelicula) {
        throw errorCon(400, "Falta la película")
    }


    await obtenerPelicula(datos.pelicula)

    const repetida = await buscarRepetida(usuarioId, datos.pelicula)
    if (repetida) {
        throw errorCon(409, "Esa película ya está en tu Top 10")
    }

    const miTop = await buscarDelUsuario(usuarioId)
    if (miTop.length >= MAXIMO) {
        throw errorCon(400, "Tu Top 10 está completo: sacá una película para agregar otra")
    }

    let posicion = 0
    if (miTop.length > 0) {
        posicion = miTop[miTop.length - 1].posicion + 1
    }

    return await guardar({ usuario: usuarioId, pelicula: datos.pelicula, posicion: posicion })
}

export async function ordenarMiTop(orden, usuarioId) {
    const miTop = await buscarDelUsuario(usuarioId)

    if (!orden || orden.length !== miTop.length) {
        throw errorCon(400, "El orden tiene que incluir todos los puestos de tu Top")
    }

    for (const id of orden) {
        const esMio = miTop.find((item) => item._id.toString() === id)
        if (!esMio) {
            throw errorCon(403, "Ese puesto no es de tu Top")
        }
    }

    for (let i = 0; i < orden.length; i++) {
        await cambiarPosicion(orden[i], i)
    }
    return await buscarDelUsuario(usuarioId)
}

export async function quitarDelTop(id, usuarioId) {
    const item = await buscarPorId(id)
    if (!item) {
        throw errorCon(404, "No existe ese puesto en el Top")
    }
    chequearQueSeaTuyo(item, usuarioId)
    return await eliminar(id)
}
