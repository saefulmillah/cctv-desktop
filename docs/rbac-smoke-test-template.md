# Smoke Test RBAC HKTV Desktop

## Informasi Uji
- Tanggal:
- Branch app: `feat/desktop-rbac-runtime`
- Backend URL:
- Versi app:
- Tester:

## User Uji
| Kode | Username | Role | Permission Kunci | Branch Scope |
|------|----------|------|------------------|--------------|
| U1 | `admin` | `super_admin` | akses penuh | semua branch |
| U2 | `rbac_verify_operator_sos` | `operator_sos` | asset + SOS action | `ATP`, `JORR-S` |
| U3 | `rbac_verify_operator_asset` | `operator_asset` | asset only | `ATP` |
| U4 | `rbac_verify_operator_cctv` | `operator_cctv` | CCTV only | `ATP` |

Lihat detail mapping user uji di [rbac-test-users.md](/c:/00.%20Project/cctv-desktop/docs/rbac-test-users.md).

## Hasil Uji

| ID | Skenario | User | Expected Result | Actual Result | Status | Catatan |
|----|----------|------|-----------------|---------------|--------|---------|
| T01 | App pertama kali menampilkan login modal | U1 | Login modal tampil, UI utama terkunci |  | PASS |  |
| T02 | Check URL berhasil dengan `API_BASE_URL` valid | U1 | Health check sukses |  | PASS |  |
| T03 | Login valid memuat session dan capability | U1 | Login sukses, user/role tampil |  | PASS | user/role tampil tapi di focus mode, seharusnya buat satu button dengan value Hi, {username} jika diklik akan dropdown profil dan logout |
| T04 | Login gagal dengan credential salah | U1 | Error tampil, tidak masuk dashboard |  | PASS |  |
| T05 | Session pulih setelah app dibuka ulang | U1 | Tetap login jika token valid |  | PASS |  |
| T06 | Token invalid saat startup kembali ke login | U1 | Session dibersihkan, login modal tampil |  | PASS / FAIL | tidak mengerti, maksudnya gimana, caranya gimana |
| T07 | User CCTV bisa buka branch picker | U2 | Branch picker aktif |  | PASS |  |
| T08 | Branch picker hanya tampilkan branch scope user | U2 | Hanya branch yang diizinkan |  | PASS |  |
| T09 | Workspace restore menolak branch di luar scope | U2 | Branch lama tidak dipakai |  | PASS / FAIL | tidak mengerti, maksudnya gimana, caranya gimana  |
| T10 | User asset-only tidak bisa pakai CCTV mode | U3 | Branch/search/reload CCTV terkunci |  | PASS |  |
| T11 | User asset bisa buka Asset Monitoring | U3 | `Go to Map` berhasil |  | PASS |  |
| T12 | User tanpa akses asset tidak bisa buka Asset Monitoring | U2/U4 | `Go to Map` disabled/ditolak |  | PASS |  |
| T13 | Asset Monitoring hanya tampilkan branch sesuai scope | U3 | Branch selector terfilter |  | PASS |  |
| T14 | `Semua Branch` hanya muncul untuk all-branch | U1 | Hanya super admin/all-branch yang melihat opsi ini |  | PASS |  |
| T15 | User tanpa `sos.ticket.dispatch` tidak bisa dispatch | U4 | Tombol/modal dispatch tidak usable |  | PASS / FAIL | belum dilakukan  |
| T16 | User tanpa `sos.ticket.complete` tidak bisa complete | U4 | Tombol/modal complete tidak usable |  | PASS / FAIL | belum dilakukan |
| T17 | User dengan permission penuh bisa dispatch | U1 | Dispatch sukses |  | PASS / FAIL | belum dilakukan |
| T18 | User dengan permission penuh bisa complete | U1 | Complete sukses |  | PASS / FAIL | belum dilakukan |
| T19 | Request `401` memaksa logout | U1 | Session reset, login modal muncul |  | PASS / FAIL | belum tau caranya |
| T20 | Request `403` tidak membuat app crash | U2/U3/U4 | Error akses tampil, app tetap stabil |  | PASS / FAIL | belum tau caranya |

## Bug / Temuan
| ID | Ringkasan | Langkah Repro | Severity | Screenshot/Log |
|----|-----------|---------------|----------|----------------|
| B01 |  |  |  |  |
| B02 |  |  |  |  |


pada saat create user terdapat error connection timeout, pada saat loading state sudah selesai kemudian dilakukan klik create user kembali, muncul error 409 dengan message : Username already exists


users:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)
userService.js:24  POST http://localhost:3000/api/users 409 (Conflict)
dispatchXhrRequest @ axios.js?v=8c973f20:1844
xhr @ axios.js?v=8c973f20:1709
dispatchRequest @ axios.js?v=8c973f20:2280
Promise.then
_request @ axios.js?v=8c973f20:2509
request @ axios.js?v=8c973f20:2394
httpMethod @ axios.js?v=8c973f20:2557
wrap @ axios.js?v=8c973f20:8
(anonymous) @ userService.js:24
(anonymous) @ UserManagementPage.jsx:202
(anonymous) @ UserFormModal.jsx:153
callCallback2 @ chunk-NXESFFTV.js?v=8c973f20:3680
invokeGuardedCallbackDev @ chunk-NXESFFTV.js?v=8c973f20:3705
invokeGuardedCallback @ chunk-NXESFFTV.js?v=8c973f20:3739
invokeGuardedCallbackAndCatchFirstError @ chunk-NXESFFTV.js?v=8c973f20:3742
executeDispatch @ chunk-NXESFFTV.js?v=8c973f20:7046
processDispatchQueueItemsInOrder @ chunk-NXESFFTV.js?v=8c973f20:7066
processDispatchQueue @ chunk-NXESFFTV.js?v=8c973f20:7075
dispatchEventsForPlugins @ chunk-NXESFFTV.js?v=8c973f20:7083
(anonymous) @ chunk-NXESFFTV.js?v=8c973f20:7206
batchedUpdates$1 @ chunk-NXESFFTV.js?v=8c973f20:18966
batchedUpdates @ chunk-NXESFFTV.js?v=8c973f20:3585
dispatchEventForPluginEventSystem @ chunk-NXESFFTV.js?v=8c973f20:7205
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-NXESFFTV.js?v=8c973f20:5484
dispatchEvent @ chunk-NXESFFTV.js?v=8c973f20:5478
dispatchDiscreteEvent @ chunk-NXESFFTV.js?v=8c973f20:5455


## Kesimpulan
- Total PASS:
- Total FAIL:
- Siap lanjut ke staging / revisi:
- Catatan akhir:
