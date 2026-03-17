'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Property, PropertyType, ListingType } from '@/types';
import { getProperties } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const propertyTypeLabels: Record<PropertyType, string> = {
  house: 'Nhà riêng',
  apartment: 'Căn hộ',
  villa: 'Biệt thự',
  townhouse: 'Nhà phố',
  land: 'Đất nền',
  office: 'Văn phòng',
};

const listingTypeLabels: Record<ListingType, string> = {
  sale: 'Bán',
  rent: 'Cho thuê',
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    property_type: searchParams.get('property_type') || 'all',
    listing_type: searchParams.get('listing_type') || 'all',
    city: searchParams.get('city') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const filterParams: any = {};
      if (filters.property_type && filters.property_type !== 'all') filterParams.property_type = filters.property_type;
      if (filters.listing_type && filters.listing_type !== 'all') filterParams.listing_type = filters.listing_type;
      if (filters.city) filterParams.city = filters.city;
      if (filters.min_price) filterParams.min_price = parseFloat(filters.min_price);
      if (filters.max_price) filterParams.max_price = parseFloat(filters.max_price);

      const response = await getProperties(filterParams, 1, 6);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = () => {
    fetchProperties();
  };

  const formatPrice = (price: number, listingType: ListingType) => {
    if (listingType === 'rent') {
      return `${(price / 1000000).toFixed(0)} triệu/tháng`;
    }
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    }
    return `${(price / 1000000).toFixed(0)} triệu`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tìm kiếm bất động sản lý tưởng
            </h1>
            <p className="text-lg text-slate-200">
              Khám phá hàng ngàn bất động sản chất lượng cao trên toàn quốc
            </p>
          </div>

          <Card className="max-w-5xl mx-auto shadow-2xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Select
                  value={filters.property_type}
                  onValueChange={(value: string) =>
                    setFilters({ ...filters, property_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="house">Nhà riêng</SelectItem>
                    <SelectItem value="apartment">Căn hộ</SelectItem>
                    <SelectItem value="villa">Biệt thự</SelectItem>
                    <SelectItem value="townhouse">Nhà phố</SelectItem>
                    <SelectItem value="land">Đất nền</SelectItem>
                    <SelectItem value="office">Văn phòng</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.listing_type}
                  onValueChange={(value: string) =>
                    setFilters({ ...filters, listing_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mục đích" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="sale">Mua bán</SelectItem>
                    <SelectItem value="rent">Cho thuê</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Tỉnh/Thành phố"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="number"
                  placeholder="Giá thấp nhất"
                  value={filters.min_price}
                  onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Giá cao nhất"
                  value={filters.max_price}
                  onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                />
                <Button
                  className="bg-blue-900 hover:bg-blue-800"
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Đang tải...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Không tìm thấy bất động sản phù hợp</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Bất động sản mới nhất
              </h2>
              <p className="text-slate-600">
                Khám phá các bất động sản được đăng gần đây
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map((property) => {
                const primaryImage = property.images.find((img) => img.is_primary) || property.images[0];

                return (
                  <Link key={property.id} href={`/properties/${property.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
                      <div className="relative h-56">
                        <img
                          src={primaryImage?.url || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-blue-900">
                            {listingTypeLabels[property.listing_type]}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge className="border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                            {propertyTypeLabels[property.property_type]}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-sm text-slate-600 mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="line-clamp-1">
                            {property.address.district}, {property.address.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            <span>{property.structure.bedrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            <span>{property.structure.bathrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Maximize className="w-4 h-4 mr-1" />
                            <span>{property.area.land_area}m²</span>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-blue-900">
                          {formatPrice(property.price, property.listing_type)}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="text-center">
              <Link href="/properties">
                <Button className="bg-blue-900 hover:bg-blue-800 h-11 rounded-md px-8">
                  Xem tất cả
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
