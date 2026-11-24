import jwt from "jsonwebtoken"


export function pedirToken(req, res, next) {
    const cabecera = req.headers.authorization
    const token = cabecera && cabecera.split(" ")[1]

    if (!token) {
        return res.status(401).json({ mensaje: "No mandaste el token" })
    }

    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = datos
        next()
    } catch (error) {
        res.status(401).json({ mensaje: "Tu sesión venció o no es válida" })
    }
}
