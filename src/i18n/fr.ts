/**
 * French is the source dictionary: `en.ts` is typed against it, so a missing
 * translation is a build error rather than a blank string in production.
 */
export const fr = {
  meta: {
    title: "RideGlow — Kit LED RGB adressable pour moto",
    description:
      "Kit LED RGB adressable pour moto. Chaque LED se pilote seule : réactive au son, à la vitesse et à l'angle. Pose en une soirée, sans percer.",
    ogAlt: "Une moto éclairée par des bandes LED adressables dans un showroom sombre",
  },
  nav: {
    modes: "Modes",
    kit: "Le kit",
    specs: "Fiche technique",
    configure: "Configurer",
    skipToContent: "Aller au contenu",
  },
  hero: {
    eyebrow: "Kit LED RGB adressable",
    title: "La lumière suit ton pilotage",
    lede: "Chaque LED se pilote seule. Le boîtier lit le son, la vitesse et l'angle, puis écrit la lumière le long de ta moto en temps réel.",
    hint: "Change de mode. C'est le rendu réel, pas une vidéo.",
    cta: "Configurer mon kit",
    ctaSecondary: "Voir ce qu'il y a dans le carton",
    loading: "Allumage du showroom",
    fallback:
      "Le showroom 3D a besoin de WebGL. Active l'accélération matérielle ou passe sur un autre navigateur pour voir le rendu en direct.",
  },
  modes: {
    title: "Cinq programmes",
    lede: "Tous embarqués dans le boîtier. Aucun ne dépend du téléphone une fois choisi.",
    gpsBadge: "Signature",
    micPrompt: "Piloter avec mon micro",
    micActive: "Micro actif",
    micDenied: "Micro refusé. Le showroom continue sur une piste de démonstration.",
    micHint: "Mets de la musique : le showroom lit ton micro en direct.",
    colorLabel: "Couleur de base",
    items: {
      sound: {
        name: "Son",
        blurb:
          "Le micro du boîtier découpe le spectre. Les basses partent du réservoir, les aigus filent vers la selle.",
      },
      ride: {
        name: "Pilotage",
        blurb:
          "GPS et centrale inertielle. La lumière défile avec la vitesse et s'ouvre à l'intérieur du virage.",
      },
      spectrum: {
        name: "Spectre",
        blurb: "Un dégradé qui balaie toute la moto. Celui qu'on regarde à l'arrêt.",
      },
      breathe: {
        name: "Respiration",
        blurb: "Un souffle lent dans ta couleur. Discret, pour rouler en ville.",
      },
      solid: {
        name: "Uni",
        blurb: "Une couleur fixe, 16 millions de teintes. Le mode qu'on oublie d'avoir allumé.",
      },
    },
  },
  bikes: {
    title: "Ta moto",
    lede: "Choisis la géométrie la plus proche. Elle fixe la longueur des bandes livrées.",
    items: {
      roadster: { name: "Roadster", blurb: "Cadre nu, réservoir apparent, bras oscillant dégagé." },
      sport: { name: "Sportive", blurb: "Carénage intégral, boîtier caché sous la coque arrière." },
      trail: {
        name: "Trail",
        blurb: "Grande garde au sol, fourche longue, bandes de fourche incluses.",
      },
      custom: { name: "Custom", blurb: "Longs rails de cadre, garde-boue arrière large." },
    },
    stripRuns: {
      underTank: "Sous le réservoir",
      underFairing: "Sous le carénage",
      swingarm: "Bras oscillant",
      fork: "Fourche",
      tail: "Coque arrière",
      frameRail: "Rail de cadre",
      rearFender: "Garde-boue arrière",
    },
    ledCount: "LED adressables",
  },
  kits: {
    title: "Ton kit",
    lede: "Même boîtier, même application. La différence est le nombre de bandes et le module inertiel.",
    recommended: "Le plus choisi",
    select: "Choisir",
    selected: "Sélectionné",
    strips: "bandes",
    items: {
      core: { name: "Core", blurb: "L'essentiel : son, spectre, application." },
      signature: {
        name: "Signature",
        blurb: "Ajoute le GPS, l'angle et les clignotants intégrés.",
      },
    },
    features: {
      app: "Application iOS et Android",
      sound: "Mode son par micro embarqué",
      spectrum: "Programmes spectre et respiration",
      ip67: "Bandes et boîtier IP67",
      gps: "Module GPS 10 Hz",
      lean: "Centrale inertielle 6 axes",
      indicators: "Clignotants intégrés aux bandes",
    },
    addonsTitle: "Options",
    addons: {
      remote: { name: "Télécommande guidon", blurb: "Changer de mode sans lâcher la poignée." },
      extension: { name: "Extension 1 m", blurb: "60 LED de plus, à répartir où tu veux." },
      harness: {
        name: "Faisceau direct batterie",
        blurb: "Cosses, fusible 5 A et gaine, prêt à brancher.",
      },
    },
  },
  review: {
    title: "Récapitulatif",
    lede: "Le paiement se fait chez Stripe. Tu renseignes ton adresse là-bas.",
    bike: "Moto",
    kit: "Kit",
    addons: "Options",
    noAddons: "Aucune",
    subtotal: "Sous-total",
    shipping: "Livraison",
    freeShipping: "Offerte",
    total: "Total",
    pay: "Payer",
    paying: "Ouverture du paiement",
    error: "Le paiement n'a pas pu s'ouvrir. Réessaie dans un instant.",
    reassurance: {
      returns: "30 jours pour changer d'avis, retour offert",
      warranty: "Garantie 2 ans",
      shipping: "Expédié sous 48 h depuis la France",
      secure: "Paiement traité par Stripe",
    },
  },
  funnel: {
    step: "Étape",
    of: "sur",
    next: "Continuer",
    back: "Retour",
    editBike: "Changer de moto",
    editKit: "Changer de kit",
  },
  spec: {
    title: "Dans le carton",
    lede: "Rien à souder, rien à percer. Un tournevis et une soirée.",
    rows: {
      density: { label: "Densité", value: "60 LED par mètre, WS2812B-2020" },
      power: { label: "Alimentation", value: "12 V, 2,4 A au maximum" },
      sealing: { label: "Étanchéité", value: "IP67, bandes et boîtier" },
      controller: { label: "Boîtier", value: "62 x 38 x 14 mm, aluminium" },
      link: { label: "Liaison", value: "Bluetooth LE 5.3, portée 30 m" },
      app: { label: "Application", value: "iOS 16 et plus, Android 10 et plus" },
      mounting: { label: "Fixation", value: "Adhésif 3M VHB, colliers fournis" },
      warranty: { label: "Garantie", value: "2 ans, pièces et main-d'œuvre" },
    },
  },
  install: {
    title: "La pose",
    lede: "Trois étapes, dans cet ordre.",
    steps: {
      stick: {
        name: "Colle les bandes",
        body: "Dégraisse au chiffon alcoolisé, positionne à blanc, puis presse trente secondes par bande.",
      },
      wire: {
        name: "Branche le boîtier",
        body: "Deux fils sur la batterie avec le faisceau fusible fourni. Le boîtier se glisse sous la selle.",
      },
      pair: {
        name: "Appaire le téléphone",
        body: "L'application trouve le boîtier seule. Tu choisis un mode, il reste en mémoire.",
      },
    },
  },
  faq: {
    title: "Les vraies questions",
    items: {
      legal: {
        q: "C'est autorisé sur route ?",
        a: "Non, dans la plupart des pays européens l'éclairage additionnel coloré est interdit en circulation. Le kit est vendu pour l'usage sur circuit, en exposition et à l'arrêt. Le boîtier coupe tout automatiquement dès que le GPS dépasse 20 km/h si tu actives le mode route.",
      },
      weather: {
        q: "Ça tient à la pluie et au nettoyeur ?",
        a: "Bandes et boîtier sont IP67. Testés au jet haute pression à trente centimètres et à cinquante bars.",
      },
      battery: {
        q: "Ça vide la batterie ?",
        a: "2,4 A au maximum, et le boîtier passe en veille soixante secondes après l'arrêt du moteur. Coupure automatique sous 12,2 V.",
      },
      fit: {
        q: "Et si ça ne va pas sur ma moto ?",
        a: "Trente jours pour renvoyer le kit, port retour à notre charge, remboursement sous cinq jours.",
      },
    },
  },
  cta: {
    title: "Choisis ta géométrie, on s'occupe des longueurs",
    body: "Deux minutes pour configurer. Expédié sous 48 heures.",
    button: "Configurer mon kit",
  },
  success: {
    title: "Commande confirmée",
    body: "Un reçu part par e-mail. Tu recevras le numéro de suivi dès que le colis quitte l'atelier, sous 48 heures.",
    orderRef: "Référence",
    back: "Revenir au showroom",
  },
  canceled: {
    title: "Paiement interrompu",
    body: "Rien n'a été débité et ta configuration est toujours là.",
    resume: "Reprendre ma configuration",
  },
  footer: {
    rights: "Tous droits réservés",
    legalNotice: "Mentions légales",
    terms: "Conditions de vente",
    privacy: "Confidentialité",
    contact: "Contact",
    disclaimer: "Éclairage additionnel destiné à un usage sur circuit, en exposition et à l'arrêt.",
  },
} as const;

/** Literal types out, plain strings in: `en` must have the same shape, not the
 * same words. A missing key is a type error. */
type Translated<T> = { [K in keyof T]: T[K] extends string ? string : Translated<T[K]> };

export type Dictionary = Translated<typeof fr>;
