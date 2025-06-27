// lib/load_data.s
.global load_data

.extern atoi_parcial

.section .text
load_data:
    // x0 = dirección de la cadena con nombre de archivo (null-terminated)
    
    // Guardar la dirección del archivo para debug
    mov x19, x0             // Guardar dirección del nombre de archivo

    // -------- Debug: mostrar que intentamos abrir --------
    ldr x1, =msg_debug_open
    mov x2, #35             // longitud del mensaje debug
    mov x0, #1              // fd stdout
    mov x8, #64             // syscall write
    svc #0

    // -------- Debug: mostrar nombre del archivo --------
    ldr x1, =msg_debug_filename
    mov x2, #21
    mov x0, #1
    mov x8, #64
    svc #0
    
    mov x0, #1              // fd stdout
    mov x1, x19             // dirección del nombre de archivo
    mov x2, #50             // longitud máxima a mostrar
    mov x8, #64             // syscall write
    svc #0

    // -------- Debug: salto de línea --------
    ldr x1, =msg_newline
    mov x2, #1
    mov x0, #1
    mov x8, #64
    svc #0
    
    // -------- Debug: mostrar bytes del nombre --------
    mov x21, #0             // contador de bytes
.debug_bytes:
    cmp x21, #20            // máximo 20 bytes para debug
    bge .end_debug_bytes
    ldrb w22, [x19, x21]    // cargar byte
    cmp w22, #0             // ¿null terminator?
    beq .end_debug_bytes
    add x21, x21, #1
    b .debug_bytes
.end_debug_bytes:
    // Mostrar longitud
    ldr x1, =msg_debug_length
    mov x2, #19
    mov x0, #1
    mov x8, #64
    svc #0

    // -------- Abrir archivo --------
    mov x8, #56             // syscall openat
    mov x0, #-100           // AT_FDCWD (directorio actual)
    mov x1, x19             // pathname (dirección del nombre de archivo)
    mov x2, #0              // flags (O_RDONLY = 0)
    mov x3, #0              // mode (no necesario para lectura)
    svc #0
    mov x20, x0             // Guardar fd en x20

    // Debug: mostrar si el fd es válido
    cmp x20, #0
    bge .fd_valido
    
    ldr x1, =msg_debug_fd_invalid
    mov x2, #25
    mov x0, #1
    mov x8, #64
    svc #0
    b .error_open
    
.fd_valido:
    ldr x1, =msg_debug_fd_valid
    mov x2, #20
    mov x0, #1
    mov x8, #64
    svc #0

    // -------- Leer archivo completo --------
    ldr x5, =data_array     // x5 = dirección base del arreglo
    mov x4, #0              // x4 = índice actual en data_array
    ldr x6, =file_buffer    // x6 = buffer para todo el archivo
    
    // Debug: mostrar que vamos a leer
    ldr x1, =msg_debug_read
    mov x2, #23
    mov x0, #1
    mov x8, #64
    svc #0
    
    // Leer todo el archivo de una vez
    mov x0, x20             // fd
    mov x1, x6              // dirección buffer
    mov x2, #4096           // leer hasta 4096 bytes
    mov x8, #63             // syscall read
    svc #0
    
    // Debug: mostrar bytes leídos
    mov x21, x0             // x21 = total de bytes leídos
    ldr x1, =msg_debug_bytes
    mov x2, #15
    mov x0, #1
    mov x8, #64
    svc #0
    
    cmp x21, #0
    ble .cerrar_archivo     // si x21 <= 0, EOF o error
    
    mov x9, #0              // x9 = posición actual en el buffer
    ldr x7, =line_buffer    // x7 = buffer para línea actual
    mov x10, #0             // x10 = posición en line_buffer

.procesar_archivo:
    cmp x9, x21             // ¿hemos procesado todo?
    bge .fin_lectura
    
    ldrb w3, [x6, x9]       // w3 = carácter actual
    cmp w3, #0x24           // '$' (finalizador)
    beq .fin_lectura        // Si es '$', terminar
    
    cmp w3, #'\n'           // ¿fin de línea?
    beq .procesar_numero
    cmp w3, #'\r'           // ¿retorno de carro?
    beq .siguiente_char     // ignorar \r
    cmp w3, #' '            // ¿espacio?
    beq .siguiente_char     // ignorar espacios
    cmp w3, #'\t'           // ¿tab?
    beq .siguiente_char     // ignorar tabs
    
    // Verificar que el buffer de línea no se desborde
    cmp x10, #63            // máximo 63 caracteres (dejar espacio para null)
    bge .siguiente_char     // si está lleno, ignorar caracteres adicionales
    
    // Agregar carácter al buffer de línea
    strb w3, [x7, x10]
    add x10, x10, #1
    
.siguiente_char:
    add x9, x9, #1
    b .procesar_archivo

.procesar_numero:
    // Terminar la cadena con null
    mov w11, #0
    strb w11, [x7, x10]
    
    // Si la línea no está vacía, convertir a número
    cmp x10, #0
    beq .reset_line
    
    // Verificar que no excedamos el tamaño del arreglo
    cmp x4, #512            // máximo 512 números (4096 bytes / 8 bytes por entero)
    bge .fin_lectura        // si está lleno, terminar
    
    mov x0, x7              // x0 = dirección de line_buffer
    bl atoi_parcial         // resultado en x0
    str x0, [x5, x4, lsl #3]    // data_array[x4] = x0
    add x4, x4, #1              // x4++

.reset_line:
    mov x10, #0             // reiniciar posición en line_buffer
    add x9, x9, #1          // siguiente carácter
    b .procesar_archivo

.fin_lectura:
    // Almacena el tamaño del arreglo leído
    ldr x7, =data_array_size
    str x4, [x7]
    
    // Debug: mostrar cuántos números se cargaron
    ldr x1, =msg_debug_loaded
    mov x2, #25
    mov x0, #1
    mov x8, #64
    svc #0
    
    // Cierra archivo
.cerrar_archivo:
    mov x8, #57             // syscall close
    mov x0, x20
    svc #0
    ret

// ----------- Manejador de error de apertura -----------
.error_open:
    ldr x1, =msg_error_open
    mov x2, #50             // longitud del mensaje (ajusta si cambias el texto)
    mov x0, #1              // fd stdout
    mov x8, #64             // syscall write
    svc #0
    ret

// ----------- BSS buffers internos -----------

.section .bss
    .align 8
line_buffer:
    .space 64       // Buffer temporal para una línea
file_buffer:
    .space 4096     // Buffer para todo el archivo

// ----------- Mensajes de error -----------

.section .data
msg_error_open:
    .ascii "[ERROR] No se pudo abrir el archivo o no existe.\n"
msg_debug_open:
    .ascii "[DEBUG] Intentando abrir archivo: "
msg_debug_filename:
    .ascii "Nombre del archivo: '"
msg_debug_length:
    .ascii "Longitud detectada\n"
msg_debug_fd_valid:
    .ascii "[DEBUG] FD valido\n"
msg_debug_fd_invalid:
    .ascii "[DEBUG] FD invalido\n"
msg_debug_read:
    .ascii "[DEBUG] Leyendo archivo\n"
msg_debug_bytes:
    .ascii "[DEBUG] Bytes: "
msg_debug_loaded:
    .ascii "[DEBUG] Numeros cargados\n"
msg_newline:
    .ascii "\n"
