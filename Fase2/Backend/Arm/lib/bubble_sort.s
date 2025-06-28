    .text
    .global bubble_sort

bubble_sort:
    // x1 = puntero al arreglo
    // w2 = longitud (número de elementos)
    cmp w2, #1
    ble sort_done

    mov w9, w2          // Guarda tamaño original en w9
    sub w2, w2, #1      // tamaño - 1 para el ciclo exterior
    mov w10, #0         // i = 0

outer_loop:
    mov w11, #0         // j = 0

    sub w12, w9, w10    // límite interno: tamaño_original - i
    sub w12, w12, #1    // límite interno: tamaño_original - i - 1

inner_loop:
    lsl w5, w11, #3     // offset = j * 8 (tamaño quad)
    uxtw x5, w5
    add x6, x1, x5      // dirección arreglo[j]

    ldr x3, [x6]        // arreglo[j]
    ldr x4, [x6, #8]    // arreglo[j+1]

    cmp x3, x4
    ble no_swap

    str x4, [x6]
    str x3, [x6, #8]

no_swap:
    add w11, w11, #1
    cmp w11, w12
    blt inner_loop

    add w10, w10, #1
    cmp w10, w2
    blt outer_loop

    mov w2, w9          // Restaurar tamaño original

sort_done:
    ret
