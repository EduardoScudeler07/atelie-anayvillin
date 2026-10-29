type ProductContact = {
  name: string
  collection: string
  slug: string
}

export function createProductWhatsAppLink(
  product: ProductContact,
): string | null {
  const phone = (
    import.meta.env.VITE_WHATSAPP_NUMBER ?? ''
  ).trim()

  if (!/^[1-9]\d{7,14}$/.test(phone)) {
    return null
  }

  const productUrl = new URL(
    `/produto/${encodeURIComponent(product.slug)}`,
    window.location.origin,
  )

  const message = [
    `Olá! Gostei do ${product.name}, da coleção ${product.collection}, e gostaria de saber mais sobre a encomenda.`,
    '',
    `Link da peça: ${productUrl.href}`,
  ].join('\n')

  const whatsappUrl = new URL(`https://wa.me/${phone}`)
  whatsappUrl.searchParams.set('text', message)

  return whatsappUrl.href
}