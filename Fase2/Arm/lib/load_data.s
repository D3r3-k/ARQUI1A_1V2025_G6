/*
    load_data.s - VERSION CON COPIA DE ARREGLO EN data_array_limits

    Al cargar los datos, se copia la dirección y tamaño a data_array_limits y data_array_limits_size.
    Así, el subarreglo de trabajo por defecto es el arreglo completo, hasta que el usuario cambie los límites.
*/

.global load_data

// External function declarations
.extern while
.extern count_partial
.extern atoi_partial
.extern data_array
.extern data_array_size
.extern data_array_limits
.extern data_array_limits_size

.section .text

load_data:
    mov x1, x0              // x0 contains the address of the string to convert
    mov x20, x1             // Store the address of the string in x20
    mov x21, 0              // Initialize x21 to 0 (total count of newlines)

    // Find the first newline character in the string
.find_newline:
    ldrb w2, [x1], 1        // Load byte from string and increment pointer
    cmp w2, 10              // Check if character is newline (ASCII 10)
    beq .replace_newline    // If newline found, go to replace
    cmp w2, 0               // Check if end of string (null terminator)
    beq .load_data_Open_file // If end of string, go to open file
    b .find_newline         // Continue searching for newline

// Replace the first newline character with a null terminator
.replace_newline:
    sub x1, x1, 1           // Move back to the character before newline
    mov w2, 0               // Replace newline with null terminator
    strb w2, [x1]           // Store null terminator at the position

// Open the file specified in the string
.load_data_Open_file:
    mov x0, -100            // AT_FDCWD (current directory)
    mov x1, x20             // File name
    mov x2, 0               // O_RDONLY (read-only mode)
    mov x8, 56              // syscall number for open
    svc 0                   // Make the syscall
    mov x9, x0              // Store file descriptor

    // Verificar si el archivo se abrió correctamente
    cmp x9, 0
    blt .load_data_error    // Si fd < 0, error al abrir archivo

// Read the contents of the file (PRIMERA PASADA - solo contar)
.load_data_Read_File_loop:
    mov x0, x9              // File descriptor
    ldr x1, =file_buffer    // Buffer to hold file contents
    mov x2, 1024            // Number of bytes to read (1 KB)
    mov x8, 63              // syscall number for read
    svc 0                   // Make the syscall

    cmp x0, 0               // Check if read returned 0 (EOF)
    beq .load_data_free_memory

    mov x10, x0             // Number of bytes read
    mov x0, x1              // x0 = address of buffer
    mov x1, x10             // x1 = number of bytes read
    bl count_partial        // Call count_partial to count newlines in the buffer

    add x21, x21, x0        // Add the count of newlines to total count

    b .load_data_Read_File_loop

.load_data_free_memory:
    ldr x0, =data_array
    ldr x1, [x0]            // x1 = actual address
    cbz x1, .load_data_reserve_memory     // If it is 0, there is nothing to free

    ldr x2, =data_array_size
    ldr x1, [x2]            // x1 = previous size in elements
    mov x3, 8
    mul x1, x1, x3          // size in bytes

    mov x0, x1              // original address
    mov x1, x1              // length
    mov x8, 215             // syscall munmap
    svc 0

.load_data_reserve_memory:
    mov x0, 0               // addr
    mov x1, x21             // número de elementos
    mov x2, 8               // 8 bytes por elemento
    mul x1, x1, x2          // x1 = total size (length)
    
    // Asegurar alineación a 8 bytes
    add x1, x1, 7           // Redondear hacia arriba
    and x1, x1, #-8         // Alinear a múltiplo de 8
    
    mov x2, 3               // PROT_READ | PROT_WRITE
    mov x3, 0x22            // MAP_PRIVATE | MAP_ANONYMOUS
    mov x4, -1              // fd
    mov x5, 0               // offset
    mov x8, 222             // mmap syscall
    svc 0

    cmp x0, -1              // Check if mmap failed
    beq .load_data_Close_file // If mmap failed, close the file and exit

.save_new_address:
    ldr x1, =data_array
    str x0, [x1]            // Save new address in data_array

    // Save new size in data_array_size - INICIALIZAR EN 0
    ldr x1, =data_array_size
    mov x2, 0               // Inicializar en 0, atoi_partial irá incrementando
    str x2, [x1]

.reset_file_reading:
    mov x0, x9              // File descriptor
    mov x1, 0               // Offset
    mov x2, 0               // Whence (SEEK_SET)
    mov x8, 62              // syscall number for lseek
    svc 0                   // Make the syscall

// SEGUNDA PASADA - procesar números reales
.load_data_Read_File_loop2:
    mov x0, x9              // File descriptor
    ldr x1, =file_buffer    // Buffer to hold file contents
    mov x2, 1024            // Number of bytes to read (1 KB)
    mov x8, 63              // syscall number for read
    svc 0                   // Make the syscall

    cmp x0, 0               // Check if read returned 0 (EOF del sistema)
    beq .load_data_Close_file // If EOF, close the file and exit

    mov x10, x0             // Number of bytes read
    mov x0, x1              // x0 = address of buffer
    mov x1, x10             // x1 = number of bytes read

    bl atoi_partial         // Call atoi_partial to process numbers

    // Verificar retorno de atoi_partial
    cmp x0, -1              // ¿atoi_partial encontró '$'?
    beq .load_data_Close_file // Si sí, terminar inmediatamente

    // Si retornó >= 0, continuar leyendo más chunks
    b .load_data_Read_File_loop2

.load_data_error:
    // Error al abrir archivo - mostrar mensaje y continuar
    mov x0, 1               // stdout
    ldr x1, =error_msg
    mov x2, 25              // longitud corregida
    mov x8, 64              // write syscall
    svc 0
    b while                 // Volver al menú

// Close the file after reading
.load_data_Close_file:
    mov x0, x9              // File descriptor
    mov x8, 57              // syscall number for close
    svc 0                   // Make the syscall

    // Copiar puntero y tamaño al arreglo con límites (data_array_limits)
    ldr x0, =data_array
    ldr x1, [x0]
    ldr x0, =data_array_limits
    str x1, [x0]

    ldr x0, =data_array_size
    ldr x1, [x0]
    ldr x0, =data_array_limits_size
    str x1, [x0]

    // Debug: Mostrar que terminamos correctamente
    mov x0, 1               // stdout
    ldr x1, =success_msg
    mov x2, 26              // longitud corregida
    mov x8, 64              // write syscall
    svc 0

    b while                 // Go back to the main loop

.section .data
error_msg:
    .ascii "Error: Cannot open file\n"
success_msg:
    .ascii "File loaded successfully\n"

.section .bss
file_buffer:
    .skip 1024              // Buffer to hold file contents (1 KB)
