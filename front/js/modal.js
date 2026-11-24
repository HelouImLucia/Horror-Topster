import { borrarSesion } from "./api.js"

const modal = document.querySelector("#modal")
const modalTitulo = document.querySelector("#modalTitulo")
const modalTexto = document.querySelector("#modalTexto")
const modalAceptar = document.querySelector("#modalAceptar")
const modalCancelar = document.querySelector("#modalCancelar")
const modalCerrar = document.querySelector("#modalCerrar")


let accionAlAceptar = null

export function abrirModal(opciones) {
    modalTitulo.textContent = opciones.titulo
    modalTexto.textContent = opciones.texto
    modalAceptar.textContent = opciones.textoAceptar || "Aceptar"

    if (opciones.textoCancelar) {
        modalCancelar.textContent = opciones.textoCancelar
        modalCancelar.style.display = ""
    } else {
        modalCancelar.style.display = "none"
    }

    accionAlAceptar = opciones.alAceptar || null
    modal.classList.add("abierto")
    document.body.classList.add("sin-scroll")
    modalAceptar.focus()
}

export function cerrarModal() {
    modal.classList.remove("abierto")
    document.body.classList.remove("sin-scroll")
}

modalAceptar.addEventListener("click", () => {
    cerrarModal()
    if (accionAlAceptar) {
        accionAlAceptar()
    }
})

modalCancelar.addEventListener("click", cerrarModal)
modalCerrar.addEventListener("click", cerrarModal)

modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
        cerrarModal()
    }
})


export function activarCerrarSesion() {
    const btnCerrarSesion = document.querySelector("#btnCerrarSesion")

    btnCerrarSesion.addEventListener("click", () => {
        abrirModal({
            titulo: "¿Cerrar sesión?",
            texto: "¿Segur@ que querés salir de Horror Topster? Podés volver cuando quieras.",
            textoCancelar: "Cancelar",
            textoAceptar: "Cerrar sesión",
            alAceptar: () => {
                borrarSesion()
                window.location.href = "login.html"
            }
        })
    })
}
