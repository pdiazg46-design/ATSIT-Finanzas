---
name: Respaldador Riguroso de Proyectos Activos (D:\Desarrollos)
description: Compara empíricamente los proyectos trabajados en la sesión con la carpeta de respaldo D:\Desarrollos (código fuente y binarios dist/). Si detecta diferencias o archivos faltantes, ejecuta el respaldo automáticamente y valida la coincidencia 100% idéntica.
---

# Respaldador Riguroso de Proyectos Activos (D:\Desarrollos)

## Propósito
Garantizar la coincidencia idéntica del código fuente y binarios compilados entre el entorno de trabajo y la unidad de respaldo `D:\Desarrollos`, comparando empíricamente cada proyecto trabajado en la sesión y ejecutando la sincronización automática ante cualquier diferencia.

---

## Reglas de Funcionamiento

### 1. Protocolo Obligatorio de Comparación Directa
Al concluir cualquier tarea o hito de desarrollo:
1. **Identificar Proyectos Trabajados**: Listar todos los proyectos modificados o desarrollados durante la sesión actual (ej: `ATSIT-Finanzas`, `Pagina WEB`).
2. **Comparar Origen vs Destino**:
   - Inspeccionar los archivos fuente (`main.js`, `package.json`, `src/`, `app/`, etc.) y los binarios compilados (`dist/*.exe`, `dist/*.zip`).
   - Comparar fechas de modificación (`LastWriteTime`) y tamaño en bytes (`Length`) entre el origen `C:\Users\pdiaz\Desarrollos\[Proyecto]` y la carpeta de respaldo `D:\Desarrollos\[Proyecto]`.
3. **Ejecutar Respaldo Si Hay Diferencias**:
   - Si se detecta cualquier archivo faltante, desactualizado o con diferente tamaño/fecha en la carpeta de respaldo, ejecutar la sincronización limpia (`robocopy` / PowerShell copy) **incluyendo la carpeta `dist/` con los instaladores `.exe`**.
4. **Re-Validar e Informar**:
   - Volver a comparar ambas ubicaciones para emitir un reporte empírico demostrando que el origen y la unidad de respaldo coinciden al 100%.

### 2. Inclusión Obligatoria de Binarios (`dist/`)
- **NO Excluir `dist/`**: Si se compilaron ejecutables `.exe` o paquetes `.zip`, deben respaldarse y compararse explícitamente en `D:\Desarrollos\[Proyecto]\dist\`.
- Exclusiones permitidas únicamente: Archivos de caché temporales regenerables (`node_modules`, `.next`, `.cache`).

### 3. Alerta de Disco Duro Externo
Una vez validada la coincidencia 100% idéntica en `D:\Desarrollos`:
> *"Patricio, se ha comparado y verificado que el proyecto [Nombre] en `D:\Desarrollos` es 100% idéntico al origen (código y ejecutables `.exe`). Por favor conecta tu **disco duro externo** para realizar la copia física final."*
