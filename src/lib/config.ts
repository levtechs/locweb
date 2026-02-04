export const businessConfig = {
  contact: {
    email: "smolsky.lev@gmail.com",
    phone: "",
  },
  pricing: {
    upfront: {
      amount: 45,
      currency: "USD",
      display: true,
    },
    monthly: {
      amount: 5,
      currency: "USD",
      display: true,
    },
  },
  refund: {
    days: 30,
    eligibleAmount: "one-time setup fee",
    nonEligibleAmount: "monthly hosting fee",
  },
  company: {
    name: "LocWeb",
    url: "https://locweb.vercel.app",
  },
}

export function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function getUpfrontPrice(): string {
  if (!businessConfig.pricing.upfront.display) return "Contact Sales"
  return formatPrice(businessConfig.pricing.upfront.amount, businessConfig.pricing.upfront.currency)
}

export function getMonthlyPrice(): string {
  if (!businessConfig.pricing.monthly.display) return "Contact Sales"
  return `${formatPrice(businessConfig.pricing.monthly.amount, businessConfig.pricing.monthly.currency)}/month`
}

export function getFullMonthlyPrice(): string {
  if (!businessConfig.pricing.monthly.display) return "Contact Sales"
  return businessConfig.pricing.monthly.amount === 0
    ? "Free"
    : `${formatPrice(businessConfig.pricing.monthly.amount, businessConfig.pricing.monthly.currency)}/month`
}

export function getContactEmail(): string {
  return businessConfig.contact.email
}

export function getContactPhone(): string {
  return businessConfig.contact.phone
}

export function getCompanyName(): string {
  return businessConfig.company.name
}

export function getRefundDays(): number {
  return businessConfig.refund.days
}

export default businessConfig
