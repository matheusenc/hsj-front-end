/**
 * Espelho tipado do contrato da API HospitalSaoJose.
 *
 * Convenções do backend que estão refletidas aqui:
 * - a serialização é camelCase (padrão JsonSerializerDefaults.Web);
 * - `Guid` chega como string no formato canônico;
 * - `DateOnly` chega como string 'YYYY-MM-DD', sem hora e sem fuso;
 * - `DateTime` chega como ISO 8601 em UTC;
 * - campos opcionais são sempre emitidos, com valor `null` — nunca `undefined`.
 */

// ---------------------------------------------------------------- Requests

export interface RequestLoginJson {
  email: string;
  password: string;
}

export interface RequestChangePasswordJson {
  currentPassword: string;
  newPassword: string;
}

export interface RequestRegisterUserJson {
  name: string;
  email: string;
  password: string;
  profileId: string;
}

export interface RequestUpdateUserJson {
  name: string;
  email: string;
  profileId: string;
}

export interface RequestFilterUsersJson {
  name?: string;
  page?: number;
  pageSize?: number;
}

export interface RequestProfileJson {
  name: string;
  description: string;
  roleIds: string[];
}

export interface RequestRegisterRoleJson {
  key: string;
  name: string;
  description: string;
}

/** O `key` de um papel é imutável depois da criação — por isso não aparece aqui. */
export interface RequestUpdateRoleJson {
  name: string;
  description: string;
}

export interface RequestCategoryJson {
  name: string;
  slug: string;
  displayOrder: number;
}

/** Enviado como multipart/form-data, junto do campo de arquivo chamado `file`. */
export interface RequestDocumentJson {
  categoryId: string;
  title: string;
  description: string;
  externalLink?: string | null;
  publicationDate: string;
  paymentDate?: string | null;
}

export interface RequestFilterDocumentsJson {
  categorySlug?: string;
  title?: string;
  page?: number;
  pageSize?: number;
}

// --------------------------------------------------------------- Responses

export interface ResponseTokensJson {
  accessToken: string;
  expiresAtUtc: string;
}

/**
 * Envelope de erro da API. `errors` é uma lista de mensagens em pt-BR sem
 * identificação de campo, então não dá para ligar erro a controle de
 * formulário — a UI mostra a lista.
 */
export interface ResponseErrorJson {
  errors: string[];
  accessTokenExpired: boolean;
}

export interface ResponseCategoryJson {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

export interface ResponseCategoriesJson {
  categories: ResponseCategoryJson[];
}

export interface ResponseRegisteredCategoryJson {
  id: string;
  slug: string;
}

export interface ResponseDocumentJson {
  id: string;
  title: string;
  description: string;
  externalLink: string | null;
  publicationDate: string;
  paymentDate: string | null;
  fileName: string;
  sizeInBytes: number;
  /** Relativo por design (`/documents/{id}/download`); concatene com apiBaseUrl. */
  downloadUrl: string;
  category: ResponseCategoryJson;
}

export interface ResponseDocumentsJson {
  documents: ResponseDocumentJson[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ResponseRegisteredDocumentJson {
  id: string;
  title: string;
  downloadUrl: string;
}

export interface ResponseProfileSummaryJson {
  id: string;
  name: string;
}

export interface ResponseRoleSummaryJson {
  id: string;
  key: string;
  name: string;
}

export interface ResponseProfileJson {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  roles: ResponseRoleSummaryJson[];
}

export interface ResponseProfilesJson {
  profiles: ResponseProfileJson[];
}

export interface ResponseRegisteredProfileJson {
  id: string;
  name: string;
}

export interface ResponseRoleJson {
  id: string;
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  profiles: ResponseProfileSummaryJson[];
}

export interface ResponseRolesJson {
  roles: ResponseRoleJson[];
}

export interface ResponseRegisteredRoleJson {
  id: string;
  key: string;
}

export interface ResponseUserJson {
  id: string;
  name: string;
  email: string;
  createdOn: string;
  profile: ResponseProfileSummaryJson;
}

export interface ResponseUsersJson {
  users: ResponseUserJson[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ResponseRegisteredUserJson {
  id: string;
  name: string;
  email: string;
}

export interface ResponseLoggedUserJson {
  id: string;
  name: string;
  email: string;
  profile: ResponseProfileSummaryJson;
  permissions: string[];
}

// ------------------------------------------------------------- Permissões

/**
 * As 18 permissões de HospitalSaoJose.Domain/Security/Permissions.cs.
 * Não existe `categories:read` nem `documents:read` — essas leituras são
 * públicas por decisão do backend.
 */
export const PERMISSIONS = {
  usersRead: 'users:read',
  usersCreate: 'users:create',
  usersUpdate: 'users:update',
  usersDelete: 'users:delete',

  profilesRead: 'profiles:read',
  profilesCreate: 'profiles:create',
  profilesUpdate: 'profiles:update',
  profilesDelete: 'profiles:delete',

  rolesRead: 'roles:read',
  rolesCreate: 'roles:create',
  rolesUpdate: 'roles:update',
  rolesDelete: 'roles:delete',

  categoriesCreate: 'categories:create',
  categoriesUpdate: 'categories:update',
  categoriesDelete: 'categories:delete',

  documentsCreate: 'documents:create',
  documentsUpdate: 'documents:update',
  documentsDelete: 'documents:delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
