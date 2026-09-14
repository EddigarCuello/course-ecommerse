# Guía de Despliegue en AWS EC2 con Docker Compose

Esta guía detalla los pasos para desplegar los 3 contenedores (**Frontend**, **Backend**, y **Base de Datos MongoDB**) en una máquina virtual de AWS EC2 sin tocar ni modificar el código fuente del proyecto.

---

## Requisitos en AWS

1. **Instancia EC2:** Ubuntu Server 22.04 LTS o 24.04 LTS (instancia `t2.micro` o superior).
2. **Grupo de Seguridad (Security Group):**
   - Regla de entrada **HTTP (Puerto 80)** abierta a `0.0.0.0/0`.
   - Regla de entrada **SSH (Puerto 22)** abierta a tu dirección IP.
   - *(Opcional)* Puerto **3000** y **27017** si deseas acceder directamente a la API o DB desde fuera (para producción se recomienda mantener solo el puerto 80 abierto y acceder a la API mediante Nginx `/api`).

---

## Pasos para el Despliegue en la Máquina Virtual AWS

### Paso 1: Conectarse a la Instancia EC2 por SSH

```bash
ssh -i tu-clave.pem ubuntu@EC2_PUBLIC_IP
```

---

### Paso 2: Instalar Docker y Docker Compose en la EC2

Ejecuta el siguiente script en la terminal de tu EC2:

```bash
# Actualizar repositorios
sudo apt update && sudo apt upgrade -y

# Instalar Docker
sudo apt install -y docker.io docker-compose-v2

# Habilitar e iniciar Docker
sudo systemctl enable --now docker

# Agregar el usuario ubuntu al grupo docker para ejecutar sin sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

### Paso 3: Clonar el Repositorio o Copiar el Código

```bash
git clone <URL_DE_TU_REPOSISTORIO>
cd course-ecommerse
```

---

### Paso 4: Crear el Archivo de Variables de Entorno `.env`

Copia el archivo de plantilla `.env.example` para crear tu configuración en producción:

```bash
cp .env.example .env
```

Edita el archivo `.env` con el editor `nano` para personalizar tus contraseñas, usuario admin y llaves:

```bash
nano .env
```

*Guarda con `Ctrl+O`, presiona `Enter` y sal con `Ctrl+X`.*

---

### Paso 5: Levantar los 3 Servicios en Producción

Ejecuta el comando de construcción y arranque de Docker Compose:

```bash
docker compose up -d --build
```

---

### Paso 6: Verificar el Estado de los Servicios

Para revisar que los 3 contenedores estén corriendo (`UP` y `healthy`):

```bash
docker compose ps
```

Para ver los registros (logs) en tiempo real:

```bash
docker compose logs -f
```

---

## ¿Cómo Funciona la Arquitectura en AWS?

```text
[ Cliente / Navegador ]
         | (Puerto 80 HTTP)
         v
[ Contenedor Frontend (Nginx) ]
    ├── Sirve los estáticos de React (SPA)
    └── Redirige /api/ y /uploads/ internamente a -> [ Contenedor Backend (Node.js) ]
                                                            |
                                                            v
                                            [ Contenedor Database (MongoDB) ]
```

- **Ventajas:** No requieres configurar CORS ni cambiar URLs de IP pública en el código del frontend. Nginx canaliza todo a través del puerto 80 en la red interna de Docker (`ecommerce_network`).

---

## Comandos Útiles de Mantenimiento

- **Detener el sistema:** `docker compose down`
- **Reiniciar contenedores:** `docker compose restart`
- **Reconstruir tras un actualización de código:** `git pull && docker compose up -d --build`
