export function useFaqSchema(faq: string[][]) {
  useHead({ script: [{
    key: 'faq-schema', type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(([question, answer]) => ({
        '@type': 'Question', name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer }
      }))
    }).replace(/</g, '\\u003c')
  }] })
}
