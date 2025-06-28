//x28 para guardar el registro de x30 y volver al main
.section .data
menu_options:
    .ascii "\n1. Valor Min\n2. Valor Max\n3. Media\n4. Mediana\n5. Moda\n6. Media M\n7. Suavizado Exp\n8. Todas\n9. Regresar"
choose_option:
    .ascii "\n Calculo que desea Visualizar: "
.section .bss
buffer:
    .skip 8   // buffer para entrada usuario (puedes ajustar tamaño)
.section .text
.global statistics_menu
.extern print
.extern read
.extern atoi
.extern medianaMain
.extern moda
.extern mediaMain
.extern while

statistics_menu:
    mov x28, x30 //guardando la direccion
    // Mostrar el menú
    ldr x1, =menu_options
    mov x2, 105              // longitud del menu_options
    bl print
    // Mostrar mensaje "Calculo que desea Visualizar: "
    ldr x1, =choose_option
    mov x2, 34              // longitud de choose_option
    bl print
    // Leer entrada usuario
    ldr x1, =buffer
    mov x2, 8
    bl read
    // Convertir entrada a número entero
    ldr x0, =buffer
    bl atoi
    // Resultado en x0: elección del usuario
    // Aquí decides qué función llamar o qué hacer según el valor de x0
//    cmp x0, 1
//    beq valor_minimo
//    cmp x0, 2
//    beq valor_maximo
    cmp x0, 3
    beq llamarMedia

    cmp x0, 4
    beq llamar_Mediana

    cmp x0, 5
      beq llamar_Moda
    cmp x0, 9
    beq end_menu


    b statistics_menu
//Seccion para llamar a las funciones externas
llamar_Mediana:
    bl medianaMain

llamar_Moda:
    bl moda
    //b statistics_menu

llamarMedia:
    bl mediaMain



end_menu:
    mov x30, x28
    ret
