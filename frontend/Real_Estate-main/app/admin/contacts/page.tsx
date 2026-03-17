'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CreditCard as Edit, Phone, Mail } from 'lucide-react';
import { ContactRequest, ContactStatus } from '@/types';
import { getContacts, updateContactStatus } from '@/lib/apiClient';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const statusLabels: Record<ContactStatus, string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  resolved: 'Đã xử lý',
};

const statusColors: Record<ContactStatus, string> = {
  new: 'bg-yellow-500',
  contacted: 'bg-blue-500',
  resolved: 'bg-green-500',
};

export default function AdminContactsPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState<ContactRequest | null>(null);
  const [editStatus, setEditStatus] = useState<ContactStatus>('new');
  const [editNotes, setEditNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await getContacts();
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleEdit = (contact: ContactRequest) => {
    setEditingContact(contact);
    setEditStatus(contact.status);
    setEditNotes(contact.notes || '');
  };

  const handleSave = async () => {
    if (!editingContact) return;

    setSubmitting(true);
    try {
      await updateContactStatus(editingContact.id, editStatus, editNotes);

      toast({
        title: 'Cập nhật thành công',
        description: 'Trạng thái liên hệ đã được cập nhật.',
      });

      setContacts(
        contacts.map((c) =>
          c.id === editingContact.id
            ? { ...c, status: editStatus, notes: editNotes }
            : c
        )
      );

      setEditingContact(null);
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra',
        description: 'Không thể cập nhật trạng thái.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Yêu cầu liên hệ</h1>
        <p className="text-slate-600 mt-1">Quản lý các yêu cầu từ khách hàng</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-900 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Đang tải...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Chưa có yêu cầu nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Bất động sản</TableHead>
                    <TableHead>Lời nhắn</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        {contact.customer_name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1" />
                            <a
                              href={`tel:${contact.customer_phone}`}
                              className="text-blue-900 hover:underline"
                            >
                              {contact.customer_phone}
                            </a>
                          </div>
                          {contact.customer_email && (
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1" />
                              <a
                                href={`mailto:${contact.customer_email}`}
                                className="text-blue-900 hover:underline"
                              >
                                {contact.customer_email}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {contact.property?.title || 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {contact.message}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[contact.status]}>
                          {statusLabels[contact.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleEdit(contact)}
                            className="border border-input bg-background text-red-600 hover:bg-red-50 hover:text-red-700 h-9 w-9 rounded-md p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật yêu cầu liên hệ</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái và ghi chú cho yêu cầu này
            </DialogDescription>
          </DialogHeader>

          {editingContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Khách hàng</p>
                  <p className="font-semibold">{editingContact.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Số điện thoại</p>
                  <p className="font-semibold">{editingContact.customer_phone}</p>
                </div>
                {editingContact.property && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600">Bất động sản</p>
                    <p className="font-semibold">{editingContact.property.title}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Lời nhắn</p>
                  <p className="text-sm">{editingContact.message}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={editStatus}
                  onValueChange={(value: string) =>
                    setEditStatus(value as ContactStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="contacted">Đã liên hệ</SelectItem>
                    <SelectItem value="resolved">Đã xử lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Ghi chú nội bộ</Label>
                <Textarea
                  id="notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ghi chú về quá trình xử lý..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setEditingContact(null)}
              className="border border-input bg-background text-black-600 hover:bg-accent hover:text-accent-foreground"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-900 hover:bg-blue-800"
              disabled={submitting}
            >
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
