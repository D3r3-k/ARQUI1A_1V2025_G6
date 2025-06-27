// lib/atoi_parcial.s
.global atoi_parcial

.section .text

atoi_parcial:
    mov x1, #0              // x1: resultado
    mov x2, x0              // x2: puntero a la cadena (x0 recibe la dirección)
    mov x5, #10             // base decimal

.loop:
    ldrb w3, [x2], #1       // Lee un byte y avanza el puntero
    cmp w3, #0              // Si es caracter nulo, termina
    beq .fin
    cmp w3, #'\n'           // Si es salto de línea, termina
    beq .fin

    cmp w3, #'0'            // ¿Es un dígito?
    blt .fin
    cmp w3, #'9'
    bgt .fin

    mov x4, x1              // Multiplica resultado actual por 10
    mul x1, x4, x5

    sub w3, w3, #'0'        // Convierte ASCII a valor numérico
    add x1, x1, x3          // Suma al resultado

    b .loop

.fin:
    mov x0, x1              // Devuelve resultado en x0
    ret
