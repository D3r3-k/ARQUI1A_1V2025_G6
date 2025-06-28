/*
    Exportación XML - TODAS las estadísticas con valores reales
    Sin valores quemados - Completamente dinámico
*/

.global export_xml

.data
    xml_filename: .asciz "resultados_estadisticas_completo.xml"
    
    // Templates XML
    xml_header: .ascii "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<estadisticas>\n"
    xml_header_len = . - xml_header
    
    filtro_info: .ascii "  <informacion_filtrado>\n    <filtro_aplicado>false</filtro_aplicado>\n    <total_datos>"
    filtro_info_len = . - filtro_info
    
    filtro_close: .ascii "</total_datos>\n  </informacion_filtrado>\n"
    filtro_close_len = . - filtro_close
    
    stats_header: .ascii "  <resultados_estadisticos>\n"
    stats_header_len = . - stats_header
    
    // Tags para cada estadística
    media_open: .ascii "    <media>"
    media_open_len = . - media_open
    media_close: .ascii "</media>\n"
    media_close_len = . - media_close
    
    mediana_open: .ascii "    <mediana>"
    mediana_open_len = . - mediana_open
    mediana_close: .ascii "</mediana>\n"
    mediana_close_len = . - mediana_close
    
    moda_open: .ascii "    <moda>"
    moda_open_len = . - moda_open
    moda_close: .ascii "</moda>\n"
    moda_close_len = . - moda_close
    
    min_open: .ascii "    <minimo>"
    min_open_len = . - min_open
    min_close: .ascii "</minimo>\n"
    min_close_len = . - min_close
    
    max_open: .ascii "    <maximo>"
    max_open_len = . - max_open
    max_close: .ascii "</maximo>\n"
    max_close_len = . - max_close
    
    varianza_open: .ascii "    <varianza>"
    varianza_open_len = . - varianza_open
    varianza_close: .ascii "</varianza>\n"
    varianza_close_len = . - varianza_close
    
    stats_footer: .ascii "  </resultados_estadisticos>\n</estadisticas>\n"
    stats_footer_len = . - stats_footer
    
    no_calculado: .ascii "No calculado"
    no_calculado_len = . - no_calculado
    
    number_buffer: .space 32
    success_msg: .asciz "XML exportado con TODAS las estadísticas\n"

.text
/*
    Función de exportación XML completa
    Parámetros:
    x0 = valor media calculado (-1 si no calculado)
    x1 = valor mediana calculado (-1 si no calculado)  
    x2 = valor moda calculado (-1 si no calculado)
    x3 = valor mínimo calculado (-1 si no calculado)
    x4 = valor máximo calculado (-1 si no calculado)
    x5 = valor varianza calculado (-1 si no calculado)
    x6 = total de datos procesados
    
    Retorna: x0 = 0 (éxito), -1 (error)
*/
export_xml:
    stp x29, x30, [sp, #-32]!
    stp x19, x20, [sp, #-16]!
    stp x21, x22, [sp, #-16]!
    stp x23, x24, [sp, #-16]!
    mov x29, sp
    
    // Guardar todos los parámetros
    mov x19, x0    // media
    mov x20, x1    // mediana
    mov x21, x2    // moda
    mov x22, x3    // mínimo
    mov x23, x4    // máximo
    mov x24, x5    // varianza
    // x6 ya contiene total_datos
    
    // Crear archivo
    mov x0, -100
    ldr x1, =xml_filename
    mov x2, 101             // O_WRONLY | O_CREAT
    mov x3, 0644
    mov x8, 56              // openat
    svc #0
    
    cmp x0, #0
    b.lt export_error
    mov x25, x0             // guardar fd en x25
    
    // Escribir header XML
    mov x0, x25
    ldr x1, =xml_header
    mov x2, xml_header_len
    mov x8, 64
    svc #0
    
    // Escribir información filtrado con total real
    mov x0, x25
    ldr x1, =filtro_info
    mov x2, filtro_info_len
    mov x8, 64
    svc #0
    
    // Escribir total de datos real
    mov x0, x6              // total datos
    bl number_to_string
    mov x0, x25
    ldr x1, =number_buffer
    bl string_length
    mov x2, x0
    mov x0, x25
    ldr x1, =number_buffer
    mov x8, 64
    svc #0
    
    mov x0, x25
    ldr x1, =filtro_close
    mov x2, filtro_close_len
    mov x8, 64
    svc #0
    
    // Header estadísticas
    mov x0, x25
    ldr x1, =stats_header
    mov x2, stats_header_len
    mov x8, 64
    svc #0
    
    // ===== MEDIA =====
    mov x0, x25
    ldr x1, =media_open
    mov x2, media_open_len
    mov x8, 64
    svc #0
    
    cmp x19, #-1            // ¿media calculada?
    b.eq media_no_calc
    
    // Escribir media real
    mov x0, x19
    bl number_to_string
    mov x0, x25
    ldr x1, =number_buffer
    bl string_length
    mov x2, x0
    mov x0, x25
    ldr x1, =number_buffer
    mov x8, 64
    svc #0
    b media_close_tag

media_no_calc:
    mov x0, x25
    ldr x1, =no_calculado
    mov x2, no_calculado_len
    mov x8, 64
    svc #0

media_close_tag:
    mov x0, x25
    ldr x1, =media_close
    mov x2, media_close_len
    mov x8, 64
    svc #0
    
    // ===== MEDIANA =====
    mov x0, x25
    ldr x1, =mediana_open
    mov x2, mediana_open_len
    mov x8, 64
    svc #0
    
    cmp x20, #-1            // ¿mediana calculada?
    b.eq mediana_no_calc
    
    // Escribir mediana real
    mov x0, x20
    bl number_to_string
    mov x0, x25
    ldr x1, =number_buffer
    bl string_length
    mov x2, x0
    mov x0, x25
    ldr x1, =number_buffer
    mov x8, 64
    svc #0
    b mediana_close_tag

mediana_no_calc:
    mov x0, x25
    ldr x1, =no_calculado
    mov x2, no_calculado_len
    mov x8, 64
    svc #0

mediana_close_tag:
    mov x0, x25
    ldr x1, =mediana_close
    mov x2, mediana_close_len
    mov x8, 64
    svc #0
    
    // ===== MODA =====
    mov x0, x25
    ldr x1, =moda_open
    mov x2, moda_open_len
    mov x8, 64
    svc #0
    
    cmp x21, #-1            // ¿moda calculada?
    b.eq moda_no_calc
    
    // Escribir moda real
    mov x0, x21
    bl number_to_string
    mov x0, x25
    ldr x1, =number_buffer
    bl string_length
    mov x2, x0
    mov x0, x25
    ldr x1, =number_buffer
    mov x8, 64
    svc #0
    b moda_close_tag

moda_no_calc:
    mov x0, x25
    ldr x1, =no_calculado
    mov x2, no_calculado_len
    mov x8, 64
    svc #0

moda_close_tag:
    mov x0, x25
    ldr x1, =moda_close
    mov x2, moda_close_len
    mov x8, 64
    svc #0
    
    // ===== MÍNIMO =====
    mov x0, x25
    ldr x1, =min_open
    mov x2, min_open_len
    mov x8, 64
    svc #0
    
    cmp x22, #-1            // ¿mínimo calculado?
    b.eq min_no_calc
    
    // Escribir mínimo real
    mov x0, x22
    bl number_to_string
    mov x0, x25
    ldr x1, =number_buffer
    bl string_length
    mov x2, x0
    mov x0, x25
    ldr x1, =number_buffer
    mov x8, 64
    svc #0
    b min_close_tag

min_no_calc:
    mov x0, x25
    ldr x1, =no_calculado
    mov x2, no_calculado_len
    mov x8, 64
    svc #0

min_close_tag:
    mov x0, x25
    ldr x1, =min_close
    mov x2, min_close_len
    mov x8, 64
    svc #0
    
    // ===== MÁXIMO =====
    mov x0, x25
    ldr x1, =max_open
    mov x2, max_open_len
    mov x8, 64
    svc #0
    
    cmp x23, #-1            // ¿máximo calculado?
    b.eq max_no_calc
    
    // Escribir máximo real
    mov x0, x23
    bl number_to_string
    mov x0, x25
    ldr x1, =number_buffer
    bl string_length
    mov x2, x0
    mov x0, x25
    ldr x1, =number_buffer
    mov x8, 64
    svc #0
    b max_close_tag

max_no_calc:
    mov x0, x25
    ldr x1, =no_calculado
    mov x2, no_calculado_len
    mov x8, 64
    svc #0

max_close_tag:
    mov x0, x25
    ldr x1, =max_close
    mov x2, max_close_len
    mov x8, 64
    svc #0
    
    // ===== VARIANZA =====
    mov x0, x25
    ldr x1, =varianza_open
    mov x2, varianza_open_len
    mov x8, 64
    svc #0
    
    cmp x24, #-1            // ¿varianza calculada?
    b.eq varianza_no_calc
    
    // Escribir varianza real
    mov x0, x24
    bl number_to_string
    mov x0, x25
    ldr x1, =number_buffer
    bl string_length
    mov x2, x0
    mov x0, x25
    ldr x1, =number_buffer
    mov x8, 64
    svc #0
    b varianza_close_tag

varianza_no_calc:
    mov x0, x25
    ldr x1, =no_calculado
    mov x2, no_calculado_len
    mov x8, 64
    svc #0

varianza_close_tag:
    mov x0, x25
    ldr x1, =varianza_close
    mov x2, varianza_close_len
    mov x8, 64
    svc #0
    
    // Footer estadísticas
    mov x0, x25
    ldr x1, =stats_footer
    mov x2, stats_footer_len
    mov x8, 64
    svc #0
    
    // Cerrar archivo
    mov x0, x25
    mov x8, 57
    svc #0
    
    // Mensaje éxito
    mov x0, 1
    ldr x1, =success_msg
    mov x2, 42
    mov x8, 64
    svc #0
    
    mov x0, #0
    b export_end

export_error:
    mov x0, #-1

export_end:
    mov sp, x29
    ldp x23, x24, [sp], #16
    ldp x21, x22, [sp], #16
    ldp x19, x20, [sp], #16
    ldp x29, x30, [sp], #32
    ret

// Convertir número a string (misma función que antes)
number_to_string:
    stp x29, x30, [sp, #-16]!
    mov x29, sp
    
    ldr x1, =number_buffer
    mov x2, #0
    
    // Limpiar buffer
clear_buffer:
    strb wzr, [x1, x2]
    add x2, x2, #1
    cmp x2, #32
    b.lt clear_buffer
    
    cmp x0, #0
    b.ne convert_number
    
    mov w2, #48    // '0'
    strb w2, [x1]
    b number_done

convert_number:
    mov x2, #0
    mov x3, x0

extract_digits:
    cmp x3, #0
    b.eq reverse_digits
    
    mov x4, #10
    udiv x5, x3, x4
    msub x6, x5, x4, x3
    
    add x6, x6, #48
    strb w6, [x1, x2]
    add x2, x2, #1
    
    mov x3, x5
    b extract_digits

reverse_digits:
    sub x2, x2, #1
    mov x3, #0

reverse_loop:
    cmp x3, x2
    b.ge number_done
    
    ldrb w4, [x1, x3]
    ldrb w5, [x1, x2]
    strb w5, [x1, x3]
    strb w4, [x1, x2]
    
    add x3, x3, #1
    sub x2, x2, #1
    b reverse_loop

number_done:
    ldp x29, x30, [sp], #16
    ret

// Calcular longitud de string
string_length:
    mov x2, #0
length_loop:
    ldrb w3, [x1, x2]
    cmp w3, #0
    b.eq length_done
    add x2, x2, #1
    b length_loop
length_done:
    mov x0, x2
    ret