
.global atoi
.section .text

atoi:
        mov x1, #0              // Inicializar el resultado a 0
        mov x2, x0              // x0 contiene la dirección de la cadena
        mov x5, #10             // x5 es 10, la base del sistema decimal
.loop:
        ldrb w3, [x2], 1        // Cargar un byte de la cadena y avanzar el puntero
        cmp w3, #'\n'           // Verificar si es el final de la cadena
        b.eq .fin               // Si es un salto de línea, terminar

        cmp w3, #'0'            // Verificar si el carácter es '0'
        b.lt .fin               // Si es menor que '0', terminar
        cmp w3, #'9'            // Verificar si el carácter es '9'
        b.gt .fin               // Si es mayor que '9', terminar

        mov x4, x1              // Guarda el resultado actual en x4
        mul x1, x4, x5          // resultado = resultado * 10
        sub w3, w3, #'0'        // Convierte ASCII a entero
        add x1, x1, x3          // resultado = resultado + (w3 - '0')
        b .loop                 // Repite el ciclo para el siguiente carácter

.fin:
        mov x0, x1              // Mover el resultado final a x0
        ret
