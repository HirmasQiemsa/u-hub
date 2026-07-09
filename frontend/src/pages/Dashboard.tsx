import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, BookOpen, GraduationCap } from 'lucide-react';

// Define the structure of the academic data
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
