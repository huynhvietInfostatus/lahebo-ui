import { RoutePaths } from '@/core/models/app-router.model'
import { RouteNames } from './app-router.model'
import { AppPermission } from './permission.model'
import { RoleEnum } from './role.model'

export interface AppMenuItem {
  label: string
  routeName?: RouteNames | string
  children?: AppMenuItem[]
  isExpanded?: boolean
  path?: string
  permissions?: AppPermission[]
  roles?: RoleEnum[]
  isShow?: boolean
}

export const homeMenu: AppMenuItem[] = [
  { label: 'Dashboard', routeName: RouteNames.DASHBOARD, permissions: [AppPermission.REPORT_VIEW] },
  {
    label: 'Legislation Library',
    routeName: RouteNames.LEGISLATION_LIBRARY,
  },
  { label: 'Risk Register', routeName: RouteNames.RISK_MANAGEMENT },
  { label: 'Action Center', routeName: RouteNames.ACTION_MANAGEMENT, permissions: [AppPermission.ACTION_VIEW] },
  { label: 'Report', routeName: RouteNames.EXPORT_REPORT }
]

export const settingMenu: AppMenuItem[] = [
  {
    label: 'Organisation',
    routeName: RouteNames.ORGANISATION_DETAILS,
    permissions: [AppPermission.ORGANISATION_ADMIN]
  }
]

export const legisMenu: AppMenuItem[] = [
  {
    label: 'Legislation List',
    routeName: RouteNames.LEGISLATION_LIBRARY_HOME,
    path: RoutePaths.LEGISLATION_LIBRARY_HOME
  },
  {
    label: 'Subscribed Items',
    routeName: RouteNames.SUBSCRIBED_ITEMS,
    path: RoutePaths.SUBSCRIBED_ITEMS
  },
  {
    label: 'Legal Register',
    routeName: RouteNames.LEGAL_REGISTER,
    path: RoutePaths.LEGAL_REGISTER
  }
]

export const organisationSettingsMenu: AppMenuItem[] = [
  {
    label: 'Organisation Settings',
    routeName: RouteNames.ORGANISATION_SETTINGS,
    path: RoutePaths.ORGANISATION_SETTINGS,
    children: [
      {
        label: 'Organisation Detail',
        routeName: RouteNames.ORGANISATION_DETAILS,
        path: RoutePaths.ORGANISATION_DETAILS
      },
      {
        label: 'Departments',
        routeName: RouteNames.DEPARTMENTS,
        path: RoutePaths.DEPARTMENTS
      },
      {
        label: 'Locations',
        routeName: RouteNames.LOCATIONS,
        path: RoutePaths.LOCATIONS
      },
      {
        label: 'User Setup',
        routeName: RouteNames.USER_SETUP,
        path: RoutePaths.USER_SETUP
      },
      {
        label: 'Payment Details',
        routeName: RouteNames.PAYMENT_DETAILS,
        path: RoutePaths.PAYMENT_DETAILS
      },
      {
        label: 'Risk Matrix',
        routeName: RouteNames.RISK_MATRIX,
        path: RoutePaths.RISK_MATRIX
      }
    ]
  }
  // {
  //   label: 'Action Centre',
  //   routeName: RouteNames.ORGANISATION_SETTINGS
  // },
  // {
  //   label: 'Risk Management',
  //   routeName: RouteNames.ORGANISATION_SETTINGS
  // },
  // {
  //   label: 'Legislation Library',
  //   routeName: RouteNames.ORGANISATION_SETTINGS
  // }
]
