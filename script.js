document.addEventListener("DOMContentLoaded", () => {
    // 1. Funcionalidad fade-in con Intersection Observer
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = { 
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // 2. Registro del Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('Service Worker registrado:', reg))
                .catch(err => console.error('Error al registrar el Service Worker:', err));
        });
    }

    // 3. Lógica del Carrito de Compras
    let carrito = [];
    const listaCarritoHtml = document.getElementById('lista-carrito');
    const totalCarritoHtml = document.getElementById('total-carrito');

    const botonesAgregar = document.querySelectorAll('.btn-add');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const section = e.target.closest('section');
            const id = e.target.getAttribute('data-id');
            const nombreBase = e.target.getAttribute('data-name');
            let precioBase = parseFloat(e.target.getAttribute('data-price'));
            
            // Cantidad
            const cantidadInput = section.querySelector('.cant-servicio');
            const cantidad = parseInt(cantidadInput.value) || 1;

            let detallesExtra = [];
            let costoDomicilio = 0;

            // 1. Verificar primero si el tipo de corte tiene un radio específico (cero, navaja, destroncado)
            const radioSubtipo = section.querySelector('input[type="radio"][name^="opt-corte"]:not([name="opt-corte1"]):checked');
            if (radioSubtipo) {
                precioBase = parseFloat(radioSubtipo.getAttribute('data-price') || 0);
                detallesExtra.push(radioSubtipo.value);
            }

            // 2. Verificar si se seleccionó Domicilio en esta sección específica y SUMAR automáticamente al precio
            const radioDomicilio = section.querySelector('input[type="radio"][name="opt-corte1"]:checked, input[type="radio"][name^="dom-corte"]:checked');
            if (radioDomicilio) {
                costoDomicilio = parseFloat(radioDomicilio.getAttribute('data-extra') || 0);
                if (costoDomicilio > 0) {
                    detallesExtra.push("Con Domicilio (+C$ 40)");
                }
            }

            // Suma del servicio + domicilio
            let precioFinalPorUnidad = precioBase + costoDomicilio;
            let subtotal = precioFinalPorUnidad * cantidad;

            const nombreFinal = detallesExtra.length > 0 ? `${nombreBase} (${detallesExtra.join(' - ')})` : nombreBase;

            // Guardar al arreglo del carrito
            carrito.push({
                id: Date.now(), 
                nombre: nombreFinal,
                precio: precioFinalPorUnidad,
                cantidad: cantidad,
                subtotal: subtotal
            });

            // Resetear cantidad a 1
            cantidadInput.value = 1;

            actualizarInterfazCarrito();
            alert(`¡${nombreBase} agregado al carrito!`);
        });
    });

    function actualizarInterfazCarrito() {
        if (carrito.length === 0) {
            listaCarritoHtml.innerHTML = '<p style="text-align: center; color: #888;">El carrito está vacío.</p>';
            totalCarritoHtml.innerText = "Total: C$ 0";
            return;
        }

        listaCarritoHtml.innerHTML = "";
        let total = 0;

        carrito.forEach(item => {
            total += item.subtotal;
            const div = document.createElement('div');
            div.className = "item-carrito";
            div.innerHTML = `
                <div>
                    <strong>${item.cantidad}x</strong> ${item.nombre}<br>
                    <small>C$ ${item.precio} c/u (Corte + Envío incluido si aplica)</small>
                </div>
                <div>
                    <span>C$ ${item.subtotal}</span>
                    <button class="btn-delete" data-id="${item.id}" style="margin-left:10px;">X</button>
                </div>
            `;
            listaCarritoHtml.appendChild(div);
        });

        totalCarritoHtml.innerText = `Total: C$ ${total}`;

        // Asignar eventos de eliminación
        const botonesEliminar = listaCarritoHtml.querySelectorAll('.btn-delete');
        botonesEliminar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseFloat(e.target.getAttribute('data-id'));
                carrito = carrito.filter(item => item.id !== itemId);
                actualizarInterfazCarrito();
            });
        });
    }

    // 4. Enviar a WhatsApp en formato boucher/recibo
    const sendBtn = document.getElementById('sendWhatsapp');
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            if (carrito.length === 0) {
                alert("Tu carrito está vacío. Agrega al menos un servicio.");
                return;
            }

            const nombreCl = document.getElementById('cl-nombre').value.trim();
            const direccionCl = document.getElementById('cl-direccion').value.trim();
            const diaCl = document.getElementById('cl-dia').value;
            const horaCl = document.getElementById('cl-hora').value;

            if (!nombreCl || !direccionCl || !diaCl || !horaCl) {
                alert("Por favor rellena todos los campos de tus Datos de Reserva al final de la página.");
                const datosSec = document.getElementById('datos-reserva');
                if(datosSec) datosSec.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            let totalPedido = 0;
            let message = "=========================\n";
            message += "     BARBER DOLOCAL      \n";
            message += "    BOUCHER DE RESERVA   \n";
            message += "=========================\n\n";
            
            message += `👤 Cliente: ${nombreCl}\n`;
            message += `📍 Dirección: ${direccionCl}\n`;
            message += `📅 Día: ${diaCl}\n`;
            message += `⏰ Hora: ${horaCl}\n\n`;
            
            message += "--- DETALLE DEL PEDIDO ---\n";
            carrito.forEach(item => {
                message += `${item.cantidad}x ${item.nombre}\n`;
                message += `   -> Precio Unid: C$ ${item.precio}\n`;
                message += `   -> Subtotal: C$ ${item.subtotal}\n`;
                totalPedido += item.subtotal;
            });
            message += "--------------------------\n";
            message += `💰 TOTAL NETO: C$ ${totalPedido}\n`;
            message += "=========================\n";
            message += "¡Muchas gracias por su preferencia!";

            const phone = "+50576821169";
            const url = "https://api.whatsapp.com/send?phone=" + phone + "&text=" + encodeURIComponent(message);
            window.open(url, "_blank");
        });
    }
});

       