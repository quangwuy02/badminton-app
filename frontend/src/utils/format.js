/**
 * Format a number as Vietnamese currency shorthand
 * e.g. 1500000 => "1.5Mđ", 500000 => "500Kđ"
 */
export function fmtMoney(n) {
  if (n == null || isNaN(n)) return '0đ'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000
    return `${sign}${val % 1 === 0 ? val : val.toFixed(1)}Mđ`
  }
  if (abs >= 1_000) {
    const val = abs / 1_000
    return `${sign}${val % 1 === 0 ? val : val.toFixed(1)}Kđ`
  }
  return `${sign}${abs.toLocaleString('vi-VN')}đ`
}

/**
 * Format a date string to Vietnamese with day of week
 * e.g. "2024-03-15" => "Thứ 6, 15/03/2024"
 */
export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dow = days[date.getDay()]
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${dow}, ${d}/${m}/${y}`
}

/**
 * Get first character of a name, uppercased
 */
export function getInitials(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}
