# Assembler y Linker
AS = as
LD = ld

# Carpetas
SRC_DIR = .
LIB_DIR = lib
STATS_DIR = estadisticas
BUILD_DIR = build

# Archivos fuente
MAIN_SRC = $(SRC_DIR)/main.s
LIB_SRC = $(wildcard $(LIB_DIR)/*.s)
STATS_SRC = $(wildcard $(STATS_DIR)/*.s)

# Objetos
MAIN_OBJ = $(BUILD_DIR)/main.o
LIB_OBJ = $(patsubst $(LIB_DIR)/%.s, $(BUILD_DIR)/lib_%.o, $(LIB_SRC))
STATS_OBJ = $(patsubst $(STATS_DIR)/%.s, $(BUILD_DIR)/stats_%.o, $(STATS_SRC))

# Ejecutable final
OUTPUT = $(BUILD_DIR)/main

# Regla principal
all: $(OUTPUT)

# Compilar main.s
$(MAIN_OBJ): $(MAIN_SRC)
	mkdir -p $(BUILD_DIR)
	$(AS) $< -o $@

# Compilar lib/*.s → lib_%.o
$(BUILD_DIR)/lib_%.o: $(LIB_DIR)/%.s
	mkdir -p $(BUILD_DIR)
	$(AS) $< -o $@

# Compilar estadisticas/*.s → stats_%.o
$(BUILD_DIR)/stats_%.o: $(STATS_DIR)/%.s
	mkdir -p $(BUILD_DIR)
	$(AS) $< -o $@

# Enlazar todos los objetos
$(OUTPUT): $(MAIN_OBJ) $(LIB_OBJ) $(STATS_OBJ)
	$(LD) $^ -o $@

# Limpiar
clean:
	rm -rf $(BUILD_DIR)
