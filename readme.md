# 📦 Node.js API Template

Template project backend API menggunakan Node.js dan MySQL/MariaDB dengan struktur modular dan support async/await, helper, services, dan integrasi eksternal seperti Redis, Email, dan WhatsApp.

## 📁 Struktur Folder

- `/config` → konfigurasi database, environment
- `/controllers` → logic request handler
- `/models` → fungsi query ke database
- `/routes` → endpoint routing
- `/helpers` → fungsi utilitas global (response, logger, dll)
- `/services` → layanan eksternal (mail, redis, whatsapp)
- `/logs` → direktori untuk file log
- `app.js` → entry point aplikasi utama

## ⚙️ Teknologi yang Digunakan

- Node.js
- Express.js
- MySQL/MariaDB
- Redis
- Nodemailer
- dotenv
- WhatsAppJS

## 🚀 Fitur Utama

- Struktur modular, scalable
- Logger terpisah di `/logs`
- Koneksi database pool + transaksi
- Helper response & formatter standar
- Support Redis cache *(opsional)*
- Service WhatsApp untuk notifikasi *(opsional)*

## 📦 Instalasi & Menjalankan

```bash
git clone https://github.com/lazzyrain/lazzycode-node-api-template.git
cd lazzycode-node-api-template
npm install
cp .env.example .env
# sesuaikan konfigurasi database & lainnya
npm start
```