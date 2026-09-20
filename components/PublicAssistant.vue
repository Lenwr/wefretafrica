<template>
  <details class="quick-help">
    <summary class="quick-help-launcher"><span class="help-icon">?</span><b class="help-label">Besoin d’aide ?</b><span class="close-icon">×</span></summary>
    <section id="wefret-help" class="quick-help-panel" aria-label="Accès rapides WefretAfrica">
      <div class="quick-help-header"><div><strong>Comment pouvons-nous vous aider ?</strong><small>Choisissez une action</small></div></div>
      <nav class="quick-help-links">
        <NuxtLink to="/#calculateur"><span>€</span><div><b>Calculer mon tarif</b><small>Obtenir une estimation immédiate</small></div><i>→</i></NuxtLink>
        <NuxtLink to="/devis-en-ligne"><span>✓</span><div><b>Demander un devis</b><small>Recevoir un prix personnalisé</small></div><i>→</i></NuxtLink>
        <NuxtLink to="/blog"><span>i</span><div><b>Consulter les guides</b><small>Préparer et suivre mon colis</small></div><i>→</i></NuxtLink>
        <a href="tel:+33676492528"><span>☎</span><div><b>Appeler WefretAfrica</b><small>06 76 49 25 28</small></div><i>→</i></a>
      </nav>
      <small class="quick-help-note">Tarifs indicatifs, confirmés après contrôle du colis.</small>
    </section>
  </details>
</template>

<style scoped>
.quick-help{position:fixed;z-index:2147483000;right:22px;bottom:22px;font-family:Arial,sans-serif;pointer-events:none}.quick-help-launcher{display:flex;align-items:center;gap:10px;width:max-content;margin-left:auto;border:0;border-radius:999px;background:#c65f35;color:#fff;padding:13px 18px;box-shadow:0 14px 38px #071a2750;cursor:pointer;pointer-events:auto;list-style:none}.quick-help-launcher::-webkit-details-marker{display:none}.quick-help-launcher::marker{content:''}.quick-help-launcher span{font-size:20px}.quick-help-launcher b{font-size:13px}.close-icon{display:none}.quick-help[open] .help-icon,.quick-help[open] .help-label{display:none}.quick-help[open] .close-icon{display:inline}.quick-help-panel{position:absolute;right:0;bottom:62px;width:min(390px,calc(100vw - 28px));overflow:hidden;border:1px solid #ded7cc;border-radius:20px;background:#fffdf9;box-shadow:0 25px 70px #071a2740;pointer-events:auto}.quick-help-header{display:flex;align-items:center;justify-content:space-between;padding:20px;background:#071a27;color:#fff}.quick-help-header strong,.quick-help-header small{display:block}.quick-help-header small{margin-top:4px;color:#bfcdd4;font-size:11px}.quick-help-links{display:grid;gap:9px;padding:15px}.quick-help-links a{display:grid;grid-template-columns:42px 1fr auto;gap:12px;align-items:center;padding:13px;border:1px solid #e7ded3;border-radius:13px;background:#fff;color:#172833;transition:.2s}.quick-help-links a:hover{border-color:#c65f35;transform:translateX(-2px)}.quick-help-links span{display:grid;place-items:center;width:42px;height:42px;border-radius:11px;background:#f5e6dd;color:#a94c2c;font-weight:900}.quick-help-links b,.quick-help-links small{display:block}.quick-help-links b{font-size:13px}.quick-help-links small{margin-top:4px;color:#6d797f;font-size:10px}.quick-help-links i{color:#c65f35;font-style:normal;font-weight:900}.quick-help-note{display:block;padding:0 18px 16px;text-align:center;color:#7a858a;font-size:9px}@media(max-width:600px){.quick-help{right:12px;bottom:74px}.quick-help-launcher .help-label{display:none}.quick-help-launcher{width:52px;height:52px;justify-content:center;padding:0}.quick-help-panel{position:fixed;right:12px;bottom:138px;left:12px;width:auto}}
</style>
