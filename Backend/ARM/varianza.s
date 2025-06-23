.global _start

.bss
buffer: .skip 2048
output: .skip 32

.data
filename: .asciz "datos.txt"   // <-- Cambia aquí el nombre de tu archivo

.text
_start:
    // Abrir archivo con nombre fijo
    mov x9, #-100            // AT_FDCWD
    ldr x10, =filename       // puntero a filename
    mov x11, #0              // O_RDONLY
    mov x12, #56             // syscall: openat
    mov x0, x9
    mov x1, x10
    mov x2, x11
    mov x8, x12
    svc #0
    mov x13, x0              // file descriptor

    // Leer archivo
    mov x0, x13
    ldr x1, =buffer
    mov x2, #2048
    mov x8, #63              // syscall: read
    svc #0
    mov x14, x0              // bytes leídos

    // Cerrar archivo
    mov x0, x13
    mov x8, #57              // syscall: close
    svc #0

    // Procesamiento igual que antes...
    ldr x15, =buffer        // x15: inicio de buffer
    mov x16, #0             // índice
    mov x17, #0             // número actual
    mov x18, #0             // suma
    mov x19, #0             // suma de cuadrados
    mov x20, #0             // contador de números
    mov x12, #10            // base 10

parse_loop:
    cmp x16, x14
    bge final_number_or_exit
    ldrb w11, [x15, x16]
    cmp w11, #'$'
    beq final_number_or_exit
    cmp w11, #10
    beq process_number
    subs x10, x11, #'0'
    blt skip_char
    cmp x10, #9
    bgt skip_char
    mul x17, x17, x12
    add x17, x17, x10
    add x16, x16, #1
    b parse_loop

skip_char:
    add x16, x16, #1
    b parse_loop

process_number:
    add x20, x20, #1
    add x18, x18, x17
    mul x10, x17, x17
    add x19, x19, x10
    mov x17, #0
    add x16, x16, #1
    b parse_loop

final_number_or_exit:
    cmp x17, #0
    beq compute_stats
    add x20, x20, #1
    add x18, x18, x17
    mul x10, x17, x17
    add x19, x19, x10
    mov x17, #0

compute_stats:
    cmp x20, #0
    beq print_result

    // Promedio = suma / n
    udiv x11, x18, x20      // x11: average
    // Promedio de cuadrados = suma_cuadrados / n
    udiv x12, x19, x20      // x12: average_sq
    // Varianza = average_sq - (average * average)
    mul x13, x11, x11
    sub x24, x12, x13       // x24: varianza

    // Conversión a texto e impresión (igual que antes)
    ldr x15, =output
    mov x16, x24
    mov x17, #10
    mov x18, #0

    cmp x16, #0
    bne get_size
    mov w19, #'0'
    strb w19, [x15]
    mov w19, #10
    strb w19, [x15, #1]
    mov x2, #2
    b print_result

get_size:
    mov x19, x16
get_size_loop:
    udiv x20, x19, x17
    add x18, x18, #1
    cmp x20, #0
    mov x19, x20
    bne get_size_loop
    add x15, x15, x18
    mov w19, #10
    strb w19, [x15]
    sub x15, x15, #1
    add x18, x18, #1
    mov x19, x16
    mov x20, #0

get_digit:
    udiv x10, x19, x17
    msub x11, x10, x17, x19
    add x20, x20, #1
    strb w11, [x15]
    sub x15, x15, #1
    mov x19, x10
    cmp x19, #0
    bne get_digit
    add x15, x15, #1

setascii:
    ldrb w12, [x15]
    add w12, w12, #'0'
    strb w12, [x15]
    add x15, x15, #1
    sub x20, x20, #1
    cmp x20, #0
    bne setascii
    mov x2, x18

print_result:
    mov x0, #1
    ldr x1, =output
    mov x8, #64
    svc #0

exit:
    mov x0, #0
    mov x8, #93
    svc #0
