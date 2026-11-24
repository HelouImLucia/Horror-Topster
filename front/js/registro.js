import { registrarUsuario, iniciarSesion, guardarSesion, leerToken } from "./api.js"
import { activarBotonesOjo, activarFotosAcceso } from "./comunes.js"

if (leerToken()) {
    window.location.href = "index.html"
}


const formRegistro = document.querySelector("#formRegistro")
const inpNombre = document.querySelector("#nombre")
const inpEmail = document.querySelector("#email")
const inpPassword = document.querySelector("#password")
const inpConfirmar = document.querySelector("#confirmar")
const chkTerminos = document.querySelector("#terminos")
const btnCrear = document.querySelector("#btnCrear")
const spanTextoCrear = document.querySelector("#textoCrear")
const pMensaje = document.querySelector("#mensaje")
const pMensajeEmail = document.querySelector("#email-mensaje")

activarBotonesOjo()
activarFotosAcceso()


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


function avisar(texto, input) {
    pMensaje.textContent = texto
    if (input) {
        input.focus()
    }
}

formRegistro.addEventListener("submit", async (evento) => {
    evento.preventDefault()
    pMensajeEmail.textContent = ""

    const nombre = inpNombre.value.trim()
    const email = inpEmail.value.trim()
    const password = inpPassword.value
    const confirmar = inpConfirmar.value


    if (nombre === "") {
        avisar("Elegí un nombre de usuario.", inpNombre)
        return
    }
    if (!email.includes("@") || !email.includes(".")) {
        avisar("Ese correo no parece válido.", inpEmail)
        return
    }
    if (password.length < 8 || !tieneLetraYNumero(password)) {
        avisar("La contraseña necesita al menos 8 caracteres, una letra y un número.", inpPassword)
        return
    }
    if (password !== confirmar) {
        avisar("Las contraseñas no coinciden.", inpConfirmar)
        return
    }
    if (!chkTerminos.checked) {
        avisar("Para crear tu cuenta tenés que aceptar los términos.", chkTerminos)
        return
    }

    pMensaje.textContent = ""
    btnCrear.disabled = true
    spanTextoCrear.textContent = "Creando tu cuenta..."

    try {

        await registrarUsuario(nombre, email, password)

        const datos = await iniciarSesion(email, password)
        guardarSesion(datos.token, datos.usuario, true)
        window.location.href = "index.html"
    } catch (error) {
        if (error.message === "El email no es válido") {
            pMensajeEmail.textContent = error.message
            inpEmail.focus()
        } else {
            avisar(error.message)
        }
        btnCrear.disabled = false
        spanTextoCrear.textContent = "Crear cuenta"
    }
})
