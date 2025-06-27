.global suavizadoMain
.extern print_number
.global imprimir_resultado_float

.section .data
resultadoSuavizado: .asciz "El Suavizado es: "
vacio: .asciz "no hay datos.."
newline: .asciz "\n"
alpha: .double 0.3                // Factor de suavizado

.section .bss

.section .text

suavizadoMain:
    stp x29, x30, [sp, #-16]!       // Guardar frame pointer y link register
    mov x29, sp

    // Cargar base del arreglo en x0
    ldr x0, =data_array_limits
    ldr x0, [x0]

    // Copiar puntero a x19 para recorrer arreglo
    mov x19, x0

    // Cargar tamaño del arreglo en x20
    ldr x20, =data_array_limits_size
    ldr x20, [x20]

    cbz x20, arregloVacio

    // Cargar primer dato (x19 avanza)
    ldr x1, [x19], #8

    // Cargar alpha
    ldr x5, =alpha
    ldr d1, [x5]

    // Convertir primer dato a float
    scvtf d2, x1

    // Imprimir primer valor suavizado
    mov x21, #0              // contador impresiones
    bl imprimir_resultado_float
    add x21, x21, #1

    mov x22, #1              // índice para loop

suavizado_loop:
    cmp x22, x20
    b.ge salir

    // Cargar siguiente dato
    ldr x3, [x19], #8

    scvtf d3, x3

    // Calcular suavizado exponencial:
    fmov d4, #1.0
    fsub d4, d4, d1
    fmul d3, d3, d1
    fmul d2, d2, d4
    fadd d2, d2, d3

    // Imprimir solo primeros 5 resultados
    cmp x21, #5
    b.ge no_imprimir

    bl imprimir_resultado_float
    add x21, x21, #1

no_imprimir:
    add x22, x22, #1
    b suavizado_loop

arregloVacio:
    mov x0, #1
    ldr x1, =vacio
    mov x2, #15
    mov x8, #64
    svc #0
    b salir

salir:
    
    mov x0, #0
    mov x8, #93
    svc #0

imprimir_resultado_float:
    fcvtzs x0, d2
    bl print_number

    // Imprimir salto de línea
    mov x0, #1
    ldr x1, =newline
    mov x2, #1
    mov x8, #64
    svc #0

    ret
