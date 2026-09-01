import type { Dictionary } from "@/i18n/fr";

export const en: Dictionary = {
  meta: {
    title: "RideGlow — Addressable RGB LED kit for motorcycles",
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
      warranty: { label: "Warranty", value: "2 years, parts and labour" },
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
  footer: {
    rights: "All rights reserved",
    legalNotice: "Legal notice",
    terms: "Terms of sale",
    privacy: "Privacy",
    contact: "Contact",
    disclaimer: "Additional lighting intended for track, show and stationary use.",
  },
};
