import { listarMiTop, agregarAlTop, quitarDelTop, ordenarMiTop } from "../services/top.service.js"


export async function listar(req, res) {
    try {
        const miTop = await listarMiTop(req.usuario.id)
        res.json(miTop)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}

export async function agregar(req, res) {
    try {
        const nuevo = await agregarAlTop(req.body, req.usuario.id)
        res.status(201).json(nuevo)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}

export async function ordenar(req, res) {
    try {
        const miTop = await ordenarMiTop(req.body.orden, req.usuario.id)
        res.json(miTop)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}

export async function quitar(req, res) {
    try {
        await quitarDelTop(req.params.id, req.usuario.id)
        res.json({ mensaje: "La película fue eliminada de tu Top 10" })
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}
