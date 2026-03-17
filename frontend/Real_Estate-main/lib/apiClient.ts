import {
  ContactRequest,
  ContactStatus,
  Feature,
  ListingStatus,
  PaginatedResponse,
  Property,
  PropertyFormPayload,
  SingleResponse,
} from '@/types';

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';
const ACCESS_TOKEN_KEY = 'real_estate_access_token';

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue>;

interface BackendListMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

interface BackendSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: BackendListMeta;
  timestamp: string;
}

interface BackendErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
    path?: string;
    status?: number;
  };
  timestamp: string;
}

interface PublicPropertyListItem {
  id: string;
  title: string;
  slug: string;
  property_type: Property['property_type'];
  listing_type: Property['listing_type'];
  price: number;
  address:
    | {
        district: string | null;
        city: string | null;
      }
    | null;
  primary_image: string | null;
}

interface AdminPropertyListItem extends PublicPropertyListItem {
  status: ListingStatus;
}

interface PropertyDetailDto {
  id: string;
  title: string;
  slug: string;
  property_type: Property['property_type'];
  listing_type: Property['listing_type'];
  price: number;
  description: string | null;
  legal_status: Property['legal_status'] | null;
  direction?: Property['direction'] | null;
  address:
    | {
        full_address: string | null;
        ward: string | null;
        district: string | null;
        city: string | null;
        latitude?: number | null;
        longitude?: number | null;
      }
    | null;
  structure:
    | {
        floors?: number | null;
        bedrooms?: number | null;
        bathrooms?: number | null;
        living_rooms?: number | null;
        kitchens?: number | null;
        mezzanine?: boolean | null;
        balcony?: boolean | null;
      }
    | null;
  area:
    | {
        width?: number | null;
        length?: number | null;
        land_area?: number | null;
        usable_area?: number | null;
      }
    | null;
  features: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    id: string;
    url: string;
    is_primary: boolean;
  }>;
  contact?: {
    name: string | null;
    phone: string | null;
    zalo_phone: string | null;
  } | null;
}

interface AdminPropertyDetailDto extends PropertyDetailDto {
  status: ListingStatus;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  zaloPhone?: string | null;
  role: 'user' | 'agent' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  accessToken: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  zaloPhone?: string;
  role?: 'user' | 'agent' | 'admin';
}

export interface PropertyFilters {
  property_type?: string;
  listing_type?: string;
  city?: string;
  district?: string;
  min_price?: number;
  max_price?: number;
}

export class ApiError extends Error {
  code: string;
  details: unknown[];
  status: number;
  path?: string;

  constructor(payload: {
    code: string;
    message: string;
    details?: unknown[];
    status?: number;
    path?: string;
  }) {
    super(payload.message);
    this.name = 'ApiError';
    this.code = payload.code;
    this.details = payload.details ?? [];
    this.status = payload.status ?? 500;
    this.path = payload.path;
  }
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

function getApiOrigin() {
  return new URL(getApiBaseUrl()).origin;
}

function buildUrl(path: string, query?: QueryParams) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, `${getApiBaseUrl()}/`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function resolveAssetUrl(url?: string | null) {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url, getApiOrigin()).toString();
}

function getStoredAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return getStoredAccessToken();
}

export function clearAccessToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function apiRequest<T>(
  path: string,
  options?: {
    method?: string;
    query?: QueryParams;
    body?: BodyInit | object;
    token?: string | null;
    headers?: HeadersInit;
  },
): Promise<BackendSuccessResponse<T>> {
  const method = options?.method ?? 'GET';
  const token = options?.token ?? getStoredAccessToken();
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;

  const headers = new Headers(options?.headers ?? {});
  if (!isFormData && options?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, options?.query), {
    method,
    headers,
    body:
      options?.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

  const rawText = await response.text();
  const payload = rawText ? (JSON.parse(rawText) as BackendSuccessResponse<T> | BackendErrorResponse) : null;

  if (!response.ok) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
      throw new ApiError({
        code: payload.error.code,
        message: payload.error.message,
        details: payload.error.details,
        status: payload.error.status ?? response.status,
        path: payload.error.path,
      });
    }

    throw new ApiError({
      code: 'HTTP_ERROR',
      message: response.statusText || 'Request failed',
      status: response.status,
    });
  }

  if (!payload || typeof payload !== 'object' || !('success' in payload)) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: 'Backend trả về dữ liệu không hợp lệ',
      status: response.status,
    });
  }

  return payload as BackendSuccessResponse<T>;
}

function toSingleResponse<T>(response: BackendSuccessResponse<T>): SingleResponse<T> {
  return {
    success: true,
    data: response.data,
    timestamp: response.timestamp,
  };
}

function toPaginatedResponse<T>(payload: {
  data: T[];
  meta?: BackendListMeta;
  timestamp: string;
}): PaginatedResponse<T> {
  return {
    success: true,
    data: payload.data,
    meta: payload.meta ?? {
      page: 1,
      limit: payload.data.length,
      total_items: payload.data.length,
      total_pages: 1,
    },
    timestamp: payload.timestamp,
  };
}

function normalizePropertySummary(
  item: PublicPropertyListItem | AdminPropertyListItem,
  status: ListingStatus,
): Property {
  const imageUrl = resolveAssetUrl(item.primary_image);

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    property_type: item.property_type,
    listing_type: item.listing_type,
    price: item.price,
    direction: undefined,
    legal_status: 'unknown',
    description: '',
    status,
    address: {
      full_address: '',
      ward: '',
      district: item.address?.district ?? '',
      city: item.address?.city ?? '',
      latitude: undefined,
      longitude: undefined,
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
      width: undefined,
      length: undefined,
      land_area: 0,
      usable_area: 0,
    },
    features: [],
    images: imageUrl
      ? [
          {
            id: `${item.id}-primary`,
            url: imageUrl,
            is_primary: true,
          },
        ]
      : [],
    contact: undefined,
  };
}

function normalizePropertyDetail(item: PropertyDetailDto, status: ListingStatus = 'published'): Property {
  const contact = item.contact
    ? {
        name: item.contact.name ?? '',
        phone: item.contact.phone ?? '',
        zalo_phone: item.contact.zalo_phone ?? '',
      }
    : undefined;

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    property_type: item.property_type,
    listing_type: item.listing_type,
    price: item.price,
    direction: item.direction ?? undefined,
    legal_status: item.legal_status ?? 'unknown',
    description: item.description ?? '',
    status,
    address: {
      full_address: item.address?.full_address ?? '',
      ward: item.address?.ward ?? '',
      district: item.address?.district ?? '',
      city: item.address?.city ?? '',
      latitude: item.address?.latitude ?? undefined,
      longitude: item.address?.longitude ?? undefined,
    },
    structure: {
      floors: item.structure?.floors ?? 0,
      bedrooms: item.structure?.bedrooms ?? 0,
      bathrooms: item.structure?.bathrooms ?? 0,
      living_rooms: item.structure?.living_rooms ?? 0,
      kitchens: item.structure?.kitchens ?? 0,
      mezzanine: item.structure?.mezzanine ?? false,
      balcony: item.structure?.balcony ?? false,
    },
    area: {
      width: item.area?.width ?? undefined,
      length: item.area?.length ?? undefined,
      land_area: item.area?.land_area ?? 0,
      usable_area: item.area?.usable_area ?? 0,
    },
    features: item.features.map((feature) => ({
      id: feature.id,
      name: feature.name,
    })),
    images: item.images.map((image) => ({
      id: image.id,
      url: resolveAssetUrl(image.url),
      is_primary: image.is_primary,
    })),
    contact,
  };
}

function normalizeFeature(feature: { id: string; name: string; description: string | null }): Feature {
  return {
    id: feature.id,
    name: feature.name,
    description: feature.description ?? '',
  };
}

function createPropertyFromPayload(
  id: string,
  slug: string,
  payload: Partial<PropertyFormPayload>,
  status?: ListingStatus,
): Property {
  return {
    id,
    title: payload.title ?? '',
    slug,
    property_type: payload.property_type ?? 'house',
    listing_type: payload.listing_type ?? 'sale',
    price: payload.price ?? 0,
    direction: payload.direction,
    legal_status: payload.legal_status ?? 'unknown',
    description: payload.description ?? '',
    status: status ?? payload.status ?? 'draft',
    address: {
      full_address: payload.address?.full_address ?? '',
      ward: payload.address?.ward ?? '',
      district: payload.address?.district ?? '',
      city: payload.address?.city ?? '',
      latitude: undefined,
      longitude: undefined,
    },
    structure: {
      floors: payload.structure?.floors ?? 0,
      bedrooms: payload.structure?.bedrooms ?? 0,
      bathrooms: payload.structure?.bathrooms ?? 0,
      living_rooms: 0,
      kitchens: 0,
      mezzanine: false,
      balcony: payload.structure?.balcony ?? false,
    },
    area: {
      width: undefined,
      length: undefined,
      land_area: payload.area?.land_area ?? 0,
      usable_area: payload.area?.usable_area ?? 0,
    },
    features: [],
    images: [],
    contact: undefined,
  };
}

async function hydratePublicProperties(items: PublicPropertyListItem[]) {
  const settled = await Promise.allSettled(
    items.map(async (item) => {
      const detailResponse = await apiRequest<PropertyDetailDto>(`/properties/${encodeURIComponent(item.slug)}`);
      return normalizePropertyDetail(detailResponse.data, 'published');
    }),
  );

  return items.map((item, index) => {
    const result = settled[index];
    if (result.status === 'fulfilled') {
      return result.value;
    }

    return normalizePropertySummary(item, 'published');
  });
}

async function findAdminPropertySummaryById(id: string) {
  let page = 1;
  const limit = 100;

  while (true) {
    const response = await apiRequest<AdminPropertyListItem[]>('/admin/properties', {
      query: { page, limit },
    });

    const match = response.data.find((item) => item.id === id);
    if (match) {
      return match;
    }

    const totalPages = response.meta?.total_pages ?? 1;
    if (page >= totalPages) {
      return null;
    }

    page += 1;
  }
}

export async function login(
  input: LoginInput,
  options?: { persistToken?: boolean },
): Promise<SingleResponse<AuthPayload>> {
  const response = await apiRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: input,
  });

  if (options?.persistToken !== false) {
    setAccessToken(response.data.accessToken);
  }

  return toSingleResponse(response);
}

export async function register(
  input: RegisterInput,
  options?: { persistToken?: boolean },
): Promise<SingleResponse<AuthPayload>> {
  const response = await apiRequest<AuthPayload>('/auth/register', {
    method: 'POST',
    body: input,
  });

  if (options?.persistToken !== false) {
    setAccessToken(response.data.accessToken);
  }

  return toSingleResponse(response);
}

export async function getMe(token?: string | null): Promise<SingleResponse<{ user: AuthUser }>> {
  const response = await apiRequest<{ user: AuthUser }>('/auth/me', {
    token,
  });

  return toSingleResponse(response);
}

export async function getProperties(
  filters: PropertyFilters = {},
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResponse<Property>> {
  const response = await apiRequest<PublicPropertyListItem[]>('/properties', {
    query: {
      ...filters,
      page,
      limit,
    },
  });

  const data = await hydratePublicProperties(response.data);
  return toPaginatedResponse({
    data,
    meta: response.meta,
    timestamp: response.timestamp,
  });
}

export async function getPropertyBySlug(slug: string): Promise<SingleResponse<Property>> {
  const response = await apiRequest<PropertyDetailDto>(`/properties/${encodeURIComponent(slug)}`);

  return {
    success: true,
    data: normalizePropertyDetail(response.data, 'published'),
    timestamp: response.timestamp,
  };
}

export async function submitContact(data: {
  property_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message: string;
}): Promise<SingleResponse<{}>> {
  const response = await apiRequest<{}>('/contacts', {
    method: 'POST',
    body: data,
  });

  return toSingleResponse(response);
}

export async function getAdminProperties(
  page: number = 1,
  limit: number = 20,
  status?: ListingStatus,
): Promise<PaginatedResponse<Property>> {
  const response = await apiRequest<AdminPropertyListItem[]>('/admin/properties', {
    query: {
      page,
      limit,
      status,
    },
  });

  const data = response.data.map((item) => normalizePropertySummary(item, item.status));
  return toPaginatedResponse({
    data,
    meta: response.meta,
    timestamp: response.timestamp,
  });
}

export async function getPropertyById(id: string): Promise<SingleResponse<Property>> {
  const response = await apiRequest<AdminPropertyDetailDto>(`/admin/properties/${encodeURIComponent(id)}`);

  return {
    success: true,
    data: normalizePropertyDetail(response.data, response.data.status),
    timestamp: response.timestamp,
  };
}

export async function createProperty(
  data: PropertyFormPayload,
): Promise<SingleResponse<Property>> {
  const response = await apiRequest<{ id: string; slug: string }>('/admin/properties', {
    method: 'POST',
    body: data,
  });

  return {
    success: true,
    data: createPropertyFromPayload(response.data.id, response.data.slug, data, data.status),
    timestamp: response.timestamp,
  };
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyFormPayload>,
): Promise<SingleResponse<Property>> {
  const response = await apiRequest<{ id: string; status?: ListingStatus }>(`/admin/properties/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: data,
  });

  return {
    success: true,
    data: createPropertyFromPayload(id, '', data, response.data.status ?? data.status),
    timestamp: response.timestamp,
  };
}

export async function deleteProperty(id: string): Promise<SingleResponse<{}>> {
  const response = await apiRequest<{}>(`/admin/properties/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  return toSingleResponse(response);
}

export async function uploadImages(
  id: string,
  files: File[],
  primary_index: number = 0,
): Promise<SingleResponse<{ id: string; url: string; is_primary: boolean }[]>> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('primary_index', String(primary_index));

  const response = await apiRequest<{ id: string; url: string; is_primary: boolean }[]>(
    `/admin/properties/${encodeURIComponent(id)}/images`,
    {
      method: 'POST',
      body: formData,
    },
  );

  return {
    success: true,
    data: response.data.map((image) => ({
      ...image,
      url: resolveAssetUrl(image.url),
    })),
    timestamp: response.timestamp,
  };
}

export async function getFeatures(): Promise<SingleResponse<Feature[]>> {
  const response = await apiRequest<Array<{ id: string; name: string; description: string | null }>>(
    '/admin/features',
  );

  return {
    success: true,
    data: response.data.map(normalizeFeature),
    timestamp: response.timestamp,
  };
}

export async function getContacts(
  status?: ContactStatus,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedResponse<ContactRequest>> {
  const response = await apiRequest<
    Array<{
      id: string;
      customer_name: string;
      customer_phone: string;
      customer_email?: string | null;
      message: string | null;
      status: ContactStatus;
      property?: {
        id: string;
        title: string;
      } | null;
      created_at: string;
    }>
  >('/admin/contacts', {
    query: {
      status,
      page,
      limit,
    },
  });

  const data = response.data.map((contact) => ({
    id: contact.id,
    property_id: contact.property?.id,
    customer_name: contact.customer_name,
    customer_phone: contact.customer_phone,
    customer_email: contact.customer_email ?? undefined,
    message: contact.message ?? '',
    status: contact.status,
    notes: undefined,
    property: contact.property ?? undefined,
    created_at: contact.created_at,
  }));

  return toPaginatedResponse({
    data,
    meta: response.meta,
    timestamp: response.timestamp,
  });
}

export async function updateContactStatus(
  id: string,
  status: ContactStatus,
  notes?: string,
): Promise<SingleResponse<ContactRequest>> {
  const response = await apiRequest<{ id: string; status: ContactStatus; notes?: string | null }>(
    `/admin/contacts/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: {
        status,
        notes,
      },
    },
  );

  return {
    success: true,
    data: {
      id: response.data.id,
      customer_name: '',
      customer_phone: '',
      message: '',
      status: response.data.status,
      notes: response.data.notes ?? undefined,
      created_at: new Date().toISOString(),
    },
    timestamp: response.timestamp,
  };
}
