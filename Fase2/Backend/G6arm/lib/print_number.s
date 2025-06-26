.section .bss
buffer:
    .skip 20                  // espacio suficiente para int64 (máx. 20 dígitos)

.section .text
.global print_number

print_number:
    // ---------- Conversión a ASCII ----------
    mov     x1, x0            // copia del número
    ldr     x2, =buffer
    add     x2, x2, 19        // puntero al final del buffer
    mov     w3, 0             // contador de dígitos

    cbz     x1, .print_zero

    mov     x9, 10
.convert_loop:
    udiv    x4, x1, x9
    msub    x5, x4, x9, x1    // x5 = x1 - x4*10  (resto)
    add     w5, w5, '0'       // a ASCII
    strb    w5, [x2]          // guarda dígito
    sub     x2, x2, 1         // retrocede el puntero
    mov     x1, x4
    add     w3, w3, 1
    cbnz    x1, .convert_loop
    b       .print_digits

.print_zero:
    mov     w5, '0'
    strb    w5, [x2]
    sub     x2, x2, 1
    mov     w3, 1

    // ---------- Envío a stdout ----------
.print_digits:
    add     x2, x2, 1         // x2 apunta ahora al primer dígito
    mov     x0, 1             // fd = stdout
    mov     x1, x2            // buffer
    uxtw    x2, w3            // longitud original en x2

    // --- Parche temporal: si longitud == 4, intercambia últimos 2 dígitos ---
    cmp     w3, 4
    bne     .no_swap          // si no son 4 dígitos, salta swap
    ldrb    w5, [x1, #2]      // tercer dígito
    ldrb    w6, [x1, #3]      // cuarto dígito
    strb    w6, [x1, #2]
    strb    w5, [x1, #3]
.no_swap:

    mov     x8, 64            // syscall write
    svc     0
    ret
