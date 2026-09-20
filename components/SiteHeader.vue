<script setup lang="ts">
const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <div class="topbar"><span>France → Afrique</span><span class="topbar-contact"><a href="tel:+33676492528">France : 06 76 49 25 28</a><a href="tel:+22892000869">Togo : +228 92 00 08 69</a></span></div>
  <header class="site-header">
    <NuxtLink class="brand" to="/"><img src="/logo.png" alt="Logo WefretAfrica"><b>WeFret<span>Africa</span></b></NuxtLink>
    <button class="menu-toggle" type="button" :aria-expanded="menuOpen" aria-label="Ouvrir le menu" @click="menuOpen = !menuOpen"><span></span><span></span><span></span></button>
    <nav class="site-nav" :class="{ open: menuOpen }">
      <NuxtLink to="/">Accueil</NuxtLink><NuxtLink to="/fret-aerien">Fret aérien</NuxtLink><NuxtLink to="/fret-maritime">Fret maritime</NuxtLink><NuxtLink to="/#infos-pratiques">Tarifs & délais</NuxtLink><NuxtLink to="/#destinations">Destinations</NuxtLink><NuxtLink to="/#agences">Nos agences</NuxtLink><NuxtLink to="/blog">Blog</NuxtLink>
    </nav>
    <NuxtLink class="btn small header-quote" to="/devis-en-ligne">Demander un devis</NuxtLink>
  </header>
</template>
