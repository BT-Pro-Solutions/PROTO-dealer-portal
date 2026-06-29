/**
 * Vehicle catalog dummy data.
 * Replace fetchVehicles() with a real API call when backend is ready.
 */

export const filterOptions = {
  makes: ['Ford', 'Chevrolet', 'Ram'],
  colors: [
    { id: 'white', label: 'White', hex: '#ffffff' },
    { id: 'silver', label: 'Silver', hex: '#c0c0c0' },
    { id: 'red', label: 'Red', hex: '#c0392b' },
    { id: 'blue', label: 'Blue', hex: '#1a5276' },
    { id: 'black', label: 'Black', hex: '#1a1a1a' },
  ],
  truckTypes: ['Cab Chassis', 'Cutaway', 'Stripped Chassis', 'Van', 'Pickup'],
  bodyTypes: [
    'Service body',
    'Flatbed',
    'Dump body',
    'Stake bed',
    'Box body',
    'Cargo van',
    'Utility body',
    'Platform body',
  ],
  rearWheels: [
    { id: 'SRW', label: 'Single Rear Wheel' },
    { id: 'DRW', label: 'Double Rear Wheel' },
  ],
  drives: ['4x2', '4x4'],
}

const colorNames = {
  white: 'Oxford White',
  silver: 'Ingot Silver',
  red: 'Race Red',
  blue: 'Antimatter Blue',
  black: 'Agate Black',
}

const modelCodes = {
  'F-550 Super Duty': 'F55',
  'F-450 Super Duty': 'F45',
  'F-350 Super Duty': 'F35',
  'Transit Van': 'TV3',
  'Silverado 5500HD': 'S55',
  'Silverado 4500HD': 'S45',
  'Express Van': 'EV3',
  '5500 Chassis Cab': 'R55',
  '4500 Chassis Cab': 'R45',
  'ProMaster Van': 'PM3',
}

const engines = {
  Ford: '6.7L Power Stroke',
  Chevrolet: '6.6L Duramax',
  Ram: '6.7L Cummins',
}

const bodyTypes = filterOptions.bodyTypes.filter((type) => type !== 'Cargo van')
const vanBodyTypes = ['Cargo van', 'Box body', 'Utility body']
const cabTruckTypes = ['Cab Chassis', 'Cutaway', 'Stripped Chassis', 'Pickup']
const vanTruckTypes = ['Van', 'Cutaway']
const chassisDueOptions = ['On Ground', 'In Transit', 'Factory Order']

const models = {
  Ford: ['F-550 Super Duty', 'F-450 Super Duty', 'F-350 Super Duty', 'Transit Van'],
  Chevrolet: ['Silverado 5500HD', 'Silverado 4500HD', 'Express Van'],
  Ram: ['5500 Chassis Cab', '4500 Chassis Cab', 'ProMaster Van'],
}

const PLACEHOLDER = '/assets/truck-placeholder.jpg'

/** Demo vehicles with no photos — exercises the missing-image placeholder UI */
const NO_IMAGE_VEHICLE_IDS = new Set(['5', '23'])

export function vehicleHasImages(vehicle) {
  return Boolean(vehicle?.imageUrls?.length)
}

function generateVin(seed) {
  const chars = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ'
  let vin = ''
  for (let i = 0; i < 17; i++) {
    vin += chars[(seed * 7 + i * 13) % chars.length]
  }
  return vin
}

function buildImageUrls(seed) {
  if (NO_IMAGE_VEHICLE_IDS.has(String(seed))) {
    return []
  }
  // Dummy gallery — replace with real URLs from API
  const count = 2 + (seed % 3)
  return Array.from({ length: count }, () => PLACEHOLDER)
}

function buildCatalog() {
  const vehicles = []
  let id = 1

  for (const [make, modelList] of Object.entries(models)) {
    for (const model of modelList) {
      for (let variant = 0; variant < 6; variant++) {
        const color = filterOptions.colors[(id + variant) % filterOptions.colors.length]
        const isVanModel = model.includes('Van')
        const truckType = isVanModel
          ? vanTruckTypes[variant % vanTruckTypes.length]
          : cabTruckTypes[variant % cabTruckTypes.length]
        const rearWheel = variant % 2 === 0 ? 'SRW' : 'DRW'
        const drive = variant % 2 === 0 ? '4x4' : '4x2'
        const year = 2025 + (variant % 2)
        const imageUrls = buildImageUrls(id)
        const isVan = truckType === 'Van' || (isVanModel && truckType === 'Cutaway')

        vehicles.push({
          id: String(id),
          make,
          model,
          title: `${make} ${model}`,
          vin: generateVin(id),
          modelCode: modelCodes[model] ?? 'N/A',
          year,
          color: color.id,
          colorName: colorNames[color.id],
          truckType,
          rearWheel,
          drive,
          imageUrl: imageUrls[0] ?? null,
          imageUrls,
          engine: isVan ? `${make} ${variant % 2 === 0 ? '3.5L EcoBoost' : '3.5L V6'}` : engines[make],
          transmission: isVan ? '10-speed automatic' : '10-speed auto',
          gvwr: isVan ? '9,070' : String(16500 + (variant % 4) * 1000),
          cabToAxle: isVan ? 'N/A' : String(60 + (variant % 5) * 6),
          wheelbase: isVan ? String(130 + (variant % 3) * 10) : String(158 + (variant % 4) * 15),
          bodyType: isVanModel
            ? vanBodyTypes[variant % vanBodyTypes.length]
            : bodyTypes[variant % bodyTypes.length],
          chassisDue: chassisDueOptions[variant % chassisDueOptions.length],
        })
        id++
      }
    }
  }

  return vehicles
}

export const vehicles = buildCatalog()

export async function fetchVehicles() {
  // TODO: return await fetch('/api/dealer/vehicles').then(r => r.json())
  return vehicles
}

export async function submitQuoteRequest(payload) {
  // TODO: return await fetch('/api/dealer/quote-requests', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // }).then(r => r.json())
  console.info('[dummy] Information request submitted:', payload)
  return { success: true, requestId: `REQ-${Date.now()}` }
}

/** Detail page spec rows — labels spelled out, keys map to vehicle fields */
export const vehicleDetailFields = [
  { label: 'VIN', key: 'vin' },
  { label: 'Model code', key: 'modelCode' },
  { label: 'Color', key: 'colorName' },
  { label: 'Engine', key: 'engine' },
  { label: 'Transmission', key: 'transmission' },
  { label: 'Gross vehicle weight rating', key: 'gvwr', suffix: ' lbs' },
  { label: 'Cab to axle', key: 'cabToAxle', suffix: ' in' },
  { label: 'Wheelbase', key: 'wheelbase', suffix: ' in' },
  { label: 'Drive', key: 'drive' },
  { label: 'Rear wheel', key: 'rearWheel' },
  { label: 'Truck type', key: 'truckType' },
  { label: 'Body type', key: 'bodyType' },
  { label: 'Chassis due', key: 'chassisDue' },
]

export function formatDetailValue(vehicle, field) {
  const raw = vehicle[field.key]
  if (raw == null || raw === '') return '—'
  if (field.suffix && raw !== 'N/A') return `${raw}${field.suffix}`
  return String(raw)
}
