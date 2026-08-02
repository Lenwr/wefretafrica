<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  origin: { type: String, default: 'France' },
  destination: { type: String, default: '' },
  departureAt: { type: [String, Date, Object], default: null },
  estimatedDeliveryAt: { type: [String, Date, Object], default: null },
  status: { type: String, default: 'PENDING' }
})

const DAY = 86_400_000
const now = ref(Date.now())
let timer

const toDate = value => {
  if (!value) return null
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const destinationDays = computed(() => {
  const destination = String(props.destination || '').toLowerCase()
  return destination.includes('bénin') || destination.includes('benin') || destination.includes('cotonou') ? 45 : 30
})
const departureDate = computed(() => toDate(props.departureAt))
const arrivalDate = computed(() => {
  const supplied = toDate(props.estimatedDeliveryAt)
  if (supplied) return supplied
  if (!departureDate.value) return null
  return new Date(departureDate.value.getTime() + destinationDays.value * DAY)
})
const isInTransit = computed(() => ['IN_TRANSIT', 'READY_FOR_PICKUP', 'DELIVERED'].includes(props.status))
const progress = computed(() => {
  if (props.status === 'DELIVERED' || props.status === 'READY_FOR_PICKUP') return 100
  if (!isInTransit.value || !departureDate.value || !arrivalDate.value) return 0
  const duration = Math.max(DAY, arrivalDate.value.getTime() - departureDate.value.getTime())
  return Math.min(100, Math.max(0, ((now.value - departureDate.value.getTime()) / duration) * 100))
})
const roundedProgress = computed(() => Math.round(progress.value))
const daysRemaining = computed(() => {
  if (!arrivalDate.value) return null
  return Math.max(0, Math.ceil((arrivalDate.value.getTime() - now.value) / DAY))
})
const visualStatus = computed(() => {
  if (props.status === 'DELIVERED') return 'Arrivé'
  if (progress.value >= 100) return 'Arrivée estimée atteinte'
  if (isInTransit.value) return 'En mer'
  return 'En attente de départ'
})
const formattedArrival = computed(() => {
  if (!arrivalDate.value) return 'À confirmer'
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(arrivalDate.value)
})
const destinationLabel = computed(() => props.destination || 'Destination')

onMounted(() => {
  timer = window.setInterval(() => { now.value = Date.now() }, 60_000)
})

onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <section class="maritime-card overflow-hidden rounded-3xl border border-white/70 shadow-2xl shadow-blue-950/20">
    <div class="maritime-map relative min-h-[460px] bg-cover bg-center sm:min-h-[570px]" style="background-image: url('/maritime-route-3d.webp')">
      <div class="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-slate-950/25"></div>
      <div class="ocean-light absolute inset-0"></div>

      <div class="relative z-10 flex items-start justify-between gap-2 p-4 sm:p-8">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.2em] text-blue-950/70">Progression estimée</p>
        </div>
        <span class="shrink-0 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-xs font-black uppercase text-blue-700 shadow-lg backdrop-blur sm:px-4 sm:text-sm">
          <span class="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-blue-500" :class="{ 'animate-pulse': isInTransit && progress < 100 }"></span>
          {{ visualStatus }}
        </span>
      </div>

      <div class="absolute inset-x-3 top-24 bottom-40 sm:inset-x-8 sm:top-28 sm:bottom-40">
        <div class="maritime-route" :aria-label="`Trajet maritime parcouru à ${roundedProgress} %`">
          <div class="route-node">
            <div class="route-icon" :class="{ 'route-icon-completed': progress > 0 }">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M4 9h13v11H4zM17 13h6l5 5v2H17zM9 24a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="route-label route-label-start">
              <span class="text-base">🇫🇷</span>
              <span>{{ origin || 'France' }} · Départ</span>
            </div>
          </div>

          <div class="route-connector">
            <div class="route-progress" :style="{ width: `${progress}%` }"></div>
          </div>

          <div class="route-node">
            <div class="route-icon" :class="{ 'route-icon-completed': progress >= 100 }">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 29s9-8 9-17a9 9 0 1 0-18 0c0 9 9 17 9 17Z" fill="none" stroke="currentColor" stroke-width="2.2" />
                <circle cx="16" cy="12" r="3.5" fill="currentColor" />
              </svg>
            </div>
            <div class="route-label route-label-end">
              <span class="text-base">{{ destinationLabel.toLowerCase().includes('bénin') || destinationLabel.toLowerCase().includes('benin') ? '🇧🇯' : '🇹🇬' }}</span>
              <span>{{ destinationLabel }} · Arrivée</span>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-2xl backdrop-blur-xl sm:inset-x-8 sm:bottom-7 sm:rounded-3xl sm:p-6">
        <div class="grid grid-cols-[1fr_auto] items-center gap-3 sm:gap-4">
          <div>
            <div class="flex items-center justify-between gap-3 text-sm font-black text-blue-950">
              <span>Progression {{ roundedProgress }} %</span>
              <span v-if="daysRemaining !== null" class="whitespace-nowrap text-blue-700">{{ daysRemaining }} j restant<span v-if="daysRemaining > 1">s</span></span>
            </div>
            <div class="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 shadow-inner">
              <div class="h-full rounded-full bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-300 transition-all duration-1000" :style="{ width: `${progress}%` }"></div>
            </div>
            <div class="mt-2 flex justify-between text-xs font-bold text-slate-500"><span>0 %</span><span>50 %</span><span>100 %</span></div>
          </div>
          <div class="border-l border-slate-200 pl-3 sm:min-w-56 sm:pl-6">
            <p class="text-xs font-black uppercase text-emerald-700">Arrivée estimée</p>
            <p class="mt-1 text-sm font-black text-emerald-800 sm:text-lg">{{ formattedArrival }}</p>
          </div>
        </div>
        <p class="mt-3 hidden text-[11px] font-semibold text-slate-500 sm:block">
          Position calculée selon les dates de départ et d’arrivée estimée — ce visuel ne représente pas une position GPS réelle.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.maritime-card { background: #dbeafe; }
.maritime-route { position: absolute; inset: 20% 20% auto 9%; display: flex; align-items: center; transform: rotate(6deg); transform-origin: center; filter: drop-shadow(0 3px 5px rgb(2 32 71 / .32)); }
.route-node { position: relative; z-index: 3; flex: 0 0 auto; }
.route-icon { display: grid; width: 40px; height: 40px; place-items: center; border: 3px solid rgb(255 255 255 / .92); border-radius: 999px; background: #082f5b; color: white; transform: rotate(-6deg); box-shadow: 0 0 0 3px rgb(14 165 233 / .2), 0 5px 13px rgb(2 32 71 / .34); transition: background-color .6s ease, box-shadow .6s ease; }
.route-icon svg { width: 21px; height: 21px; }
.route-icon-completed { background: #059669; box-shadow: 0 0 0 3px rgb(16 185 129 / .22), 0 5px 13px rgb(2 32 71 / .34); }
.route-connector { position: relative; z-index: 2; height: 2px; flex: 1 1 auto; background: repeating-linear-gradient(90deg, white 0 8px, transparent 8px 14px); filter: drop-shadow(0 1px 1px rgb(2 32 71 / .65)); }
.route-progress { position: absolute; inset: 0 auto 0 0; overflow: hidden; background: repeating-linear-gradient(90deg, #10b981 0 8px, transparent 8px 14px); transition: width 1.2s ease; filter: drop-shadow(0 0 2px #10b981); }
.route-label { position: absolute; top: calc(100% + 12px); display: flex; align-items: center; gap: 8px; width: max-content; border: 1px solid rgb(255 255 255 / .85); border-radius: 14px; background: rgb(255 255 255 / .9); padding: 9px 12px; color: #082f5b; font-size: 12px; font-weight: 900; transform: rotate(-6deg); box-shadow: 0 8px 24px rgb(2 6 23 / .2); backdrop-filter: blur(12px); }
.route-label-start { left: 0; }
.route-label-end { right: 0; }
.ocean-light { background: linear-gradient(110deg, transparent 25%, rgb(255 255 255 / .13) 46%, transparent 65%); background-size: 220% 100%; animation: ocean-shimmer 9s ease-in-out infinite; mix-blend-mode: screen; }
@keyframes ocean-shimmer { 0%, 100% { background-position: 100% 0; } 50% { background-position: 0 0; } }
@media (prefers-reduced-motion: reduce) { .ocean-light { animation: none; } .route-progress { transition: none; } }
@media (max-width: 640px) {
  .maritime-map { background-size: 100% 100%; }
  .maritime-route { inset: 26% 7% auto 5%; transform: rotate(4deg); }
  .route-icon { width: 32px; height: 32px; border-width: 2px; transform: rotate(-4deg); }
  .route-icon svg { width: 17px; height: 17px; }
  .route-label { top: calc(100% + 8px); max-width: 116px; gap: 5px; padding: 7px 8px; font-size: 10px; transform: rotate(-4deg); white-space: normal; }
}
</style>
