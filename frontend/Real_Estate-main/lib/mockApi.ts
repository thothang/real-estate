import {
  Property,
  PropertyFormPayload,
  PaginatedResponse,
  SingleResponse,
  Feature,
  ContactRequest,
  ContactStatus,
} from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockFeatures: Feature[] = [
  { id: 'feat-1', name: 'Hồ bơi', description: 'Hồ bơi trong nhà' },
  { id: 'feat-2', name: 'Gara ô tô', description: 'Chỗ đậu xe ô tô' },
  { id: 'feat-3', name: 'Thang máy', description: 'Thang máy hiện đại' },
  { id: 'feat-4', name: 'Sân vườn', description: 'Sân vườn rộng rãi' },
  { id: 'feat-5', name: 'Phòng gym', description: 'Phòng tập thể dục' },
  { id: 'feat-6', name: 'Sân thượng', description: 'Sân thượng view đẹp' },
  { id: 'feat-7', name: 'An ninh 24/7', description: 'Bảo vệ 24 giờ' },
  { id: 'feat-8', name: 'Gần trường học', description: 'Gần khu vực trường học' },
];

let mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Căn hộ cao cấp Vinhomes Central Park',
    slug: 'can-ho-cao-cap-vinhomes-central-park',
    property_type: 'apartment',
    listing_type: 'sale',
    price: 4500000000,
    direction: 'south_east',
    legal_status: 'pink_book',
    description: 'Căn hộ cao cấp tại Vinhomes Central Park, view sông Saigon tuyệt đẹp. Thiết kế hiện đại, đầy đủ nội thất cao cấp. Vị trí đắc địa, gần trung tâm thành phố.',
    status: 'published',
    address: {
      full_address: '208 Nguyễn Hữu Cảnh',
      ward: 'Phường 22',
      district: 'Bình Thạnh',
      city: 'Hồ Chí Minh',
      latitude: 10.7869,
      longitude: 106.7209,
    },
    structure: {
      floors: 1,
      bedrooms: 2,
      bathrooms: 2,
      living_rooms: 1,
      kitchens: 1,
      mezzanine: false,
      balcony: true,
    },
    area: {
      land_area: 80,
      usable_area: 75,
    },
    features: [
      { id: 'feat-1', name: 'Hồ bơi' },
      { id: 'feat-3', name: 'Thang máy' },
      { id: 'feat-5', name: 'Phòng gym' },
      { id: 'feat-7', name: 'An ninh 24/7' },
    ],
    images: [
      { id: 'img-1-1', url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: true },
      { id: 'img-1-2', url: 'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-1-3', url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-1-4', url: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-1-5', url: 'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
    ],
    contact: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      zalo_phone: '0901234567',
    },
  },
  {
    id: 'prop-2',
    title: 'Biệt thự sang trọng Thảo Điền',
    slug: 'biet-thu-sang-trong-thao-dien',
    property_type: 'villa',
    listing_type: 'sale',
    price: 25000000000,
    direction: 'east',
    legal_status: 'red_book',
    description: 'Biệt thự đơn lập tại khu Thảo Điền, thiết kế sang trọng với sân vườn rộng rãi. Không gian sống lý tưởng cho gia đình.',
    status: 'published',
    address: {
      full_address: '123 Xuân Thủy',
      ward: 'Phường Thảo Điền',
      district: 'Quận 2',
      city: 'Hồ Chí Minh',
      latitude: 10.8032,
      longitude: 106.7382,
    },
    structure: {
      floors: 3,
      bedrooms: 5,
      bathrooms: 4,
      living_rooms: 2,
      kitchens: 1,
      mezzanine: true,
      balcony: true,
    },
    area: {
      width: 12,
      length: 20,
      land_area: 240,
      usable_area: 450,
    },
    features: [
      { id: 'feat-1', name: 'Hồ bơi' },
      { id: 'feat-2', name: 'Gara ô tô' },
      { id: 'feat-4', name: 'Sân vườn' },
      { id: 'feat-6', name: 'Sân thượng' },
      { id: 'feat-7', name: 'An ninh 24/7' },
    ],
    images: [
      { id: 'img-2-1', url: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: true },
      { id: 'img-2-2', url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-2-3', url: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-2-4', url: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-2-5', url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
    ],
    contact: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      zalo_phone: '0901234567',
    },
  },
  {
    id: 'prop-3',
    title: 'Nhà phố hiện đại Gò Vấp',
    slug: 'nha-pho-hien-dai-go-vap',
    property_type: 'townhouse',
    listing_type: 'sale',
    price: 8500000000,
    direction: 'north',
    legal_status: 'red_book',
    description: 'Nhà phố 1 trệt 3 lầu, thiết kế hiện đại, đầy đủ tiện nghi. Vị trí thuận lợi, gần chợ, trường học.',
    status: 'published',
    address: {
      full_address: '456 Phan Văn Trị',
      ward: 'Phường 11',
      district: 'Gò Vấp',
      city: 'Hồ Chí Minh',
      latitude: 10.8376,
      longitude: 106.6676,
    },
    structure: {
      floors: 4,
      bedrooms: 4,
      bathrooms: 3,
      living_rooms: 1,
      kitchens: 1,
      mezzanine: false,
      balcony: true,
    },
    area: {
      width: 5,
      length: 18,
      land_area: 90,
      usable_area: 280,
    },
    features: [
      { id: 'feat-2', name: 'Gara ô tô' },
      { id: 'feat-6', name: 'Sân thượng' },
      { id: 'feat-8', name: 'Gần trường học' },
    ],
    images: [
      { id: 'img-3-1', url: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: true },
      { id: 'img-3-2', url: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-3-3', url: 'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-3-4', url: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-3-5', url: 'https://images.pexels.com/photos/2119714/pexels-photo-2119714.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
    ],
    contact: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      zalo_phone: '0901234567',
    },
  },
  {
    id: 'prop-4',
    title: 'Căn hộ dịch vụ cho thuê Quận 1',
    slug: 'can-ho-dich-vu-cho-thue-quan-1',
    property_type: 'apartment',
    listing_type: 'rent',
    price: 15000000,
    direction: 'south',
    legal_status: 'contract',
    description: 'Căn hộ dịch vụ đầy đủ nội thất, vị trí trung tâm Quận 1. Phù hợp cho người nước ngoài và gia đình trẻ.',
    status: 'published',
    address: {
      full_address: '789 Lê Thánh Tôn',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      city: 'Hồ Chí Minh',
      latitude: 10.7769,
      longitude: 106.7009,
    },
    structure: {
      floors: 1,
      bedrooms: 1,
      bathrooms: 1,
      living_rooms: 1,
      kitchens: 1,
      mezzanine: false,
      balcony: true,
    },
    area: {
      land_area: 45,
      usable_area: 40,
    },
    features: [
      { id: 'feat-3', name: 'Thang máy' },
      { id: 'feat-5', name: 'Phòng gym' },
      { id: 'feat-7', name: 'An ninh 24/7' },
    ],
    images: [
      { id: 'img-4-1', url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: true },
      { id: 'img-4-2', url: 'https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-4-3', url: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-4-4', url: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-4-5', url: 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
    ],
    contact: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      zalo_phone: '0901234567',
    },
  },
  {
    id: 'prop-5',
    title: 'Đất nền dự án Nhà Bè',
    slug: 'dat-nen-du-an-nha-be',
    property_type: 'land',
    listing_type: 'sale',
    price: 3500000000,
    direction: 'west',
    legal_status: 'pink_book',
    description: 'Đất nền dự án có sổ hồng riêng, hạ tầng hoàn thiện. Vị trí đẹp, phù hợp đầu tư hoặc xây dựng nhà ở.',
    status: 'published',
    address: {
      full_address: 'Đường Số 8, Khu dân cư Phú Xuân',
      ward: 'Phường Nhà Bè',
      district: 'Nhà Bè',
      city: 'Hồ Chí Minh',
      latitude: 10.6994,
      longitude: 106.7308,
    },
    structure: {
      floors: 0,
      bedrooms: 0,
      bathrooms: 0,
      living_rooms: 0,
      kitchens: 0,
      mezzanine: false,
      balcony: false,
    },
    area: {
      width: 8,
      length: 16,
      land_area: 128,
    },
    features: [],
    images: [
      { id: 'img-5-1', url: 'https://images.pexels.com/photos/221540/pexels-photo-221540.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: true },
      { id: 'img-5-2', url: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-5-3', url: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
    ],
    contact: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      zalo_phone: '0901234567',
    },
  },
  {
    id: 'prop-6',
    title: 'Văn phòng hạng A Quận 3',
    slug: 'van-phong-hang-a-quan-3',
    property_type: 'office',
    listing_type: 'rent',
    price: 45000000,
    legal_status: 'contract',
    description: 'Văn phòng hạng A, diện tích rộng, view thoáng. Phù hợp cho công ty từ 20-30 nhân viên.',
    status: 'published',
    address: {
      full_address: '234 Nam Kỳ Khởi Nghĩa',
      ward: 'Phường 8',
      district: 'Quận 3',
      city: 'Hồ Chí Minh',
      latitude: 10.7813,
      longitude: 106.6926,
    },
    structure: {
      floors: 1,
      bedrooms: 0,
      bathrooms: 2,
      living_rooms: 0,
      kitchens: 1,
      mezzanine: false,
      balcony: false,
    },
    area: {
      land_area: 150,
      usable_area: 150,
    },
    features: [
      { id: 'feat-3', name: 'Thang máy' },
      { id: 'feat-7', name: 'An ninh 24/7' },
    ],
    images: [
      { id: 'img-6-1', url: 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: true },
      { id: 'img-6-2', url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
      { id: 'img-6-3', url: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=1200', is_primary: false },
    ],
    contact: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      zalo_phone: '0901234567',
    },
  },
];

let mockContacts: ContactRequest[] = [
  {
    id: 'contact-1',
    property_id: 'prop-1',
    customer_name: 'Trần Thị Lan',
    customer_phone: '0987654321',
    customer_email: 'lantran@email.com',
    message: 'Tôi muốn xem căn hộ này vào cuối tuần.',
    status: 'new',
    property: {
      id: 'prop-1',
      title: 'Căn hộ cao cấp Vinhomes Central Park',
    },
    created_at: '2026-03-08T10:30:00Z',
  },
  {
    id: 'contact-2',
    property_id: 'prop-2',
    customer_name: 'Lê Văn Hùng',
    customer_phone: '0912345678',
    customer_email: 'hungle@email.com',
    message: 'Cho tôi hỏi biệt thự này còn không? Giá có thương lượng được không?',
    status: 'contacted',
    notes: 'Đã gọi điện tư vấn, khách đang cân nhắc',
    property: {
      id: 'prop-2',
      title: 'Biệt thự sang trọng Thảo Điền',
    },
    created_at: '2026-03-07T14:20:00Z',
  },
  {
    id: 'contact-3',
    property_id: 'prop-3',
    customer_name: 'Phạm Minh Tuấn',
    customer_phone: '0909876543',
    message: 'Nhà này có thể xem vào thứ 7 được không?',
    status: 'resolved',
    notes: 'Đã cho khách xem nhà, khách chưa quyết định',
    property: {
      id: 'prop-3',
      title: 'Nhà phố hiện đại Gò Vấp',
    },
    created_at: '2026-03-05T09:15:00Z',
  },
];

export async function getProperties(
  filters: {
    property_type?: string;
    listing_type?: string;
    city?: string;
    district?: string;
    min_price?: number;
    max_price?: number;
  } = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Property>> {
  await delay(500);

  let filtered = mockProperties.filter((p) => p.status === 'published');

  if (filters.property_type) {
    filtered = filtered.filter((p) => p.property_type === filters.property_type);
  }
  if (filters.listing_type) {
    filtered = filtered.filter((p) => p.listing_type === filters.listing_type);
  }
  if (filters.city) {
    filtered = filtered.filter((p) => p.address.city === filters.city);
  }
  if (filters.district) {
    filtered = filtered.filter((p) => p.address.district === filters.district);
  }
  if (filters.min_price) {
    filtered = filtered.filter((p) => p.price >= filters.min_price!);
  }
  if (filters.max_price) {
    filtered = filtered.filter((p) => p.price <= filters.max_price!);
  }

  const total_items = filtered.length;
  const total_pages = Math.ceil(total_items / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filtered.slice(start, end);

  return {
    success: true,
    data: paginatedData,
    meta: {
      page,
      limit,
      total_items,
      total_pages,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getPropertyBySlug(slug: string): Promise<SingleResponse<Property>> {
  await delay(400);

  const property = mockProperties.find((p) => p.slug === slug);

  if (!property) {
    throw new Error('Property not found');
  }

  return {
    success: true,
    data: property,
    timestamp: new Date().toISOString(),
  };
}

export async function submitContact(data: {
  property_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message: string;
}): Promise<SingleResponse<{}>> {
  await delay(600);

  const property = data.property_id
    ? mockProperties.find((p) => p.id === data.property_id)
    : undefined;

  const newContact: ContactRequest = {
    id: `contact-${Date.now()}`,
    property_id: data.property_id,
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email,
    message: data.message,
    status: 'new',
    property: property
      ? {
          id: property.id,
          title: property.title,
        }
      : undefined,
    created_at: new Date().toISOString(),
  };

  mockContacts.unshift(newContact);

  return {
    success: true,
    data: {},
    timestamp: new Date().toISOString(),
  };
}

export async function getAdminProperties(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Property>> {
  await delay(400);

  const total_items = mockProperties.length;
  const total_pages = Math.ceil(total_items / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = mockProperties.slice(start, end);

  return {
    success: true,
    data: paginatedData,
    meta: {
      page,
      limit,
      total_items,
      total_pages,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getPropertyById(id: string): Promise<SingleResponse<Property>> {
  await delay(400);

  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    throw new Error('Property not found');
  }

  return {
    success: true,
    data: property,
    timestamp: new Date().toISOString(),
  };
}

export async function createProperty(data: PropertyFormPayload): Promise<SingleResponse<Property>> {
  await delay(700);

  const slug = data.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const selectedFeatures = mockFeatures
    .filter((f) => data.feature_ids.includes(f.id))
    .map((f) => ({ id: f.id, name: f.name }));

  const newProperty: Property = {
    id: `prop-${Date.now()}`,
    title: data.title,
    slug,
    property_type: data.property_type,
    listing_type: data.listing_type,
    price: data.price,
    direction: data.direction,
    legal_status: data.legal_status,
    description: data.description,
    status: data.status,
    address: {
      full_address: data.address.full_address,
      ward: data.address.ward || '',
      district: data.address.district,
      city: data.address.city,
    },
    structure: {
      floors: data.structure.floors,
      bedrooms: data.structure.bedrooms,
      bathrooms: data.structure.bathrooms,
      living_rooms: 1,
      kitchens: 1,
      mezzanine: false,
      balcony: data.structure.balcony,
    },
    area: {
      land_area: data.area.land_area,
      usable_area: data.area.usable_area,
    },
    features: selectedFeatures,
    images: [],
    contact: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      zalo_phone: '0901234567',
    },
  };

  mockProperties.unshift(newProperty);

  return {
    success: true,
    data: newProperty,
    timestamp: new Date().toISOString(),
  };
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyFormPayload>
): Promise<SingleResponse<Property>> {
  await delay(600);

  const index = mockProperties.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error('Property not found');
  }

  const property = mockProperties[index];

  if (data.title) property.title = data.title;
  if (data.property_type) property.property_type = data.property_type;
  if (data.listing_type) property.listing_type = data.listing_type;
  if (data.price !== undefined) property.price = data.price;
  if (data.direction) property.direction = data.direction;
  if (data.legal_status) property.legal_status = data.legal_status;
  if (data.description) property.description = data.description;
  if (data.status) property.status = data.status;

  if (data.address) {
    property.address = {
      ...property.address,
      ...data.address,
      ward: data.address.ward || property.address.ward,
    };
  }

  if (data.structure) {
    property.structure = {
      ...property.structure,
      ...data.structure,
    };
  }

  if (data.area) {
    property.area = {
      ...property.area,
      ...data.area,
    };
  }

  if (data.feature_ids) {
    property.features = mockFeatures
      .filter((f) => data.feature_ids!.includes(f.id))
      .map((f) => ({ id: f.id, name: f.name }));
  }

  mockProperties[index] = property;

  return {
    success: true,
    data: property,
    timestamp: new Date().toISOString(),
  };
}

export async function deleteProperty(id: string): Promise<SingleResponse<{}>> {
  await delay(500);

  const index = mockProperties.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error('Property not found');
  }

  mockProperties.splice(index, 1);

  return {
    success: true,
    data: {},
    timestamp: new Date().toISOString(),
  };
}

export async function uploadImages(
  id: string,
  files: File[],
  primary_index: number = 0
): Promise<SingleResponse<{ id: string; url: string; is_primary: boolean }[]>> {
  await delay(1000);

  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    throw new Error('Property not found');
  }

  const uploadedImages = files.map((file, index) => ({
    id: `img-${id}-${Date.now()}-${index}`,
    url: URL.createObjectURL(file),
    is_primary: index === primary_index,
  }));

  property.images.push(...uploadedImages);

  return {
    success: true,
    data: uploadedImages,
    timestamp: new Date().toISOString(),
  };
}

export async function getFeatures(): Promise<SingleResponse<Feature[]>> {
  await delay(300);

  return {
    success: true,
    data: mockFeatures,
    timestamp: new Date().toISOString(),
  };
}

export async function getContacts(
  status?: ContactStatus,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<ContactRequest>> {
  await delay(400);

  let filtered = mockContacts;

  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  const total_items = filtered.length;
  const total_pages = Math.ceil(total_items / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filtered.slice(start, end);

  return {
    success: true,
    data: paginatedData,
    meta: {
      page,
      limit,
      total_items,
      total_pages,
    },
    timestamp: new Date().toISOString(),
  };
}

export async function updateContactStatus(
  id: string,
  status: ContactStatus,
  notes?: string
): Promise<SingleResponse<ContactRequest>> {
  await delay(500);

  const contact = mockContacts.find((c) => c.id === id);

  if (!contact) {
    throw new Error('Contact not found');
  }

  contact.status = status;
  if (notes !== undefined) {
    contact.notes = notes;
  }

  return {
    success: true,
    data: contact,
    timestamp: new Date().toISOString(),
  };
}
