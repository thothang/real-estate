import Link from 'next/link';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-900" />
              <span className="text-xl font-bold text-slate-900">BĐS Premium</span>
            </div>
            <p className="text-sm text-slate-600">
              Nền tảng bất động sản hàng đầu Việt Nam. Kết nối người mua và người bán nhanh chóng, minh bạch.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Dịch vụ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?listing_type=sale" className="text-slate-600 hover:text-blue-900">
                  Mua bán
                </Link>
              </li>
              <li>
                <Link href="/?listing_type=rent" className="text-slate-600 hover:text-blue-900">
                  Cho thuê
                </Link>
              </li>
              <li>
                <Link href="/admin/properties/create" className="text-slate-600 hover:text-blue-900">
                  Đăng tin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-slate-600 hover:text-blue-900">
                  Hướng dẫn
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-blue-900">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-blue-900">
                  Chính sách
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Nguyễn Huệ, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>0901234567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>contact@bdspremium.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} BĐS Premium. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
