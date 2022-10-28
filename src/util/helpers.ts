import axios from 'axios'

export const api = async ({ method, endpoint, query, contentType, data }: { method?: string; endpoint: string; query?: { [k: string]: number | string | boolean | null | undefined; }; contentType?: string; data?: any; }) => {
  const { data: result } = await axios.request({
    method,
    headers: Object.fromEntries(Object.entries({
      'Authorization': `Bearer ${ import.meta.env.VITE_BX_TOKEN }`,
      'Content-Type': contentType
    }).filter(([ , value ]) => value !== undefined)),
    url: `${ import.meta.env.VITE_BX_PAYMENTS_SERVER }/api/${ endpoint }?${ new URLSearchParams(Object.fromEntries(Object.entries(query ?? {}).filter(([ , value ]) => value !== undefined).map(([ key, value ]) => [ key, String(value) ])) as { [k: string]: string; }).toString() }`,
    data
  });
  return result;
}

export function toDateStr(date: number, onlyDate = false, locale = 'de-DE', isSecods = true) {
  if (onlyDate) {
    return new Date((date * 1000 * Number(isSecods))).toLocaleString(locale, { 'year': 'numeric', 'month': 'numeric', 'day': 'numeric' });
  }
  else {
    return new Date((date * 1000 * Number(isSecods))).toLocaleString(locale, { 'year': 'numeric', 'month': 'numeric', 'day': 'numeric', 'hour': 'numeric', 'minute': 'numeric' });
  }
}
export function toPriceStr(price: number, currency = 'EUR', locale = 'de-DE') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(price);
}