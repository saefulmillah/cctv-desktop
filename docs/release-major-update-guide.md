# Release Guide: Major Version and Auto Update

Panduan ini dipakai untuk merilis versi baru aplikasi `HK Toll Vision (HKTV)` agar:

- branch fitur masuk ke versi resmi
- version aplikasi naik dengan benar
- installer baru berhasil dibuild
- GitHub Release ter-publish
- versi aplikasi sebelumnya bisa mendeteksi update terbaru

## Prasyarat

Pastikan hal berikut sudah siap:

- branch fitur sudah stabil dan siap dirilis
- tidak ada perubahan lokal yang belum jelas
- kamu memiliki GitHub Personal Access Token dengan scope `repo`
- kamu berada di folder project `cctv-desktop`

## 1. Cek status repository

```powershell
git status --short --branch
```

Pastikan working tree bersih sebelum mulai rilis.

## 2. Pindah ke branch utama

```powershell
git checkout master
git pull origin master
```

Ini memastikan `master` lokal mengikuti kondisi terbaru dari GitHub.

## 3. Merge branch fitur ke master

Contoh jika branch fitur bernama `perf/stream-stability`:

```powershell
git merge --no-ff perf/stream-stability
```

Gunakan `--no-ff` supaya histori merge lebih jelas.

Jika ada conflict:

1. selesaikan conflict
2. `git add` file yang sudah diperbaiki
3. lanjutkan commit merge

## 4. Update version aplikasi

Ubah versi di file berikut:

- `package.json`
- `package-lock.json`

Contoh major version:

- dari `1.3.6`
- menjadi `2.0.0`

Contoh setelah diubah:

```json
"version": "2.0.0"
```

Pastikan version di kedua file sama.

## 5. Commit perubahan versi

```powershell
git add package.json package-lock.json
git commit -m "chore: release version 2.0.0"
```

## 6. Push master ke GitHub

```powershell
git push origin master
```

## 7. Build installer lokal

```powershell
npm run make
```

Hasil build biasanya ada di folder:

- `out/builder/HKTV-Setup-2.0.0.exe`
- `out/builder/HKTV-Setup-2.0.0.exe.blockmap`
- `out/builder/latest.yml`

## 8. Verifikasi metadata updater

Cek isi file:

```powershell
Get-Content out\builder\latest.yml -Raw
```

Pastikan minimal berisi:

- `version: 2.0.0`
- `path: HKTV-Setup-2.0.0.exe`
- `sha512`
- `releaseDate`

## 9. Siapkan token GitHub

Set token ke environment variable sementara di terminal aktif:

```powershell
$env:GH_TOKEN="TOKEN_GITHUB_KAMU"
```

Catatan:

- jangan hardcode token ke source code
- setelah selesai, sebaiknya rotate token jika pernah dibagikan

## 10. Publish release ke GitHub

```powershell
npm run publish
```

Perintah ini akan:

- build ulang installer
- upload installer ke GitHub Releases
- upload blockmap
- upload `latest.yml`

## 11. Cek status release

Jika GitHub CLI tersedia:

```powershell
gh release view v2.0.0 --repo saefulmillah/cctv-desktop --json name,tagName,isDraft,isPrerelease,url,assets
```

Pastikan:

- `isDraft` bernilai `false`
- `isPrerelease` bernilai `false`
- asset release lengkap

## 12. Jika release masih draft, publish release

Kadang `electron-builder` membuat release sebagai draft. Jika itu terjadi:

```powershell
gh release edit v2.0.0 --repo saefulmillah/cctv-desktop --draft=false
```

Setelah itu cek lagi status release.

## 13. Verifikasi asset release

Pastikan release GitHub berisi:

- `HKTV-Setup-2.0.0.exe`
- `HKTV-Setup-2.0.0.exe.blockmap`
- `latest.yml`

## 14. Uji update dari versi sebelumnya

Lakukan pengujian dari aplikasi versi lama, misalnya `1.3.6`:

1. buka aplikasi versi lama
2. jalankan pengecekan update
3. pastikan aplikasi mendeteksi `2.0.0`
4. pastikan proses download/update berjalan normal

## Alur Singkat

Urutan cepatnya seperti ini:

```powershell
git checkout master
git pull origin master
git merge --no-ff perf/stream-stability
```

Lalu update version di `package.json` dan `package-lock.json`, kemudian:

```powershell
git add package.json package-lock.json
git commit -m "chore: release version 2.0.0"
git push origin master
npm run make
$env:GH_TOKEN="TOKEN_GITHUB_KAMU"
npm run publish
gh release edit v2.0.0 --repo saefulmillah/cctv-desktop --draft=false
```

## Checklist Rilis

- `master` sudah berisi perubahan terbaru
- version sudah benar di `package.json`
- version sudah benar di `package-lock.json`
- commit rilis sudah dibuat
- `master` sudah di-push
- installer berhasil dibuild
- `latest.yml` mengarah ke versi baru
- release GitHub sudah publik
- asset updater lengkap
- update dari versi lama berhasil terdeteksi

## Catatan Penting

- Major version dipakai saat perubahan dianggap besar atau signifikan
- Jika release tetap draft, auto-update biasanya tidak akan mendeteksi versi baru
- Jangan membagikan token GitHub di chat, file repo, atau source code
- Jika token sudah pernah dibagikan, segera rotate token tersebut di GitHub
