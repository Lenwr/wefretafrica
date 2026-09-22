<script setup lang="ts">
const route = useRoute()

const slug = Array.isArray(route.params.slug)
  ? route.params.slug.join('-')
  : String(route.params.slug || '')

type PageContent = {
  eyebrow: string
  title: string
  intro: string
  image: string
  imageAlt: string
  sections: {
    title: string
    text: string
  }[]
  features: {
    icon: string
    title: string
    text: string
  }[]
  faq: [string, string][]
}

const freightPages: Record<string, PageContent> = {
  'fret-aerien': {
    eyebrow: 'Rapide et suivi',
    title: 'Fret aérien vers l’Afrique de l’Ouest',
    intro:
      'Une solution express au départ de la France pour vos colis légers, vêtements, bijoux et appareils électroniques.',
    image: '/fret-aerien-premium.webp',
    imageAlt: 'Remise d’un colis au terminal de fret aérien',

    sections: [
      {
        title: 'Une expédition simple',
        text:
          'Indiquez la destination, la nature et le poids du colis. Nous confirmons le tarif, réceptionnons ou collectons votre envoi, puis vous tenons informé jusqu’à sa remise.'
      },
      {
        title: 'Achats en ligne',
        text:
          'Vous souhaitez acheter sur une boutique en ligne et expédier vos colis par fret aérien ? Faites livrer vos commandes directement à notre dépôt en France. Adresse de livraison : 15 Rue des écoles, 95500 Le Thillay. Lors de votre commande, renseignez votre nom sous la forme « WefretAfrica_Votre nom ». Nous réceptionnons ensuite vos achats avant de les réexpédier vers votre destination.'
      }
    ],

    features: [
      {
        icon: '01',
        title: 'Départ rapide',
        text:
          'Un mode de transport adapté aux envois urgents et peu volumineux.'
      },
      {
        icon: '02',
        title: 'Tarif au poids',
        text:
          'Une estimation claire selon le poids, la destination et la nature du colis.'
      },
      {
        icon: '03',
        title: 'Suivi humain',
        text:
          'Une équipe disponible pour vous informer à chaque étape.'
      }
    ],

    faq: [
      [
        'Quels colis envoyer par avion ?',
        'Les vêtements, petits équipements, cadeaux et autres marchandises autorisées et peu volumineuses.'
      ],
      [
        'Comment connaître mon tarif ?',
        'Le prix dépend du poids, de la destination et du contenu. Demandez un devis pour obtenir un montant confirmé.'
      ]
    ]
  },

  'fret-maritime': {
    eyebrow: 'Économique et adapté aux volumes',
    title: 'Fret maritime vers l’Afrique de l’Ouest',
    intro:
      'La solution pensée pour les cartons, barriques, effets personnels, meubles et envois volumineux.',
    image: '/fret-maritime-premium.webp',
    imageAlt: 'Famille préparant un envoi maritime',

    sections: [
      {
        title: 'Préparez à votre rythme',
        text:
          'Nous pouvons vous fournir un emballage adapté. Chaque colis doit porter les coordonnées de l’expéditeur, du destinataire et la destination complète.'
      },
      {
        title: 'Collecte sur rendez-vous',
        text:
          'Une fois le colis prêt, planifiez un enlèvement en Île-de-France, à Lille, dans la métropole lilloise ou à Lyon. En dehors de ces zones, nous étudions avec vous la meilleure solution.'
      }
    ],

    features: [
      {
        icon: '01',
        title: 'Grands volumes',
        text:
          'Cartons, barriques, mobilier et effets personnels trouvent leur place.'
      },
      {
        icon: '02',
        title: 'Budget maîtrisé',
        text:
          'Une tarification adaptée au carton ou au volume selon votre besoin.'
      },
      {
        icon: '03',
        title: 'Transport encadré',
        text:
          'Votre expédition est suivie du dépôt jusqu’à la remise locale.'
      }
    ],

    faq: [
      [
        'Quel délai prévoir ?',
        'Le maritime prend plusieurs semaines. Le délai précis dépend du prochain départ et de la destination.'
      ],
      [
        'Où pouvez-vous collecter mon colis ?',
        'Nous collectons sur rendez-vous en Île-de-France, à Lille, dans la métropole lilloise et à Lyon. Indiquez votre ville dans la demande de devis.'
      ],
      [
        'Comment étiqueter mon colis ?',
        'Indiquez clairement les noms et téléphones de l’expéditeur et du destinataire, ainsi que la ville et le pays.'
      ]
    ]
  },

  'envois-colis-paris-lome': {
    eyebrow: 'France → Togo',
    title: 'Envoi de colis de Paris vers Lomé',
    intro:
      'Pour la famille, la maison ou un projet : nous organisons votre envoi depuis Paris et l’Île-de-France jusqu’à Lomé.',
    image: '/lome-premium.webp',
    imageAlt: 'Réception d’un colis à Lomé au Togo',

    sections: [
      {
        title: 'Aérien ou maritime',
        text:
          'Choisissez la rapidité de l’aérien pour un colis léger, ou l’économie du maritime pour des cartons, barriques et effets personnels.'
      },
      {
        title: 'Collecte en Île-de-France',
        text:
          'Nous récupérons votre colis à domicile ou à l’adresse convenue, sur rendez-vous.'
      }
    ],

    features: [
      {
        icon: '01',
        title: 'Contactez-nous',
        text:
          'Décrivez le colis, son poids ou son volume et votre adresse de collecte.'
      },
      {
        icon: '02',
        title: 'Choisissez le transport',
        text:
          'Nous vous aidons à arbitrer entre délai, volume et budget.'
      },
      {
        icon: '03',
        title: 'Suivez le colis',
        text:
          'Vous restez informé jusqu’à la réception à Lomé.'
      }
    ],

    faq: [
      [
        'Proposez-vous l’enlèvement ?',
        'Oui, sur rendez-vous en Île-de-France.'
      ],
      [
        'Puis-je envoyer un achat en ligne ?',
        'Oui, vos commandes peuvent être réceptionnées en France puis réexpédiées vers Lomé.'
      ]
    ]
  },

  'envois-colis-paris-cotonou': {
    eyebrow: 'France → Bénin',
    title: 'Envoi de colis de Paris vers Cotonou',
    intro:
      'Nous accompagnons vos envois de colis, marchandises autorisées et effets personnels depuis la région parisienne vers Cotonou.',
    image: '/cotonou-premium.webp',
    imageAlt: 'Réception d’un colis à Cotonou au Bénin',

    sections: [
      {
        title: 'Deux solutions d’envoi',
        text:
          'L’aérien convient aux petits colis urgents. Le maritime est idéal pour les volumes importants et les envois familiaux.'
      },
      {
        title: 'De porte à destination',
        text:
          'Nous organisons la collecte en Île-de-France et vous accompagnons pendant l’acheminement jusqu’à Cotonou.'
      }
    ],

    features: [
      {
        icon: '01',
        title: 'Devis transparent',
        text:
          'Le tarif est confirmé selon les caractéristiques réelles de votre envoi.'
      },
      {
        icon: '02',
        title: 'Enlèvement planifié',
        text:
          'Choisissez avec notre équipe un créneau de collecte adapté.'
      },
      {
        icon: '03',
        title: 'Relais local',
        text:
          'Un accompagnement jusqu’à la remise de votre colis à Cotonou.'
      }
    ],

    faq: [
      [
        'Comment choisir entre avion et bateau ?',
        'Choisissez l’aérien pour la vitesse et le maritime pour un meilleur coût sur les gros volumes.'
      ],
      [
        'Quels renseignements fournir ?',
        'La destination, le contenu, les dimensions, le poids approximatif et l’adresse de collecte.'
      ]
    ]
  },

  'prix-envoi-colis-france-togo': {
    eyebrow: 'Guide tarifs',
    title: 'Combien coûte un envoi de colis de France vers le Togo ?',
    intro:
      'Le prix dépend du transport choisi, du poids, du volume, du contenu et du lieu d’enlèvement. Voici comment préparer une estimation fiable.',
    image: '/blog-prix-france-togo.webp',
    imageAlt: 'Colis prêts à être expédiés',

    sections: [
      {
        title: 'Les éléments qui font varier le prix',
        text:
          'En aérien, le poids réel et le volume du colis sont déterminants. En maritime, le type d’emballage, le volume et la nature des objets comptent davantage. La collecte hors zone habituelle ou une manutention particulière peuvent aussi modifier le devis.'
      },
      {
        title: 'Obtenir un montant précis',
        text:
          'Préparez la ville de départ, la destination, les dimensions, le poids approximatif et une description fidèle du contenu. Une photo du colis peut aider notre équipe à confirmer la solution et le montant final.'
      }
    ],

    features: [
      {
        icon: '01',
        title: 'Mesurez',
        text: 'Notez la longueur, la largeur et la hauteur du colis.'
      },
      {
        icon: '02',
        title: 'Pesez',
        text:
          'Indiquez le poids réel, même approximatif, avant le contrôle.'
      },
      {
        icon: '03',
        title: 'Comparez',
        text:
          'Demandez une estimation en aérien et en maritime selon votre priorité.'
      }
    ],

    faq: [
      [
        'Le prix affiché par le calculateur est-il définitif ?',
        'Il fournit une estimation. Le montant est confirmé après vérification du colis, de son contenu et de ses dimensions.'
      ],
      [
        'Quel transport coûte le moins cher ?',
        'Pour un gros volume non urgent, le maritime est généralement plus adapté. Pour un petit colis urgent, l’aérien peut être préférable.'
      ]
    ]
  },

  'produits-interdits-colis-afrique': {
    eyebrow: 'Guide réglementation',
    title: 'Quels produits sont interdits dans un colis vers l’Afrique ?',
    intro:
      'Certains objets présentent un risque ou nécessitent une autorisation. Les déclarer avant l’enlèvement évite un refus, un retard ou un blocage.',
    image: '/blog-produits-interdits.webp',
    imageAlt: 'Cartons fragiles préparés pour une expédition',

    sections: [
      {
        title: 'Les produits à ne pas placer sans vérification',
        text:
          'Signalez toujours les liquides inflammables, aérosols, bouteilles de gaz, carburants, armes, munitions, produits chimiques, médicaments, denrées périssables, batteries seules et objets contenant une batterie au lithium. Les règles peuvent différer entre l’aérien, le maritime et le pays de destination.'
      },
      {
        title: 'Le bon réflexe avant de fermer le carton',
        text:
          'Faites une liste précise du contenu, conservez les factures disponibles et envoyez-nous une photo en cas de doute. Ne cachez jamais un produit sensible sous une description générale : notre équipe doit pouvoir vérifier son acceptation avant la collecte.'
      }
    ],

    features: [
      {
        icon: '01',
        title: 'Listez le contenu',
        text: 'Décrivez chaque catégorie d’objet de manière claire.'
      },
      {
        icon: '02',
        title: 'Signalez les batteries',
        text:
          'Précisez l’appareil, le type de batterie et son état.'
      },
      {
        icon: '03',
        title: 'Demandez confirmation',
        text:
          'En cas de doute, contactez l’équipe avant d’emballer.'
      }
    ],

    faq: [
      [
        'Puis-je envoyer un téléphone ou un ordinateur ?',
        'Cela dépend du mode de transport, de la batterie et des conditions du départ. Signalez toujours l’appareil avant l’envoi.'
      ],
      [
        'Puis-je envoyer des médicaments ?',
        'Des restrictions et justificatifs peuvent s’appliquer. Demandez une vérification avant de remettre le colis.'
      ]
    ]
  },

  'delai-livraison-togo-benin': {
    eyebrow: 'Guide délais',
    title: 'Quel délai pour livrer un colis au Togo ou au Bénin ?',
    intro:
      'Le délai dépend surtout du transport choisi et de la date de départ. Il faut distinguer le temps avant expédition du temps d’acheminement.',
    image: '/blog-delais-togo-benin.webp',
    imageAlt: 'Conteneurs transportés par voie maritime',

    sections: [
      {
        title: 'Aérien : privilégier la rapidité',
        text:
          'Le délai indicatif annoncé est de 5 jours après le départ. Le colis doit être déposé 48 heures avant afin de permettre son contrôle, son enregistrement et sa préparation.'
      },
      {
        title: 'Maritime : anticiper le prochain départ',
        text:
          'À compter du départ, prévoyez environ un mois vers le Togo et un mois et demi vers le Bénin. La collecte, la consolidation, les formalités, les conditions portuaires et la disponibilité au retrait peuvent influencer la date finale.'
      }
    ],

    features: [
      {
        icon: '01',
        title: 'Avant le départ',
        text:
          'Préparation, contrôle et regroupement des colis.'
      },
      {
        icon: '02',
        title: 'Acheminement',
        text:
          'Transport aérien ou maritime vers la destination.'
      },
      {
        icon: '03',
        title: 'Réception',
        text:
          'Information du client et organisation de la remise locale.'
      }
    ],

    faq: [
      [
        'Le délai commence-t-il le jour de l’enlèvement ?',
        'Non. Les délais indicatifs d’acheminement commencent au départ effectif, après la phase de préparation.'
      ],
      [
        'Comment savoir quand mon colis est arrivé ?',
        'L’équipe vous informe de l’avancement et vous précise les modalités de retrait ou de remise.'
      ]
    ]
  },

  'calcul-poids-volumetrique': {
    eyebrow: 'Guide calcul',
    title: 'Comment calculer le poids volumétrique d’un colis ?',
    intro:
      'En fret aérien, un colis léger mais encombrant peut occuper beaucoup d’espace. Le poids volumétrique permet de tenir compte de ce volume.',
    image: '/blog-poids-volumetrique.webp',
    imageAlt: 'Préparation et emballage d’un colis',

    sections: [
      {
        title: 'Mesurer correctement le carton',
        text:
          'Mesurez en centimètres la longueur, la largeur et la hauteur aux points les plus larges. Multipliez ensuite ces trois valeurs. Le transporteur applique à ce volume un diviseur défini par ses conditions de transport.'
      },
      {
        title: 'Comparer poids réel et poids volumétrique',
        text:
          'Le calcul sert à comparer la place occupée avec le poids indiqué par la balance. Le poids facturable est confirmé par notre équipe après mesure du colis. Réduire les espaces vides avec un emballage solide et ajusté peut limiter le volume.'
      }
    ],

    features: [
      {
        icon: '01',
        title: 'Longueur',
        text:
          'Mesurez le côté le plus long du colis en centimètres.'
      },
      {
        icon: '02',
        title: 'Largeur et hauteur',
        text:
          'Prenez les dimensions maximales, emballage compris.'
      },
      {
        icon: '03',
        title: 'Vérification',
        text:
          'Utilisez le calculateur puis faites confirmer le résultat.'
      }
    ],

    faq: [
      [
        'Quelle formule utiliser ?',
        'Multipliez longueur × largeur × hauteur, puis appliquez le diviseur indiqué par le transporteur. Notre calculateur vous évite de faire l’opération manuellement.'
      ],
      [
        'Pourquoi mon colis est-il facturé au volume ?',
        'Parce qu’un colis encombrant mobilise de l’espace dans l’avion même s’il est relativement léger.'
      ]
    ]
  }
}

const page = freightPages[slug]

if (!page) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page introuvable'
  })
}

const guideSlugs = new Set([
  'prix-envoi-colis-france-togo',
  'produits-interdits-colis-afrique',
  'delai-livraison-togo-benin',
  'calcul-poids-volumetrique'
])

const isGuide = guideSlugs.has(slug)

useSeoMeta({
  title: `${page.title} | WefretAfrica`,
  description: page.intro,
  ogTitle: page.title,
  ogDescription: page.intro,
  ogType: 'website'
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: `https://www.wefretafrica.com/${slug}`
    }
  ]
})
</script>

<template>
  <main>
    <SiteHeader />

    <!-- HERO -->
    <section class="page-hero">
      <div>
        <p class="eyebrow">
          {{ page.eyebrow }}
        </p>

        <h1>
          {{ page.title }}
        </h1>

        <p>
          {{ page.intro }}
        </p>

        <div class="actions">
          <NuxtLink
            class="btn"
            to="/devis-en-ligne"
          >
            Obtenir un devis
          </NuxtLink>

          <a
            class="btn ghost"
            href="#essentiel"
          >
            {{ isGuide ? 'Voir la réponse rapide' : 'Voir la solution' }}
          </a>
        </div>
      </div>

      <img
        :src="page.image"
        :alt="page.imageAlt"
        fetchpriority="high"
        decoding="async"
      >
    </section>

    <!-- FEATURES -->
    <section
      id="essentiel"
      class="section page-features"
    >
      <div class="heading">
        <div>
          <p class="kicker">
            {{ isGuide ? 'Réponse rapide' : 'Une prise en charge claire' }}
          </p>

          <h2>
            {{ isGuide ? 'L’essentiel en' : 'Votre envoi,' }}
            <em>
              {{ isGuide ? 'quelques secondes' : 'étape par étape' }}
            </em>
          </h2>
        </div>

        <p>
          {{
            isGuide
              ? 'Les informations importantes sont résumées ici. Les explications et cas particuliers se trouvent juste après.'
              : 'De la préparation à la réception, vous savez toujours où en est votre colis.'
          }}
        </p>
      </div>

      <div class="cards">
        <article
          v-for="feature in page.features"
          :key="feature.title"
        >
          <i>{{ feature.icon }}</i>

          <h3>
            {{ feature.title }}
          </h3>

          <p>
            {{ feature.text }}
          </p>
        </article>
      </div>
    </section>

    <!-- INFO FRET AERIEN -->
    <section
      v-if="slug === 'fret-aerien'"
      class="transport-notice"
    >
      <span>48 h</span>

      <div>
        <p class="kicker">
          Avant chaque départ aérien
        </p>

        <h2>
          Déposez votre colis
          <em>48 heures avant</em>
        </h2>

        <p>
          Ce délai nous permet de contrôler, enregistrer et préparer votre
          expédition. Le délai indicatif de livraison aérienne est ensuite
          de 5 jours.
        </p>
      </div>
    </section>

    <!-- INFO FRET MARITIME -->
    <section
      v-if="slug === 'fret-maritime'"
      class="transport-notice sea-notice"
    >
      <span>10 €</span>

      <div>
        <p class="kicker">
          Carton et collecte
        </p>

        <h2>
          Nous vous aidons à
          <em>préparer le colis</em>
        </h2>

        <p>
          Le carton vide coûte 10 €. La collecte est proposée sur rendez-vous
          en Île-de-France, à Lille, dans la métropole lilloise et à Lyon.
          Contactez-nous pour confirmer les modalités de livraison du carton
          dans votre ville.
        </p>
      </div>
    </section>

    <!-- LOME -->
    <section
      v-if="slug === 'envois-colis-paris-lome'"
      class="transport-notice"
    >
      <span>1 mois</span>

      <div>
        <p class="kicker">
          Délai maritime indicatif
        </p>

        <h2>
          Votre envoi vers
          <em>le Togo</em>
        </h2>

        <p>
          Prévoyez environ un mois d’acheminement maritime à compter du
          départ. En aérien, le délai indicatif est de 5 jours.
        </p>
      </div>
    </section>

    <section
      v-if="slug === 'envois-colis-paris-lome'"
      class="pickup-location"
    >
      <div class="pickup-pin">
        ⌖
      </div>

      <div>
        <p class="kicker">
          Retrait du fret maritime à Lomé
        </p>

        <h2>
          Récupérez votre colis maritime dans
          <em>notre dépôt</em>
        </h2>

        <p>
          Pour les envois par bateau uniquement, les colis sont à récupérer
          dans notre dépôt situé vers
          <strong>Adéwui, à côté du bar 3/4</strong>.
          Notre équipe vous informe dès que votre colis est disponible au
          retrait.
        </p>

        <NuxtLink
          class="text-link"
          to="/devis-en-ligne?destination=Togo&transport=Maritime"
        >
          Organiser mon envoi maritime vers Lomé →
        </NuxtLink>
      </div>
    </section>

    <!-- COTONOU -->
    <section
      v-if="slug === 'envois-colis-paris-cotonou'"
      class="transport-notice"
    >
      <span>1,5 mois</span>

      <div>
        <p class="kicker">
          Délai maritime indicatif
        </p>

        <h2>
          Votre envoi vers
          <em>le Bénin</em>
        </h2>

        <p>
          Prévoyez environ un mois et demi d’acheminement maritime à compter
          du départ. En aérien, le délai indicatif est de 5 jours.
        </p>
      </div>
    </section>

    <DepartureSchedule
      v-if="slug === 'fret-maritime'"
    />

    <!-- CONTENU PRINCIPAL -->
    <section class="content-split">
      <img
        :src="page.image"
        :alt="page.imageAlt"
        loading="lazy"
        decoding="async"
      >

      <div>
        <p class="kicker">
          La solution WefretAfrica
        </p>

        <article
          v-for="section in page.sections"
          :key="section.title"
        >
          <h2>
            {{ section.title }}
          </h2>

          <!-- ACHATS EN LIGNE : AFFICHAGE SPECIAL -->
          <!-- ACHATS EN LIGNE : AFFICHAGE SPECIAL -->
<template
  v-if="
    slug === 'fret-aerien' &&
    section.title === 'Achats en ligne'
  "
>
  <p>
    Vous souhaitez acheter sur une boutique en ligne et expédier
    vos colis par fret aérien ? Faites livrer vos commandes
    directement à notre dépôt en France.
  </p>

  <!-- ADRESSE -->
  <div
    style="
      margin-top: 20px;
      padding: 20px;
      border: 1px solid #fed7aa;
      border-radius: 16px;
      background: #fff7ed;
    "
  >
    <p
      style="
        margin: 0 0 10px 0;
        font-size: 17px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: #b45309;
      "
    >
      Adresse de livraison
    </p>

    <p
      style="
        margin: 0;
        font-size: 21px;
        line-height: 1.5;
        font-weight: 800;
        color: #111827;
      "
    >
      <strong>15 Rue des écoles</strong><br>
      <strong>95500 Le Thillay</strong>
    </p>
  </div>

  <!-- NOM OBLIGATOIRE -->
  <div
    style="
      margin-top: 14px;
      padding: 20px;
      border: 1px solid #bae6fd;
      border-radius: 16px;
      background: #f0f9ff;
    "
  >
    <p
      style="
        margin: 0 0 10px 0;
        font-size: 17px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: #0369a1;
      "
    >
      Important — Nom à renseigner
    </p>

    <p style="margin: 0;">
      Lors de votre commande, indiquez impérativement votre nom
      sous la forme :
    </p>

    <p
      style="
        display: inline-block;
        margin: 12px 0 0 0;
        padding: 10px 16px;
        border-radius: 8px;
        background: #0f172a;
        color: #ffffff;
        font-size: 21px;
        line-height: 1.3;
        font-weight: 800;
      "
    >
      <strong>WefretAfrica_Votre nom</strong>
    </p>
  </div>

  <p style="margin-top: 16px;">
    Nous réceptionnons ensuite vos achats avant de les réexpédier
    vers votre destination.
  </p>
</template>

          <!-- AUTRES SECTIONS -->
          <p v-else>
            {{ section.text }}
          </p>
        </article>

        <NuxtLink
          class="text-link"
          to="/devis-en-ligne"
        >
          Parler de mon envoi →
        </NuxtLink>
      </div>
    </section>

    <!-- FAQ -->
    <section
      v-if="page.faq.length"
      class="section faq page-faq"
    >
      <div>
        <p class="kicker">
          Questions fréquentes
        </p>

        <h2>
          Avant de
          <em>vous lancer</em>
        </h2>
      </div>

      <div>
        <details
          v-for="(item, index) in page.faq"
          :key="item[0]"
          :open="index === 0"
        >
          <summary>
            {{ item[0] }}
            <span>+</span>
          </summary>

          <p>
            {{ item[1] }}
          </p>
        </details>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <h2>
        Prêt à organiser votre
        <em>prochain envoi ?</em>
      </h2>

      <NuxtLink
        class="btn white"
        to="/devis-en-ligne"
      >
        Demander mon devis →
      </NuxtLink>
    </section>

    <!-- FOOTER -->
    <footer>
      <div class="brand">
        <img
          src="/logo.png"
          alt=""
        >

        <b>
          WeFret<span>Africa</span>
        </b>
      </div>

      <p>
        Votre partenaire pour l’envoi de colis entre la France et l’Afrique
        de l’Ouest.
      </p>

      <div class="footer-links">
        <NuxtLink to="/fret-aerien">
          Fret aérien
        </NuxtLink>

        <NuxtLink to="/fret-maritime">
          Fret maritime
        </NuxtLink>

        <NuxtLink to="/blog">
          Blog
        </NuxtLink>
      </div>

      <small>
        © 2026 WefretAfrica. Tous droits réservés.
      </small>
    </footer>
  </main>
</template>