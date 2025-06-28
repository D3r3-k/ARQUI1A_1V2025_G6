.global moda
.extern data_array_limits
.extern data_array_limits_size

.section .text

moda:
    stp x29, x30, [sp, #-16]!
    stp x19, x20, [sp, #-16]!
    stp x21, x22, [sp, #-16]!
    stp x23, x24, [sp, #-16]!
    stp x25, x26, [sp, #-16]!

    // Obtener array
    ldr x19, =data_array_limits
    ldr x19, [x19]
    cbz x19, .moda_no_array

    // Obtener tamaño
    ldr x20, =data_array_limits_size
    ldr x20, [x20]
    cbz x20, .moda_empty

    // ALGORITMO ORIGINAL DE MODA (SIN TOCAR)
    mov x21, 0              // elemento con mayor frecuencia (moda)
    mov x22, 0              // frecuencia máxima encontrada
    mov x23, 0              // índice actual para el bucle externo

.moda_outer_loop:
    cmp x23, x20
    beq .moda_print_result

    ldr x24, [x19, x23, lsl #3]

    mov x25, 0              // contador de apariciones
    mov x26, 0              // índice para bucle interno

.moda_count_loop:
    cmp x26, x20
    beq .moda_check_frequency

    ldr x1, [x19, x26, lsl #3]
    cmp x1, x24
    bne .moda_count_next

    add x25, x25, 1

.moda_count_next:
    add x26, x26, 1
    b .moda_count_loop

.moda_check_frequency:
    cmp x25, x22
    ble .moda_next_element

    mov x21, x24
    mov x22, x25

.moda_next_element:
    add x23, x23, 1
    b .moda_outer_loop

.moda_print_result:
    cmp x22, 0
    beq .moda_no_data

    mov x0, 1
    adr x1, moda_result_msg
    mov x2, 6
    mov x8, 64
    svc 0

    // Imprimir la moda usando el método simple que funcionaba
    mov x0, x21
    bl convert_and_print

    b .moda_exit

// LA FUNCIÓN convert_and_print QUE YA FUNCIONABA
convert_and_print:
    stp x29, x30, [sp, #-16]!
    stp x19, x20, [sp, #-16]!
    stp x21, x22, [sp, #-16]!

    mov x19, x0
    adr x20, number_buffer
    mov x21, 0

    cmp x19, 0
    beq .convert_zero

    cmp x19, 0
    bge .convert_positive

    mov w22, '-'
    strb w22, [x20, x21]
    add x21, x21, 1
    neg x19, x19

.convert_positive:
    adr x22, temp_digits
    mov x1, 0

.extract_digits:
    mov x2, 10
    udiv x3, x19, x2
    msub x4, x3, x2, x19

    add w4, w4, #'0'
    strb w4, [x22, x1]
    add x1, x1, 1

    mov x19, x3
    cmp x19, 0
    bne .extract_digits

.copy_digits:
    sub x1, x1, 1
    ldrb w2, [x22, x1]
    strb w2, [x20, x21]
    add x21, x21, 1

    cmp x1, 0
    bne .copy_digits

    b .print_buffer

.convert_zero:
    mov w22, '0'
    strb w22, [x20]
    mov x21, 1

.print_buffer:
    mov x0, 1
    mov x1, x20
    mov x2, x21
    mov x8, 64
    svc 0

    ldp x21, x22, [sp], #16
    ldp x19, x20, [sp], #16
    ldp x29, x30, [sp], #16
    ret

.moda_no_array:
    b .moda_exit

.moda_empty:
    b .moda_exit

.moda_no_data:
    b .moda_exit

.moda_exit:
    ldp x25, x26, [sp], #16
    ldp x23, x24, [sp], #16
    ldp x21, x22, [sp], #16
    ldp x19, x20, [sp], #16
    ldp x29, x30, [sp], #16
    ret

.section .data
moda_result_msg:
    .ascii "Moda: "

.section .bss
char_buffer:
    .space 2
number_buffer:
    .space 20
temp_digits:
    .space 20
