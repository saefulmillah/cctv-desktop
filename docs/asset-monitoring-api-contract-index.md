# Asset Monitoring API Contract

Dokumen ini membagi kontrak API asset monitoring menjadi tiga tahap implementasi agar backend dan frontend bisa bergerak bertahap tanpa menunggu semua domain selesai sekaligus.

## Tahapan

1. Tahap 1: gate equipment alert, CCTV, VMS, SOS overlay, dan realtime stream.
   Lihat [asset-monitoring-api-contract-stage-1.md](/c:/00.%20Project/cctv-desktop/docs/asset-monitoring-api-contract-stage-1.md)
2. Tahap 2: FO node dan FO link, termasuk visualisasi garis konektivitas berbentuk arc atau curve.
   Lihat [asset-monitoring-api-contract-stage-2-fo.md](/c:/00.%20Project/cctv-desktop/docs/asset-monitoring-api-contract-stage-2-fo.md)
3. Tahap 3: WIM aggregated alert dan detail sub-device.
   Lihat [asset-monitoring-api-contract-stage-3-wim.md](/c:/00.%20Project/cctv-desktop/docs/asset-monitoring-api-contract-stage-3-wim.md)

## Prinsip Umum

- Peta tidak memakai `bounds` sebagai kontrak API.
- Query utama memakai `branch_id`, `gate_id`, `status`, `type`, dan `include`.
- Layer agregasi seperti `gate` dan `wim_site` mengembalikan satu marker per entitas.
- Layer standalone seperti `cctv`, `vms`, dan `fo_node` mengembalikan marker individual.
- Realtime update dilakukan melalui SSE.
- Semua timestamp menggunakan ISO 8601 lengkap dengan offset timezone.

## Enum yang Disepakati

### `status`

- `normal`
- `warning`
- `error`
- `offline`

### `severity`

- `none`
- `low`
- `medium`
- `high`
- `critical`

## Envelope Response

Semua endpoint JSON disarankan memakai envelope berikut:

```json
{
  "data": [],
  "meta": {},
  "message": "optional"
}
```

Untuk detail item:

```json
{
  "data": {}
}
```

Untuk error:

```json
{
  "message": "Branch tidak ditemukan.",
  "errors": {
    "branch_id": ["branch_id wajib valid."]
  }
}
```
