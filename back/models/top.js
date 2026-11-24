import mongoose from "mongoose"

const topSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    pelicula: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pelicula",
        required: true
    },
    posicion: { type: Number, default: 0 },
    fechaDeCreacion: { type: Date, default: Date.now }
})

export const Top = mongoose.model("Top", topSchema)
