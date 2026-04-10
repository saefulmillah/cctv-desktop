# Asset Monitoring API Contract - Tahap 1

Tahap 1 mencakup:

- gate equipment alert untuk perangkat tol
- marker standalone untuk CCTV dan VMS
- overlay SOS
- realtime event stream

Tahap ini sengaja belum memasukkan FO dan WIM.

## Tujuan Tahap 1

- Menampilkan marker pulse merah di gerbang jika satu atau lebih perangkat tol error.
- Menampilkan marker individual untuk CCTV dan VMS.
- Menampilkan cluster error untuk CCTV dan VMS bila lokasinya berdekatan di frontend.
- Mempertahankan overlay SOS sebagai layer terpisah.
- Menerima perubahan status secara realtime tanpa reload penuh halaman.

## Domain dan Tanggung Jawab

### Gate alert aggregation

Digunakan untuk perangkat tol di gerbang seperti:

- `TCT`
- `PCT`
- `IOL`
- `LPR`

Frontend hanya menerima satu entitas marker per gerbang. Perhitungan apakah gerbang error dilakukan di backend.

### Standalone asset

Dipakai untuk:

- `cctv`
- `vms`

Frontend menerima marker individual, lalu bebas melakukan clustering visual.

### SOS overlay

SOS tetap dipisah sebagai overlay insiden dan tidak menjadi sumber utama isi layer asset.

## Endpoint

### 1. Branch list

`GET /api/map/branches`

Dipakai untuk memilih ruas atau branch aktif.

Response:

```json
{
  "data": [
    {
      "id": 12,
      "branch_code": "JORR-S",
      "branch_name": "JORR Selatan",
      "center_lat": -6.255,
      "center_lng": 106.842
    }
  ]
}
```

### 2. Gate equipment alert summary

`GET /api/map/gate-alerts?branch_id=12`

Mengembalikan satu marker agregasi per gerbang.

Query params:

- `branch_id` required
- `status` optional, contoh: `error,offline`
- `include` optional, contoh: `affected_devices`

Response:

```json
{
  "data": [
    {
      "gate_id": 301,
      "gate_code": "GT-CIKUPA-01",
      "gate_name": "Gerbang Cikupa",
      "branch_id": 12,
      "lat": -6.2331,
      "lng": 106.5082,
      "status": "error",
      "severity": "high",
      "pulse": true,
      "device_summary": {
        "total": 8,
        "normal": 5,
        "warning": 1,
        "error": 2,
        "offline": 0
      },
      "affected_devices": [
        {
          "device_id": 8001,
          "device_type": "TCT",
          "device_name": "TCT-01",
          "status": "error",
          "severity": "high",
          "last_update_at": "2026-04-09T10:14:43+07:00"
        },
        {
          "device_id": 8002,
          "device_type": "LPR",
          "device_name": "LPR-01",
          "status": "warning",
          "severity": "medium",
          "last_update_at": "2026-04-09T10:13:10+07:00"
        }
      ],
      "last_event_at": "2026-04-09T10:14:43+07:00"
    }
  ],
  "meta": {
    "branch_id": 12,
    "totals": {
      "gates": 26,
      "error": 2,
      "warning": 1,
      "offline": 0
    }
  }
}
```

Aturan backend:

- `pulse = true` jika `device_summary.error > 0` atau `device_summary.offline > 0`
- `status` merepresentasikan status agregasi gerbang
- `severity` merepresentasikan severity tertinggi di gerbang tersebut

### 3. Gate equipment alert detail

`GET /api/map/gate-alerts/{gate_id}`

Dipakai saat marker gerbang diklik.

Response:

```json
{
  "data": {
    "gate_id": 301,
    "gate_code": "GT-CIKUPA-01",
    "gate_name": "Gerbang Cikupa",
    "branch_id": 12,
    "lat": -6.2331,
    "lng": 106.5082,
    "status": "error",
    "severity": "high",
    "pulse": true,
    "device_summary": {
      "total": 8,
      "normal": 5,
      "warning": 1,
      "error": 2,
      "offline": 0
    },
    "devices": [
      {
        "device_id": 8001,
        "device_type": "TCT",
        "device_name": "TCT-01",
        "status": "error",
        "severity": "high",
        "serial_number": "TCT-01-ABC",
        "last_update_at": "2026-04-09T10:14:43+07:00",
        "recent_events": [
          {
            "event_id": "evt-gate-1",
            "event_type": "status_changed",
            "status": "error",
            "severity": "high",
            "occurred_at": "2026-04-09T10:14:43+07:00"
          }
        ]
      }
    ]
  }
}
```

### 4. Standalone asset summary

`GET /api/map-assets?branch_id=12&type=cctv,vms`

Dipakai untuk layer standalone.

Query params:

- `branch_id` required
- `type` required, nilai valid tahap 1: `cctv`, `vms`
- `status` optional, contoh: `error,offline`

Response:

```json
{
  "data": [
    {
      "id": 9001,
      "asset_type": "cctv",
      "asset_code": "CCTV-GT-CIKUPA-01",
      "asset_name": "CCTV Gerbang Cikupa 01",
      "branch_id": 12,
      "gate_id": 301,
      "gate_name": "Gerbang Cikupa",
      "lat": -6.23312,
      "lng": 106.50817,
      "status": "error",
      "severity": "high",
      "pulse": true,
      "is_online": false,
      "has_live_stream": true,
      "last_update_at": "2026-04-09T10:15:00+07:00"
    },
    {
      "id": 9102,
      "asset_type": "vms",
      "asset_code": "VMS-CIKUPA-A",
      "asset_name": "VMS Cikupa A",
      "branch_id": 12,
      "gate_id": 301,
      "gate_name": "Gerbang Cikupa",
      "lat": -6.2335,
      "lng": 106.5078,
      "status": "normal",
      "severity": "none",
      "pulse": false,
      "is_online": true,
      "has_live_stream": false,
      "last_update_at": "2026-04-09T10:14:43+07:00"
    }
  ],
  "meta": {
    "branch_id": 12,
    "types": ["cctv", "vms"],
    "totals": {
      "all": 148,
      "normal": 130,
      "warning": 8,
      "error": 7,
      "offline": 3
    }
  }
}
```

Aturan backend:

- `pulse = true` jika status `error` atau `offline`
- marker cluster tetap dihitung di frontend, bukan di backend

### 5. Standalone asset detail

`GET /api/map-assets/{asset_type}/{id}`

Nilai `asset_type` valid tahap 1:

- `cctv`
- `vms`

Response contoh CCTV:

```json
{
  "data": {
    "id": 9001,
    "asset_type": "cctv",
    "asset_code": "CCTV-GT-CIKUPA-01",
    "asset_name": "CCTV Gerbang Cikupa 01",
    "branch_id": 12,
    "gate_id": 301,
    "gate_name": "Gerbang Cikupa",
    "lat": -6.23312,
    "lng": 106.50817,
    "status": "error",
    "severity": "high",
    "pulse": true,
    "is_online": false,
    "has_live_stream": true,
    "stream_play_url": "https://example.com/live/cctv-01.m3u8",
    "last_update_at": "2026-04-09T10:15:00+07:00",
    "metadata": {
      "vendor": "Hikvision",
      "model": "DS-2CD",
      "ip_address": "10.10.1.20"
    },
    "active_alarms": [
      {
        "alarm_id": "alm-1",
        "alarm_code": "STREAM_OFFLINE",
        "alarm_name": "Stream Offline",
        "severity": "high",
        "opened_at": "2026-04-09T10:14:20+07:00"
      }
    ]
  }
}
```

### 6. SOS overlay summary

`GET /api/sos-alerts`

Frontend tetap membutuhkan layer SOS yang terpisah dari asset layer.

Response:

```json
{
  "data": [
    {
      "sos_id": 10001,
      "branch_id": 12,
      "branch_code": "JORR-S",
      "branch_name": "JORR Selatan",
      "gate_id": 301,
      "latitude": -6.234,
      "longitude": 106.509,
      "status": 0,
      "created_at": "2026-04-09T10:16:00+07:00",
      "user": {
        "id": 55,
        "first_name": "Budi",
        "last_name": "Santoso",
        "phone": "08123456789",
        "address": "Jl. Contoh"
      },
      "nearest_assets": [
        {
          "asset_id": 9001,
          "asset_type": "cctv",
          "asset_name": "CCTV Gerbang Cikupa 01",
          "distance_m": 130
        },
        {
          "asset_id": 9102,
          "asset_type": "vms",
          "asset_name": "VMS Cikupa A",
          "distance_m": 210
        }
      ]
    }
  ]
}
```

Catatan:

- gunakan `nearest_assets`, bukan `nearest_cameras`
- struktur lama masih bisa dipertahankan sementara dengan adapter di frontend

### 7. SOS ticket endpoints

Endpoint yang sudah ada saat ini masih bisa dipakai tanpa perubahan kontrak besar:

- `GET /api/sos-tickets/open`
- `GET /api/sos-tickets/{ticket_no}`
- `POST /api/sos-tickets/dispatch`
- `POST /api/sos-tickets/{ticket_no}/complete`

Tahap 1 tidak menambah requirement baru untuk endpoint ticket selain konsistensi timestamp dan status.

### 8. Realtime event stream

`GET /api/map-events/stream`

Transport yang diutamakan: SSE.

Header yang direkomendasikan:

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

Event yang dibutuhkan tahap 1:

- `gate_status_changed`
- `asset_status_changed`
- `asset_alarm_opened`
- `asset_alarm_cleared`
- `sos_created`
- `sos_updated`
- `sos_completed`

Contoh event gerbang:

```txt
event: gate_status_changed
data: {"gate_id":301,"branch_id":12,"status":"error","severity":"high","pulse":true,"device_summary":{"total":8,"normal":5,"warning":1,"error":2,"offline":0},"last_event_at":"2026-04-09T10:14:43+07:00"}
```

Contoh event asset:

```txt
event: asset_status_changed
data: {"asset_id":9001,"asset_type":"cctv","branch_id":12,"gate_id":301,"status":"error","severity":"high","pulse":true,"is_online":false,"last_update_at":"2026-04-09T10:15:00+07:00"}
```

Contoh event SOS:

```txt
event: sos_created
data: {"sos_id":10001,"branch_id":12,"gate_id":301,"latitude":-6.234,"longitude":106.509,"status":0,"created_at":"2026-04-09T10:16:00+07:00"}
```

## Catatan Implementasi Frontend

- Gate alert akan menjadi layer agregasi dengan marker pulse merah jika error.
- CCTV dan VMS akan dirender sebagai marker individual.
- Cluster error CCTV dan VMS dihitung di frontend berdasarkan kedekatan posisi.
- Layer SOS tetap berdiri sendiri dan hanya melakukan focus atau highlight, bukan reload asset layer.

## Out of Scope Tahap 1

- FO node dan FO link
- WIM aggregated alert
- query berbasis bounds
- jalur network topology selain daftar marker per branch
