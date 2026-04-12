# Asset Monitoring API Contract - Tahap 3 WIM

Tahap 3 menambahkan domain WIM sebagai entitas agregasi.

WIM diperlakukan mirip dengan gate alert:

- satu marker per site WIM
- marker pulse merah jika salah satu atau lebih sub-device error atau offline

Sub-device yang dicakup:

- `sensor_wim`
- `sensor_od`
- `camera`

## Tujuan Tahap 3

- Menampilkan status agregasi site WIM dalam satu marker yang mudah dibaca.
- Memungkinkan drill-down ke sub-device yang ada di dalam site WIM.
- Mendukung realtime update untuk perubahan status sub-device maupun status agregasi site.

## Endpoint

### 1. WIM site alert summary

`GET /api/map/wim-alerts?branch_id=12`

Query params:

- `branch_id` required
- `status` optional, contoh: `error,offline`
- `include` optional, contoh: `affected_devices`

Response:

```json
{
  "data": [
    {
      "wim_id": 41,
      "wim_code": "WIM-CIKUPA-A",
      "wim_name": "WIM Cikupa A",
      "branch_id": 12,
      "lat": -6.229,
      "lng": 106.511,
      "status": "error",
      "severity": "high",
      "pulse": true,
      "device_summary": {
        "total": 6,
        "normal": 4,
        "warning": 0,
        "error": 1,
        "offline": 1
      },
      "affected_devices": [
        {
          "device_id": 6001,
          "device_type": "sensor_wim",
          "device_name": "WIM Sensor 1",
          "status": "error",
          "severity": "high",
          "last_update_at": "2026-04-09T10:16:00+07:00"
        },
        {
          "device_id": 6002,
          "device_type": "camera",
          "device_name": "WIM Camera 1",
          "status": "offline",
          "severity": "high",
          "last_update_at": "2026-04-09T10:15:10+07:00"
        }
      ],
      "last_event_at": "2026-04-09T10:16:00+07:00"
    }
  ],
  "meta": {
    "branch_id": 12,
    "totals": {
      "sites": 4,
      "error": 1,
      "warning": 0,
      "offline": 0
    }
  }
}
```

Aturan backend:

- `pulse = true` jika ada device `error` atau `offline`
- `status` adalah status agregasi site WIM
- `severity` adalah severity tertinggi dari sub-device aktif

### 2. WIM site detail

`GET /api/map/wim-alerts/{wim_id}`

Response:

```json
{
  "data": {
    "wim_id": 41,
    "wim_code": "WIM-CIKUPA-A",
    "wim_name": "WIM Cikupa A",
    "branch_id": 12,
    "lat": -6.229,
    "lng": 106.511,
    "status": "error",
    "severity": "high",
    "pulse": true,
    "device_summary": {
      "total": 6,
      "normal": 4,
      "warning": 0,
      "error": 1,
      "offline": 1
    },
    "devices": [
      {
        "device_id": 6001,
        "device_type": "sensor_wim",
        "device_name": "WIM Sensor 1",
        "status": "error",
        "severity": "high",
        "serial_number": "WIM-S-01",
        "last_update_at": "2026-04-09T10:16:00+07:00",
        "recent_events": [
          {
            "event_id": "evt-wim-1",
            "event_type": "status_changed",
            "status": "error",
            "severity": "high",
            "occurred_at": "2026-04-09T10:16:00+07:00"
          }
        ]
      },
      {
        "device_id": 6002,
        "device_type": "camera",
        "device_name": "WIM Camera 1",
        "status": "offline",
        "severity": "high",
        "serial_number": "WIM-CAM-01",
        "last_update_at": "2026-04-09T10:15:10+07:00"
      }
    ]
  }
}
```

### 3. WIM device detail

Opsional, tetapi disarankan jika nanti frontend perlu panel detail per sub-device.

`GET /api/map/wim-devices/{device_id}`

Response:

```json
{
  "data": {
    "device_id": 6001,
    "wim_id": 41,
    "device_type": "sensor_wim",
    "device_name": "WIM Sensor 1",
    "status": "error",
    "severity": "high",
    "last_update_at": "2026-04-09T10:16:00+07:00",
    "metadata": {
      "vendor": "Kistler",
      "model": "Quartz Sensor"
    },
    "active_alarms": [
      {
        "alarm_id": "wim-alm-1",
        "alarm_code": "NO_READING",
        "alarm_name": "No Reading",
        "severity": "high",
        "opened_at": "2026-04-09T10:15:45+07:00"
      }
    ]
  }
}
```

## Realtime Event Stream Tambahan

Tambahkan event berikut ke `GET /api/map-events/stream`:

- `wim_status_changed`
- `wim_device_status_changed`
- `wim_alarm_opened`
- `wim_alarm_cleared`

Contoh event agregasi:

```txt
event: wim_status_changed
data: {"wim_id":41,"branch_id":12,"status":"error","severity":"high","pulse":true,"device_summary":{"total":6,"normal":4,"warning":0,"error":1,"offline":1},"last_event_at":"2026-04-09T10:16:00+07:00"}
```

Contoh event sub-device:

```txt
event: wim_device_status_changed
data: {"device_id":6001,"wim_id":41,"device_type":"sensor_wim","status":"error","severity":"high","last_update_at":"2026-04-09T10:16:00+07:00"}
```

## Catatan Frontend

- Layer WIM dirender sebagai marker agregasi, bukan marker per sensor.
- Detail sub-device ditampilkan di panel saat marker WIM dipilih.
- Bila di masa depan ingin menampilkan sub-device individual, kontrak tahap 3 masih kompatibel karena data detail site sudah menyertakan daftar device.

## Out of Scope Tahap 3

- animasi rute kendaraan pada WIM
- heatmap pelanggaran WIM
- analitik historis lintas hari
