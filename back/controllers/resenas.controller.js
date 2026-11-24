import { listarResenas, listarMisResenas, crearResena, editarResena, borrarResena} from "../services/resenas.service.js"

export async function listar(req, res) {
    try {
        const resenas = await listarResenas(req.query.pelicula)
        res.json(resenas)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}

export async function listarMias(req, res) {
    try {
        const resenas = await listarMisResenas(req.usuario.id)
        res.json(resenas)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}

export async function crear(req, res) {
    try {
        const nueva = await crearResena(req.body, req.usuario)
        res.status(201).json(nueva)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}

export async function editar(req, res) {
    try {
        const actualizada = await editarResena(req.params.id, req.body, req.usuario.id)
        res.json(actualizada)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}

export async function borrar(req, res) {
    try {
        await borrarResena(req.params.id, req.usuario.id)
        res.json({ mensaje: "Reseña borrada" })
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}
