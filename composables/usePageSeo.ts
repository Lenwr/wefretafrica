export function usePageSeo(title: string, description: string, image = '/hero-premium.webp') {
  const route = useRoute()
  const imageUrl = `https://www.wefretafrica.com${image}`
  useSeoMeta({
    title, description,
    ogTitle: title, ogDescription: description,
    ogImage: imageUrl, ogImageAlt: title,
    ogUrl: () => `https://www.wefretafrica.com${route.path}`,
    ogType: 'website', ogLocale: 'fr_FR', ogSiteName: 'WefretAfrica',
    twitterCard: 'summary_large_image', twitterTitle: title,
    twitterDescription: description, twitterImage: imageUrl, twitterImageAlt: title
  })
}
