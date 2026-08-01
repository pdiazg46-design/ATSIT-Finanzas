---
name: Respaldador Riguroso de Proyectos Activos (D:\Desarrollos)
description: Al término de cada proyecto o hito de desarrollo, exige actualizar los respaldos en D:\Desarrollos (incluyendo binarios en dist/ y código fuente) y solicitar explícitamente al usuario la conexión de su disco duro externo.
---

# Respaldador Riguroso de Proyectos Activos (D:\Desarrollos)

## Propósito
Garantizar la protección absoluta del código fuente y los binarios compilados de los proyectos desarrollados, exigiendo la consolidación completa en la ruta oficial `D:\Desarrollos` y notificando proactivamente al usuario Patricio para conectar su disco duro externo al finalizar cada proyecto o tarea relevante.

---

## Reglas de Funcionamiento

### 1. Directorio Raíz Oficial
- **Ruta Oficial de Trabajo**: `D:\Desarrollos`
- Todo proyecto (`ATSIT-Finanzas`, `Pagina WEB` / `AT-SIT-Portafolio`, etc.) debe estar 100% sincronizado en `D:\Desarrollos`.

### 2. Inclusión Obligatoria de Binarios y Validación Rigurosa
- **NO Excluir `dist/`**: Si en la sesión de trabajo se generaron ejecutables o instaladores (`.exe`, `.zip`, `.dmg`), la carpeta `dist/` o de publicación **DEBE ser copiada y respaldada** en `D:\Desarrollos\[Proyecto]\dist\`.
- **Exclusiones autorizadas únicamente**: Temporales de caché sin valor (`node_modules`, `.next`, `.cache`).

### 3. Protocolo de Validación Empírica
Antes de informar un respaldo como completado, el agente debe:
1. Validar que la carpeta de código fuente exista en `D:\Desarrollos\[Proyecto]`.
2. **Validar explícitamente los archivos compilados**: Verificar que los instaladores (`dist/*.exe`) existan en el disco D con tamaño en bytes y fecha idénticos a los del disco C.

### 4. Alerta de Disco Externo
Solicitar de manera explícita y obligatoria al usuario:
> *"Patricio, el proyecto [Nombre] se ha completado y respaldado al 100% en `D:\Desarrollos` (incluyendo ejecutables y código fuente). Por favor conecta tu **disco duro externo** para la copia de seguridad física."*
