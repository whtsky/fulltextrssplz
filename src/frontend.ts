import { sign } from './sign'

const urlInput = document.getElementById('url') as HTMLInputElement
const formatInput = document.getElementById('format') as HTMLSelectElement
const keyInput = document.getElementById('key') as HTMLInputElement
const urlOutput = document.getElementById('output') as HTMLAnchorElement

urlInput.addEventListener('input', () => updateUrl())
formatInput.addEventListener('change', () => updateUrl())
keyInput.addEventListener('input', () => updateUrl())

function updateUrl() {
  const url = urlInput.value
  const key = keyInput.value
  let targetUrl = `${location.origin}/feed?url=${url}&format=${formatInput.value}`
  if (key) {
    targetUrl += `&sign=${sign(url, key)}`
  }
  urlOutput.innerText = targetUrl
  urlOutput.href = targetUrl
}
