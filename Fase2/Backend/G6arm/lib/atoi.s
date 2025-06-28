/*

    Este archivo es parte del proyecto TUI.
    Contiene la implementación de la función atoi, que convierte una representación
    de cadena de un entero a su valor entero real.
    Lee caracteres de la cadena, verifica si son dígitos y acumula
    el resultado multiplicando el resultado actual por 10 y sumando el nuevo dígito.
    La función deja de procesar cuando encuentra un carácter que no es dígito o el final de la cadena.

*/

/* 

    Uso de registros:
    x0  - puntero a la cadena a convertir
    x1  - resultado (acumulador para el valor entero)
    x2  - puntero al carácter actual en la cadena
    w3  - carácter actual (byte) que se está procesando
    x4  - registro temporal para el resultado actual
    x5  - valor constante 10 para la multiplicación

*/


.global atoi                // Función para convertir una cadena a un entero

.section .text  
atoi:
    mov x1, 0               // Inicializa el resultado en 0
    mov x2, x0              // x0 contiene la dirección de la cadena a convertir 
    mov x5, 10              // Carga 10 en x5  
.atoi_loop:
    ldrb w3, [x2], 1        // Carga un byte de la cadena e incrementa el puntero
    cmp w3, #'0'            // Verifica si el carácter es '0'
    blt .atoi_done          // Si es menor que '0', termina
    cmp w3, #'9'            // Verifica si el carácter es '9'    
    bgt .atoi_done          // Si es mayor que '9', termina

    // Convierte el carácter ASCII a entero
    // resultado = resultado * 10 + (w3 - '0')
    mov x4, x1              // Guarda el resultado actual en x4
    mul x1, x4, x5          // resultado = resultado * 10
    sub w3, w3, #'0'        // Convierte ASCII a entero
    add x1, x1, x3          // resultado = resultado + (w3 - '0')
    b .atoi_loop            // Repite el ciclo para el siguiente carácter

.atoi_done:
    mov x0, x1
    ret

