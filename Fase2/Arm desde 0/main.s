.global _start

/*
| Registro | Uso en load\_data                                         |
| -------- | --------------------------------------------------------- |
| x0       | fd (file descriptor) / valor temporal / número convertido |
| x1       | Dirección buffer de lectura de línea / puntero de archivo |
| x2       | Tamaño de lectura (`read`)                                |
| x3       | Número leído (temporal)                                   |
| x4       | Índice actual del arreglo                                 |
| x5       | Dirección base del arreglo                                |
| x6       | Dirección del buffer temporal                             |
| x7       | syscall number (open/read/close)                          |
| x8       | syscall number (open/read/close)                          |
| x9       | valor temporal, banderas                                  |

 */

// Exportar funciones
.global menu_loop
.global menu_estadisticas

.global imprimir
.global leer

// Exportar variables
.global data_array
.global data_array_size

// Importar funciones
.extern atoi


.section .text
_start:
	ldr x1, =bienvenida
	mov x2, #91
	bl imprimir

menu_loop:
	ldr x1, =menu
	mov x2, #272
	bl imprimir

	ldr x1, =msg_escoger
	mov x2, #24
	bl imprimir

	bl leer
	mov x0, x1
	bl atoi

	// 1. Cargar archivo
	cmp x0, #1
	b.eq menu_carga
	// 2. Cargar límites
	cmp x0, #2
	b.eq menu_limites
	// 3. Estadísticas
	cmp x0, #3
	b.eq menu_estadisticas
	// 4. Predicciones
	cmp x0, #4
	b.eq menu_predicciones
	// 5. Salir
	cmp x0, #5
	b.eq salir

	// Si la opción es inválida, redirigir al error
	cmp x0, #1
	b.lt set_error_main
	cmp x0, #5
	b.gt set_error_main

	b menu_loop

set_error_main:
	ldr x26, =menu_loop
	b error_opt

menu_carga:
	// Imprimir mensaje de carga
	ldr x1, =msg_menu_load
	mov x2, #24
	bl imprimir

	// Leer el nombre del archivo
	bl leer

	// Guardar el nombre del archivo en x0
	ldr x0, =buffer
	// Llamar a la función load_data
	bl load_data
	b menu_loop

menu_limites:
	ldr x1, =msg_menu_limits1
	mov x2, #30
	bl imprimir
	bl leer
	mov x27, x0

	ldr x1, =msg_menu_limits2
	mov x2, #28
	bl imprimir
	bl leer
	mov x28, x0
	b menu_loop

menu_estadisticas:
	ldr x1, =msg_menu_stats
	mov x2, #393
	bl imprimir

	ldr x1, =msg_escoger
	mov x2, #24
	bl imprimir

	bl leer
	mov x0, x1
	bl atoi

	// 1. Media
	// cmp x0, #1
	// b.eq menu_media
	// 2. Mediana
	// cmp x0, #2
	// b.eq menu_mediana
	// 3. Moda
	// cmp x0, #3
	// b.eq menu_moda
	// 4. Valor Min
	// cmp x0, #4
	// b.eq menu_valor_min
	// 5. Valor Max
	// cmp x0, #5
	// b.eq menu_valor_max
	// 6. Desviación Estándar
	// cmp x0, #6
	// b.eq menu_desviacion
	// 7. Varianza
	// cmp x0, #7
	// b.eq menu_varianza
	// 8. Todas
	// cmp x0, #8
	// b.eq menu_todas
	// 9. Regresar
	cmp x0, #9
	b.eq menu_loop
	// Si la opción es inválida, redirigir al error
	cmp x0, #1
	b.lt set_error_stats
	cmp x0, #9
	b.gt set_error_stats

	b menu_loop

set_error_stats:
	ldr x26, =menu_estadisticas
	b error_opt

menu_predicciones:
	ldr x1, =msg_menu_predic
	mov x2, #180
	bl imprimir

	ldr x1, =msg_escoger
	mov x2, #24
	bl imprimir
	bl leer
	mov x0, x1
	bl atoi

	cmp x0, #2
	b.eq menu_loop
	cmp x0, #1
	b.lt set_error_pred
	cmp x0, #1
	b.gt set_error_pred

	// Aquí irían las funciones de predicción
	b menu_loop

set_error_pred:
	ldr x26, =menu_predicciones
	b error_opt

error_opt:
	ldr x1, =msg_error
	mov x2, #24
	bl imprimir
	br x26

salir:
	ldr x1, =msg_salida
	mov x2, #12
	bl imprimir
	mov x0, #0
	mov x8, #93
	svc #0

imprimir:
	mov x0, #1
	mov x8, #64
	svc #0
	ret

leer:
	// Limpiar el buffer antes de leer
	ldr x1, =buffer         // dirección del buffer
	mov x2, #0              // contador
	mov w3, #0              // valor null
.clear_loop:
	cmp x2, #256            // ¿llegamos al final del buffer?
	bge .start_read
	strb w3, [x1, x2]       // escribir null
	add x2, x2, #1          // siguiente posición
	b .clear_loop
	
.start_read:
	mov x0, #0              // stdin
	ldr x1, =buffer         // buffer donde guardar
	mov x2, #255            // máximo a leer (dejar espacio para null)
	mov x8, #63             // syscall read
	svc #0
	
	// Limpiar el buffer: reemplazar '\n' con '\0'
	ldr x1, =buffer         // dirección del buffer
	mov x2, #0              // contador
.clean_loop:
	ldrb w3, [x1, x2]       // cargar byte
	cmp w3, #'\n'           // ¿es salto de línea?
	beq .null_terminate
	cmp w3, #'\r'           // ¿es retorno de carro?
	beq .null_terminate
	cmp w3, #0              // ¿ya es null?
	beq .clean_done
	add x2, x2, #1          // siguiente carácter
	cmp x2, #255            // ¿llegamos al final del buffer?
	blt .clean_loop
	b .clean_done
.null_terminate:
	mov w3, #0              // cargar null
	strb w3, [x1, x2]       // guardar null terminator
.clean_done:
	ret



// ============= [Data Section] =============
.section .data
bienvenida:
	.ascii "\n|===========================|\n"
	.ascii "|       SIEPA TUI APP       |\n"
	.ascii "|===========================|\n"

menu:
	.ascii "|===========================|\n"
	.ascii "|        MENU PRINCIPAL     |\n"
	.ascii "|===========================|\n"
	.ascii "| 1. Cargar archivo         |\n"
	.ascii "| 2. Cargar límites         |\n"
	.ascii "| 3. Estadísticas           |\n"
	.ascii "| 4. Predicciones           |\n"
	.ascii "| 5. Salir                  |\n"
	.ascii "|===========================|\n"

msg_menu_load:
	.ascii "[>] Nombre del archivo: "

msg_menu_limits1:
	.ascii "[>] Escoga el limite inicial: "
msg_menu_limits2:
	.ascii "[>] Escoga el limite final: "

msg_menu_stats:
	.ascii "\n|===========================|\n"
	.ascii "|       ESTADISTICAS        |\n"
	.ascii "|===========================|\n"
	.ascii "| 1. Media                  |\n"
	.ascii "| 2. Mediana                |\n"
	.ascii "| 3. Moda                   |\n"
	.ascii "| 4. Valor Min              |\n"
	.ascii "| 5. Valor Max              |\n"
	.ascii "| 6. Desviación Estándar    |\n"
	.ascii "| 7. Varianza               |\n"
	.ascii "| 8. Todas                  |\n"
	.ascii "| 9. Regresar               |\n"
	.ascii "|===========================|\n"

msg_menu_predic:
	.ascii "|===========================|\n"
	.ascii "|       PREDICCIONES        |\n"
	.ascii "|===========================|\n"
	.ascii "| 1. Media Movil            |\n"
	.ascii "| 2. Regresar               |\n"
	.ascii "|===========================|\n"

msg_escoger:
	.ascii "[>] Escribe una opcion: "

msg_error:
	.ascii "[Error] Opcion invalida\n"

msg_salida:
	.ascii "Saliendo...\n"

// ============= [BSS Section] =============
.section .bss
	.align 8
buffer:
	.space 256

data_array:
	.space 4096      // Espacio para hasta 512 números enteros (8 bytes cada uno)
data_array_size:
	.space 8