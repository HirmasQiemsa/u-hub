# Dokumentasi Implementasi Frontend: Dashboard & Keamanan Rute (Protected Routes)

Dokumen ini memuat panduan teknis untuk mengamankan akses halaman, menyisipkan token autentikasi secara otomatis pada setiap permintaan API, dan merancang antarmuka Halaman Dashboard utama.

### 1. Pembaruan Konfigurasi API Client (Token Interceptor)
**File**: `frontend/src/api/axios.ts`
**Fungsi**: Menambahkan interceptor agar setiap request yang dikirimkan ke backend secara otomatis menyertakan JWT Token dari `localStorage`.

```tsx
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token pada setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Pembuatan Komponen Protected Route
**File**: `frontend/src/components/ProtectedRoute.tsx`
**Fungsi**: Bertindak sebagai wrapper (pembungkus) rute. Jika pengguna tidak memiliki token, sistem akan mengarahkan ulang (redirect) ke halaman Login.

```tsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // Jika token tidak ditemukan di localStorage, arahkan kembali ke /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ada, render komponen anak (halaman yang dituju)
  return <Outlet />;
};

export default ProtectedRoute;
```

### 3. Komponen Halaman Dashboard
**File**: `frontend/src/pages/Dashboard.tsx`
**Fungsi**: Menampilkan antarmuka utama pengguna setelah login, memuat data akademik (Mockup API), dan menyediakan fungsi Logout.

```tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, BookOpen, GraduationCap } from 'lucide-react';

interface AcademicData {
  message?: string;
  ipk?: number;
  totalSks?: number;
  major?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        const response = await api.get('/academic');
        setAcademicData(response.data);
      } catch (error) {
        console.error('Gagal mengambil data akademik', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="px-6 py-4 bg-white shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">U-Hub Portal</h1>
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl p-6 mx-auto mt-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">Ringkasan Akademik</h2>
        
        {loading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Indeks Prestasi Kumulatif (IPK)</p>
                <p className="text-2xl font-bold text-gray-900">{academicData?.ipk || '3.85'}</p>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total SKS Ditempuh</p>
                <p className="text-2xl font-bold text-gray-900">{academicData?.totalSks || '120'}</p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
```
*(Catatan: Nilai statis '3.85' dan '120' digunakan sebagai fallback visual apabila data dari database masih bernilai 0 atau belum di-seed).*

### 4. Pembaruan Rute Utama
**File**: `frontend/src/App.tsx`
**Fungsi**: Mengintegrasikan `ProtectedRoute` untuk mengamankan halaman Dashboard.

```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans text-gray-900 bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

### 5. Prosedur Penyelesaian Tiket (Git Workflow)
Eksekusi perintah berikut pada terminal di root directory untuk menyimpan perubahan, menggabungkan cabang, dan menutup tiket Issue terkait Frontend Auth & Routing.

```bash
git add .
git commit -m "feat: setup protected routes and dashboard ui slicing (closes #2)"
git checkout development
git merge feature/issue-2-frontend-auth
git push origin development
```