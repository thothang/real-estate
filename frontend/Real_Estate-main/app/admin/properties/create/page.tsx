'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X } from 'lucide-react';
import { PropertyFormPayload, Feature, PropertyType, ListingType, LegalStatus, Direction, ListingStatus } from '@/types';
import { createProperty, uploadImages, getFeatures } from '@/lib/apiClient';
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

export default function CreatePropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PropertyFormPayload>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      feature_ids: [],
      status: 'draft',
      structure: {
        floors: 1,
        bedrooms: 1,
        bathrooms: 1,
        balcony: false,
      },
      area: {
        land_area: 0,
        usable_area: 0,
      },
    },
  });

  const selectedFeatureIds = watch('feature_ids') || [];

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await getFeatures();
        setFeatures(response.data);
      } catch (error) {
        console.error('Error fetching features:', error);
      }
    };

    fetchFeatures();
  }, []);

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
      const response = await createProperty(data);

      if (files.length > 0) {
        await uploadImages(response.data.id, files, primaryImageIndex);
      }

      toast({
        title: 'Tạo thành công',
        description: 'Bất động sản đã được tạo.',
      });

      router.push('/admin/properties');
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Không thể tạo bất động sản.',
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

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Tạo tin đăng mới</h1>
        <p className="text-slate-600 mt-1">Điền thông tin bất động sản</p>
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
                {errors.property_type && <p className="text-sm text-red-600 mt-1">{errors.property_type.message}</p>}
              </div>

              <div>
                <Label htmlFor="listing_type">Mục đích *</Label>
                <Select
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
                {errors.listing_type && <p className="text-sm text-red-600 mt-1">{errors.listing_type.message}</p>}
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
                {errors.legal_status && <p className="text-sm text-red-600 mt-1">{errors.legal_status.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="direction">Hướng</Label>
                <Select
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
                  onValueChange={(value: string) =>
                    setValue('status', value as ListingStatus)
                  }
                  defaultValue="draft"
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
                {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>}
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
                {errors.structure?.floors && (
                  <p className="text-sm text-red-600 mt-1">{errors.structure.floors.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="structure.bedrooms">Phòng ngủ *</Label>
                <Input
                  id="structure.bedrooms"
                  type="number"
                  {...register('structure.bedrooms', { valueAsNumber: true })}
                  placeholder="2"
                />
                {errors.structure?.bedrooms && (
                  <p className="text-sm text-red-600 mt-1">{errors.structure.bedrooms.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="structure.bathrooms">Phòng tắm *</Label>
                <Input
                  id="structure.bathrooms"
                  type="number"
                  {...register('structure.bathrooms', { valueAsNumber: true })}
                  placeholder="2"
                />
                {errors.structure?.bathrooms && (
                  <p className="text-sm text-red-600 mt-1">{errors.structure.bathrooms.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="structure.balcony"
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
                {errors.area?.land_area && (
                  <p className="text-sm text-red-600 mt-1">{errors.area.land_area.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="area.usable_area">Diện tích sử dụng (m²) *</Label>
                <Input
                  id="area.usable_area"
                  type="number"
                  {...register('area.usable_area', { valueAsNumber: true })}
                  placeholder="80"
                />
                {errors.area?.usable_area && (
                  <p className="text-sm text-red-600 mt-1">{errors.area.usable_area.message}</p>
                )}
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
            <CardTitle>Hình ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <Label htmlFor="images" className="cursor-pointer">
                <span className="text-blue-900 hover:underline">Chọn file</span> hoặc kéo thả vào đây
              </Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-sm text-slate-500 mt-2">PNG, JPG (tối đa 10MB mỗi file)</p>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
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
                    {primaryImageIndex === index && (
                      <div className="absolute bottom-1 left-1 bg-blue-900 text-white text-xs px-2 py-1 rounded">
                        Ảnh chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="bg-blue-900 hover:bg-blue-800" disabled={submitting}>
            {submitting ? 'Đang tạo...' : 'Tạo tin đăng'}
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
