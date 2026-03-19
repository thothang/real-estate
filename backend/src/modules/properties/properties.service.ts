import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ListingStatus } from '@prisma/client';
import type { GetPropertiesQueryDto } from './dto/get-properties-query.dto';
import type { CreatePropertyDto } from './dto/create-property.dto';
import type { UpdatePropertyDto } from './dto/update-property.dto';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllAdmin(page = 1, limit = 20, status?: ListingStatus) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status != null) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { postedDate: 'desc' },
        include: {
          address: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }] },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    const data = items.map((p) => {
      const primaryImage = p.images.find((i) => i.isPrimary) ?? p.images[0];
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        property_type: p.propertyType,
        listing_type: p.listingType,
        price: p.price,
        status: p.status,
        address: p.address
          ? { district: p.address.district, city: p.address.city }
          : null,
        primary_image: primaryImage?.url ?? null,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total_items: total,
        total_pages: Math.ceil(total / limit) || 1,
      },
      message: 'Lấy danh sách thành công',
    };
  }

  async findOneAdminById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        address: true,
        structure: true,
        area: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }] },
        features: { include: { feature: true } },
        user: { select: { name: true, phone: true, zaloPhone: true } },
      },
    });

    if (!property) {
      throw new HttpException(
        {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Bất động sản không tồn tại',
          details: [],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const { user, ...rest } = property;
    return {
      data: {
        id: rest.id,
        title: rest.title,
        slug: rest.slug,
        property_type: rest.propertyType,
        listing_type: rest.listingType,
        price: rest.price,
        description: rest.description ?? '',
        legal_status: rest.legalStatus ?? 'unknown',
        direction: rest.direction ?? null,
        status: rest.status,
        address: rest.address
          ? {
              full_address: rest.address.fullAddress ?? '',
              ward: rest.address.ward ?? '',
              district: rest.address.district ?? '',
              city: rest.address.city ?? '',
              latitude: rest.address.latitude ?? null,
              longitude: rest.address.longitude ?? null,
            }
          : {
              full_address: '',
              ward: '',
              district: '',
              city: '',
              latitude: null,
              longitude: null,
            },
        structure: rest.structure
          ? {
              floors: rest.structure.floors ?? 0,
              bedrooms: rest.structure.bedrooms ?? 0,
              bathrooms: rest.structure.bathrooms ?? 0,
              living_rooms: rest.structure.livingRooms ?? 0,
              kitchens: rest.structure.kitchens ?? 0,
              mezzanine: rest.structure.mezzanine ?? false,
              balcony: rest.structure.balcony ?? false,
            }
          : {
              floors: 0,
              bedrooms: 0,
              bathrooms: 0,
              living_rooms: 0,
              kitchens: 0,
              mezzanine: false,
              balcony: false,
            },
        area: rest.area
          ? {
              width: rest.area.width ?? null,
              length: rest.area.length ?? null,
              land_area: rest.area.landArea ?? 0,
              usable_area: rest.area.usableArea ?? null,
            }
          : {
              width: null,
              length: null,
              land_area: 0,
              usable_area: null,
            },
        features: rest.features.map((pf) => ({
          id: pf.feature.id,
          name: pf.feature.name,
        })),
        images: rest.images.map((i) => ({
          id: i.id,
          url: i.url,
          is_primary: i.isPrimary,
        })),
        contact: user
          ? {
              name: user.name,
              phone: user.phone,
              zalo_phone: user.zaloPhone,
            }
          : null,
      },
      message: 'Lấy thông tin chi tiết thành công',
    };
  }

  async findAllPublic(query: GetPropertiesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ListingStatus.published,
    };

    if (query.property_type) where.propertyType = query.property_type;
    if (query.listing_type) where.listingType = query.listing_type;
    if (query.city || query.district) {
      where.address = {};
      if (query.city) where.address.city = query.city;
      if (query.district) where.address.district = query.district;
    }
    if (query.min_price != null || query.max_price != null) {
      where.price = {};
      if (query.min_price != null) where.price.gte = query.min_price;
      if (query.max_price != null) where.price.lte = query.max_price;
    }

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { postedDate: 'desc' },
        include: {
          address: true,
          images: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }] },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    const data = items.map((p) => {
      const primaryImage = p.images.find((i) => i.isPrimary) ?? p.images[0];
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        property_type: p.propertyType,
        listing_type: p.listingType,
        price: p.price,
        address: p.address
          ? { district: p.address.district, city: p.address.city }
          : { district: null, city: null },
        primary_image: primaryImage?.url ?? null,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total_items: total,
        total_pages: Math.ceil(total / limit) || 1,
      },
      message: 'Lấy danh sách thành công',
    };
  }

  async findOneBySlugPublic(slug: string) {
    const property = await this.prisma.property.findFirst({
      where: { slug, status: ListingStatus.published },
      include: {
        address: true,
        structure: true,
        area: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }] },
        features: { include: { feature: true } },
        user: { select: { name: true, phone: true, zaloPhone: true } },
      },
    });

    if (!property) {
      throw new HttpException(
        {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Không tìm thấy bất động sản với đường dẫn này',
          details: [],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.property.update({
      where: { id: property.id },
      data: { viewCount: { increment: 1 } },
    });

    const { user, ...rest } = property;
    return {
      data: {
        id: rest.id,
        title: rest.title,
        slug: rest.slug,
        property_type: rest.propertyType,
        listing_type: rest.listingType,
        price: rest.price,
        description: rest.description,
        legal_status: rest.legalStatus,
        direction: rest.direction,
        address: rest.address
          ? {
              full_address: rest.address.fullAddress,
              ward: rest.address.ward,
              district: rest.address.district,
              city: rest.address.city,
              latitude: rest.address.latitude,
              longitude: rest.address.longitude,
            }
          : null,
        structure: rest.structure
          ? {
              floors: rest.structure.floors,
              bedrooms: rest.structure.bedrooms,
              bathrooms: rest.structure.bathrooms,
              living_rooms: rest.structure.livingRooms,
              kitchens: rest.structure.kitchens,
              mezzanine: rest.structure.mezzanine,
              balcony: rest.structure.balcony,
            }
          : null,
        area: rest.area
          ? {
              width: rest.area.width,
              length: rest.area.length,
              land_area: rest.area.landArea,
              usable_area: rest.area.usableArea,
            }
          : null,
        features: rest.features.map((pf) => ({
          id: pf.feature.id,
          name: pf.feature.name,
        })),
        images: rest.images.map((i) => ({
          id: i.id,
          url: i.url,
          is_primary: i.isPrimary,
        })),
        contact: user
          ? {
              name: user.name,
              phone: user.phone,
              zalo_phone: user.zaloPhone,
            }
          : null,
      },
      message: 'Lấy thông tin chi tiết thành công',
    };
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let n = 1;
    while (await this.prisma.property.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++n}`;
    }
    return slug;
  }

  async createPropertyAdmin(dto: CreatePropertyDto, postedById: string) {
    const baseSlug = slugify(dto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const property = await this.prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
          title: dto.title,
          slug,
          propertyType: dto.property_type,
          listingType: dto.listing_type,
          price: dto.price,
          direction: dto.direction,
          legalStatus: dto.legal_status,
          description: dto.description,
          status: dto.status ?? ListingStatus.draft,
          postedBy: postedById,
        },
      });

      if (dto.address) {
        await tx.propertyAddress.create({
          data: {
            propertyId: created.id,
            fullAddress: dto.address.full_address,
            ward: dto.address.ward,
            district: dto.address.district,
            city: dto.address.city,
            latitude: dto.address.latitude,
            longitude: dto.address.longitude,
          },
        });
      }
      if (dto.structure) {
        await tx.propertyStructure.create({
          data: {
            propertyId: created.id,
            floors: dto.structure.floors,
            bedrooms: dto.structure.bedrooms,
            bathrooms: dto.structure.bathrooms,
            livingRooms: dto.structure.living_rooms,
            kitchens: dto.structure.kitchens,
            mezzanine: dto.structure.mezzanine,
            balcony: dto.structure.balcony,
          },
        });
      }
      if (dto.area) {
        await tx.propertyArea.create({
          data: {
            propertyId: created.id,
            width: dto.area.width,
            length: dto.area.length,
            landArea: dto.area.land_area,
            usableArea: dto.area.usable_area,
          },
        });
      }
      if (dto.feature_ids?.length) {
        await tx.propertyFeature.createMany({
          data: dto.feature_ids.map((featureId) => ({
            propertyId: created.id,
            featureId,
          })),
        });
      }
      return created;
    });

    return {
      data: { id: property.id, slug: property.slug },
      message: 'Tạo bất động sản thành công',
    };
  }

  async updatePropertyAdmin(id: string, dto: UpdatePropertyDto) {
    const existing = await this.prisma.property.findUnique({
      where: { id },
      include: { address: true, structure: true, area: true },
    });

    if (!existing) {
      throw new HttpException(
        {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Bất động sản không tồn tại',
          details: [],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const propertyData: any = {};
    if (dto.title != null) propertyData.title = dto.title;
    if (dto.property_type != null)
      propertyData.propertyType = dto.property_type;
    if (dto.listing_type != null) propertyData.listingType = dto.listing_type;
    if (dto.price != null) propertyData.price = dto.price;
    if (dto.direction != null) propertyData.direction = dto.direction;
    if (dto.legal_status != null) propertyData.legalStatus = dto.legal_status;
    if (dto.description != null) propertyData.description = dto.description;
    if (dto.status != null) propertyData.status = dto.status;

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(propertyData).length > 0) {
        await tx.property.update({ where: { id }, data: propertyData });
      }

      if (dto.address) {
        await tx.propertyAddress.upsert({
          where: { propertyId: id },
          create: {
            propertyId: id,
            fullAddress: dto.address.full_address,
            ward: dto.address.ward,
            district: dto.address.district,
            city: dto.address.city,
            latitude: dto.address.latitude,
            longitude: dto.address.longitude,
          },
          update: {
            fullAddress: dto.address.full_address,
            ward: dto.address.ward,
            district: dto.address.district,
            city: dto.address.city,
            latitude: dto.address.latitude,
            longitude: dto.address.longitude,
          },
        });
      }
      if (dto.structure) {
        await tx.propertyStructure.upsert({
          where: { propertyId: id },
          create: {
            propertyId: id,
            floors: dto.structure.floors,
            bedrooms: dto.structure.bedrooms,
            bathrooms: dto.structure.bathrooms,
            livingRooms: dto.structure.living_rooms,
            kitchens: dto.structure.kitchens,
            mezzanine: dto.structure.mezzanine,
            balcony: dto.structure.balcony,
          },
          update: {
            floors: dto.structure.floors,
            bedrooms: dto.structure.bedrooms,
            bathrooms: dto.structure.bathrooms,
            livingRooms: dto.structure.living_rooms,
            kitchens: dto.structure.kitchens,
            mezzanine: dto.structure.mezzanine,
            balcony: dto.structure.balcony,
          },
        });
      }
      if (dto.area) {
        await tx.propertyArea.upsert({
          where: { propertyId: id },
          create: {
            propertyId: id,
            width: dto.area.width,
            length: dto.area.length,
            landArea: dto.area.land_area,
            usableArea: dto.area.usable_area,
          },
          update: {
            width: dto.area.width,
            length: dto.area.length,
            landArea: dto.area.land_area,
            usableArea: dto.area.usable_area,
          },
        });
      }
      if (dto.feature_ids !== undefined) {
        await tx.propertyFeature.deleteMany({ where: { propertyId: id } });
        if (dto.feature_ids.length > 0) {
          await tx.propertyFeature.createMany({
            data: dto.feature_ids.map((featureId) => ({
              propertyId: id,
              featureId,
            })),
          });
        }
      }
    });

    return {
      data: { id, ...(dto.status != null ? { status: dto.status } : {}) },
      message: 'Cập nhật bất động sản thành công',
    };
  }

  async deletePropertyAdmin(id: string) {
    const existing = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new HttpException(
        {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Bất động sản không tồn tại',
          details: [],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.propertyFeature.deleteMany({ where: { propertyId: id } });
      await tx.contactRequest.deleteMany({ where: { propertyId: id } });
      await tx.propertyImage.deleteMany({ where: { propertyId: id } });
      await tx.propertyAddress.deleteMany({ where: { propertyId: id } });
      await tx.propertyStructure.deleteMany({ where: { propertyId: id } });
      await tx.propertyArea.deleteMany({ where: { propertyId: id } });
      await tx.property.delete({ where: { id } });
    });

    return {
      data: {},
      message: 'Xóa bất động sản thành công',
    };
  }

  async addPropertyImages(
    propertyId: string,
    images: { url: string; isPrimary: boolean; displayOrder: number }[],
  ) {
    const existing = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existing) {
      throw new HttpException(
        {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Bất động sản không tồn tại',
          details: [],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const result: { id: string; url: string; is_primary: boolean }[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const created = await this.prisma.propertyImage.create({
        data: {
          propertyId,
          url: img.url,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
        },
      });
      result.push({
        id: created.id,
        url: created.url,
        is_primary: created.isPrimary,
      });
    }
    return result;
  }
}
