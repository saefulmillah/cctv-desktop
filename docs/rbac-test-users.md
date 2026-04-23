# Data User Uji RBAC HKTV Desktop

Dokumen ini menyiapkan `U1-U4` untuk pengujian runtime RBAC desktop berdasarkan:

- role catalog backend di collection:
  `super_admin`, `operator_cctv`, `operator_asset`, `operator_sos`, `viewer_branch`
- requirement permission di [backend-rbac-requirements.md](/c:/00.%20Project/cctv-desktop/docs/backend-rbac-requirements.md)

Gunakan daftar ini sebagai acuan tetap saat mengisi hasil uji di [rbac-smoke-test-template.md](/c:/00.%20Project/cctv-desktop/docs/rbac-smoke-test-template.md).

## Daftar Uji

| Kode | Username Saran | Role Backend | Tujuan Uji | Permission Utama yang Diuji | Branch Scope Saran |
|------|----------------|--------------|------------|------------------------------|--------------------|
| U1 | `admin` | `super_admin` | baseline akses penuh | `branch.view.all`, `feature.cctv.view`, `feature.asset.view`, `feature.sos.view`, `sos.ticket.dispatch`, `sos.ticket.complete` | semua branch |
| U2 | `rbac_verify_operator_sos` | `operator_sos` | asset monitoring + SOS action + branch terbatas | `feature.asset.view`, `feature.sos.view`, `branch.view.assigned`, `asset.view`, `gate.view`, `sos.alert.view`, `sos.ticket.view`, `sos.ticket.dispatch`, `sos.ticket.complete` | `ATP`, `JORR-S` |
| U3 | `rbac_verify_operator_asset` | `operator_asset` | asset monitoring tanpa dispatch/complete | `feature.asset.view`, `branch.view.assigned`, `asset.view`, `gate.view` | `ATP` |
| U4 | `rbac_verify_operator_cctv` | `operator_cctv` | CCTV only | `feature.cctv.view`, `branch.select`, `branch.view.assigned`, `camera.view` | `ATP` |

## Kenapa Set Ini Dipakai

- `U1` membuktikan akses penuh dan opsi `Semua Branch`.
- `U2` dipakai untuk menguji bahwa asset monitoring dan aksi SOS memang bisa jalan pada user non-admin.
- `U3` dipakai untuk membuktikan user asset-only tidak bisa masuk CCTV dan tidak bisa dispatch/complete.
- `U4` dipakai untuk membuktikan user CCTV-only tidak bisa masuk Asset Monitoring.

## Mapping ke Skenario Test

| Skenario | User yang Dipakai |
|----------|-------------------|
| Login dasar, restore session, all-branch | `U1` |
| Branch picker CCTV dan filtering scope | `U4` |
| Asset Monitoring branch filtering | `U3` |
| Dispatch/complete diizinkan | `U2` atau `U1` |
| Dispatch/complete ditolak | `U3` atau `U4` |
| Asset Monitoring ditolak | `U4` |
| CCTV mode ditolak | `U3` |

## Catatan Penting

- Bila backend Anda belum memetakan permission per role persis seperti tabel di atas, pakai tabel ini sebagai target uji yang diharapkan.
- Jika ingin hanya 1 user non-admin yang “serba bisa”, gunakan `U2` untuk skenario SOS penuh, lalu tetap pertahankan `U3` dan `U4` untuk negative test.
- Nama branch di desktop mengikuti data backend. Jika backend Anda memakai kode branch berbeda, ganti `ATP` dan `JORR-S` dengan branch aktif yang benar.
