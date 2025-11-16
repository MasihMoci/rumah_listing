import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Home as HomeIcon, DollarSign, Users, Search } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchFilters, setSearchFilters] = useState({
    city: "",
    propertyType: "",
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
  });

  const { data: properties, isLoading } = trpc.properties.search.useQuery(searchFilters, {
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filters are already reactive, so this just triggers the query
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE}</h1>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600 py-2">
                  Welcome, <strong>{user?.name || "User"}</strong>
                </span>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Login / Register</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Temukan Rumah Impian Anda</h2>
            <p className="text-xl text-blue-100">Platform terpercaya untuk jual beli properti di Indonesia</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kota</label>
                <Input
                  placeholder="Jakarta, Surabaya, Bandung..."
                  value={searchFilters.city}
                  onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                  className="text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Properti</label>
                <Select value={searchFilters.propertyType || ""} onValueChange={(value) => setSearchFilters({ ...searchFilters, propertyType: value })}>
                  <SelectTrigger className="text-slate-900">
                    <SelectValue placeholder="Pilih tipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">Rumah</SelectItem>
                    <SelectItem value="apartment">Apartemen</SelectItem>
                    <SelectItem value="land">Tanah</SelectItem>
                    <SelectItem value="commercial">Komersial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Min Harga</label>
                <Input
                  placeholder="Rp 0"
                  type="number"
                  value={searchFilters.minPrice || ""}
                  onChange={(e) => setSearchFilters({ ...searchFilters, minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Max Harga</label>
                <Input
                  placeholder="Rp 999,999,999"
                  type="number"
                  value={searchFilters.maxPrice || ""}
                  onChange={(e) => setSearchFilters({ ...searchFilters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="text-slate-900"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Cari Properti
            </Button>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-900">Mengapa Memilih Kami?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <HomeIcon className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Ribuan Properti</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Pilihan properti terlengkap dari berbagai kota di Indonesia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Agen Terpercaya</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Terkoneksi dengan agen dan developer profesional</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Harga Transparan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Informasi harga lengkap tanpa biaya tersembunyi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-8 text-slate-900">Properti Terbaru</h3>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-200 rounded-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map((property: any) => (
                <div key={property.id}>
                  <Link href={`/property/${property.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-48 bg-slate-200 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-300">
                          <HomeIcon className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{property.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {property.city}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-blue-600">Rp {property.price.toLocaleString("id-ID")}</p>
                        <div className="flex gap-4 text-sm text-slate-600">
                          {property.bedrooms && <span>🛏️ {property.bedrooms} Kamar</span>}
                          {property.bathrooms && <span>🚿 {property.bathrooms} Kamar Mandi</span>}
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">Tidak ada properti yang sesuai dengan pencarian Anda</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Siap Menemukan Properti Impian?</h3>
          <p className="text-xl mb-6 text-blue-100">Daftar sekarang dan dapatkan akses ke ribuan properti eksklusif</p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg">
                Mulai Sekarang
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Tentang Kami</h4>
              <p className="text-sm">Platform terpercaya untuk jual beli properti di Indonesia</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Layanan</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Jual Properti
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Beli Properti
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Sewa Properti
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Bantuan</h4>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Kontak Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Kebijakan Privasi
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Hubungi Kami</h4>
              <p className="text-sm">📞 +62 XXX XXXX XXXX</p>
              <p className="text-sm">📧 info@rumahlistingdemo.com</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2024 Rumah Listing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
