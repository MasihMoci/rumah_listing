import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Home, CreditCard, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Akses Ditolak</h2>
          <p className="text-slate-600 mb-6">Anda tidak memiliki akses ke halaman admin</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Navigation */}
      <nav className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold">RL</span>
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">
              Welcome, <strong>{user.name}</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-slate-300 hover:text-white gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">1,234</div>
              <p className="text-xs text-slate-500 mt-1">+12% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Properti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">567</div>
              <p className="text-xs text-slate-500 mt-1">+8% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">Rp 45.2M</div>
              <p className="text-xs text-slate-500 mt-1">+23% dari bulan lalu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">23</div>
              <p className="text-xs text-slate-500 mt-1">Menunggu review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="properties" className="gap-2">
              <Home className="w-4 h-4" />
              Properti
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Pembayaran
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Properti Pending Review</CardTitle>
                <CardDescription>Properti yang menunggu persetujuan admin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">Rumah Mewah di Jakarta Selatan</p>
                        <p className="text-sm text-slate-600">Rp 2.5 Miliar • 4 Kamar • 200 m²</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Tolak
                        </Button>
                        <Button size="sm">Setujui</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Properti Aktif</CardTitle>
                <CardDescription>Properti yang sudah dipublikasikan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Judul</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Kota</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Harga</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Views</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map((i) => (
                        <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900">Apartemen Premium</td>
                          <td className="py-3 px-4 text-slate-600">Jakarta</td>
                          <td className="py-3 px-4 text-slate-900 font-semibold">Rp 1.5M</td>
                          <td className="py-3 px-4 text-slate-600">1,234</td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="ghost">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Users</CardTitle>
                <CardDescription>Kelola akun pengguna dan role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Nama</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900 font-semibold">John Doe</td>
                          <td className="py-3 px-4 text-slate-600">john@example.com</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                              User
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <Button size="sm" variant="ghost">
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600">
                              Hapus
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Pembayaran</CardTitle>
                <CardDescription>Riwayat pembayaran dan langganan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Jumlah</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900 font-semibold">ORD-2024-{i}</td>
                          <td className="py-3 px-4 text-slate-600">User {i}</td>
                          <td className="py-3 px-4 text-slate-900 font-semibold">Rp 99,000</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              Success
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">2024-01-{10 + i}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>Statistik platform dan performa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-600 mb-4">Top Cities</p>
                    <div className="space-y-3">
                      {["Jakarta", "Surabaya", "Bandung", "Medan", "Makassar"].map((city, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-slate-900">{city}</span>
                          <div className="flex-1 mx-4 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${100 - i * 15}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-600 text-sm">{150 - i * 20}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-600 mb-4">Property Types</p>
                    <div className="space-y-3">
                      {["Rumah", "Apartemen", "Tanah", "Komersial"].map((type, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-slate-900">{type}</span>
                          <div className="flex-1 mx-4 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${80 - i * 15}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-600 text-sm">{120 - i * 25}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
