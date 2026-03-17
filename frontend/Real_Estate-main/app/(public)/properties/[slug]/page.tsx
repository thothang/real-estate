'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize, Compass, Phone, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '@/types';
import { getPropertyBySlug, submitContact, getProperties } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const contactFormSchema = z.object({
  customer_name: z.string().min(2, 'Vui lòng nhập tên của bạn'),
  customer_phone: z.string().min(10, 'Vui lòng nhập số điện thoại hợp lệ'),
  customer_email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  message: z.string().min(10, 'Vui lòng nhập nội dung ít nhất 10 ký tự'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const propertyTypeLabels: Record<string, string> = {
  house: 'Nhà riêng',
  apartment: 'Căn hộ',
  villa: 'Biệt thự',
  townhouse: 'Nhà phố',
  land: 'Đất nền',
  office: 'Văn phòng',
};

const legalStatusLabels: Record<string, string> = {
  red_book: 'Sổ đỏ',
  pink_book: 'Sổ hồng',
  contract: 'Hợp đồng mua bán',
  unknown: 'Đang cập nhật',
};

const directionLabels: Record<string, string> = {
  north: 'Bắc',
  south: 'Nam',
  east: 'Đông',
  west: 'Tây',
  north_east: 'Đông Bắc',
  north_west: 'Tây Bắc',
  south_east: 'Đông Nam',
  south_west: 'Tây Nam',
};

export default function PropertyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);
  const [newProperties, setNewProperties] = useState<Property[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await getPropertyBySlug(slug);
        setProperty(response.data);

        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updatedViewed = [
          response.data,
          ...viewed.filter((p: Property) => p.id !== response.data.id),
        ].slice(0, 4);
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedViewed));
        setRecentlyViewed(updatedViewed.slice(1));
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchNewProperties = async () => {
      try {
        const response = await getProperties({}, 1, 4);
        setNewProperties(response.data);
      } catch (error) {
        console.error('Error fetching new properties:', error);
      }
    };

    fetchProperty();
    fetchNewProperties();
  }, [slug]);

  useEffect(() => {
    if (!property || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [property, isAutoPlaying]);

  const onSubmitContact = async (data: ContactFormData) => {
    if (!property) return;

    setSubmitting(true);
    try {
      await submitContact({
        property_id: property.id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || undefined,
        message: data.message,
      });

      toast({
        title: 'Gửi thành công',
        description: 'Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.',
      });

      reset();
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `${(price / 1000000).toFixed(0)} triệu/tháng`;
    }
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    return `${(price / 1000000).toFixed(0)} triệu`;
  };

  const nextImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) =>
      property && prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) =>
      property && prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent"></div>
        <p className="mt-4 text-slate-600">Đang tải...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-slate-600">Không tìm thấy bất động sản</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative mb-4 group">
                  <img
                    src={property.images[currentImageIndex]?.url}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <Button
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </div>
                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth">
                    {property.images.map((image, index) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={`Preview ${index}`}
                        className={`w-24 h-24 object-cover rounded cursor-pointer flex-shrink-0 ${
                          currentImageIndex === index ? 'ring-2 ring-blue-900' : ''
                        }`}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setIsAutoPlaying(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center text-slate-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.address.full_address}, {property.address.ward}, {property.address.district}, {property.address.city}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge>{propertyTypeLabels[property.property_type]}</Badge>
                      <Badge className="border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {property.listing_type === 'sale' ? 'Bán' : 'Cho thuê'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-900">
                      {formatPrice(property.price, property.listing_type)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Maximize className="w-6 h-6 mx-auto mb-2 text-blue-900" />
                    <div className="text-sm text-slate-600">Diện tích</div>
                    <div className="font-semibold">{property.area.land_area}m²</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Bed className="w-6 h-6 mx-auto mb-2 text-blue-900" />
                    <div className="text-sm text-slate-600">Phòng ngủ</div>
                    <div className="font-semibold">{property.structure.bedrooms}</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Bath className="w-6 h-6 mx-auto mb-2 text-blue-900" />
                    <div className="text-sm text-slate-600">Phòng tắm</div>
                    <div className="font-semibold">{property.structure.bathrooms}</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Compass className="w-6 h-6 mx-auto mb-2 text-blue-900" />
                    <div className="text-sm text-slate-600">Hướng</div>
                    <div className="font-semibold">{property.direction ? directionLabels[property.direction] : 'N/A'}</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Thông tin chi tiết</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-600">Số tầng:</span>
                      <span className="ml-2 font-medium">{property.structure.floors}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Diện tích sử dụng:</span>
                      <span className="ml-2 font-medium">{property.area.usable_area || 'N/A'}m²</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Pháp lý:</span>
                      <span className="ml-2 font-medium">{legalStatusLabels[property.legal_status]}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Ban công:</span>
                      <span className="ml-2 font-medium">{property.structure.balcony ? 'Có' : 'Không'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mô tả chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {property.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tiện ích</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature) => (
                      <Badge key={feature.id} className="text-foreground px-3 py-1">
                        {feature.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.contact && (
                    <>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Người đăng</div>
                        <div className="font-semibold">{property.contact.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 mb-1">Số điện thoại</div>
                        <a
                          href={`tel:${property.contact.phone}`}
                          className="flex items-center font-semibold text-blue-900 hover:underline"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {property.contact.phone}
                        </a>
                      </div>
                      <a
                        href={`https://zalo.me/${property.contact.zalo_phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat qua Zalo
                        </Button>
                      </a>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gửi yêu cầu tư vấn</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-4">
                    <div>
                      <Label htmlFor="customer_name">Họ tên *</Label>
                      <Input
                        id="customer_name"
                        {...register('customer_name')}
                        placeholder="Nguyễn Văn A"
                      />
                      {errors.customer_name && (
                        <p className="text-sm text-red-600 mt-1">{errors.customer_name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer_phone">Số điện thoại *</Label>
                      <Input
                        id="customer_phone"
                        {...register('customer_phone')}
                        placeholder="0901234567"
                      />
                      {errors.customer_phone && (
                        <p className="text-sm text-red-600 mt-1">{errors.customer_phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer_email">Email</Label>
                      <Input
                        id="customer_email"
                        type="email"
                        {...register('customer_email')}
                        placeholder="email@example.com"
                      />
                      {errors.customer_email && (
                        <p className="text-sm text-red-600 mt-1">{errors.customer_email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Nội dung *</Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        placeholder="Tôi muốn được tư vấn thêm về bất động sản này..."
                        rows={4}
                      />
                      {errors.message && (
                        <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={submitting}>
                      {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {recentlyViewed.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Bất động sản gần đây đã xem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map((prop) => {
                const primaryImage = prop.images.find((img) => img.is_primary) || prop.images[0];
                return (
                  <Link key={prop.id} href={`/properties/${prop.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                      <div className="relative h-48">
                        <img
                          src={primaryImage?.url}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                          {prop.title}
                        </h3>
                        <div className="text-lg font-bold text-blue-900">
                          {formatPrice(prop.price, prop.listing_type)}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Bất động sản mới đăng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProperties.map((prop) => {
              const primaryImage = prop.images.find((img) => img.is_primary) || prop.images[0];
              return (
                <Link key={prop.id} href={`/properties/${prop.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                    <div className="relative h-48">
                      <img
                        src={primaryImage?.url}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                        {prop.title}
                      </h3>
                      <div className="text-lg font-bold text-blue-900">
                        {formatPrice(prop.price, prop.listing_type)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
