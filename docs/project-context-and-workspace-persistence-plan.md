# Rencana Integrasi CCTV Proyek dan Persistensi Workspace

Dokumen ini menyimpan rencana implementasi untuk dua kebutuhan besar:

- menggabungkan CCTV proyek PT Hutama Karya ke aplikasi yang saat ini berfokus pada CCTV jalan tol
- menyimpan konfigurasi workspace terakhir agar tetap kembali saat aplikasi dibuka ulang

## Tujuan Utama

Aplikasi perlu mampu:

- menangani dua konteks operasional yang berbeda: `Tol` dan `Proyek`
- memberi pemisahan UI/UX yang jelas agar user tidak bingung
- menyimpan state kerja terakhir seperti layout, selected camera, page, mode, dan replace camera
- membuat tombol `Reload` hanya me-refresh data/stream tanpa menghapus konfigurasi tampilan
- menyediakan tombol `Reset Workspace` terpisah untuk menghapus konfigurasi kerja user

## 1. Konsep UI dan UX untuk Tol vs Proyek

### Prinsip utama

Jangan mencampur CCTV tol dan CCTV proyek dalam satu alur tanpa pembeda yang jelas.

Rekomendasi terbaik adalah menggunakan konsep:

- `Context`
- atau `Workspace`

Minimal ada dua context:

- `Tol`
- `Proyek`

### Rekomendasi UI

#### Context switcher

Tambahkan switcher yang selalu terlihat, misalnya:

- di header sidebar kiri atas
- atau sebagai segmented control kecil di area toolbar/dock

Contoh:

- `Tol | Proyek`

#### Identitas visual per context

Tetap satu keluarga desain, tetapi berbeda aksen:

- `Tol`
  - biru-cyan seperti sekarang
  - istilah: `Ruas`, `Gate`, `Page`
- `Proyek`
  - tetap modern, tetapi aksen bisa hijau-teal atau amber-teal
  - istilah: `Proyek`, `Lokasi`, `Area`, `Paket`, `Zona`

#### Sidebar adaptif

Untuk context `Tol`:

- judul ruas aktif
- statistik online/offline/selected
- peta ruas dan marker CCTV

Untuk context `Proyek`:

- judul proyek aktif
- statistik kamera proyek
- peta lokasi/site proyek
- metadata area kerja atau region jika tersedia

#### Picker dan search dipisah

Saat context `Tol` aktif:

- branch picker menampilkan ruas tol
- search mencari kamera tol

Saat context `Proyek` aktif:

- picker menampilkan daftar proyek/site
- search mencari kamera proyek

Default search tetap mengikuti context aktif.

## 2. Model Data yang Disarankan

Tambahkan konsep `context` di data frontend.

Contoh nilai:

- `toll`
- `project`

### Field dasar kamera

Setiap kamera minimal memiliki:

- `id`
- `context`
- `name`
- `stream_play_url`
- `lat`
- `lng`
- `is_active`

### Field khusus tol

- `branch_id`
- `branch_code`
- `branch_name`
- `gate_name`

### Field khusus proyek

- `project_id`
- `project_code`
- `project_name`
- `location_name`
- `region`
- `package_name`

## 3. State Persistence yang Disarankan

Persistence dibagi menjadi dua level.

### Global app state

State global menyimpan:

- `activeContext`
- mode app terakhir jika diperlukan
- API config
- update config

### Workspace state per context

Setiap context memiliki state kerja sendiri.

Contoh data yang disimpan per context:

- entity aktif terakhir
- page aktif
- layout terakhir
- mode terakhir
- selected camera ids
- selected camera metadata minimal
- slot override / replace camera
- map center dan map zoom terakhir jika diperlukan

Contoh struktur:

```json
{
  "activeContext": "toll",
  "contexts": {
    "toll": {
      "activeEntityId": 10,
      "activePage": 2,
      "mode": "focus",
      "layout": {
        "type": "5x4",
        "mainCount": 1,
        "sideCount": 6
      },
      "selectedCameraIds": ["2261", "2270"],
      "slotOverrides": {
        "10:2:0": { "id": 2261, "cctv_name": "..." }
      }
    },
    "project": {
      "activeEntityId": 55,
      "activePage": 1,
      "mode": "normal",
      "layout": {
        "type": "3x3",
        "mainCount": 1,
        "sideCount": 4
      },
      "selectedCameraIds": [],
      "slotOverrides": {}
    }
  }
}
```

## 4. Perilaku Saat App Dibuka Ulang

Urutan restore yang disarankan:

1. load config API
2. load persisted workspace state
3. restore `activeContext`
4. load entity aktif terakhir
5. load page terakhir
6. apply layout terakhir
7. restore selected camera
8. restore slot override
9. restore mode terakhir
10. render grid final

Tujuan urutan ini:

- menghindari flicker
- menghindari selected/override hilang karena data belum siap
- memastikan state tampil konsisten sejak awal

## 5. Perubahan Perilaku Tombol Reload

Perilaku `Reload` yang diinginkan:

- refresh data kamera aktif
- refresh stream
- refresh metadata terbaru
- refresh status kamera
- refresh marker map bila perlu

Tetapi `Reload` tidak boleh menghapus:

- layout
- selected camera
- slot override / replace camera
- mode
- page aktif
- context aktif

Dengan kata lain, `Reload` menjadi aksi `refresh data`, bukan `reset workspace`.

## 6. Tombol Reset Workspace

Karena tidak ingin diletakkan di menu toolbar, tombol reset sebaiknya ditempatkan di area workspace.

### Rekomendasi lokasi

Pilihan terbaik:

- di header sidebar
- atau di bawah panel stats sidebar

Label yang disarankan:

- `Reset View`
- atau `Reset Workspace`

### Perilaku reset

`Reset Workspace` hanya menghapus state kerja untuk context aktif:

- reset layout ke default
- hapus selected camera
- hapus slot override
- reset mode ke normal
- reset page ke 1
- reset map viewport jika diperlukan

Tetapi tidak menghapus:

- API config
- update config
- context aktif

## 7. Pemisahan Reload vs Reset

Agar perilaku aplikasi jelas:

### Reload

- update stream dan data
- tidak mengubah preferensi user

### Reset Workspace

- menghapus preferensi tampilan dan pilihan kerja untuk context aktif

### Change Context

- berpindah workspace
- state context lama tetap disimpan
- state context baru dipulihkan dari storage jika ada

## 8. Rencana Implementasi Bertahap

### Tahap A: fondasi persistence

Tujuan:

- menyimpan state workspace ke storage lokal
- memulihkan state saat startup

File yang kemungkinan disentuh:

- `src/renderer.js`
- `src/index.js`
- `src/preload.js`

Yang akan ditambahkan:

- `window.appState.getWorkspaceState()`
- `window.appState.saveWorkspaceState(payload)`
- helper `serializeWorkspaceState()`
- helper `restoreWorkspaceState()`

### Tahap B: ubah perilaku reload

Tujuan:

- `Reload` tidak lagi menghapus override/layout/selection

Perubahan:

- hapus logic yang membersihkan `slotOverrides` saat reload
- pertahankan selected camera dan layout saat fetch ulang dilakukan

### Tahap C: tambah tombol Reset Workspace

Tujuan:

- menyediakan reset eksplisit yang terpisah dari toolbar menu

Perubahan:

- tambah button baru di area sidebar atau workspace panel
- tambahkan handler reset untuk context aktif
- opsional: tambahkan konfirmasi ringan sebelum reset

### Tahap D: tambah context switcher Tol vs Proyek

Tujuan:

- memisahkan alur kerja dua domain CCTV

Perubahan:

- tambah `activeContext`
- pisahkan picker, search, title, stats, dan map data source
- samakan pola UI tetapi beda istilah dan aksen

### Tahap E: polish UX

Tujuan:

- memperjelas bahwa dua context ini berbeda tetapi tetap dalam satu aplikasi

Perubahan:

- badge context aktif
- aksen warna per context
- empty state spesifik context
- recent activity per context bila diperlukan

## 9. Keputusan Arsitektur Penting

Perlu dipastikan apakah CCTV proyek:

- memakai endpoint backend yang sama dengan CCTV tol
- atau memakai endpoint yang berbeda

### Jika endpoint sama

- cukup tambah field `context/type`
- lakukan filtering per context

### Jika endpoint berbeda

Rekomendasi:

- gunakan satu service interface di frontend
- tetapi dispatch ke endpoint berbeda secara internal

Contoh interface yang disarankan:

- `getEntitiesByContext(context)`
- `getCamerasByEntity(context, entityId, page)`
- `searchCameras(context, query)`

## 10. Risiko yang Perlu Dijaga

- restore state terlalu cepat sebelum data siap dapat menyebabkan selected/override gagal dipasang
- ID kamera dari backend bisa berubah sehingga restore selection tidak cocok
- state per-context harus benar-benar terpisah agar tidak tercampur
- tombol reset tidak boleh ikut menghapus config API
- tombol reload tidak boleh lagi berperilaku seperti reset

## 11. Urutan Kerja yang Direkomendasikan

Urutan implementasi yang paling aman:

1. ubah konsep `Reload` vs `Reset Workspace`
2. tambahkan persistence state
3. restore state saat startup
4. baru implement context `Tol` vs `Proyek`
5. terakhir lakukan polish visual dan UX per context

Alasan urutan ini:

- persistence dan reset akan berguna untuk kedua context
- fondasi lebih baik disiapkan sebelum domain baru dimasukkan

## 12. Blueprint Lanjutan yang Bisa Dibuat

Langkah berikutnya yang bisa disusun setelah ini:

- blueprint implementasi per file untuk `renderer.js`
- blueprint IPC dan storage untuk `index.js` dan `preload.js`
- rancangan UI context switcher
- rancangan data contract untuk CCTV proyek
