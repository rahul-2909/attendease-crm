export const todayISO = () => new Date().toISOString().slice(0, 10)

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

export const formatDateShort = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatRange = (from, to) => {
  if (!from && !to) return 'All time'
  if (from && !to) return `From ${formatDateShort(from)}`
  if (!from && to) return `Until ${formatDateShort(to)}`
  return `${formatDateShort(from)} – ${formatDateShort(to)}`
}

export const emptyToNull = (value) => (value === '' ? null : value)

export const buildPayload = (values) => {
  const payload = { ...values }
  Object.keys(payload).forEach((key) => {
    if (payload[key] === '' || payload[key] === undefined) delete payload[key]
  })
  return payload
}
