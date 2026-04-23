# Backend Requirements - RBAC dan Access Control untuk HKTV Desktop

## 1. Latar Belakang

Aplikasi HKTV Desktop saat ini sudah memiliki fitur utama seperti:

- CCTV mode
- Asset Monitoring / SOS mode
- Pemilihan ruas / branch
- Akses data kamera, asset, gate alert, dan SOS ticket melalui backend API

Saat ini aplikasi belum memiliki mekanisme pembatasan fitur berdasarkan user, role, dan scope ruas. Requirement ini bertujuan menambahkan sistem otorisasi terpusat agar akses user terhadap fitur dan data dikontrol oleh backend.

## 2. Tujuan

Backend harus mampu:

- mengidentifikasi user yang sedang login
- menentukan role dan permission user
- membatasi fitur yang boleh diakses user
- membatasi ruas / branch yang boleh dilihat dan dipilih user
- memastikan filtering akses dilakukan di server-side
- mencegah user mengakses data di luar scope meskipun memanipulasi request dari client

## 3. Ruang Lingkup

Requirement ini mencakup:

- authentication integration dengan SSO / IdP berbasis OIDC/OAuth2
- authorization berbasis role dan permission
- pembatasan akses per branch / ruas
- proteksi endpoint backend yang dipakai aplikasi desktop
- capability endpoint untuk frontend / Electron app
- audit log akses dan aksi sensitif

Requirement ini tidak mencakup:

- redesign total domain CCTV / Asset Monitoring
- perubahan besar kontrak data asset monitoring yang sudah ada
- perubahan UI detail di desktop app selain kebutuhan integrasi auth

## 4. Arsitektur yang Direkomendasikan

Backend menggunakan pola berikut:

- `Identity Provider (IdP)` sebagai sumber login user
- `Backend API` sebagai resource server
- `Authorization module/service` untuk memetakan user ke role, permission, dan scope ruas
- `Electron desktop app` sebagai client yang mengirim access token ke backend

Rekomendasi sumber identity:

- Keycloak
- Azure AD / Microsoft Entra ID
- IdP internal perusahaan yang mendukung OIDC

Metode login yang direkomendasikan untuk desktop app:

- `Authorization Code Flow + PKCE`

## 5. Konsep Otorisasi

### 5.1 Role

Role adalah kumpulan permission yang diberikan ke user.

Role minimum yang direkomendasikan:

- `super_admin`
- `operator_cctv`
- `operator_asset`
- `operator_sos`
- `viewer_branch`

### 5.2 Permission

Permission minimum yang direkomendasikan:

- `feature.cctv.view`
- `feature.asset.view`
- `feature.sos.view`
- `branch.select`
- `branch.view.all`
- `branch.view.assigned`
- `camera.view`
- `asset.view`
- `gate.view`
- `sos.alert.view`
- `sos.ticket.view`
- `sos.ticket.dispatch`
- `sos.ticket.complete`

### 5.3 Scope Branch / Ruas

Selain role dan permission, setiap user dapat memiliki scope ruas.

Contoh:

- user A hanya boleh mengakses `JORR-S`
- user B boleh mengakses `JORR-S` dan `Jagorawi`
- user C sebagai `super_admin` boleh mengakses semua ruas

Scope ruas harus diterapkan pada semua endpoint yang memuat data berbasis branch.

## 6. Model Data Minimum

Backend perlu menyediakan tabel / koleksi berikut.

### 6.1 User

Menyimpan identitas user internal yang terhubung dengan IdP.

Kolom minimum:

- `id`
- `external_subject_id`
- `username`
- `email`
- `display_name`
- `is_active`
- `created_at`
- `updated_at`

### 6.2 Role

Kolom minimum:

- `id`
- `role_code`
- `role_name`
- `description`
- `is_active`

### 6.3 Permission

Kolom minimum:

- `id`
- `permission_code`
- `permission_name`
- `description`

### 6.4 User Roles

Mapping many-to-many antara user dan role.

Kolom minimum:

- `id`
- `user_id`
- `role_id`

### 6.5 Role Permissions

Mapping many-to-many antara role dan permission.

Kolom minimum:

- `id`
- `role_id`
- `permission_id`

### 6.6 User Branch Scopes

Mapping ruas yang diizinkan untuk setiap user.

Kolom minimum:

- `id`
- `user_id`
- `branch_id`
- `granted_by`
- `granted_at`

## 7. Endpoint yang Harus Disiapkan

## 7.1 Authentication / Session Capability

### `GET /auth/me`

Tujuan:

- mengambil profil user login
- mengambil role user
- mengambil permission user
- mengambil daftar ruas yang boleh diakses
- menjadi sumber capability utama untuk frontend

Response minimum:

```json
{
  "data": {
    "user": {
      "id": "u-123",
      "username": "budi",
      "email": "budi@example.com",
      "display_name": "Budi Santoso"
    },
    "roles": ["operator_asset"],
    "permissions": [
      "feature.asset.view",
      "feature.sos.view",
      "branch.select",
      "branch.view.assigned"
    ],
    "branch_scopes": [
      {
        "id": 12,
        "branch_code": "JORR-S",
        "branch_name": "JORR Selatan"
      }
    ]
  }
}
