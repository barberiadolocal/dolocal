document.addEventListener("DOMContentLoaded", () => {
    // Funcionalidad fade-in con Intersection Observer
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

    // Registro del Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('Service Worker registrado:', reg))
                .catch(err => console.error('Error al registrar el Service Worker:', err));
        });
    }

    // Funcionalidad para enviar los datos a WhatsApp con el botón
    const sendBtn = document.getElementById('sendWhatsapp');
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            let message = "";
            // Recorrer todas las secciones con la clase "fade-in"
            const sections = document.querySelectorAll('section.fade-in');
            sections.forEach(function(section) {
                // Obtener el título de la sección
                const title = section.querySelector('h2') ? section.querySelector('h2').innerText : "Sección";
                let sectionData = "";
                let filled = false;
                // Recoger todos los inputs y selects de la sección
                const elements = section.querySelectorAll('input, select');
                elements.forEach(function(el) {
                    let label = "";
                    const previous = el.previousElementSibling;
                    if (previous && previous.tagName.toLowerCase() === "label") {
                        label = previous.innerText.trim();
                    } else if (el.placeholder) {
                        label = el.placeholder;
                    } else {
                        label = el.name;
                    }
                    let value = el.value.trim();
                    // Si es número y su valor es 0, se ignora
                    if (el.type === "number" && value === "0") { 
                        value = "";
                    }
                    // Para radios, se recoge sólo si están marcados
                    if (el.type === "radio") {
                        if (el.checked) {
                            value = el.value;
                        } else {
                            value = "";
                        }
                    }
                    if (value !== "") {
                        filled = true;
                        sectionData += `${label}: ${value}\n`;
                    }
                });
                if (filled) {
                    message += `${title}:\n${sectionData}\n`;
                }
            });
            if (message === "") {
                alert("No hay información rellenada en ninguna sección.");
                return;
            }
            // Reemplaza "TU_NUMERO_DE_WHATSAPP" por tu número real, incluyendo el código de país.
            const phone = "+50576821169";
            const url = "https://api.whatsapp.com/send?phone=" + phone + "&text=" + encodeURIComponent(message);
            window.open(url, "_blank");
        });
    }
});