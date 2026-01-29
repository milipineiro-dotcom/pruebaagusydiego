// CONFIGURACIÓN DE DATOS (Cambiar aquí si es necesario)
const weddingData = {
    civil: {
        date: "2026-10-16",
        startTime: "11:30",
        endTime: "13:00",
        title: "Casamiento Civil Agustina y Diego",
        location: "Registro Civil Central, Av. Ficticia 123",
        geo: "Registro+Civil+Central+Buenos+Aires" // Para Google Maps
    },
    party: {
        date: "2026-10-17",
        startTime: "19:00",
        endTime: "23:59", // Fin aproximado
        title: "Fiesta Boda Agustina y Diego",
        location: "Estancia La Soñada, Ruta 2 Km 50",
        geo: "Estancia+La+Soñada"
    }
};

// URL DE TU GOOGLE APPS SCRIPT (PEGA TU URL AQUÍ DESPUÉS DE HACER EL DEPLOY)
const SCRIPT_URL = 'PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT'; 

// 1. ANIMACIÓN DEL SOBRE
const envelopeContainer = document.getElementById('envelope-trigger');
const mainContent = document.getElementById('main-content');

envelopeContainer.addEventListener('click', () => {
    envelopeContainer.classList.add('open');
    
    // Mostrar contenido suavemente después de que el sobre se vaya
    setTimeout(() => {
        mainContent.classList.remove('hidden');
        document.body.style.overflowY = 'auto'; // Habilitar scroll
    }, 1500);
});

// 2. SCROLL ANIMATION
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-on-scroll').forEach(section => {
    observer.observe(section);
});

// 3. FUNCIONES DE MAPA Y CALENDARIO
function openMap(type) {
    const q = weddingData[type].geo;
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
}

function addToCalendar(type) {
    const event = weddingData[type];
    // Formato fechas para Google Calendar: YYYYMMDDTHHMMSSZ (UTC o local sin Z)
    const start = event.date.replace(/-/g, '') + 'T' + event.startTime.replace(':', '') + '00';
    const end = event.date.replace(/-/g, '') + 'T' + event.endTime.replace(':', '') + '00';
    
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=¡Los esperamos!&location=${encodeURIComponent(event.location)}`;
    window.open(url, '_blank');
}

// 4. LÓGICA RSVP (MODAL Y FORMULARIO)
const modal = document.getElementById('rsvp-modal');
const form = document.getElementById('rsvp-form');
const guestsContainer = document.getElementById('guests-container');
const statusMsg = document.getElementById('form-status');

function openRSVP() {
    modal.style.display = 'flex';
}

function closeRSVP() {
    modal.style.display = 'none';
    statusMsg.innerText = '';
}

// Cerrar al tocar fuera del modal
window.onclick = function(event) {
    if (event.target == modal) {
        closeRSVP();
    }
}

// Agregar campo de invitado extra
function addGuestField() {
    const div = document.createElement('div');
    div.className = 'guest-card';
    div.innerHTML = `
        <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:0.8rem">Nombre del acompañante</label>
            <input type="text" name="guest_name" required placeholder="Nombre y Apellido">
            <button type="button" class="btn-text" style="color:#d9534f; font-size:0.8rem" onclick="this.parentElement.parentElement.remove()">Eliminar</button>
        </div>
    `;
    guestsContainer.appendChild(div);
}

// Enviar Formulario a Google Sheets
form.addEventListener('submit', e => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = "Enviando...";

    // Recopilar datos
    const formData = new FormData(form);
    const mainGuest = formData.get('main_guest');
    
    // Obtener todos los acompañantes
    const guests = [];
    document.querySelectorAll('input[name="guest_name"]').forEach(input => {
        if(input.value) guests.push(input.value);
    });

    const data = {
        main_guest: mainGuest,
        additional_guests: guests.join(', '), // String separado por comas
        total_pax: 1 + guests.length,
        timestamp: new Date().toISOString()
    };

    // Enviar usando fetch
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'no-cors', // Importante para evitar error de CORS con Google Scripts
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(() => {
        statusMsg.style.color = 'green';
        statusMsg.innerText = "¡Confirmación recibida! Gracias.";
        form.reset();
        guestsContainer.innerHTML = ''; // Limpiar extra guests
        setTimeout(() => {
            closeRSVP();
            submitBtn.disabled = false;
            submitBtn.innerText = "Enviar Confirmación";
        }, 2000);
    }).catch(err => {
        console.error('Error:', err);
        statusMsg.style.color = 'red';
        statusMsg.innerText = "Hubo un error. Por favor intentá de nuevo o avisanos por WP.";
        submitBtn.disabled = false;
        submitBtn.innerText = "Enviar Confirmación";
    });
});
