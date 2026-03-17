'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize, ChevronDown, ChevronUp } from 'lucide-react';
import { Property, PropertyType, ListingType, Direction, LegalStatus } from '@/types';
import { getProperties } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

const directionLabels: Record<Direction, string> = {
  north: 'Bắc',
  south: 'Nam',
  east: 'Đông',
  west: 'Tây',
  north_east: 'Đông Bắc',
  north_west: 'Tây Bắc',
  south_east: 'Đông Nam',
  south_west: 'Tây Nam',
};

const legalStatusLabels: Record<LegalStatus, string> = {
  red_book: 'Sổ đỏ',
  pink_book: 'Sổ hồng',
  contract: 'Hợp đồng',
  unknown: 'Không rõ',
};

export default function AllPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    property_types: [] as string[],
    listing_types: [] as string[],
    directions: [] as string[],
    legal_statuses: [] as string[],
    city: '',
    district: '',
    ward: '',
    min_price: '',
    max_price: '',
    min_bedrooms: '',
    max_bedrooms: '',
    min_bathrooms: '',
    max_bathrooms: '',
    min_area: '',
    max_area: '',
  });

  const [openSections, setOpenSections] = useState({
    propertyType: true,
    listingType: true,
    price: false,
    location: false,
    direction: false,
    legalStatus: false,
    structure: false,
    area: false,
  });

  const fetchProperties = async (currentPage: number) => {
    setLoading(true);
    try {
      const filterParams: any = {};
      if (filters.property_types.length > 0) filterParams.property_type = filters.property_types[0];
      if (filters.listing_types.length > 0) filterParams.listing_type = filters.listing_types[0];
      if (filters.city) filterParams.city = filters.city;
      if (filters.district) filterParams.district = filters.district;
      if (filters.min_price) filterParams.min_price = parseFloat(filters.min_price);
      if (filters.max_price) filterParams.max_price = parseFloat(filters.max_price);

      const response = await getProperties(filterParams, currentPage, 12);
      setProperties(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(page);
  }, [page]);

  const handleFilterChange = () => {
    setPage(1);
    fetchProperties(1);
  };

  const toggleArrayFilter = (key: string, value: string) => {
    const current = filters[key as keyof typeof filters] as string[];
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: newValue });
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
      <div className="bg-gradient-to-r from-blue-900 to-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Tất cả bất động sản</h1>
          <p className="text-slate-200">Khám phá hàng ngàn bất động sản chất lượng cao</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Bộ lọc</h2>
                  <Button
                    onClick={() => {
                      setFilters({
                        property_types: [],
                        listing_types: [],
                        directions: [],
                        legal_statuses: [],
                        city: '',
                        district: '',
                        ward: '',
                        min_price: '',
                        max_price: '',
                        min_bedrooms: '',
                        max_bedrooms: '',
                        min_bathrooms: '',
                        max_bathrooms: '',
                        min_area: '',
                        max_area: '',
                      });
                      handleFilterChange();
                    }}
                    className="hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                  >
                    Xóa lọc
                  </Button>
                </div>

                <Collapsible
                  open={openSections.propertyType}
                  onOpenChange={(open: boolean) =>
                    setOpenSections({ ...openSections, propertyType: open })
                  }
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
                    Loại hình
                    {openSections.propertyType ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {Object.entries(propertyTypeLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${key}`}
                          checked={filters.property_types.includes(key)}
                          onCheckedChange={() => toggleArrayFilter('property_types', key)}
                        />
                        <Label htmlFor={`type-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.listingType}
                  onOpenChange={(open: boolean) =>
                    setOpenSections({ ...openSections, listingType: open })
                  }
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
                    Mục đích
                    {openSections.listingType ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {Object.entries(listingTypeLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`listing-${key}`}
                          checked={filters.listing_types.includes(key)}
                          onCheckedChange={() => toggleArrayFilter('listing_types', key)}
                        />
                        <Label htmlFor={`listing-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.price}
                  onOpenChange={(open: boolean) =>
                    setOpenSections({ ...openSections, price: open })
                  }
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
                    Mức giá
                    {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
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
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.location}
                  onOpenChange={(open: boolean) =>
                    setOpenSections({ ...openSections, location: open })
                  }
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
                    Vị trí
                    {openSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    <Input
                      placeholder="Tỉnh/Thành phố"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    />
                    <Input
                      placeholder="Quận/Huyện"
                      value={filters.district}
                      onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                    />
                    <Input
                      placeholder="Phường/Xã"
                      value={filters.ward}
                      onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.direction}
                  onOpenChange={(open: boolean) =>
                    setOpenSections({ ...openSections, direction: open })
                  }
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
                    Hướng
                    {openSections.direction ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {Object.entries(directionLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dir-${key}`}
                          checked={filters.directions.includes(key)}
                          onCheckedChange={() => toggleArrayFilter('directions', key)}
                        />
                        <Label htmlFor={`dir-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.legalStatus}
                  onOpenChange={(open: boolean) =>
                    setOpenSections({ ...openSections, legalStatus: open })
                  }
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
                    Pháp lý
                    {openSections.legalStatus ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {Object.entries(legalStatusLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`legal-${key}`}
                          checked={filters.legal_statuses.includes(key)}
                          onCheckedChange={() => toggleArrayFilter('legal_statuses', key)}
                        />
                        <Label htmlFor={`legal-${key}`} className="text-sm cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible
                  open={openSections.area}
                  onOpenChange={(open: boolean) =>
                    setOpenSections({ ...openSections, area: open })
                  }
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-medium">
                    Diện tích
                    {openSections.area ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    <Input
                      type="number"
                      placeholder="Diện tích tối thiểu (m²)"
                      value={filters.min_area}
                      onChange={(e) => setFilters({ ...filters, min_area: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Diện tích tối đa (m²)"
                      value={filters.max_area}
                      onChange={(e) => setFilters({ ...filters, max_area: e.target.value })}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Button className="w-full bg-blue-900 hover:bg-blue-800" onClick={handleFilterChange}>
                  Áp dụng bộ lọc
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-3">
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
                  <p className="text-slate-600">Tìm thấy {properties.length} kết quả</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                      Trang trước
                    </Button>
                    <span className="text-sm text-slate-600">
                      Trang {page} / {totalPages}
                    </span>
                    <Button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                      Trang sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
