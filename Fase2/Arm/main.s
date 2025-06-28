/*
    main.s - Main TUI con manejo de subarreglo filtrado y todas las estadísticas
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

.extern atoi
.extern load_data
.extern export_xml
.extern suavizadoMain

.section .text

_start:
    ldr x1, =welcome_message   // Load address of welcome message
    mov x2, 28                 // Length of welcome message
    bl print                    // Call print function    

// Main loop of the TUI application
while:
    ldr x1, =menu_options      // Load address of menu options
    mov x2, 76                 // Length of menu options
    bl print                    // Call print function

    ldr x1, =choose_option     // Load address of choose option message
    mov x2, 19                // Length of choose option message
    bl print                    // Call print function

    bl read                     // Read user input
    ldr x0, =buffer             // Load address of buffer
    bl atoi                     // Convert input string to integer

    // Si el valor es 1 al
    cmp x0, 1                   // Compare input with 1 (statistics option)
    beq llamar_Estadistica

    cmp x0, 2                   // Compare input with 2 (predictions option)
    beq predictions             // If input is 2, go to predictions

    cmp x0, 3                   // Compare input with 3 (set file option)
    beq set_file

    cmp x0, 4                   // Compare input with 4 (set limits option)
    beq set_limits

    cmp x0, 5                   // Compare input with 5 (export XML option)
    beq exportar_xml

    cmp x0, 6                   // Compare input with 6 (exit option)
    beq end

    // Opcion invalida
    ldr x1, =invalid_option_msg
    mov x2, 17
    bl print
    b while

// Menu de predicciones
predictions:
    ldr x1, =predictions_menu   // Load address of predictions menu
    mov x2, 53                  // Length of predictions menu
    bl print

    ldr x1, =choose_option      // Load address of choose option message
    mov x2, 19                  // Length of choose option message
    bl print

    bl read                     // Read user input
    ldr x0, =buffer             // Load address of buffer
    bl atoi                     // Convert input string to integer

    cmp x0, 1                   // Compare input with 1 (suavizado exponencial)
    beq llamar_Suavizado

    cmp x0, 2                   // Compare input with 2 (media movil)
    beq media_movil

    cmp x0, 3                   // Compare input with 3 (regresar)
    beq while

    // Opcion invalida
    ldr x1, =invalid_option_msg
    mov x2, 17
    bl print
    b predictions



//llamar a funciones externas
llamar_Estadistica:
    b Sub_Menu

// Function to handle set file option
set_file:
    ldr x1, =set_file_message  // Load address of set file message
    mov x2, 32                 // Length of set file message
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
    // Mensaje de despedida
    ldr x1, =goodbye_msg
    mov x2, 30
    bl print
    
    mov x0, 0                   // Exit code
    mov x8, 93                  // syscall number for exit
    svc 0

 // Exportar XML con TODOS los valores calculados
exportar_xml:
    ldr x0, =resultado_media
    ldr x0, [x0]                // media calculada (o -1)
    ldr x1, =resultado_mediana
    ldr x1, [x1]                // mediana calculada (o -1)
    ldr x2, =resultado_moda
    ldr x2, [x2]                // moda calculada (o -1)
    ldr x3, =resultado_min
    ldr x3, [x3]                // mínimo calculado (o -1)
    ldr x4, =resultado_max
    ldr x4, [x4]                // máximo calculado (o -1)
    ldr x5, =resultado_varianza
    ldr x5, [x5]                // varianza calculada (o -1)
    ldr x6, =data_array_limits_size
    ldr x6, [x6]                // total datos procesados
    bl export_xml
    // Verificar resultado
    cmp x0, #0
    b.eq xml_ok
    
    // Error en XML (opcional)
    b while                     // Regresar al menú principal

xml_ok:
    ldr x1, =xml_success_msg
    mov x2, 28
    bl print
    b while                     // Regresar al menú principal

exit_program:
    mov x0, 0                   // Exit code
    mov x8, 93                  // syscall number for exit
    svc 0

////////////////////////////Sub Menu///////////////////////////////

Sub_Menu:
    mov x27, x30 //guardando la direccion
    ldr x1, =Sub_menu_options
    mov x2, 93
    bl print
    ldr x1, =choose_option
    mov x2, 19
    bl print
    ldr x1, =buffer
    mov x2, 8
    bl read
    ldr x0, =buffer
    bl atoi
    // Si el valor es 1 al 9
    cmp x0, 1
    beq llamar_Min
    cmp x0, 2
    beq llamar_Max
    cmp x0, 3
    beq llamar_Media
    cmp x0, 4
    beq llamar_Mediana
    cmp x0, 5
    beq llamar_Moda
    cmp x0, 6
    beq llamar_Varianza
    // cmp x0, 7
    // beq llamar_DesviacionE
    cmp x0, 8
    beq llamar_Todos
    cmp x0, 9
    beq while

    // Opcion invalida
    ldr x1, =invalid_option_msg
    mov x2, 17
    bl print
    b Sub_Menu

llamar_Todos:
    // Calcular y guardar mínimo
    bl minMain
    mov x10, x0
    ldr x1, =resultado_min
    str x10, [x1]
    ldr x1, =min_calculado
    mov x2, #1
    strb w2, [x1]
    
    // Calcular y guardar máximo
    bl maxMain
    mov x10, x0
    ldr x1, =resultado_max
    str x10, [x1]
    ldr x1, =max_calculado
    mov x2, #1
    strb w2, [x1]
    
    // Calcular y guardar media
    bl mediaMain
    mov x10, x0
    ldr x1, =resultado_media
    str x10, [x1]
    ldr x1, =media_calculada
    mov x2, #1
    strb w2, [x1]
    
    // Calcular y guardar mediana
    bl medianaMain
    mov x10, x0
    ldr x1, =resultado_mediana
    str x10, [x1]
    ldr x1, =mediana_calculada
    mov x2, #1
    strb w2, [x1]
    
    // Calcular y guardar moda
    bl moda
    mov x10, x0
    ldr x1, =resultado_moda
    str x10, [x1]
    ldr x1, =moda_calculada
    mov x2, #1
    strb w2, [x1]
    
    // Calcular y guardar varianza
    bl varianza
    mov x10, x0
    ldr x1, =resultado_varianza
    str x10, [x1]
    ldr x1, =varianza_calculada
    mov x2, #1
    strb w2, [x1]
    
    // Calcular y guardar suavizado
    bl suavizadoMain
    mov x10, x0
    ldr x1, =resultado_suavizado
    str x10, [x1]
    ldr x1, =suavizado_calculado
    mov x2, #1
    strb w2, [x1]

    b Sub_Menu

// Nuevas funciones para mínimo y máximo
llamar_Min:
    bl minMain
    // Preservar x0 inmediatamente
    mov x10, x0                 // x10 = resultado mínimo
    // Guardar desde x10, no desde x0
    ldr x1, =resultado_min
    str x10, [x1]               // guardar desde x10
    ldr x1, =min_calculado
    mov x2, #1
    strb w2, [x1]               // marcar como calculado
    b Sub_Menu

llamar_Max:
    bl maxMain
    // Preservar x0 inmediatamente
    mov x10, x0                 // x10 = resultado máximo
    // Guardar desde x10, no desde x0
    ldr x1, =resultado_max
    str x10, [x1]               // guardar desde x10
    ldr x1, =max_calculado
    mov x2, #1
    strb w2, [x1]               // marcar como calculado
    b Sub_Menu

llamar_Media:
    bl mediaMain
    // Guardar x0 INMEDIATAMENTE en un registro seguro
    mov x10, x0                 // x10 = resultado media
    // AHORA guardar desde x10
    ldr x1, =resultado_media
    str x10, [x1]               // guardar desde x10, no x0
    ldr x1, =media_calculada
    mov x2, #1
    strb w2, [x1]               // marcar como calculado
    b Sub_Menu

llamar_Mediana:
    bl medianaMain
    // GUARDAR resultado real de mediana
    ldr x1, =resultado_mediana
    str x0, [x1]                // guardar valor calculado
    ldr x1, =mediana_calculada
    mov x2, #1
    strb w2, [x1]               // marcar como calculado
    b Sub_Menu

llamar_Moda:
    bl moda
    // GUARDAR resultado real de moda
    ldr x1, =resultado_moda
    str x0, [x1]                // guardar valor calculado
    ldr x1, =moda_calculada
    mov x2, #1
    strb w2, [x1]               // marcar como calculado
    b Sub_Menu

llamar_Varianza:
    bl varianza                 // Asume que tienes una función varianza
    ldr x1, =resultado_varianza
    str x0, [x1]                // guardar valor calculado
    ldr x1, =varianza_calculada
    mov x2, #1
    strb w2, [x1]               // marcar como calculado
    b Sub_Menu
    
// Funciones de predicciones (pendientes de implementar)
llamar_Suavizado:
    bl suavizadoMain
    mov x10, x0
    ldr x1, =resultado_suavizado
    str x10, [x1]
    ldr x1, =suavizado_calculado
    mov x2, #1
    strb w2, [x1]
    
    b predictions

media_movil:
    // Media móvil = misma media estadística
    bl mediaMain
    mov x10, x0                 // x10 = resultado media
    // AHORA guardar desde x10
    ldr x1, =resultado_media
    str x10, [x1]               // guardar desde x10, no x0
    ldr x1, =media_calculada
    mov x2, #1
    strb w2, [x1]               // marcar como calculado
    b predictions
end_menu:
    mov x30, x27
    ret

// Opción de establecer límites
set_limits:
    // Solicita límite inferior
    ldr x1, =set_limit_start_msg
    mov x2, 38
    bl print

    bl read
    ldr x0, =buffer
    bl atoi
    mov x24, x0             // x24 = inicio

    // Solicita límite superior
    ldr x1, =set_limit_end_msg
    mov x2, 38
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
    mov x2, 38
    bl print
    b while

// Strings for the TUI application
.section .data
welcome_message:
    .ascii "\nBienvenido a Siepa TUI APP\n"
menu_options:
    .ascii "\n1. Estadisticas\n2. Predicciones\n3. Leer archivo\n4. Limites\n5. XML\n6. Salir\n"
predictions_menu:
    .ascii "\n1. Suavizado Exponencial\n2. Media Movil\n3. Regresar\n"
choose_option:
    .ascii "\nElija una opcion: "
invalid_option_msg:
    .ascii "\nOpcion invalida\n"
not_implemented_msg:
    .ascii "\nFuncion no implementada\n"
set_file_message:
    .ascii "\nIngrese el nombre del archivo: "
newline:
    .ascii "aaaaaaaaaaaaaaaaaaaaaaaa\n"
set_limit_start_msg:
    .ascii "\nIngrese el índice inicial (desde 0): "
set_limit_end_msg:
    .ascii "\nIngrese el índice final (exclusivo): "
set_limit_error_msg:
    .ascii "\nLímites inválidos. Intente de nuevo.\n"
Sub_menu_options:
    .ascii "\n1. Min\n2. Max\n3. Media\n4. Mediana\n5. Moda\n6. Varianza\n7. Desv Estandar\n8. Todas\n9. Regresar\n"

// Variables para guardar TODOS los resultados calculados
resultado_media:
    .quad -1                    // -1 = no calculado
resultado_mediana:
    .quad -1                    // -1 = no calculado
resultado_moda:
    .quad -1                    // -1 = no calculado
resultado_min:
    .quad -1                    // -1 = no calculado
resultado_max:
    .quad -1                    // -1 = no calculado
resultado_varianza:
    .quad -1                    // -1 = no calculado
resultado_suavizado:
    .quad -1                    // -1 = no calculado

// Flags para saber qué se ha calculado
media_calculada:
    .byte 0                     // 0 = no calculado, 1 = calculado
mediana_calculada:
    .byte 0                     // 0 = no calculado, 1 = calculado
moda_calculada:
    .byte 0                     // 0 = no calculado, 1 = calculado
min_calculado:
    .byte 0                     // 0 = no calculado, 1 = calculado
max_calculado:
    .byte 0                     // 0 = no calculado, 1 = calculado
varianza_calculada:
    .byte 0                     // 0 = no calculado, 1 = calculado
suavizado_calculado:
    .byte 0                     // 0 = no calculado, 1 = calculado

goodbye_msg:
    .ascii "\nGenerando XML y saliendo...\n"
xml_success_msg:
    .ascii "\nXML exportado exitosamente\n"

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
