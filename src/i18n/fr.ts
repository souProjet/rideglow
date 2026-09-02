/**
 * French is the source dictionary: `en.ts` is typed against it, so a missing
 * translation is a build error rather than a blank string in production.
 */
export const fr = {
  meta: {
    title: "RideGlow: kit LED RGB adressable pour moto",
    description:
      "Kit LED RGB adressable pour moto. Chaque LED se pilote seule : réactive au son, à la vitesse et à l'angle. Pose en une soirée, sans percer.",
    ogAlt:
      "Le nom RideGlow sur fond noir, à côté d'un bandeau LED incliné dont chaque LED porte une couleur différente",
    ogHeadline: "Chaque LED se pilote seule.",
    ogSub: "Kit adressable pour moto. Réactif au son, à la vitesse et à l'angle.",
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
    priceFrom: "À partir de",
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
  showroom: {
    viewLabel: "Angle de vue",
    views: {
      threeQuarter: "Trois-quarts",
      profile: "Profil",
      front: "Face",
      rear: "Arrière",
    },
    autoRotate: "Rotation auto",
    drag: "Fais glisser pour tourner autour de la moto",
  },
  build: {
    title: "Ta configuration",
    leds: "LED adressables",
    length: "de bande",
    runs: "brins à poser",
    ignoresColor:
      "Ce mode écrit ses propres couleurs. La teinte de base sert au mode Uni et Respiration.",
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
      belly: "Sous le moteur",
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
    soldOut: "Rupture",
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
    soldOut: "Indisponible pour le moment :",
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
  pricing: {
    eyebrow: "Tarifs",
    title: "Deux kits, un seul boîtier",
    lede: "Le prix complet, avant d'avoir à configurer quoi que ce soit. Même boîtier et même application dans les deux : ce qui change, c'est le nombre de bandes et le module inertiel.",
    vat: "TTC",
    cta: "Configurer ce kit",
    freeShippingFrom: "Livraison offerte dès",
    otherwise: "sinon",
    addonsLead: "Options :",
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
  legal: {
    updated: "Dernière mise à jour",
    gap: "à compléter",
    identity: "Identité de l'éditeur",
    host: "Hébergeur",
    processorTable: "Sous-traitants",
    fields: {
      legalName: "Raison sociale",
      legalForm: "Forme juridique",
      capital: "Capital social",
      address: "Siège social",
      registry: "RCS",
      siret: "SIRET",
      vat: "TVA intracommunautaire",
      publisher: "Directeur de la publication",
      phone: "Téléphone",
      email: "E-mail",
      mediator: "Médiateur de la consommation",
      mediatorUrl: "Site du médiateur",
      role: "Rôle",
      company: "Société",
      country: "Pays",
    },
    processors: {
      stripe: "Paiement et encaissement",
      vercel: "Hébergement du site",
      neon: "Base de données des commandes",
      resend: "E-mail d'expédition",
    },
    notice: {
      title: "Mentions légales",
      intro:
        "Informations exigées par la loi pour la confiance dans l'économie numérique du 21 juin 2004.",
      publisher: {
        title: "Éditeur",
        body: [
          "Le site RideGlow est édité par la société identifiée ci-dessous, qui en assure la publication et la vente des produits présentés.",
        ],
      },
      hosting: {
        title: "Hébergement",
        body: [
          "Le site est hébergé par le prestataire indiqué ci-dessous. Les commandes sont enregistrées dans une base de données Postgres gérée par Neon et les paiements sont traités par Stripe.",
        ],
      },
      ip: {
        title: "Propriété intellectuelle",
        body: [
          "Les textes, la charte graphique, les visuels, les modèles tridimensionnels et le code du site sont protégés. Toute reproduction ou réutilisation, totale ou partielle, sans accord écrit préalable est interdite.",
          "Les noms de constructeurs de motos ne sont pas utilisés sur le site : les kits sont proposés par famille de géométrie, pas par modèle de marque.",
        ],
      },
      liability: {
        title: "Responsabilité",
        body: [
          "Les rendus tridimensionnels du showroom sont des représentations de principe destinées à situer les bandeaux sur une géométrie type. Ils ne constituent pas une reproduction de votre moto et les longueurs livrées sont celles indiquées sur la fiche produit.",
          "L'éclairage additionnel de couleur est interdit en circulation dans la plupart des pays européens. Le kit est vendu pour un usage sur circuit, en exposition et à l'arrêt. Il vous appartient de vérifier la réglementation applicable là où vous roulez.",
        ],
      },
      data: {
        title: "Données personnelles",
        body: [
          "Le traitement des données liées à une commande est décrit dans la politique de confidentialité.",
        ],
      },
    },
    terms: {
      title: "Conditions générales de vente",
      intro:
        "Applicables à toute commande passée sur le site. Le fait de commander vaut acceptation des présentes conditions dans leur version en ligne au jour de la commande.",
      scope: {
        title: "1. Objet et champ d'application",
        body: [
          "Les présentes conditions régissent la vente à distance des kits d'éclairage RideGlow et de leurs accessoires à des acheteurs particuliers résidant dans l'un des pays de livraison listés à l'article 5.",
          "Elles s'appliquent à l'exclusion de toute autre condition, et prévalent sur toute version antérieure.",
        ],
      },
      products: {
        title: "2. Produits",
        body: [
          "Les caractéristiques essentielles de chaque kit, les longueurs de bandeau et le nombre de LED adressables sont indiqués sur la fiche produit et rappelés dans le récapitulatif avant paiement.",
          "Les kits sont proposés par famille de géométrie de moto. La compatibilité annoncée porte sur cette géométrie, pas sur un modèle de constructeur identifié.",
        ],
      },
      order: {
        title: "3. Commande",
        body: [
          "La commande se déroule en trois étapes : choix de la moto et du kit, récapitulatif, paiement. Vous pouvez revenir en arrière et corriger votre configuration jusqu'à la validation du paiement.",
          "La vente est conclue lorsque le paiement est confirmé. Un e-mail récapitulatif est alors envoyé à l'adresse fournie lors du paiement.",
        ],
      },
      price: {
        title: "4. Prix et paiement",
        body: [
          "Les prix sont indiqués en euros toutes taxes comprises. Les frais de livraison sont affichés avant le paiement et offerts au-delà du montant de commande indiqué dans le récapitulatif.",
          "Le paiement est traité par Stripe. Le numéro de carte n'est ni vu ni conservé par RideGlow : il est saisi sur une page hébergée par Stripe, avec authentification forte du porteur lorsque la banque l'exige.",
          "Les produits restent la propriété de RideGlow jusqu'au paiement complet du prix.",
        ],
      },
      delivery: {
        title: "5. Livraison",
        body: [
          "Les commandes sont expédiées sous 48 heures ouvrées. Le délai de livraison estimé est de 2 à 5 jours ouvrés après expédition, selon la destination.",
          "Le numéro de suivi est envoyé par e-mail au départ du colis. Le risque de perte ou de dommage est transféré au moment où vous prenez physiquement possession du colis.",
          "Nous livrons dans les pays suivants :",
        ],
      },
      withdrawal: {
        title: "6. Rétractation et retours",
        body: [
          "Vous disposez de quatorze jours à compter de la réception pour exercer votre droit de rétractation, sans avoir à motiver votre décision, conformément à l'article L221-18 du code de la consommation.",
          "RideGlow porte ce délai à trente jours et prend à sa charge les frais de retour. Le kit doit être renvoyé complet, dans un état permettant sa remise en vente ; un bandeau coupé ou collé de façon définitive n'est plus repris.",
          "Le remboursement intervient sous cinq jours à compter de la réception du retour, par le même moyen de paiement que celui utilisé pour la commande.",
          "Pour exercer ce droit, écrivez à l'adresse de contact en indiquant votre référence de commande.",
        ],
      },
      warranty: {
        title: "7. Garanties légales",
        body: [
          "Tous les produits bénéficient de la garantie légale de conformité (articles L217-3 et suivants du code de la consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du code civil). Ces garanties sont dues indépendamment de toute garantie commerciale.",
          "Au titre de la garantie légale de conformité, vous disposez de deux ans à compter de la délivrance du bien, pouvez choisir entre la réparation et le remplacement, et êtes dispensé de rapporter la preuve du défaut pendant les vingt-quatre mois qui suivent la délivrance.",
          "Une demande au titre de la garantie s'ouvre par un e-mail à l'adresse de contact, avec la référence de commande et une description du défaut.",
        ],
      },
      compliance: {
        title: "8. Usage et conformité",
        body: [
          "Le kit est un éclairage additionnel décoratif vendu pour un usage sur circuit, en exposition et à l'arrêt. L'éclairage de couleur non homologué est interdit en circulation dans la plupart des pays européens.",
          "La pose relève de votre responsabilité et peut affecter la conformité de votre véhicule ainsi que la position de votre assureur. Vérifiez la réglementation et votre contrat d'assurance avant toute utilisation sur la voie publique.",
        ],
      },
      disputes: {
        title: "9. Réclamation et médiation",
        body: [
          "Toute réclamation est à adresser à l'adresse de contact. Si la réponse ne vous satisfait pas, vous pouvez recourir gratuitement à un médiateur de la consommation, conformément à l'article L612-1 du code de la consommation.",
        ],
      },
      law: {
        title: "10. Droit applicable",
        body: [
          "Les présentes conditions sont soumises au droit français. En tant que consommateur, vous conservez le bénéfice des dispositions impératives de la loi du pays où vous résidez.",
        ],
      },
    },
    privacy: {
      title: "Politique de confidentialité",
      intro:
        "Ce que nous collectons quand vous commandez, pourquoi, combien de temps, et comment reprendre la main.",
      controller: {
        title: "Responsable de traitement",
        body: [
          "Le responsable du traitement est la société éditrice du site, identifiée dans les mentions légales. Toute demande relative à vos données se fait par e-mail à l'adresse de contact.",
        ],
      },
      collected: {
        title: "Données collectées",
        body: [
          "Une commande génère : votre adresse e-mail, votre nom et votre adresse de livraison, votre numéro de téléphone, le montant payé et la configuration choisie (moto, kit, options).",
          "Ces informations sont saisies sur la page de paiement Stripe, puis transmises au site pour préparer le colis. Nous ne recevons jamais votre numéro de carte.",
          "La navigation sur le showroom et le configurateur ne crée pas de compte et ne fait l'objet d'aucune mesure d'audience.",
        ],
      },
      purposes: {
        title: "Finalités et bases légales",
        body: [
          "Exécution du contrat : traiter la commande, expédier le colis, envoyer le suivi, gérer les retours et les garanties.",
          "Obligation légale : conserver les pièces comptables et les factures.",
          "Intérêt légitime : sécuriser le paiement et prévenir la fraude, fonction assurée par Stripe.",
        ],
      },
      recipients: {
        title: "Destinataires",
        body: [
          "Vos données ne sont ni vendues ni louées. Elles sont accessibles à l'équipe qui prépare les commandes et aux prestataires suivants, qui agissent sur instruction :",
        ],
        transfers:
          "Les transferts vers les États-Unis sont encadrés par les clauses contractuelles types de la Commission européenne. Le transporteur reçoit en outre les éléments nécessaires à la livraison.",
      },
      retention: {
        title: "Durées de conservation",
        body: [
          "Les données de commande et de facturation sont conservées dix ans, au titre des obligations comptables.",
          "Les coordonnées de livraison sont conservées trois ans après la dernière commande, puis supprimées.",
          "La configuration en cours reste dans le stockage de session de votre navigateur et disparaît à la fermeture de l'onglet.",
        ],
      },
      cookies: {
        title: "Cookies et stockage local",
        body: [
          "Le site n'utilise ni cookie publicitaire ni outil de mesure d'audience, et n'affiche donc pas de bandeau de consentement.",
          "Un cookie NEXT_LOCALE mémorise la langue choisie pendant un an. Un cookie de session est posé uniquement lors d'une connexion au back-office. La configuration du kit est gardée dans le stockage de session, côté navigateur, le temps de l'onglet.",
        ],
      },
      rights: {
        title: "Vos droits",
        body: [
          "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité, ainsi que du droit de définir des directives sur le sort de vos données après votre décès.",
          "Pour les exercer, écrivez à l'adresse de contact. Nous répondons dans un délai d'un mois.",
          "Si la réponse ne vous convient pas, vous pouvez saisir la CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, ou déposer une plainte sur cnil.fr.",
        ],
      },
    },
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
