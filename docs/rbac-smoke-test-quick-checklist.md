# Checklist Cepat RBAC 5-10 Menit

Checklist ini untuk validasi cepat setelah build baru atau setelah perubahan auth/RBAC.

## Persiapan

- Jalankan app desktop
- Pastikan `API_BASE_URL` sudah benar
- Siapkan 4 akun uji dari [rbac-test-users.md](/c:/00.%20Project/cctv-desktop/docs/rbac-test-users.md)

## Jalur Test Cepat

### 1. Login Dasar

- Buka app
- Pastikan login modal muncul
- Login dengan `U1`
- Pastikan nama user muncul dan app bisa masuk normal

Hasil yang diharapkan:
- login berhasil
- app tidak stuck di modal
- `Go to Map` tersedia
- branch picker CCTV tersedia

### 2. All-Branch

- Saat masih login sebagai `U1`, buka Asset Monitoring
- Buka selector branch

Hasil yang diharapkan:
- opsi `Semua Branch` terlihat

### 3. CCTV Only

- Logout
- Login dengan `U4`

Hasil yang diharapkan:
- branch picker CCTV aktif
- quick search/reload CCTV aktif
- `Go to Map` tidak bisa dipakai

### 4. Asset Only

- Logout
- Login dengan `U3`

Hasil yang diharapkan:
- CCTV mode terkunci
- `Go to Map` bisa dipakai
- branch selector asset hanya menampilkan branch scope user
- opsi `Semua Branch` tidak muncul

### 5. SOS Action Positive

- Logout
- Login dengan `U2`
- Buka Asset Monitoring
- Pilih incident SOS yang relevan

Hasil yang diharapkan:
- tombol `Dispatch` bisa dipakai
- tombol `Complete` bisa dipakai pada ticket yang sesuai

### 6. SOS Action Negative

- Logout
- Login dengan `U3`
- Buka Asset Monitoring
- Pilih incident SOS yang relevan

Hasil yang diharapkan:
- `Dispatch` tidak usable
- `Complete` tidak usable

### 7. Session Restore

- Login dengan `U1`
- Tutup app
- Buka lagi

Hasil yang diharapkan:
- session otomatis pulih bila token masih valid

## Kriteria Lulus Cepat

Release kandidat boleh lanjut ke pengujian lebih detail bila semua ini benar:

- login modal muncul saat belum ada session
- `U1` bisa akses penuh
- `U4` hanya bisa CCTV
- `U3` hanya bisa Asset Monitoring
- `U2` bisa dispatch/complete
- `Semua Branch` hanya muncul untuk all-branch

## Jika Waktu Tinggal 2-3 Menit

Prioritas minimum:

1. Login `U1`
2. Cek `Semua Branch`
3. Login `U4` dan pastikan `Go to Map` ditolak
4. Login `U3` dan pastikan CCTV terkunci
