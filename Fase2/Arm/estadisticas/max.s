.section .data
newline:
    .ascii "\n"
no_data_msg:
    .ascii "No data available\n"

.section .text
.global maxMain
.global max
.extern print_number
.extern Sub_Menu
.extern data_array_limits
.extern data_array_limits_size

maxMain:
    // Guardar dirección de retorno
    mov x26, x30                
    
    // Cargar puntero al arreglo y su tamaño
    ldr x1, =data_array_limits         
    ldr x1, [x1]                // x1 = puntero al arreglo
    ldr x2, =data_array_limits_size  
    ldr w2, [x2]                // w2 = tamaño del arreglo (32-bit is fine for size)
    
    // Verificar si el arreglo está vacío
    cbz w2, .no_data
    
    // Calcular máximo
    bl max
    
    // Imprimir resultado
    bl print_number
    
    // Imprimir salto de línea
    mov x0, 1
    ldr x1, =newline
    mov x2, 1
    mov x8, 64
    svc 0
    
    // Restaurar dirección de retorno y volver al submenú
    mov x30, x26
    b Sub_Menu

.no_data:
    // Mostrar mensaje de error si no hay datos
    mov x0, 1
    ldr x1, =no_data_msg
    mov x2, 18
    mov x8, 64
    svc 0
    
    // Restaurar dirección de retorno y volver al submenú
    mov x30, x26
    b Sub_Menu

// -------------------------------------------------
// Función: max
// Entrada: x1 = puntero arreglo, w2 = tamaño
// Salida:  x0 = valor máximo
// -------------------------------------------------
max:
    // Verificar si el arreglo está vacío
    cbz w2, .empty_array
    
    // Inicializar máximo con el primer elemento
    ldr x0, [x1]                // x0 = primer elemento
    cbz w2, .done               // Si solo hay un elemento, retornar
    
    mov x3, 1                   // x3 = índice actual (use 64-bit register)
    
.max_loop:
    cmp x3, x2                  // Compare index with size (x2 is zero-extended)
    beq .done                   // Si llegamos al final, terminar
    
    ldr x4, [x1, x3, lsl #3]    // Cargar elemento actual (use x3 for offset)
    cmp x4, x0
    ble .no_update              // Si no es mayor, saltar
    mov x0, x4                  // Actualizar máximo
    
.no_update:
    add x3, x3, 1               // Incrementar índice
    b .max_loop

.empty_array:
    mov x0, 0                   // Retornar 0 si el arreglo está vacío
    
.done:
    ret
