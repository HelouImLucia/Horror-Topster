import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { buscarPorEmail, buscarPorId, guardar } from "../repositories/usuarios.repository.js"
import { errorCon } from "./errores.js"

function tieneLetraYNumero(texto) {
    let hayLetra = false
    let hayNumero = false

    for (const caracter of texto) {
        if ("0123456789".includes(caracter)) {
            hayNumero = true
        } else if ("abcdefghijklmnñopqrstuvwxyz".includes(caracter.toLowerCase())) {
            hayLetra = true
        }
    }

    return hayLetra && hayNumero
}
function validar(datos) {
    const nombre = datos.nombre ? datos.nombre.trim() : ""
    const email = datos.email ? datos.email.trim().toLowerCase() : ""
    const password = datos.password ? String(datos.password) : ""

    if (nombre === "" || email === "" || password === "") {
        throw errorCon(400, "Faltan datos: nombre, email y contraseña")
    }

    if (!email.includes("@gmail.com") && !email.includes("@hotmail.com") && !email.includes("@adinet.com") && !email.includes("@test.com")) {
        throw errorCon(400, "El email no es válido")
    }

    if (password.length < 8 || !tieneLetraYNumero(password)) {
        throw errorCon(400, "La contraseña necesita al menos 8 caracteres, una letra y un número")
    }

    return { nombre: nombre, email: email, password: password }
}

async function chequearEmailLibre(email) {
    const existente = await buscarPorEmail(email)
    if (existente) {
        throw errorCon(409, "Ya existe una cuenta con el email " + email)
    }
}

function sinPassword(usuario) {
    return {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        fechaDeCreacion: usuario.fechaDeCreacion
    }
}

export async function registrarUsuario(datos) {
    const limpios = validar(datos)                    
    await chequearEmailLibre(limpios.email)       

    const hash = await bcrypt.hash(limpios.password, 10)
    const guardado = await guardar({                  
        nombre: limpios.nombre,
        email: limpios.email,
        password: hash                               
    })
    return sinPassword(guardado)
}

export async function loginUsuario(datos) {
    const email = datos.email ? datos.email.trim().toLowerCase() : ""
    const password = datos.password || ""

    if (email === "" || password === "") {
        throw errorCon(400, "Faltan datos: email y contraseña")
    }

    const usuario = await buscarPorEmail(email)
    if (!usuario) {
        throw errorCon(401, "Email o contraseña incorrectos")
    }

    const coincide = await bcrypt.compare(password, usuario.password)
    if (!coincide) {
        throw errorCon(401, "Email o contraseña incorrectos")
    }

    const token = jwt.sign(
        { id: usuario._id, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    )
    return { token: token, usuario: sinPassword(usuario) }
}

export async function obtenerUsuario(id) {
    const usuario = await buscarPorId(id)
    if (!usuario) {
        throw errorCon(404, "No existe un usuario con id " + id)
    }
    return sinPassword(usuario)
}
