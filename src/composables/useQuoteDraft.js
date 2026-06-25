import { reactive } from 'vue'

const instructionsByVehicleId = reactive({})

const customerInfo = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
})

export function useQuoteDraft() {
  function getInstructions(vehicleId) {
    return instructionsByVehicleId[vehicleId] ?? ''
  }

  function setInstructions(vehicleId, text) {
    instructionsByVehicleId[vehicleId] = text
  }

  function removeInstructions(vehicleId) {
    delete instructionsByVehicleId[vehicleId]
  }

  function clearAllInstructions() {
    for (const key of Object.keys(instructionsByVehicleId)) {
      delete instructionsByVehicleId[key]
    }
  }

  function clearCustomerInfo() {
    customerInfo.name = ''
    customerInfo.email = ''
    customerInfo.phone = ''
    customerInfo.company = ''
  }

  function buildPayload(selectedIds) {
    return {
      customer: {
        name: customerInfo.name.trim(),
        email: customerInfo.email.trim(),
        phone: customerInfo.phone.trim(),
        company: customerInfo.company.trim(),
      },
      items: selectedIds.map((vehicleId) => ({
        vehicleId,
        instructions: getInstructions(vehicleId),
      })),
    }
  }

  return {
    customerInfo,
    getInstructions,
    setInstructions,
    removeInstructions,
    clearAllInstructions,
    clearCustomerInfo,
    buildPayload,
  }
}
