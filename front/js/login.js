import { iniciarSesion, guardarSesion, leerToken } from "./api.js"
import { activarBotonesOjo, activarFotosAcceso } from "./comunes.js"

if (leerToken()) {
    window.location.href = "index.html"
}

const formLogin = document.querySelector("#formLogin")
const inpEmail = document.querySelector("#email")
const inpPassword = document.querySelector("#password")
const chkRecordar = document.querySelector("#recordar")
const btnEntrar = document.querySelector("#btnEntrar")
const spanTextoEntrar = document.querySelector("#textoEntrar")
const pMensaje = document.querySelector("#mensaje")

activarBotonesOjo()
activarFotosAcceso()

formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault()

    const email = inpEmail.value.trim()
    const password = inpPassword.value

    if (email === "" || password === "") {
        pMensaje.textContent = "Completá tu correo y tu contraseña."
        return
    }

    pMensaje.textContent = ""
    btnEntrar.disabled = true
    spanTextoEntrar.textContent = "Entrando..."

    try {
        const datos = await iniciarSesion(email, password)
        guardarSesion(datos.token, datos.usuario, chkRecordar.checked)
        window.location.href = "index.html"
    } catch (error) {

        pMensaje.textContent = error.message
        btnEntrar.disabled = false
        spanTextoEntrar.textContent = "Entrar"
    }
})
