require('dotenv/config');

const { PrismaClient, UserRole, PropertyType, ListingType, LegalStatus, Direction, ListingStatus, ContactStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

function slugify(value) {
  return value
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@realestate.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin',
      role: UserRole.admin,
      passwordHash: adminPasswordHash,
    },
    create: {
      name: 'Admin',
      email: adminEmail,
      phone: '0900000000',
      zaloPhone: '0900000000',
      passwordHash: adminPasswordHash,
      role: UserRole.admin,
    },
  });

  const featureSeeds = [
    { name: 'Gần trường học', description: 'Thuận tiện đi học' },
    { name: 'Gần bệnh viện', description: 'Gần khu y tế' },
    { name: 'Nội thất đầy đủ', description: 'Đầy đủ nội thất cơ bản' },
    { name: 'Có chỗ đậu xe', description: 'Khu vực để xe rộng rãi' },
    { name: 'An ninh 24/7', description: 'Bảo vệ tuần tra' },
  ];

  const features = [];
  for (const seed of featureSeeds) {
    const existing = await prisma.feature.findFirst({
      where: {
        name: seed.name,
      },
    });

    const feature = existing
      ? await prisma.feature.update({
          where: { id: existing.id },
          data: {
            description: seed.description,
          },
        })
      : await prisma.feature.create({ data: seed });

    features.push(feature);
  }

  const now = new Date();
  const cities = [
    {
      city: 'Hồ Chí Minh',
      districts: [
        { district: 'Quận 1', wards: ['Bến Nghé', 'Bến Thành', 'Đa Kao'] },
        { district: 'Quận 7', wards: ['Tân Phong', 'Tân Hưng', 'Phú Mỹ'] },
        { district: 'Thủ Đức', wards: ['An Phú', 'Thảo Điền', 'Hiệp Bình Chánh'] },
      ],
    },
    {
      city: 'Hà Nội',
      districts: [
        { district: 'Ba Đình', wards: ['Liễu Giai', 'Ngọc Hà', 'Đội Cấn'] },
        { district: 'Cầu Giấy', wards: ['Dịch Vọng', 'Mai Dịch', 'Nghĩa Tân'] },
        { district: 'Nam Từ Liêm', wards: ['Mỹ Đình 1', 'Mỹ Đình 2', 'Cầu Diễn'] },
      ],
    },
    {
      city: 'Đà Nẵng',
      districts: [
        { district: 'Hải Châu', wards: ['Hải Châu 1', 'Hải Châu 2', 'Hòa Thuận Đông'] },
        { district: 'Sơn Trà', wards: ['An Hải Bắc', 'Mân Thái', 'Phước Mỹ'] },
        { district: 'Ngũ Hành Sơn', wards: ['Mỹ An', 'Khuê Mỹ', 'Hòa Hải'] },
      ],
    },
  ];

  const titlePrefixes = [
    'Bán',
    'Cho thuê',
    'Chính chủ',
    'Giá tốt',
    'View đẹp',
    'Full nội thất',
  ];

  const titleSubjects = {
    [PropertyType.house]: ['nhà cấp 4', 'nhà hẻm', 'nhà mặt tiền'],
    [PropertyType.apartment]: ['căn hộ 1PN', 'căn hộ 2PN', 'căn hộ studio'],
    [PropertyType.villa]: ['villa sân vườn', 'biệt thự mini', 'villa hồ bơi'],
    [PropertyType.townhouse]: ['nhà phố', 'shophouse', 'nhà phố thương mại'],
    [PropertyType.land]: ['đất nền', 'đất thổ cư', 'đất sổ đỏ'],
    [PropertyType.office]: ['văn phòng', 'mặt bằng', 'tòa nhà mini'],
  };

  const unsplashImages = [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505691723518-36a5ac3b2fa2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  ];

  const allPropertyTypes = Object.values(PropertyType);
  const allListingTypes = Object.values(ListingType);
  const allDirections = Object.values(Direction);
  const allLegalStatuses = Object.values(LegalStatus);
  const statusPool = [
    ListingStatus.published,
    ListingStatus.published,
    ListingStatus.published,
    ListingStatus.draft,
    ListingStatus.sold,
    ListingStatus.rented,
  ];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickMany(arr, count) {
    const copy = [...arr];
    const result = [];
    while (copy.length && result.length < count) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }

  function priceFor(listingType, propertyType) {
    if (listingType === ListingType.rent) {
      if (propertyType === PropertyType.office) return 12000000 + Math.floor(Math.random() * 35000000);
      if (propertyType === PropertyType.apartment) return 8000000 + Math.floor(Math.random() * 22000000);
      return 10000000 + Math.floor(Math.random() * 30000000);
    }

    if (propertyType === PropertyType.land) return 1500000000 + Math.floor(Math.random() * 12000000000);
    if (propertyType === PropertyType.villa) return 8000000000 + Math.floor(Math.random() * 25000000000);
    if (propertyType === PropertyType.apartment) return 1800000000 + Math.floor(Math.random() * 7000000000);
    if (propertyType === PropertyType.office) return 3500000000 + Math.floor(Math.random() * 14000000000);
    return 2500000000 + Math.floor(Math.random() * 15000000000);
  }

  function areaFor(propertyType) {
    if (propertyType === PropertyType.apartment) {
      const usableArea = 45 + Math.floor(Math.random() * 80);
      return {
        width: null,
        length: null,
        landArea: usableArea,
        usableArea,
      };
    }

    const width = 3.5 + Math.random() * 6;
    const length = 10 + Math.random() * 18;
    const landArea = Math.round(width * length);
    const usableArea = landArea * (1 + Math.floor(Math.random() * 4));
    return {
      width: Number(width.toFixed(1)),
      length: Number(length.toFixed(1)),
      landArea,
      usableArea,
    };
  }

  function structureFor(propertyType) {
    if (propertyType === PropertyType.land) {
      return {
        floors: 0,
        bedrooms: 0,
        bathrooms: 0,
        livingRooms: 0,
        kitchens: 0,
        mezzanine: false,
        balcony: false,
      };
    }

    const floors = propertyType === PropertyType.apartment ? 1 : 1 + Math.floor(Math.random() * 4);
    const bedrooms = propertyType === PropertyType.office ? 0 : 1 + Math.floor(Math.random() * 5);
    const bathrooms = propertyType === PropertyType.office ? 1 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 4);
    const livingRooms = propertyType === PropertyType.office ? 0 : 1;
    const kitchens = propertyType === PropertyType.office ? 0 : 1;
    return {
      floors,
      bedrooms,
      bathrooms,
      livingRooms,
      kitchens,
      mezzanine: Math.random() < 0.25,
      balcony: Math.random() < 0.6,
    };
  }

  for (let i = 0; i < 30; i += 1) {
    const propertyType = allPropertyTypes[i % allPropertyTypes.length];
    const listingType = allListingTypes[i % allListingTypes.length];
    const citySeed = pick(cities);
    const districtSeed = pick(citySeed.districts);
    const ward = pick(districtSeed.wards);

    const prefix = listingType === ListingType.rent ? pick(['Cho thuê', 'Giá tốt', 'View đẹp']) : pick(titlePrefixes);
    const subject = pick(titleSubjects[propertyType]);
    const title = `${prefix} ${subject} - ${ward}, ${districtSeed.district}`;

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${now.getTime()}-${i}-${Math.floor(Math.random() * 10000)}`;

    const status = statusPool[i % statusPool.length];
    const legalStatus = pick(allLegalStatuses);
    const direction = pick(allDirections);
    const price = priceFor(listingType, propertyType);
    const area = areaFor(propertyType);
    const structure = structureFor(propertyType);

    const imageCount = 1 + Math.floor(Math.random() * 4);
    const pickedImages = pickMany(unsplashImages, imageCount);
    const images = pickedImages.map((url, idx) => ({
      url,
      isPrimary: idx === 0,
      displayOrder: idx,
    }));

    const property = await prisma.property.create({
      data: {
        title,
        slug,
        propertyType,
        listingType,
        price,
        direction,
        legalStatus,
        description: 'Tin đăng demo được tạo từ seed để test UI và API.',
        status,
        postedBy: admin.id,
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        available: status === ListingStatus.published,
        address: {
          create: {
            fullAddress: `${10 + Math.floor(Math.random() * 200)} ${districtSeed.district}, ${citySeed.city}`,
            ward,
            district: districtSeed.district,
            city: citySeed.city,
            latitude: null,
            longitude: null,
          },
        },
        structure: {
          create: structure,
        },
        area: {
          create: area,
        },
        images: {
          create: images,
        },
      },
    });

    const featureCount = 2 + Math.floor(Math.random() * 3);
    const featurePick = pickMany(features, featureCount);
    for (const feature of featurePick) {
      await prisma.propertyFeature.upsert({
        where: {
          propertyId_featureId: {
            propertyId: property.id,
            featureId: feature.id,
          },
        },
        update: {},
        create: {
          propertyId: property.id,
          featureId: feature.id,
        },
      });
    }

    if (Math.random() < 0.35) {
      await prisma.contactRequest.create({
        data: {
          propertyId: property.id,
          customerName: 'Khách hàng demo',
          customerPhone: '0912345678',
          customerEmail: 'customer@example.com',
          message: 'Mình muốn xem nhà. Liên hệ giúp mình nhé.',
          status: ContactStatus.new,
          notes: null,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
