import { Building2, Target, Users, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-900 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về chúng tôi</h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Nền tảng bất động sản hàng đầu Việt Nam, kết nối người mua và người bán
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">
              BĐS Premium - Đối tác tin cậy của bạn
            </h2>
            <div className="prose prose-lg max-w-none text-slate-700">
              <p className="text-center mb-8">
                BĐS Premium là nền tảng công nghệ hàng đầu trong lĩnh vực bất động sản tại Việt Nam.
                Chúng tôi cung cấp giải pháp toàn diện cho việc mua bán, cho thuê các loại hình
                bất động sản từ nhà riêng, căn hộ, biệt thự đến đất nền và văn phòng.
              </p>
              <p className="text-center">
                Với đội ngũ chuyên nghiệp và tâm huyết, chúng tôi cam kết mang đến trải nghiệm
                tốt nhất cho khách hàng thông qua công nghệ hiện đại và dịch vụ chất lượng cao.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Giá trị cốt lõi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Target className="h-8 w-8 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Sứ mệnh
                      </h3>
                      <p className="text-slate-600">
                        Kết nối mọi người với ngôi nhà mơ ước thông qua công nghệ và dịch vụ
                        chuyên nghiệp, tạo nên những giá trị bền vững cho cộng đồng.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Building2 className="h-8 w-8 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Tầm nhìn
                      </h3>
                      <p className="text-slate-600">
                        Trở thành nền tảng bất động sản số 1 Việt Nam, được tin dùng bởi hàng
                        triệu người với độ tin cậy và chất lượng dịch vụ hàng đầu.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-8 w-8 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Con người
                      </h3>
                      <p className="text-slate-600">
                        Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm và luôn đặt lợi ích
                        khách hàng lên hàng đầu trong mọi quyết định.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Award className="h-8 w-8 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Chất lượng
                      </h3>
                      <p className="text-slate-600">
                        Cam kết cung cấp thông tin chính xác, minh bạch và dịch vụ
                        chuyên nghiệp trong từng giao dịch bất động sản.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Tại sao chọn BĐS Premium?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1000+
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Bất động sản
                </h3>
                <p className="text-slate-600">
                  Hàng ngàn tin đăng được cập nhật liên tục
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  10K+
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Khách hàng
                </h3>
                <p className="text-slate-600">
                  Tin tưởng và sử dụng dịch vụ của chúng tôi
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-900 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  24/7
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Hỗ trợ
                </h3>
                <p className="text-slate-600">
                  Đội ngũ tư vấn sẵn sàng hỗ trợ mọi lúc
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-900 to-slate-800 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Bắt đầu hành trình của bạn</h2>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
              Hãy để chúng tôi đồng hành cùng bạn tìm kiếm ngôi nhà mơ ước hoặc
              bất động sản đầu tư lý tưởng
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/properties"
                className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
              >
                Xem bất động sản
              </a>
              <a
                href="tel:0901234567"
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Liên hệ: 0901234567
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
