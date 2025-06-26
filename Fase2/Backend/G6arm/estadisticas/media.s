.section .data
media_msg:  .ascii  "Media: "           // 7 bytes
newline:    .ascii  "\n"

.section .text
.global mediaMain       
.global media           

.extern print           // write(stdout, x1, x2)
.extern print_number
.extern data_array
.extern data_array_size
.extern data_array_limits
.extern data_array_limits_size

mediaMain:
        stp     x29, x30, [sp, #-16]!
        mov     x29, sp

        // etiqueta "Media: "
        ldr     x1, =media_msg
        mov     x2, #7
        bl      print

        // argumentos para media
        ldr     x1, =data_array_limits
        ldr     x1, [x1]
        ldr     x2, =data_array_limits_size
        ldr     w2, [x2]

        bl      media          // x0 ← media

        bl      print_number   // imprime media
        // '\n'
        ldr     x1, =newline
        mov     x2, #1
        mov     x0, #1
        mov     x8, #64
        svc     #0

        ldp     x29, x30, [sp], #16
        ret

media:                          // x1 = arr*, w2 = n
        cbz     w2, .empty

        mov     x3, #0          // suma
        mov     w4, #0          // i

.loop:
        ldr     x5, [x1, x4, lsl #3]
        add     x3, x3, x5
        add     w4, w4, #1
        cmp     w4, w2
        blt     .loop

        uxtw    x6, w2
        udiv    x0, x3, x6      // media = suma / n
        ret

.empty:
        mov     x0, #0
        ret
