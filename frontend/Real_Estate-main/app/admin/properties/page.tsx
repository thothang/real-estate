'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react';
import { Property, ListingStatus } from '@/types';
import { getAdminProperties, deleteProperty } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<ListingStatus, string> = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  sold: 'Đã bán',
  rented: 'Đã cho thuê',
};

const propertyTypeLabels: Record<Property['property_type'], string> = {
  house: 'Nhà riêng',
  apartment: 'Căn hộ',
  villa: 'Biệt thự',
  townhouse: 'Nhà phố',
  land: 'Đất nền',
  office: 'Văn phòng',
};

const propertyTypeColors: Record<Property['property_type'], string> = {
  house: 'bg-slate-100 text-slate-800',
  apartment: 'bg-blue-100 text-blue-900',
  villa: 'bg-purple-100 text-purple-900',
  townhouse: 'bg-amber-100 text-amber-900',
  land: 'bg-green-100 text-green-900',
  office: 'bg-sky-100 text-sky-900',
};

const statusColors: Record<ListingStatus, string> = {
  draft: 'bg-slate-500',
  published: 'bg-green-500',
  sold: 'bg-blue-500',
  rented: 'bg-purple-500',
};

export default function AdminPropertiesPage() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await getAdminProperties();
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

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteProperty(deleteId);
      toast({
        title: 'Xóa thành công',
        description: 'Bất động sản đã được xóa.',
      });
      setProperties(properties.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Không thể xóa bất động sản.',
        variant: 'destructive',
      });
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý tin đăng</h1>
          <p className="text-slate-600 mt-1">Quản lý tất cả bất động sản</p>
        </div>
        <Link href="/admin/properties/create">
          <Button className="bg-blue-900 hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Tạo tin đăng mới
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách bất động sản</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Đang tải...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Chưa có bất động sản nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Loại hình</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {property.title}
                      </TableCell>
                      <TableCell>
                        <Badge className={propertyTypeColors[property.property_type]}>
                          {propertyTypeLabels[property.property_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-blue-900">
                        {formatPrice(property.price, property.listing_type)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {property.address.district}, {property.address.city}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[property.status]}>
                          {statusLabels[property.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/properties/${property.id}/edit`}>
                            <Button className="border border-input bg-background text-red-600 hover:bg-red-50 hover:text-red-700 h-9 w-9 rounded-md p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            className="border border-input bg-background text-red-600 hover:bg-red-50 hover:text-red-700 h-9 w-9 rounded-md p-0"
                            onClick={() => setDeleteId(property.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bất động sản này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
