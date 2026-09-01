import type { Dictionary } from "@/i18n/fr";

export const en: Dictionary = {
  meta: {
    title: "RideGlow: addressable RGB LED kit for motorcycles",
    description:
      "Addressable RGB LED kit for motorcycles. Every LED is driven on its own: reactive to sound, speed and lean angle. Fitted in one evening, no drilling.",
    ogAlt: "A motorcycle lit by addressable LED strips in a dark showroom",
  },
  nav: {
    modes: "Modes",
    kit: "The kit",
    specs: "Spec sheet",
    configure: "Configure",
    skipToContent: "Skip to content",
  },
  hero: {
    eyebrow: "Addressable RGB LED kit",
    title: "The light follows your riding",
    lede: "Every LED is driven on its own. The controller reads sound, speed and lean angle, then writes the light along your bike in real time.",
    hint: "Switch modes. This is the real render, not a video.",
    cta: "Configure my kit",
    ctaSecondary: "See what's in the box",
    loading: "Powering up the showroom",
    fallback:
      "The 3D showroom needs WebGL. Turn on hardware acceleration or use another browser to see it live.",
  },
  modes: {
    title: "Five programs",
    lede: "All of them run on the controller. None needs your phone once you've picked one.",
    gpsBadge: "Signature",
    micPrompt: "Drive it with my microphone",
    micActive: "Microphone live",
    micDenied: "Microphone declined. The showroom keeps running on a demo track.",
    micHint: "Put music on: the showroom reads your microphone live.",
    colorLabel: "Base color",
    items: {
      sound: {
        name: "Sound",
        blurb:
          "The onboard microphone splits the spectrum. Bass starts at the tank, treble runs to the seat.",
      },
      ride: {
        name: "Riding",
        blurb:
          "GPS and inertial unit. Light streams with speed and opens up on the inside of the corner.",
      },
      spectrum: {
        name: "Spectrum",
        blurb: "A gradient sweeping the whole bike. The one people watch while it's parked.",
      },
      breathe: {
        name: "Breathe",
        blurb: "A slow swell in your color. Understated, for riding through town.",
      },
      solid: {
        name: "Solid",
        blurb: "One fixed color, 16 million shades. The mode you forget is on.",
      },
    },
  },
  showroom: {
    viewLabel: "Camera angle",
    views: {
      threeQuarter: "Three-quarter",
      profile: "Side",
      front: "Front",
      rear: "Rear",
    },
    autoRotate: "Auto-rotate",
    drag: "Drag to walk around the bike",
  },
  build: {
    title: "Your build",
    leds: "addressable LEDs",
    length: "of strip",
    runs: "runs to fit",
    ignoresColor: "This mode writes its own colors. The base shade drives Solid and Breathe.",
  },
  bikes: {
    title: "Your bike",
    lede: "Pick the closest geometry. It sets the strip lengths we ship.",
    items: {
      roadster: { name: "Roadster", blurb: "Bare frame, exposed tank, clear swingarm." },
      sport: { name: "Sport", blurb: "Full fairing, controller hidden under the tail unit." },
      trail: {
        name: "Adventure",
        blurb: "High ground clearance, long fork, fork strips included.",
      },
      custom: { name: "Custom", blurb: "Long frame rails, wide rear fender." },
    },
    stripRuns: {
      underTank: "Under the tank",
      underFairing: "Under the fairing",
      swingarm: "Swingarm",
      fork: "Fork",
      tail: "Tail unit",
      frameRail: "Frame rail",
      rearFender: "Rear fender",
    },
    ledCount: "addressable LEDs",
  },
  kits: {
    title: "Your kit",
    lede: "Same controller, same app. The difference is strip count and the inertial module.",
    recommended: "Most chosen",
    select: "Choose",
    selected: "Selected",
    strips: "strips",
    items: {
      core: { name: "Core", blurb: "The essentials: sound, spectrum, app." },
      signature: { name: "Signature", blurb: "Adds GPS, lean angle and built-in indicators." },
    },
    features: {
      app: "iOS and Android app",
      sound: "Sound mode via onboard microphone",
      spectrum: "Spectrum and breathe programs",
      ip67: "IP67 strips and controller",
      gps: "10 Hz GPS module",
      lean: "6-axis inertial unit",
      indicators: "Indicators built into the strips",
    },
    addonsTitle: "Add-ons",
    addons: {
      remote: { name: "Bar-mounted remote", blurb: "Switch modes without letting go of the grip." },
      extension: { name: "1 m extension", blurb: "60 more LEDs, put them where you want." },
      harness: {
        name: "Direct battery harness",
        blurb: "Terminals, 5 A fuse and loom, ready to wire.",
      },
    },
  },
  review: {
    title: "Summary",
    lede: "Payment happens on Stripe. You enter your address there.",
    bike: "Bike",
    kit: "Kit",
    addons: "Add-ons",
    noAddons: "None",
    subtotal: "Subtotal",
    shipping: "Shipping",
    freeShipping: "Free",
    total: "Total",
    pay: "Pay",
    paying: "Opening checkout",
    error: "Checkout could not open. Try again in a moment.",
    reassurance: {
      returns: "30 days to change your mind, return shipping covered",
      warranty: "2-year warranty",
      shipping: "Ships within 48 h from France",
      secure: "Payment handled by Stripe",
    },
  },
  funnel: {
    step: "Step",
    of: "of",
    next: "Continue",
    back: "Back",
    editBike: "Change bike",
    editKit: "Change kit",
  },
  spec: {
    title: "In the box",
    lede: "Nothing to solder, nothing to drill. One screwdriver and one evening.",
    rows: {
      density: { label: "Density", value: "60 LEDs per meter, WS2812B-2020" },
      power: { label: "Power", value: "12 V, 2.4 A maximum" },
      sealing: { label: "Sealing", value: "IP67, strips and controller" },
      controller: { label: "Controller", value: "62 x 38 x 14 mm, aluminum" },
      link: { label: "Link", value: "Bluetooth LE 5.3, 30 m range" },
      app: { label: "App", value: "iOS 16 and later, Android 10 and later" },
      mounting: { label: "Mounting", value: "3M VHB adhesive, ties included" },
      warranty: { label: "Warranty", value: "2 years, parts and labor" },
    },
  },
  install: {
    title: "Fitting it",
    lede: "Three steps, in this order.",
    steps: {
      stick: {
        name: "Stick the strips",
        body: "Degrease with an alcohol wipe, dry-fit the run, then press each strip for thirty seconds.",
      },
      wire: {
        name: "Wire the controller",
        body: "Two leads onto the battery with the fused harness supplied. The controller tucks under the seat.",
      },
      pair: {
        name: "Pair your phone",
        body: "The app finds the controller on its own. Pick a mode and it stays in memory.",
      },
    },
  },
  faq: {
    title: "The real questions",
    items: {
      legal: {
        q: "Is it road legal?",
        a: "No. In most European countries additional colored lighting is banned in traffic. The kit is sold for track, show and stationary use. Turn on road mode and the controller cuts everything as soon as GPS speed passes 20 km/h.",
      },
      weather: {
        q: "Does it survive rain and pressure washing?",
        a: "Strips and controller are IP67. Tested with a pressure washer at thirty centimeters and fifty bar.",
      },
      battery: {
        q: "Will it flatten my battery?",
        a: "2.4 A maximum, and the controller sleeps sixty seconds after the engine stops. It cuts out below 12.2 V.",
      },
      fit: {
        q: "What if it doesn't fit my bike?",
        a: "Thirty days to send the kit back, return shipping on us, refunded within five days.",
      },
    },
  },
  cta: {
    title: "Pick your geometry, we handle the lengths",
    body: "Two minutes to configure. Shipped within 48 hours.",
    button: "Configure my kit",
  },
  success: {
    title: "Order confirmed",
    body: "A receipt is on its way by email. You'll get the tracking number as soon as the parcel leaves the workshop, within 48 hours.",
    orderRef: "Reference",
    back: "Back to the showroom",
  },
  canceled: {
    title: "Checkout interrupted",
    body: "Nothing was charged and your configuration is still here.",
    resume: "Resume my configuration",
  },
  legal: {
    updated: "Last updated",
    gap: "to be completed",
    identity: "Publisher identity",
    host: "Host",
    processorTable: "Processors",
    fields: {
      legalName: "Legal name",
      legalForm: "Legal form",
      capital: "Share capital",
      address: "Registered office",
      registry: "Trade register",
      siret: "SIRET",
      vat: "VAT number",
      publisher: "Publication director",
      phone: "Phone",
      email: "Email",
      mediator: "Consumer mediator",
      mediatorUrl: "Mediator website",
      role: "Role",
      company: "Company",
      country: "Country",
    },
    processors: {
      stripe: "Payment and settlement",
      vercel: "Site hosting",
      neon: "Order database",
      resend: "Shipping email",
    },
    notice: {
      title: "Legal notice",
      intro:
        "Information required by the French act of 21 June 2004 on confidence in the digital economy.",
      publisher: {
        title: "Publisher",
        body: [
          "RideGlow is published by the company identified below, which is responsible for the site and sells the products shown on it.",
        ],
      },
      hosting: {
        title: "Hosting",
        body: [
          "The site is hosted by the provider identified below. Orders are recorded in a Postgres database run by Neon, and payments are handled by Stripe.",
        ],
      },
      ip: {
        title: "Intellectual property",
        body: [
          "The copy, the visual identity, the imagery, the three-dimensional models and the code of this site are protected. Reproducing or reusing any of it, in whole or in part, without prior written consent is prohibited.",
          "No motorcycle manufacturer names are used on the site: kits are sold by frame geometry, not by branded model.",
        ],
      },
      liability: {
        title: "Liability",
        body: [
          "The three-dimensional renders in the showroom illustrate where the strips sit on a representative geometry. They are not a reproduction of your own motorcycle, and the lengths shipped are the ones stated on the product page.",
          "Colored auxiliary lighting is prohibited in traffic in most European countries. The kit is sold for track, show and stationary use. Checking the rules that apply where you ride is your responsibility.",
        ],
      },
      data: {
        title: "Personal data",
        body: ["How order data is processed is set out in the privacy policy."],
      },
    },
    terms: {
      title: "Terms of sale",
      intro:
        "These terms apply to every order placed on the site. Placing an order means accepting the version published on the day of that order.",
      scope: {
        title: "1. Scope",
        body: [
          "These terms govern the distance selling of RideGlow lighting kits and their accessories to consumers resident in one of the delivery countries listed in section 5.",
          "They apply to the exclusion of any other terms, and supersede any earlier version.",
        ],
      },
      products: {
        title: "2. Products",
        body: [
          "The essential characteristics of each kit, the strip lengths and the number of addressable LEDs are stated on the product page and repeated in the summary shown before payment.",
          "Kits are sold by motorcycle frame family. Stated compatibility covers that geometry, not a named manufacturer model.",
        ],
      },
      order: {
        title: "3. Placing an order",
        body: [
          "An order takes three steps: choose the bike and the kit, review the summary, pay. You can go back and change your configuration at any point until payment is confirmed.",
          "The sale is concluded once payment is confirmed. A summary email is then sent to the address given at payment.",
        ],
      },
      price: {
        title: "4. Prices and payment",
        body: [
          "Prices are shown in euros, all taxes included. Shipping is shown before payment and is free above the order value stated in the summary.",
          "Payment is handled by Stripe. RideGlow never sees or stores your card number: it is entered on a page hosted by Stripe, with strong customer authentication whenever your bank requires it.",
          "Products remain the property of RideGlow until the price has been paid in full.",
        ],
      },
      delivery: {
        title: "5. Delivery",
        body: [
          "Orders ship within 48 working hours. Estimated delivery is 2 to 5 working days after dispatch, depending on the destination.",
          "The tracking number is emailed when the parcel leaves. Risk of loss or damage passes to you when you take physical possession of the parcel.",
          "We deliver to the following countries:",
        ],
      },
      withdrawal: {
        title: "6. Withdrawal and returns",
        body: [
          "You have fourteen days from delivery to withdraw from the sale without giving a reason, under article L221-18 of the French consumer code.",
          "RideGlow extends that period to thirty days and covers return shipping. The kit must come back complete and in resalable condition; a strip that has been cut or permanently bonded cannot be taken back.",
          "Refunds are issued within five days of the return arriving, to the payment method used for the order.",
          "To withdraw, email the contact address with your order reference.",
        ],
      },
      warranty: {
        title: "7. Legal guarantees",
        body: [
          "Every product carries the legal guarantee of conformity (articles L217-3 and following of the French consumer code) and the guarantee against hidden defects (articles 1641 and following of the French civil code). These apply regardless of any commercial warranty.",
          "Under the guarantee of conformity you have two years from delivery, you may choose between repair and replacement, and you do not have to prove the defect during the twenty-four months following delivery.",
          "To make a claim, email the contact address with your order reference and a description of the fault.",
        ],
      },
      compliance: {
        title: "8. Use and compliance",
        body: [
          "The kit is decorative auxiliary lighting sold for track, show and stationary use. Non-approved colored lighting is prohibited in traffic in most European countries.",
          "Fitting is your responsibility and may affect your vehicle's compliance as well as your insurer's position. Check the rules and your policy before any use on public roads.",
        ],
      },
      disputes: {
        title: "9. Complaints and mediation",
        body: [
          "Send any complaint to the contact address. If our answer does not satisfy you, you may refer the matter free of charge to a consumer mediator, under article L612-1 of the French consumer code.",
        ],
      },
      law: {
        title: "10. Governing law",
        body: [
          "These terms are governed by French law. As a consumer you keep the benefit of the mandatory provisions of the law of the country where you live.",
        ],
      },
    },
    privacy: {
      title: "Privacy policy",
      intro:
        "What we collect when you order, why, for how long, and how to take back control of it.",
      controller: {
        title: "Controller",
        body: [
          "The controller is the company that publishes the site, identified in the legal notice. Any request about your data goes to the contact address by email.",
        ],
      },
      collected: {
        title: "What we collect",
        body: [
          "An order produces: your email address, your name and delivery address, your phone number, the amount paid and the configuration you chose (bike, kit, add-ons).",
          "You enter those details on the Stripe payment page, and they are then passed to the site so the parcel can be packed. We never receive your card number.",
          "Browsing the showroom and the configurator creates no account and is not measured by any analytics tool.",
        ],
      },
      purposes: {
        title: "Purposes and legal bases",
        body: [
          "Performance of the contract: process the order, ship the parcel, send tracking, handle returns and guarantees.",
          "Legal obligation: keep accounting records and invoices.",
          "Legitimate interest: secure the payment and prevent fraud, which Stripe carries out.",
        ],
      },
      recipients: {
        title: "Recipients",
        body: [
          "Your data is neither sold nor rented. It is available to the people who pack orders and to the following providers, who act on instruction:",
        ],
        transfers:
          "Transfers to the United States rely on the European Commission's standard contractual clauses. The carrier also receives what it needs to deliver the parcel.",
      },
      retention: {
        title: "Retention",
        body: [
          "Order and invoicing data is kept for ten years, to meet accounting obligations.",
          "Delivery contact details are kept for three years after your last order, then deleted.",
          "The configuration you are working on stays in your browser's session storage and disappears when the tab closes.",
        ],
      },
      cookies: {
        title: "Cookies and local storage",
        body: [
          "The site uses no advertising cookie and no analytics tool, so it shows no consent banner.",
          "A NEXT_LOCALE cookie remembers your language for a year. A session cookie is set only when signing in to the back office. Your kit configuration lives in session storage, in the browser, for the life of the tab.",
        ],
      },
      rights: {
        title: "Your rights",
        body: [
          "You have the right to access, rectify, erase, restrict, object and port your data, as well as the right to leave instructions on what happens to it after your death.",
          "To exercise those rights, email the contact address. We answer within one month.",
          "If our answer does not satisfy you, you can refer the matter to the CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France, or file a complaint at cnil.fr.",
        ],
      },
    },
  },
  footer: {
    rights: "All rights reserved",
    legalNotice: "Legal notice",
    terms: "Terms of sale",
    privacy: "Privacy",
    contact: "Contact",
    disclaimer: "Additional lighting intended for track, show and stationary use.",
  },
};
