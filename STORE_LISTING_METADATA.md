# 📱 FICHA DE PUBLICACIÓN TIENDAS (Google Play Store & App Store)

Este documento contiene todos los textos y datos requeridos para completar la ficha de la aplicación en **Google Play Console** y **Apple App Store Connect**.

---

## 🏷️ 1. Datos Básicos

- **Nombre de la Aplicación:** San Miguel Móvil
- **Nombre del Paquete / Application ID:** `com.proyectosanmiguel.amsa`
- **Categoría:** Productividad / Bienes Raíces (Real Estate) / Finanzas Personales
- **Público Objetivo:** Clientes actuales y prospectos de Proyectos San Miguel (Mayores de 18 años).
- **URL de Política de Privacidad:** `https://proyectosanmiguel.com/politica_privacidad.html` (o `https://proyectosanmiguel.com/portal/politica-privacidad`)
- **Correo de Soporte:** `info@proyectosanmiguel.com`

---

## ✍️ 2. Textos para Google Play Store

### A. Descripción Corta (Máximo 80 caracteres)
```text
Consulta tu estado de cuenta, cotiza lotes y gestiona tus pagos de San Miguel.
```

### B. Descripción Completa
```text
San Miguel Móvil es la aplicación oficial de Proyectos San Miguel, diseñada para brindarte acceso transparente, ágil y seguro a todos tus proyectos inmobiliarios y financiamiento de lotes.

🌟 FUNCIONALIDADES PRINCIPALES:

🏢 Catálogo de Lotificaciones y Proyectos
• Explora todos nuestros proyectos inmobiliarios disponibles con galería fotográfica e información detallada de ubicación.
• Consulta en tiempo real la disponibilidad de bloques y lotes.

📊 Simulador Financiero y Cotizador de Cuotas
• Calcula tu plan de financiamiento personalizado eligiendo el plazo en meses y la prima inicial.
• Visualiza el valor de tu cuota mensual estimada antes de formalizar tu compra.

📄 Portal de Clientes y Estado de Cuenta
• Acceso seguro y privado mediante tu número de expediente o identificación.
• Consulta tu saldo actual, número de cuotas pagadas, cuotas pendientes y tabla de amortización completa.
• Descarga directa de tus estados de cuenta e historial de recibos en formato PDF de alta fidelidad.

💳 Reporte de Pagos y Comprobantes
• Registra tus abonos y transferencias bancarias de forma directa adjuntando una fotografía de tu boleta o comprobante.
• Agiliza la conciliación de tus pagos sin necesidad de desplazarte a nuestras oficinas.

🏦 Cuentas Bancarias Oficiales
• Accede al listado verificado de cuentas bancarias de la empresa para realizar tus depósitos de forma 100% confiable y segura.

🔔 Notificaciones y Recordatorios
• Recibe alertas oportunas sobre las fechas de vencimiento de tus cuotas y confirmación de abonos recibidos.

Proyectos San Miguel: Invierte en tu futuro y el de tu familia con total tranquilidad y respaldo.
```

---

## 🧪 3. Credenciales de Prueba para los Revisores de Google / Apple

Cuando Google o Apple soliciten acceso de prueba para revisar la aplicación antes de aprobarla:

- **Instrucción para el Revisor:** Ingrese a la pestaña "Mi Cuenta" o "Portal Clientes", seleccione acceso por Expediente/Identidad e ingrese las siguientes credenciales de prueba:
- **Número de Identificación / Expediente de Prueba:** `0801-1990-12345` (o el expediente demo que desees configurar)
- **Notas adicionales:** La app permite navegar libremente por el catálogo de proyectos y el simulador de cuotas de manera pública sin iniciar sesión.

---

## 🔒 4. Respuestas para el Cuestionario de Seguridad y Contenido de Google Play

1. **¿La app recopila datos de ubicación en segundo plano?** No.
2. **¿La app comparte datos personales con terceros para publicidad?** No.
3. **¿La app utiliza cifrado en tránsito?** Sí, todas las peticiones utilizan HTTPS (SSL/TLS).
4. **¿Permite al usuario eliminar o consultar sus datos?** Sí, mediante solicitud directa a la administración.
5. **Permisos solicitados:**
   - `Cámara y Fotos`: Exclusivamente para que el usuario capture y envíe el comprobante de su transferencia bancaria.
   - `Notificaciones`: Para alertas de estado de cuenta y avisos importantes.
