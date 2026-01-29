# Invitación de Boda Digital - Agustina & Diego

Este proyecto es una invitación web interactiva, responsive (mobile-first) y conectada a Google Sheets para gestionar la lista de invitados.

## 🚀 Pasos para la Configuración

### 1. Preparar Google Sheets (Base de Datos)

1.  Ve a [Google Sheets](https://sheets.google.com) y crea una **hoja nueva**.
2.  En la primera fila, escribe los siguientes encabezados (A1, B1, C1, D1):
    * **Fecha**
    * **Invitado Principal**
    * **Acompañantes**
    * **Total Personas**
3.  Ponle un nombre a la hoja, por ejemplo: "Boda RSVP".

### 2. Crear el Webhook con Apps Script

1.  En tu hoja de cálculo, ve al menú: **Extensiones** > **Apps Script**.
2.  Se abrirá una nueva pestaña con un editor de código. Borra todo el código que aparece y pega el siguiente:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Obtener fecha actual formateada
    var fecha = new Date();
    
    // Agregar fila con los datos recibidos
    sheet.appendRow([
      fecha,
      data.main_guest,
      data.additional_guests,
      data.total_pax
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({"result":"success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({"result":"error", "error": e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
