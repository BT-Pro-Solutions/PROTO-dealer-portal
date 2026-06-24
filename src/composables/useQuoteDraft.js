import { reactive } from 'vue'

const instructionsByVehicleId = reactive({})

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

  function buildPayload(selectedIds) {
    return selectedIds.map((vehicleId) => ({
      vehicleId,
      instructions: getInstructions(vehicleId),
    }))
  }

  return {
    getInstructions,
    setInstructions,
    removeInstructions,
    clearAllInstructions,
    buildPayload,
  }
}
