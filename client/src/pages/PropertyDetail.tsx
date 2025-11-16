import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Phone, MessageCircle, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ phone: string | null; whatsapp: string | null } | null>(null);

  const { data: property, isLoading } = trpc.properties.getById.useQuery({ id: parseInt(id!) });
  const requestContactMutation = trpc.contacts.requestContact.useMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Properti Tidak Ditemukan</h2>
          <Button onClick={() => navigate("/")} variant="outline">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(property.images) ? property.images : [];
  const currentImage = images[currentImageIndex] || "/placeholder.jpg";

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleRequestContact = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      const result = await requestContactMutation.mutateAsync({ propertyId: property.id });
      setContactInfo(result);
      setShowContactDialog(true);
      toast.success("Kontak berhasil diakses!");
    } catch (error: any) {
      if (error.message.includes("Premium")) {
        toast.error("Anda perlu berlangganan premium untuk melihat kontak");
      } else {
        toast.error("Gagal mengakses kontak");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button onClick={() => navigate("/")} variant="ghost" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="relative bg-slate-200 rounded-lg overflow-hidden h-96 md:h-[500px]">
              <img src={currentImage} alt={property.title} className="w-full h-full object-cover" />

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-slate-900" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition"
                  >
                    <ChevronRight className="w-6 h-6 text-slate-900" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      idx === currentImageIndex ? "border-blue-600" : "border-slate-300"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Property Details */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Deskripsi Properti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 whitespace-pre-wrap">{property.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  {property.bedrooms && (
                    <div>
                      <p className="text-sm text-slate-600">Kamar Tidur</p>
                      <p className="text-2xl font-bold text-slate-900">{property.bedrooms}</p>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div>
                      <p className="text-sm text-slate-600">Kamar Mandi</p>
                      <p className="text-2xl font-bold text-slate-900">{property.bathrooms}</p>
                    </div>
                  )}
                  {property.landSize && (
                    <div>
                      <p className="text-sm text-slate-600">Luas Tanah</p>
                      <p className="text-2xl font-bold text-slate-900">{property.landSize} m²</p>
                    </div>
                  )}
                  {property.buildingSize && (
                    <div>
                      <p className="text-sm text-slate-600">Luas Bangunan</p>
                      <p className="text-2xl font-bold text-slate-900">{property.buildingSize} m²</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-blue-600">Rp {property.price.toLocaleString("id-ID")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Lokasi</p>
                  <div className="flex gap-2 text-slate-900">
                    <MapPin className="w-5 h-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-semibold">{property.address}</p>
                      <p className="text-sm">{property.city}, {property.province}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 mb-2">Tipe Properti</p>
                  <p className="font-semibold text-slate-900 capitalize">{property.propertyType}</p>
                </div>

                {property.yearBuilt && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-2">Tahun Dibangun</p>
                    <p className="font-semibold text-slate-900">{property.yearBuilt}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hubungi Penjual</CardTitle>
                <CardDescription>Akses kontak penjual dengan berlangganan premium</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleRequestContact}
                  disabled={requestContactMutation.isPending}
                  className="w-full gap-2"
                >
                  {!isAuthenticated ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Login untuk Akses Kontak
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      {requestContactMutation.isPending ? "Memproses..." : "Lihat Kontak"}
                    </>
                  )}
                </Button>

                {contactInfo && (
                  <div className="space-y-2 pt-4 border-t">
                    {contactInfo.phone && (
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span className="text-slate-900 font-semibold">{contactInfo.phone}</span>
                      </a>
                    )}
                    {contactInfo.whatsapp && (
                      <a
                        href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                      >
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span className="text-slate-900 font-semibold">WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium CTA */}
            {!isAuthenticated && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base">Dapatkan Akses Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 mb-4">
                    Berlangganan sekarang untuk mengakses kontak penjual dan fitur eksklusif lainnya
                  </p>
                  <a href={getLoginUrl()}>
                    <Button className="w-full">Daftar Sekarang</Button>
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kontak Penjual</DialogTitle>
            <DialogDescription>Hubungi penjual melalui nomor telepon atau WhatsApp di bawah ini</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {contactInfo?.phone && (
              <a
                href={`tel:${contactInfo.phone}`}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">Telepon</p>
                    <p className="font-semibold text-slate-900">{contactInfo.phone}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </a>
            )}
            {contactInfo?.whatsapp && (
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">WhatsApp</p>
                    <p className="font-semibold text-slate-900">{contactInfo.whatsapp}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
