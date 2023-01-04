export enum RouteNames {
  // Main
  DASHBOARD = 'dashboard',
  SIGN_IN = 'signin',
  SIGN_UP = 'signup',
  FORGOT_PASSWORD = 'forgotPassword',
  RESET_PASSWORD = 'resetPassword',
  NEW_USER_RESET_PASSWORD = 'newUserResetPassword',
  VERIFY_OTP = 'verify',
  MFA_SIGN_IN = 'mfaSignIn',
  MFA_SETUP = 'mfaSetup',

  // Payment
  PRICING_PLAN = 'pricingPlan',
  PAYMENT_SUCCESS = 'paymentSuccess',
  PAYMENT_FAILURE = 'paymentFailure',
  PAYMENT_EXPIRED = 'paymentExpired',

  // org
  ORGANISATION_SETTINGS = 'organisationSettings',
  ORGANISATION_DETAILS = 'organisationDetails',
  USER_PROFILE = 'userProfile',
  RISK_MATRIX = 'riskMatrix',
  EDIT_RISK_MATRIX = 'editRiskMatrix',
  SWOT = 'swot',
  PAYMENT_DETAILS = 'paymentDetails',
  LEGISLATION_LIBRARY = 'legislationLibrary',
  LEGISLATION_LIBRARY_HOME = 'legislationLibraryHome',
  SUBSCRIBED_ITEMS = 'subscribedItems',
  LEGAL_REGISTER = 'legalRegister',

  // main
  ACTION_MANAGEMENT = 'actionManagement',
  RISK_MANAGEMENT = 'riskManagement',
  LOCATIONS = 'locations',
  DEPARTMENTS = 'departments',
  RISK_UPLOADER = 'riskUploader',
  NOTIFICATION = 'notification',
  USER_SETUP = 'userSetup',
  EXPORT_REPORT = 'exportReport',

  // error
  UNAUTHORIZED = 'unAuthorized'
}

export enum RoutePaths {
  // Auth
  SIGN_IN = '/signin',
  SIGN_UP = '/signup',
  FORGOT_PASSWORD = '/forgot-password',
  RESET_PASSWORD = '/reset-password',
  NEW_USER_RESET_PASSWORD = '/new-user-reset-password',
  VERIFY_OTP = '/verify',
  MFA_SIGN_IN = '/mfa-signin',
  MFA_SETUP = '/mfa-setup',

  // Payment
  PAYMENT = '/payment',
  PRICING_PLAN = 'pricing-plans',
  PAYMENT_SUCCESS = 'payment-success',
  PAYMENT_FAILURE = 'payment-failure',
  PAYMENT_EXPIRED = 'payment-expired',

  // org
  ORGANISATION_SETTINGS = '/organisation-settings',
  ORGANISATION_DETAILS = 'details',
  USER_SETUP = 'user-setup',
  RISK_MATRIX = 'risk-matrix',
  EDIT_RISK_MATRIX = 'risk-matrix/edit',
  LOCATIONS = 'locations',
  DEPARTMENTS = 'departments',
  SWOT = '/swot',
  PAYMENT_DETAILS = 'payment-details',
  LEGISLATION_LIBRARY = '/legislation-library',
  LEGISLATION_LIBRARY_HOME = 'home',
  SUBSCRIBED_ITEMS = 'subscribed-items',
  LEGAL_REGISTER = 'legal-register',

  // main
  RISK_MANAGEMENT = '/risks',
  ACTION_MANAGEMENT = '/actions',
  INITIAL = '/',
  DASHBOARD = '/dashboard',
  RISK_UPLOADER = '/risk-uploader',
  EXPORT_REPORT = '/export-report',
  NOTIFICATION = '/notifications',
  USER_PROFILE = '/me',

  // error
  UNAUTHORIZED = '/401'
}
