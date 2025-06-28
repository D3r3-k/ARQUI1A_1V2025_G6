.global varianza
.extern data_array_limits
.extern data_array_limits_size

.section .text

varianza:
    stp x29, x30, [sp, #-16]!
    stp x19, x20, [sp, #-16]!
    stp x21, x22, [sp, #-16]!
    stp x23, x24, [sp, #-16]!

    // Mensaje inicial
    mov x0, 1
    adr x1, varianza_start_msg
    mov x2, 23
    mov x8, 64
    svc 0

    // Obtener array de datos
    ldr x19, =data_array_limits
    ldr x19, [x19]
    cbz x19, .varianza_no_array

    // Obtener tamaño del array
    ldr x20, =data_array_limits_size
    ldr x20, [x20]
    cbz x20, .varianza_empty

    // Inicializar variables
    mov x21, 0              // x21 = suma total
    mov x22, 0              // x22 = suma de cuadrados
    mov x0, 0               // x0 = índice

.varianza_sum_loop:
    cmp x0, x20             // ¿terminamos?
    beq .varianza_calculate

    ldr x1, [x19, x0, lsl #3]   // elemento en posición x0
    add x21, x21, x1        // suma += elemento
    mul x2, x1, x1          // x2 = elemento²
    add x22, x22, x2        // suma_cuadrados += elemento²
    add x0, x0, 1           // siguiente posición
    b .varianza_sum_loop

.varianza_calculate:
    // Tu fórmula original (que funciona bien)
    mul x23, x20, x22       // x23 = n * suma_cuadrados
    mul x24, x21, x21       // x24 = suma²
    sub x23, x23, x24       // x23 = n * suma_cuadrados - suma²

    mul x24, x20, x20       // x24 = n²
    udiv x24, x23, x24      // x24 = varianza final

    // Imprimir "La varianza es: "
    mov x0, 1
    adr x1, varianza_result_msg
    mov x2, 17
    mov x8, 64
    svc 0

    // Imprimir el resultado usando tu función ORIGINAL
    mov x0, x24             // número a imprimir
    bl print_varianza_number

    // Imprimir salto de línea
    mov x0, 1
    adr x1, newline_msg
    mov x2, 1
    mov x8, 64
    svc 0

    // Retornar la varianza en x0
    mov x0, x24              // x0 = varianza calculada 

    b .varianza_exit

// Tu función ORIGINAL de impresión (exactamente como la tenías)
print_varianza_number:
    stp x29, x30, [sp, #-16]!
    stp x15, x16, [sp, #-16]!
    stp x17, x18, [sp, #-16]!
    stp x19, x20, [sp, #-16]!

    // x0 contiene el número a imprimir
    mov x16, x0             // x16 = número a convertir
    adr x15, output_buffer  // x15 = buffer de salida
    mov x17, 10             // x17 = base 10
    mov x18, 0              // x18 = contador de dígitos

    // Caso especial: número 0
    cmp x16, 0
    bne .get_size

    mov w19, '0'
    strb w19, [x15]
    mov w19, 10             // newline
    strb w19, [x15, 1]
    mov x2, 2
    b .print_number

.get_size:
    mov x19, x16

.get_size_loop:
    udiv x20, x19, x17      // x20 = x19 / 10
    add x18, x18, 1         // incrementar contador
    cmp x20, 0
    mov x19, x20
    bne .get_size_loop

    // Posicionar al final del buffer
    add x15, x15, x18
    mov w19, 10             // newline
    strb w19, [x15]
    sub x15, x15, 1
    add x18, x18, 1         // incluir newline en el tamaño

    mov x19, x16
    mov x20, 0

.get_digit:
    udiv x10, x19, x17      // x10 = x19 / 10
    msub x11, x10, x17, x19 // x11 = x19 % 10 (resto)
    add x20, x20, 1
    strb w11, [x15]         // guardar dígito
    sub x15, x15, 1
    mov x19, x10
    cmp x19, 0
    bne .get_digit

    add x15, x15, 1

.setascii:
    ldrb w12, [x15]
    add w12, w12, '0'       // convertir a ASCII
    strb w12, [x15]
    add x15, x15, 1
    sub x20, x20, 1
    cmp x20, 0
    bne .setascii

    mov x2, x18             // tamaño total

.print_number:
    mov x0, 1               // stdout
    adr x1, output_buffer   // buffer
    mov x8, 64              // syscall write
    svc 0

    ldp x19, x20, [sp], 16
    ldp x17, x18, [sp], 16
    ldp x15, x16, [sp], 16
    ldp x29, x30, [sp], 16
    ret

.varianza_no_array:
    mov x0, 1
    adr x1, varianza_no_array_msg
    mov x2, 20
    mov x8, 64
    svc 0
    mov x0, #-1              // AGREGAR: retornar -1 si no hay datos
    b .varianza_exit

.varianza_empty:
    mov x0, 1
    adr x1, varianza_empty_msg
    mov x2, 15
    mov x8, 64
    svc 0
    mov x0, #-1              // AGREGAR: retornar -1 si está vacío
    b .varianza_exit

.varianza_exit:
    ldp x23, x24, [sp], 16
    ldp x21, x22, [sp], 16
    ldp x19, x20, [sp], 16
    ldp x29, x30, [sp], 16
    ret

.section .data
varianza_start_msg:
    .ascii "Calculando varianza...\n"
varianza_result_msg:
    .ascii "La varianza es: "
newline_msg:
    .ascii "\n"
varianza_no_array_msg:
    .ascii "ERROR: No hay datos\n"
varianza_empty_msg:
    .ascii "ERROR: Array vacio\n"

.section .bss
output_buffer:
    .space 32
