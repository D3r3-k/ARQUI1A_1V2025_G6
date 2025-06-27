.section .data
newline:
    .ascii "\n"
mi_arreglo:
    .quad 25, 80, 95, 105, 200, 690, 10, 20
.section .text
.global medianaMain
.global mediana
.extern print_number
.extern bubble_sort
.extern Sub_Menu
.extern data_array
.extern data_array_size
.extern data_array_limits
.extern data_array_limits_size
medianaMain:
    mov x26, x30                // Guardar dirección de retorno
    ldr x1, =data_array_limits         // puntero al arreglo
    ldr x1, [x1]
    ldr     x2, =data_array_limits_size  // ← dirección del entero
    ldr     w2, [x2]
    bl bubble_sort              // Ordenar arreglo
    // Calcular mediana
    bl mediana
    bl print_number
    // Imprimir salto de línea
    ldr x1, =newline
    mov x2, 1
    mov x0, 1
    mov x8, 64
    svc 0
//    b Sub_Menu ///////////////
    mov x30, x26
    ret
// -------------------------------------------------
// Función: mediana
// Entrada: x1 = puntero arreglo, w2 = tamaño
// Salida:  x0 = valor mediana
// -------------------------------------------------
mediana:
    cbz w2, .empty
    lsr w3, w2, 1               // w3 = w2 / 2
    and w4, w2, 1               // w4 = w2 % 2
    cbnz w4, .odd_size          // Si es impar, saltar
    // Caso par: promedio de dos valores centrales
    sub w5, w3, 1
    uxtw x3, w3
    uxtw x5, w5
    ldr x6, [x1, x5, lsl #3]    // valor1
    ldr x7, [x1, x3, lsl #3]    // valor2
    add x8, x6, x7
    lsr x0, x8, 1               // resultado = promedio
    b   .done                   // Evitar caer en .odd_size
.odd_size:
    uxtw x3, w3
    ldr x0, [x1, x3, lsl #3]
    b   .done
.empty:
    mov x0, 0
.done:
    ret
