# Node.js API Template

Template project backend API menggunakan Node.js dan MySQL/MariaDB dengan struktur modular dan support async/await, helper, services, dan integrasi eksternal seperti Redis, Email, dan WhatsApp.

#### 📁 Struktur Folder

- `/config` → konfigurasi database, environment
- `/controllers` → logic request handler
- `/models` → fungsi query ke database
- `/routes` → endpoint routing
- `/helpers` → fungsi utilitas global (response, logger, dll)
- `/services` → layanan eksternal (mail, redis, whatsapp)
- `/logs` → direktori untuk file log
- `app.js` → entry point aplikasi utama

### 📦 Dependencies

Berikut adalah library utama yang digunakan:

- `express`: Web framework untuk Node.js
- `dotenv`: Untuk mengelola variabel lingkungan (.env)
- `ioredis` & `redis`: Untuk koneksi dan manajemen Redis
- `mysql2`: Untuk koneksi database MySQL
- `multer`: Untuk upload file
- `moment-timezone`: Untuk manajemen waktu dengan zona waktu
- `node-schedule`: Untuk penjadwalan tugas
- `nodemailer`: Untuk mengirim email via SMTP
- `playwright`: Untuk otomatisasi browser
- `qrcode` & `qrcode-terminal`: Untuk generate QR WhatsApp
- `whatsapp-web.js`: Untuk integrasi WhatsApp Web API

### 🚀 Fitur Utama

- Struktur modular, scalable
- Logger terpisah di `/logs`
- Koneksi database pool + transaksi
- Helper response & formatter standar
- Support Redis cache *(opsional)*
- Service WhatsApp untuk notifikasi *(opsional)*

### ⚙️ Instalasi & Menjalankan

```bash
git clone https://github.com/lazzyrain/lazzycode-node-api-template.git
cd lazzycode-node-api-template
npm i
cp .env.example .env
# sesuaikan konfigurasi database & lainnya
npm start
```