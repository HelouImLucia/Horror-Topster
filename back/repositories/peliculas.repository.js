import mongoose from "mongoose"
import { Pelicula } from "../models/pelicula.js"

function idValido(id) {
    return mongoose.isValidObjectId(id)
}

export async function buscarTodas() {
    return await Pelicula.find()
}

export async function buscarPorId(id) {
    if (!idValido(id)) {
        return null
    }
    return await Pelicula.findById(id)
}
