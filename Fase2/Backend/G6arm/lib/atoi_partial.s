/*
    atoi_partial.s - VERSION CON DETECCIÓN DE EOF
    
    Retorna valores especiales:
    - Número positivo: cantidad de números procesados
    - -1: Encontró '$' (fin de archivo)
*/

.global atoi_partial

.section .text

atoi_partial:
    // Guardar registros
    stp x29, x30, [sp, #-16]!
    stp x19, x20, [sp, #-16]!
    stp x21, x22, [sp, #-16]!
    stp x23, x24, [sp, #-16]!
    
    // Parámetros de entrada
    mov x19, x0                 // x19 = dirección del buffer de texto
    mov x20, x1                 // x20 = tamaño del buffer
    
    // Debug: Mostrar inicio
    mov x0, 1
    adr x1, .msg_parsing
    mov x2, 8
    mov x8, 64
    svc 0
    
    // Verificar que tenemos array válido
    ldr x21, =data_array
    ldr x21, [x21]              // x21 = dirección del array de números
    cbz x21, .parse_error
    
    // Obtener índice actual del array global
    ldr x22, =data_array_size
    ldr x23, [x22]              // x23 = índice actual (números ya guardados)
    
    // Variables de parsing
    mov x22, 0                  // x22 = índice en buffer de texto
    mov x24, 0                  // x24 = número acumulado actual
    mov x5, 0                   // x5 = flag: ¿construyendo número?
    mov x6, 10                  // x6 = constante 10
    mov x7, 0                   // x7 = números procesados en este chunk

.parse_loop:
    // ¿Llegamos al final del buffer?
    cmp x22, x20
    beq .parse_normal_end
    
    // Leer carácter actual
    ldrb w8, [x19, x22]         // w8 = carácter en posición x22
    
    // ¿Es el terminador '$'?
    cmp w8, 36                  // ASCII 36 = '$'
    beq .parse_found_eof
    
    // ¿Es newline?
    cmp w8, 10                  // ASCII 10 = '\n'
    beq .parse_store_number
    
    // ¿Es dígito válido?
    cmp w8, #'0'
    blt .parse_skip_char        // Menor que '0'
    cmp w8, #'9'
    bgt .parse_skip_char        // Mayor que '9'
    
    // ES DÍGITO: procesar
    sub w8, w8, #'0'            // Convertir ASCII a número
    mul x24, x24, x6            // acumulado *= 10
    add x24, x24, x8            // acumulado += nuevo dígito
    mov x5, 1                   // flag = "tenemos un número"
    b .parse_next_char

.parse_store_number:
    // ¿Hay número acumulado para guardar?
    cmp x5, 1
    bne .parse_reset
    
    // Guardar número en el array
    str x24, [x21, x23, lsl #3] // array[x23] = número
    add x23, x23, 1             // siguiente posición en array
    add x7, x7, 1               // incrementar contador de este chunk
    
    // Debug: Mostrar que guardamos un número
    mov x0, 1
    adr x1, .msg_num
    mov x2, 1
    mov x8, 64
    svc 0

.parse_reset:
    mov x24, 0                  // resetear acumulador
    mov x5, 0                   // resetear flag
    b .parse_next_char

.parse_skip_char:
    // Carácter no válido: resetear si estábamos construyendo
    mov x24, 0
    mov x5, 0
    b .parse_next_char

.parse_next_char:
    add x22, x22, 1             // siguiente carácter
    b .parse_loop

.parse_found_eof:
    // Encontramos '$' - guardar último número si existe
    cmp x5, 1
    bne .parse_eof_done
    
    str x24, [x21, x23, lsl #3] // Guardar último número
    add x23, x23, 1
    add x7, x7, 1
    
    mov x0, 1
    adr x1, .msg_last
    mov x2, 1
    mov x8, 64
    svc 0

.parse_eof_done:
    // Actualizar tamaño global del array
    ldr x22, =data_array_size
    str x23, [x22]
    
    mov x0, 1
    adr x1, .msg_eof
    mov x2, 4
    mov x8, 64
    svc 0
    
    mov x0, -1                  // Retornar -1 = EOF encontrado
    b .parse_exit

.parse_normal_end:
    // Final normal del chunk - guardar último número si existe
    cmp x5, 1
    bne .parse_update_size
    
    str x24, [x21, x23, lsl #3]
    add x23, x23, 1
    add x7, x7, 1

.parse_update_size:
    // Actualizar tamaño global del array
    ldr x22, =data_array_size
    str x23, [x22]
    
    mov x0, 1
    adr x1, .msg_done
    mov x2, 5
    mov x8, 64
    svc 0
    
    mov x0, x7                  // Retornar números procesados en este chunk
    b .parse_exit

.parse_error:
    mov x0, 1
    adr x1, .msg_error
    mov x2, 6
    mov x8, 64
    svc 0
    mov x0, 0                   // Retornar 0 números procesados

.parse_exit:
    // Restaurar registros
    ldp x23, x24, [sp], #16
    ldp x21, x22, [sp], #16
    ldp x19, x20, [sp], #16
    ldp x29, x30, [sp], #16
    ret

.section .data
.msg_parsing:
    .ascii "PARSING\n"
.msg_num:
    .ascii "#"
.msg_last:
    .ascii "L"
.msg_done:
    .ascii "DONE\n"
.msg_eof:
    .ascii "EOF\n"
.msg_error:
    .ascii "ERROR\n"
