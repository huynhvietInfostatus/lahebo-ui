import { useLookupStore } from '@/store/use-lookup-store'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { getEnumValues } from '@/core/helpers/common'
import { RiskStatus } from '@/core/models/risk.model'
import { useOrgLocationStore } from '@/store/use-org-location-store'
import { useOrgDepartmentStore } from '@/store/use-org-department-store'
import { ActionStatus } from '../models/action.model'

export function useRiskLookups(forceFetch = false) {
  const lookupStore = useLookupStore()
  const locationStore = useOrgLocationStore()
  const departmentStore = useOrgDepartmentStore()

  const { riskSources, isoStandards, actionSources } = storeToRefs(lookupStore)
  const { locations } = storeToRefs(locationStore)
  const { departments } = storeToRefs(departmentStore)

  const riskStatuses = getEnumValues(RiskStatus)
  const actionStatuses = getEnumValues(ActionStatus)

  const legalRequirements: string[] = []

  onMounted(() => {
    if (riskSources.value.length === 0 || forceFetch) {
      lookupStore.fetchRiskSources()
    }
    if (isoStandards.value.length === 0 || forceFetch) {
      lookupStore.fetchIsoStandards()
    }
    if (departments.value.length === 0 || forceFetch) {
      departmentStore.getDepartments()
    }
    if (locations.value.length === 0 || forceFetch) {
      locationStore.getLocations()
    }
    if (actionSources.value.length === 0 || forceFetch) {
      lookupStore.getActionSources()
    }
  })

  return {
    riskSources,
    isoStandards,
    departments,
    locations,
    legalRequirements,
    riskStatuses,
    actionSources,
    actionStatuses
  }
}
