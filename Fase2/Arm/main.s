/*
    main.s - Main TUI con manejo de subarreglo filtrado (data_array_limits)
*/

.global _start
.global while
.global data_array
.global data_array_size
.global print
.global read
.global Sub_Menu
.global data_array_limits
.global data_array_limits_size
.global menuPredicciones

.extern atoi
.extern load_data

.section .text

_start:
    ldr x1, =welcome_message   // Load address of welcome message
    mov x2, 33                 // Length of welcome message
    bl print                    // Call print function    

// Main loop of the TUI application
while:
    ldr x1, =menu_options      // Load address of menu options
    mov x2, 64                 // Length of menu options
    bl print                    // Call print function

    ldr x1, =choose_option     // Load address of choose option message
    mov x2, 26                 // Length of choose option message
    bl print                    // Call print function

    bl read                     // Read user input
    ldr x0, =buffer             // Load address of buffer
    bl atoi                     // Convert input string to integer

    cmp x0, 1                   // Compare input with 1 (statistics option)
    beq llamar_Estadistica

    cmp x0, 2                   // Compare input with 2 (predictions option)
    beq llamarPrediccion             // If input is 2, go to predictions

    cmp x0, 3                   // Compare input with 3 (set file option)
    beq set_file

    cmp x0, 4                   // Compare input with 4 (set limits option)
    beq set_limits

    cmp x0, 5                   // Compare input with 5 (exit option)
    beq end
    b while


//menu predicciones
llamarPrediccion:
    b menuPredicciones

//llamar a funciones externas
llamar_Estadistica:
    b Sub_Menu

// Function to handle set file option
set_file:
    ldr x1, =set_file_message  // Load address of set file message
    mov x2, 45                 // Length of set file message
    bl print
    bl read                     // Read user input for file name
    ldr x0, =buffer             // Load address of buffer
    bl load_data                // Load data from the file specified in buffer

print:
    mov x0, 1                   // File descriptor for stdout
    mov x8, 64                  // syscall number for write
    svc 0
    ret

read:
    mov x0, 0                   // File descriptor for stdin
    ldr x1, =buffer             // Address of the buffer to read into
    mov x2, 256                 // Size of the buffer
    mov x8, 63                  // syscall number for read
    svc 0
    ret

end:
    mov x0, 0                   // Exit code
    mov x8, 93                  // syscall number for exit
    svc 0


//////////////////////////Predicciones Menu ////////////////////////
menuPredicciones:
    mov x27,x30
    ldr x1, =predictionOptions
    mov x2, 38
    bl print

    ldr x1,=choose_option
    mov x2, 26
    bl print
    ldr x1, = buffer
    mov x2, 8
    bl read
    ldr x0, =buffer
    bl atoi

    cmp x0, 1
    beq llamarSuavizado
    
    cmp x0, 2
    beq llamar_Mediana
    
    cmp x0,3
    beq while

    b menuPredicciones

////////////////////////////Sub Menu///////////////////////////////

Sub_Menu:
    mov x27, x30 //guardando la direccion
    ldr x1, =Sub_menu_options
    mov x2, 103              // longitud del menu_options
    bl print
    ldr x1, =choose_option
    mov x2, 26
    bl print
    ldr x1, =buffer
    mov x2, 8
    bl read
    ldr x0, =buffer
    bl atoi
    // 1. valor mínimo
     cmp x0, 1
     beq llamarMinimo
    // 2. valor máximo
     cmp x0, 2
     beq llamarMax
    // 3. media
    cmp x0, 3
    beq llamar_Media
    // 4. valor mínimo    
    cmp x0, 4
    beq llamar_Mediana
    // 5. Moda
    cmp x0, 5
    beq llamar_Moda

    // 6. Varianza
    cmp x0, 6  
    beq llamarVarianza

    cmp x0, 8
    beq llamarFunciones

    // 9. regresar
    cmp x0, 9
    beq while


    b Sub_Menu

llamarMinimo:
    bl minMain
    b Sub_Menu


llamarMax:
    bl maxMain
    b Sub_Menu

llamar_Media:
    bl mediaMain
    b Sub_Menu

llamar_Mediana:
    bl medianaMain
    b Sub_Menu

llamar_Moda:
    bl moda
    b Sub_Menu

llamarVarianza:
    bl varianza
    b Sub_Menu


//llamada de predicciones
llamarSuavizado:

    bl suavizadoMain
    b menuPredicciones


llamarFunciones:
    
    bl media
    bl medianaMain
    bl moda
    bl varianza
    b Sub_Menu

end_menu:
    mov x30, x27
    ret

// Opción de establecer límites
set_limits:
    // Solicita límite inferior
    ldr x1, =set_limit_start_msg
    mov x2, 39
    bl print

    bl read
    ldr x0, =buffer
    bl atoi
    mov x24, x0             // x24 = inicio

    // Solicita límite superior
    ldr x1, =set_limit_end_msg
    mov x2, 39
    bl print

    bl read
    ldr x0, =buffer
    bl atoi
    mov x25, x0             // x25 = fin (exclusivo)

    // Si ambos son cero, restaurar el arreglo original a los límites
    cmp x24, 0
    bne .do_limits
    cmp x25, 0
    bne .do_limits

.copia_todo:
    ldr x0, =data_array
    ldr x1, [x0]
    ldr x0, =data_array_limits
    str x1, [x0]

    ldr x0, =data_array_size
    ldr x1, [x0]
    ldr x0, =data_array_limits_size
    str x1, [x0]

    b while

.do_limits:
    // Validar límites
    ldr x0, =data_array
    ldr x1, [x0]                 // Base del arreglo original
    ldr x0, =data_array_size
    ldr x2, [x0]                 // Tamaño total

    // x24 >= 0, x25 >= x24, x25 <= x2
    cmp x24, 0
    blt .limite_error
    cmp x25, x24
    blt .limite_error
    cmp x25, x2
    bgt .limite_error

    // Nuevo tamaño
    sub x3, x25, x24        // x3 = tamaño nuevo
    
    // Si el tamaño es 0, crear un puntero nulo
    cmp x3, 0
    beq .limite_vacio
    
    mov x4, 8
    mul x5, x3, x4          // x5 = bytes a reservar

    // Guardar la dirección base del arreglo original antes de mmap
    mov x20, x1             // x20 = dirección base del arreglo original

    // mmap para el subarreglo
    mov x0, 0
    mov x1, x5
    mov x2, 3
    mov x3, 0x22
    mov x4, -1
    mov x5, 0
    mov x8, 222
    svc 0
    mov x6, x0              // x6 = dirección subarreglo nuevo

    // Verificar si mmap falló
    cmn x6, #1
    beq .limite_error

    mov x7, x24             // inicio
    mov x8, 0               // índice en subarreglo
.copiar_sub:
    cmp x7, x25
    beq .fin_copia
    ldr x9, [x20, x7, lsl #3]  // Usar x20 en lugar de x1
    str x9, [x6, x8, lsl #3]
    add x7, x7, 1
    add x8, x8, 1
    b .copiar_sub

.fin_copia:
    ldr x0, =data_array_limits
    str x6, [x0]
    ldr x0, =data_array_limits_size
    sub x8, x25, x24
    str x8, [x0]
    b while

.limite_vacio:
    // Para rangos vacíos, establecer puntero nulo y tamaño 0
    ldr x0, =data_array_limits
    mov x1, 0
    str x1, [x0]
    ldr x0, =data_array_limits_size
    mov x1, 0
    str x1, [x0]
    b while

.limite_error:
    ldr x1, =set_limit_error_msg
    mov x2, 31
    bl print
    b while

// Strings for the TUI application
.section .data
welcome_message:
    .ascii "\nWelcome to the TUI application!\n"
menu_options:
    .ascii "\n1. Statistics\n2. Predictions\n3. Set File\n4. Set Limits\n5. Exit\n"
choose_option:
    .ascii "\nPlease choose an option: "
set_file_message:
    .ascii "\nSet the name of the file to load data from: "
newline:
    .ascii "aaaaaaaaaaaaaaaaaaaaaaaa\n"
set_limit_start_msg:
    .ascii "\nIngrese el índice inicial (desde 0): "
set_limit_end_msg:
    .ascii "\nIngrese el índice final (exclusivo): "
set_limit_error_msg:
    .ascii "Límites inválidos. Intente de nuevo.\n"
Sub_menu_options:
    .ascii "\n1. Valor Min\n2. Valor Max\n3. Media\n4. Mediana\n5. Moda\n6. Varianza\n7. Suavizado Exp\n8. Todas\n9. Regresar"
predictionOptions:
    .ascii "\n1. Suavizado \n2. Media M\n3. Regresar "



// Buffer for user input
.section .bss
buffer:
    .space 256
file_name:
    .space 32

.section .bss
    .align 3
data_array:                     
    .skip 8
data_array_size:
    .skip 8
data_array_limits:          // Puntero al subarreglo limitado
    .skip 8
data_array_limits_size:     // Tamaño del subarreglo limitado
    .skip 8
