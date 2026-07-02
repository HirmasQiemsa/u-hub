### 1. Wrap Up Backend (Tutup Tiket Issue #2)

Buka terminal lu (pastikan ada di root folder project), lalu jalankan runtutan perintah ini buat nyimpen, ngegabungin ke development, dan otomatis nutup Issue di GitHub lu:

```bash
# 1. Masukin semua perubahan
git add .

# 2. Commit dengan pesan penutup Issue (Sesuaikan nomor #2 dengan nomor Issue lu di GitHub)
git commit -m "feat: complete core backend and midtrans integration (closes #2)"

# 3. Pindah ke branch utama (development)
git checkout development

# 4. Gabungkan kerjaan dari branch fitur tadi
git merge feature/issue-2-core-backend

# 5. Push ke cloud (GitHub) biar aman!
git push origin development
```

### 2. Welcome to Frontend (React + TS + Tailwind v4)

Sekarang kita ganti topi dari Backend Engineer jadi Frontend Engineer. Di tahap ini, hasil kerja keras lu di backend bakal beneran kelihatan wujud fisiknya.

Karena waktu kita sisa beberapa hari lagi dalam sprint seminggu ini, kita harus pakai tools yang bikin kerjaan slicing UI dan pemanggilan API jadi super cepet.

**Buka Issue Baru di GitHub:**
Bikin tiket baru dengan judul `[Frontend] Slicing Auth Pages & Routing Setup`. Anggaplah ini dapet nomor `#3`.
Lalu bikin branch baru di terminal:

```bash
git checkout -b feature/issue-3-frontend-auth
```

**Install Senjata Utama Frontend:**
Masuk ke folder `frontend`, lalu install tiga library wajib industri ini:
- `react-router-dom`: Buat ngatur perpindahan halaman (Routing).
- `axios`: Buat nge-hit API backend lu dengan lebih rapi dibanding fetch bawaan.
- `lucide-react`: Buat icon-icon UI yang cakep dan ringan.

```bash
cd frontend
npm install react-router-dom axios lucide-react
```

### 3. Setup Routing Dasar (Kerangka UI)

Biar lu kebayang, kita bakal bikin 3 halaman utama dulu: Login, Register, dan Dashboard.

Buka `frontend/src/App.tsx`, hapus semua isinya, dan ubah jadi kerangka routing ini:

```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Nanti kita bikin komponennya, sekarang panggil nama aja dulu
const Login = () => <div className="p-10 text-2xl">Halaman Login UI</div>;
const Register = () => <div className="p-10 text-2xl">Halaman Register UI</div>;
const Dashboard = () => <div className="p-10 text-2xl">Halaman Dashboard Utama</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```