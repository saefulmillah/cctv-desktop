# Asset Monitoring API Contract - Tahap 2 FO

Tahap 2 menambahkan domain Fiber Optic:

- `fo_node` sebagai marker titik
- `fo_link` sebagai konektivitas antar titik

Visualisasi yang diinginkan di frontend:

- node tampil sebagai marker
- koneksi antar node tampil sebagai garis curve atau arc
- node atau link berstatus error menampilkan warna merah

## Tujuan Tahap 2

- Menampilkan topologi FO pada peta.
- Menampilkan error di node maupun link FO secara realtime.
- Memungkinkan frontend menggambar arc tanpa backend perlu mengirim geometri curve jadi.

## Model Data

### FO node

Node adalah titik perangkat atau termination point.

### FO link

Link adalah hubungan dari satu node ke node lain. Frontend akan menggambar curve dari koordinat awal dan akhir.

## Endpoint

### 1. FO node summary

`GET /api/map-assets?branch_id=12&type=fo_node`

Response:

```json
{
  "data": [
    {
      "id": 9201,
      "asset_type": "fo_node",
      "asset_code": "FO-NODE-A",
      "asset_name": "FO Node A",
      "branch_id": 12,
      "gate_id": 301,
      "gate_name": "Gerbang Cikupa",
      "lat": -6.2321,
      "lng": 106.5091,
      "status": "error",
      "severity": "high",
      "pulse": true,
      "is_online": false,
      "last_update_at": "2026-04-09T10:12:00+07:00"
    },
    {
      "id": 9202,
      "asset_type": "fo_node",
      "asset_code": "FO-NODE-B",
      "asset_name": "FO Node B",
      "branch_id": 12,
      "gate_id": 302,
      "gate_name": "Gerbang Bitung",
      "lat": -6.2289,
      "lng": 106.5142,
      "status": "normal",
      "severity": "none",
      "pulse": false,
      "is_online": true,
      "last_update_at": "2026-04-09T10:10:00+07:00"
    }
  ]
}
```

### 2. FO node detail

`GET /api/map-assets/fo_node/{id}`

Response:

```json
{
  "data": {
    "id": 9201,
    "asset_type": "fo_node",
    "asset_code": "FO-NODE-A",
    "asset_name": "FO Node A",
    "branch_id": 12,
    "gate_id": 301,
    "lat": -6.2321,
    "lng": 106.5091,
    "status": "error",
    "severity": "high",
    "pulse": true,
    "metadata": {
      "node_role": "distribution",
      "cabinet_name": "FO Cabinet A",
      "vendor": "Cisco"
    },
    "active_alarms": [
      {
        "alarm_id": "fo-alm-1",
        "alarm_code": "LOSS_SIGNAL",
        "alarm_name": "Loss of Signal",
        "severity": "high",
        "opened_at": "2026-04-09T10:11:50+07:00"
      }
    ]
  }
}
```

### 3. FO link summary

`GET /api/map-fo-links?branch_id=12`

Response:

```json
{
  "data": [
    {
      "link_id": 7001,
      "branch_id": 12,
      "from_node_id": 9201,
      "to_node_id": 9202,
      "from_lat": -6.2321,
      "from_lng": 106.5091,
      "to_lat": -6.2289,
      "to_lng": 106.5142,
      "status": "error",
      "severity": "high",
      "pulse": false,
      "last_update_at": "2026-04-09T10:13:00+07:00",
      "link_metrics": {
        "core_total": 24,
        "core_active": 12,
        "utilization_percent": 50
      }
    }
  ]
}
```

Catatan:

- Backend cukup mengirim titik awal dan titik akhir.
- Frontend akan membuat arc atau curve dari pasangan titik tersebut.
- `pulse` pada link opsional, karena visual utama link adalah warna dan glow.

### 4. FO link detail

`GET /api/map-fo-links/{link_id}`

Response:

```json
{
  "data": {
    "link_id": 7001,
    "branch_id": 12,
    "from_node_id": 9201,
    "to_node_id": 9202,
    "from_lat": -6.2321,
    "from_lng": 106.5091,
    "to_lat": -6.2289,
    "to_lng": 106.5142,
    "status": "error",
    "severity": "high",
    "last_update_at": "2026-04-09T10:13:00+07:00",
    "metadata": {
      "fiber_segment_name": "Segment A-B",
      "fiber_type": "single_mode",
      "distance_m": 850
    },
    "active_alarms": [
      {
        "alarm_id": "fo-link-alm-1",
        "alarm_code": "LINK_DOWN",
        "alarm_name": "FO Link Down",
        "severity": "high",
        "opened_at": "2026-04-09T10:12:50+07:00"
      }
    ]
  }
}
```

## Realtime Event Stream Tambahan

Tambahkan event berikut ke `GET /api/map-events/stream`:

- `fo_node_status_changed`
- `fo_link_status_changed`
- `fo_alarm_opened`
- `fo_alarm_cleared`

Contoh:

```txt
event: fo_node_status_changed
data: {"asset_id":9201,"asset_type":"fo_node","branch_id":12,"status":"error","severity":"high","pulse":true,"is_online":false,"last_update_at":"2026-04-09T10:12:00+07:00"}
```

```txt
event: fo_link_status_changed
data: {"link_id":7001,"branch_id":12,"from_node_id":9201,"to_node_id":9202,"status":"error","severity":"high","last_update_at":"2026-04-09T10:13:00+07:00"}
```

## Kontrak Visual Frontend untuk Curve

Frontend akan membentuk curve berdasarkan:

- titik awal `from_lat`, `from_lng`
- titik akhir `to_lat`, `to_lng`

Backend tidak perlu mengirim `control_point`, kecuali nanti ingin presisi khusus. Bila dibutuhkan di masa depan, field opsional berikut bisa ditambahkan:

```json
{
  "curve_hint": {
    "bend": 0.18,
    "clockwise": true
  }
}
```

Namun untuk tahap 2, field ini belum wajib.

## Out of Scope Tahap 2

- WIM aggregated alert
- perhitungan route FO otomatis
- network trace end-to-end
