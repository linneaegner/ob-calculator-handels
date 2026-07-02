/** Remove site chrome and short-lived banners before hashing. */
export function stripEphemeralContent(text: string): string {
  return text
    .replace(/Vissa problem med BankID[\s\S]*?annars\./gi, " ")
    .replace(/Gå direkt till huvudinnehåll/gi, " ")
    .replace(/Gå direkt till sök/gi, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_|`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Strip HTML to comparable plain text for change detection. */
export function normalizePageContent(html: string): string {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()

  return stripEphemeralContent(text)
}

export function normalizeAgreementText(text: string): string {
  return stripEphemeralContent(text)
}
