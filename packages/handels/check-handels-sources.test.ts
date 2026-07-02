import { describe, expect, it } from "vitest"
import { normalizeAgreementText, normalizePageContent, stripEphemeralContent } from "./scripts/handels-source-utils"

describe("normalizePageContent", () => {
  it("strips tags and collapses whitespace", () => {
    const html = `
      <html>
        <head><style>body { color: red; }</style></head>
        <body>
          <script>alert("x")</script>
          <h1>Lön</h1>
          <p>5,75&nbsp;kr/tim</p>
        </body>
      </html>
    `

    expect(normalizePageContent(html)).toBe("Lön 5,75 kr/tim")
  })

  it("removes ephemeral BankID banners", () => {
    const text =
      "Vissa problem med BankID-signering i inträdet. Vi felsöker det för närvarande. Händer det dig, testa en gång till och hör av dig annars. Lön 5,75 kr"
    expect(stripEphemeralContent(text)).toBe("Lön 5,75 kr")
  })
})

describe("normalizeAgreementText", () => {
  it("normalizes markdown-like agreement excerpts", () => {
    expect(normalizeAgreementText("## OB\n\n| 50 % |")).toBe("OB 50 %")
  })
})
