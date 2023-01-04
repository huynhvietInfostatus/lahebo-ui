export function convertToCSV(objArray: any) {
  const array = objArray
  let str = ''

  for (let i = 0; i < array.length; i++) {
    let line = ''
    if (Array.isArray(array[i])) line = array[i].join(',')
    else {
      for (const index in array[i]) {
        if (line != '') line += ','
        line += array[i][index]
          .toString()
          .replace(/(\r\n|\r|\n)/g, ' ')
          .replace(/,/g, '')
      }
    }

    str += line + '\r\n'
  }

  return str
}

export function exportCSVFile(headers: Object, items: any) {
  if (headers) {
    items.unshift(headers)
  }

  // Convert Object to JSON
  const csv = convertToCSV(items)
  const exportedFilenmae = 'Report.csv' || 'export.csv'

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', exportedFilenmae)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
