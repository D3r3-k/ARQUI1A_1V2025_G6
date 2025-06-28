// Función simple para imprimir solo el tamaño del array
.section .data
size_msg: .ascii "Tamano: "
newline: .ascii "\n"

.section .text
.global print_array_size
.extern print_number
.extern data_array_limits_size

print_array_size:
        stp     x29, x30, [sp, #-16]!
        mov     x29, sp
        
        // Imprimir "Tamano: "
        mov     x0, #1
        ldr     x1, =size_msg
        mov     x2, #8
        mov     x8, #64
        svc     #0
        
        // Imprimir el número
        ldr     x0, =data_array_limits_size
        ldr     x0, [x0]
        bl      print_number
        
        // Imprimir salto de línea
        mov     x0, #1
        ldr     x1, =newline
        mov     x2, #1
        mov     x8, #64
        svc     #0
        
        ldp     x29, x30, [sp], #16
        ret
