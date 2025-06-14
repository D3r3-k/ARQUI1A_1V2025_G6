# SIEPA - Sistema Inteligente de Evaluación y Predicción Ambiental

## Grupo: ARQUI1A_1V2025_G6

### Integrantes y responsabilidades:
- **Bryan** – Vista de Inicio (Home)
- **Ángel** – Vista de Login
- **Miguel** – Dashboard general
- **Derek** – Módulo de control de actuadores
- **Edwin** – Histórico de datos

---

## Rutas del sistema

### `/`
**Responsable:** Bryan  
**Descripción:** Página de inicio del sistema. Debe mostrar una presentación general del proyecto y acceso al login si el usuario no está autenticado.  
**Estado:** Debe validar autenticación e iniciar redirección al dashboard si el usuario ya está logueado.

---

### `/login`
**Responsable:** Ángel  
**Descripción:** Página de autenticación para los administradores. Implementa verificación de credenciales seguras.  
**Estado:** Implementado con validación básica y redirección al dashboard tras login exitoso.

---

### `/dashboard`
**Responsable:** Miguel  
**Descripción:** Vista principal del sistema tras autenticación. Muestra información general en tiempo real recolectada por los sensores.  
**Estado:** Debe integrar datos del broker MQTT y mostrar variables como temperatura, humedad, etc.

---

### `/dashboard/control`
**Responsable:** Derek  
**Descripción:** Módulo de control de actuadores. Permite activar/desactivar dispositivos como ventiladores, luces o buzzer desde la web.  
**Estado:** Debe enviar comandos por MQTT al sistema físico.

---

### `/dashboard/historico`
**Responsable:** Edwin  
**Descripción:** Módulo de visualización histórica. Debe mostrar gráficos con los datos recolectados a lo largo del tiempo.  
**Estado:** Implementado con consultas a la base de datos y renderizado gráfico con librerías como Chart.js o similar.

---

## Instrucciones generales
- Todas las vistas deben estar protegidas por autenticación.
- Se debe mantener una estructura limpia de componentes y carpetas.
- Usar control de versiones y documentación técnica clara dentro del repositorio.

> **Importante:** Todo el trabajo debe estar subido en el repositorio con el nombre correcto y el auxiliar agregado como colaborador.
>
> -Commit de Verificación:

2025-06-14-00:17
