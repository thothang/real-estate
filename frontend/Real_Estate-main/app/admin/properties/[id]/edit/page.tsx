'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X } from 'lucide-react';
import { PropertyFormPayload, Feature, Property, PropertyType, ListingType, LegalStatus, Direction, ListingStatus } from '@/types';
import { getPropertyById, updateProperty, uploadImages, getFeatures } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const propertyFormSchema = z.object({
  title: z.string().min(10, 'Tiêu đề phải có ít nhất 10 ký tự'),
  property_type: z.enum(['house', 'apartment', 'villa', 'townhouse', 'land', 'office']),
  listing_type: z.enum(['sale', 'rent']),
  price: z.number().min(0, 'Giá phải lớn hơn 0'),
  direction: z.enum(['north', 'south', 'east', 'west', 'north_east', 'north_west', 'south_east', 'south_west']).optional(),
  legal_status: z.enum(['red_book', 'pink_book', 'contract', 'unknown']),
  description: z.string().min(50, 'Mô tả phải có ít nhất 50 ký tự'),
  status: z.enum(['draft', 'published', 'sold', 'rented']),
  address: z.object({
    full_address: z.string().min(5, 'Địa chỉ không hợp lệ'),
    district: z.string().min(2, 'Quận/Huyện không hợp lệ'),
    city: z.string().min(2, 'Tỉnh/Thành phố không hợp lệ'),
    ward: z.string().optional(),
  }),
  structure: z.object({
    floors: z.number().min(0),
    bedrooms: z.number().min(0),
    bathrooms: z.number().min(0),
    balcony: z.boolean(),
  }),
  area: z.object({
    land_area: z.number().min(1, 'Diện tích phải lớn hơn 0'),
    usable_area: z.number().min(0),
  }),
  feature_ids: z.array(z.string()),
});

export default function EditPropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PropertyFormPayload>({
    resolver: zodResolver(propertyFormSchema),
  });

  const selectedFeatureIds = watch('feature_ids') || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertyResponse, featuresResponse] = await Promise.all([
          getPropertyById(propertyId),
          getFeatures(),
        ]);

        const prop = propertyResponse.data;
        setProperty(prop);
        setFeatures(featuresResponse.data);

        reset({
          title: prop.title,
          property_type: prop.property_type,
          listing_type: prop.listing_type,
          price: prop.price,
          direction: prop.direction,
          legal_status: prop.legal_status,
          description: prop.description,
          status: prop.status,
          address: {
            full_address: prop.address.full_address,
            district: prop.address.district,
            city: prop.address.city,
            ward: prop.address.ward,
          },
          structure: {
            floors: prop.structure.floors,
            bedrooms: prop.structure.bedrooms,
            bathrooms: prop.structure.bathrooms,
            balcony: prop.structure.balcony,
          },
          area: {
            land_area: prop.area.land_area,
            usable_area: prop.area.usable_area || 0,
          },
          feature_ids: prop.features.map((f) => f.id),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Có lỗi xảy ra',
          description: 'Không thể tải thông tin bất động sản.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, reset, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: PropertyFormPayload) => {
    setSubmitting(true);
    try {
      await updateProperty(propertyId, data);

      if (files.length > 0) {
        await uploadImages(propertyId, files, primaryImageIndex);
      }

      toast({
        title: 'Cập nhật thành công',
        description: 'Bất động sản đã được cập nhật.',
      });

      router.push('/admin/properties');
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Không thể cập nhật bất động sản.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    const current = selectedFeatureIds || [];
    if (current.includes(featureId)) {
      setValue('feature_ids', current.filter((id) => id !== featureId));
    } else {
      setValue('feature_ids', [...current, featureId]);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent"></div>
        <p className="mt-4 text-slate-600">Đang tải...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Không tìm thấy bất động sản</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Chỉnh sửa tin đăng</h1>
        <p className="text-slate-600 mt-1">Cập nhật thông tin bất động sản</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" {...register('title')} placeholder="Căn hộ cao cấp..." />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_type">Loại hình *</Label>
                <Select
                  value={watch('property_type')}
                  onValueChange={(value: string) =>
                    setValue('property_type', value as PropertyType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">Nhà riêng</SelectItem>
                    <SelectItem value="apartment">Căn hộ</SelectItem>
                    <SelectItem value="villa">Biệt thự</SelectItem>
                    <SelectItem value="townhouse">Nhà phố</SelectItem>
                    <SelectItem value="land">Đất nền</SelectItem>
                    <SelectItem value="office">Văn phòng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="listing_type">Mục đích *</Label>
                <Select
                  value={watch('listing_type')}
                  onValueChange={(value: string) =>
                    setValue('listing_type', value as ListingType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mục đích" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Bán</SelectItem>
                    <SelectItem value="rent">Cho thuê</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Giá *</Label>
                <Input
                  id="price"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="5000000000"
                />
                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <Label htmlFor="legal_status">Pháp lý *</Label>
                <Select
                  value={watch('legal_status')}
                  onValueChange={(value: string) =>
                    setValue('legal_status', value as LegalStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn pháp lý" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="red_book">Sổ đỏ</SelectItem>
                    <SelectItem value="pink_book">Sổ hồng</SelectItem>
                    <SelectItem value="contract">Hợp đồng mua bán</SelectItem>
                    <SelectItem value="unknown">Không rõ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="direction">Hướng</Label>
                <Select
                  value={watch('direction') || ''}
                  onValueChange={(value: string) =>
                    setValue('direction', value as Direction)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hướng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">Bắc</SelectItem>
                    <SelectItem value="south">Nam</SelectItem>
                    <SelectItem value="east">Đông</SelectItem>
                    <SelectItem value="west">Tây</SelectItem>
                    <SelectItem value="north_east">Đông Bắc</SelectItem>
                    <SelectItem value="north_west">Tây Bắc</SelectItem>
                    <SelectItem value="south_east">Đông Nam</SelectItem>
                    <SelectItem value="south_west">Tây Nam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Trạng thái *</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value: string) =>
                    setValue('status', value as ListingStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Xuất bản</SelectItem>
                    <SelectItem value="sold">Đã bán</SelectItem>
                    <SelectItem value="rented">Đã cho thuê</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Mô tả chi tiết về bất động sản..."
                rows={5}
              />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Địa chỉ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address.full_address">Địa chỉ đầy đủ *</Label>
              <Input
                id="address.full_address"
                {...register('address.full_address')}
                placeholder="123 Nguyễn Huệ"
              />
              {errors.address?.full_address && (
                <p className="text-sm text-red-600 mt-1">{errors.address.full_address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="address.ward">Phường/Xã</Label>
                <Input id="address.ward" {...register('address.ward')} placeholder="Phường 1" />
              </div>

              <div>
                <Label htmlFor="address.district">Quận/Huyện *</Label>
                <Input id="address.district" {...register('address.district')} placeholder="Quận 1" />
                {errors.address?.district && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.district.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address.city">Tỉnh/Thành phố *</Label>
                <Input id="address.city" {...register('address.city')} placeholder="Hồ Chí Minh" />
                {errors.address?.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cấu trúc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="structure.floors">Số tầng *</Label>
                <Input
                  id="structure.floors"
                  type="number"
                  {...register('structure.floors', { valueAsNumber: true })}
                  placeholder="1"
                />
              </div>

              <div>
                <Label htmlFor="structure.bedrooms">Phòng ngủ *</Label>
                <Input
                  id="structure.bedrooms"
                  type="number"
                  {...register('structure.bedrooms', { valueAsNumber: true })}
                  placeholder="2"
                />
              </div>

              <div>
                <Label htmlFor="structure.bathrooms">Phòng tắm *</Label>
                <Input
                  id="structure.bathrooms"
                  type="number"
                  {...register('structure.bathrooms', { valueAsNumber: true })}
                  placeholder="2"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="structure.balcony"
                checked={watch('structure.balcony')}
                onCheckedChange={(checked: boolean) =>
                  setValue('structure.balcony', checked)
                }
              />
              <Label htmlFor="structure.balcony" className="cursor-pointer">
                Có ban công
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diện tích</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area.land_area">Diện tích đất (m²) *</Label>
                <Input
                  id="area.land_area"
                  type="number"
                  {...register('area.land_area', { valueAsNumber: true })}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="area.usable_area">Diện tích sử dụng (m²) *</Label>
                <Input
                  id="area.usable_area"
                  type="number"
                  {...register('area.usable_area', { valueAsNumber: true })}
                  placeholder="80"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiện ích</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature.id}
                    checked={selectedFeatureIds.includes(feature.id)}
                    onCheckedChange={() => toggleFeature(feature.id)}
                  />
                  <Label htmlFor={feature.id} className="cursor-pointer">
                    {feature.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            {property.images.length > 0 ? (
              <div className="grid grid-cols-4 gap-4 mb-4">
                {property.images.map((image) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.url}
                      alt="Property"
                      className="w-full h-32 object-cover rounded"
                    />
                    {image.is_primary && (
                      <div className="absolute bottom-1 left-1 bg-blue-900 text-white text-xs px-2 py-1 rounded">
                        Ảnh chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">Chưa có hình ảnh</p>
            )}

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <Label htmlFor="images" className="cursor-pointer">
                <span className="text-blue-900 hover:underline">Thêm hình ảnh mới</span>
              </Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className={`w-full h-32 object-cover rounded border-2 ${
                        primaryImageIndex === index ? 'border-blue-900' : 'border-slate-200'
                      }`}
                      onClick={() => setPrimaryImageIndex(index)}
                    />
                    <Button
                      type="button"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={submitting}>
            {submitting ? 'Đang cập nhật...' : 'Cập nhật tin đăng'}
          </Button>
          <Button
            type="button"
            onClick={() => router.back()}
            className="border border-input bg-background text-black-600 hover:bg-accent hover:text-accent-foreground"
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
