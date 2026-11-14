/* =========================================================================
   AMIN — SITE DATA
   Bilingual (Bengali default / English) content for the portfolio.
   Everything you'll want to personalize lives in this one file.
   ========================================================================= */

/* ---- Shared contact details (same in every language) ------------------- */
const CONTACT = {
  email: "mr.amin4125@gmail.com",
  phone: "+966567833548",
  phoneDisplay: "+966 56 783 3548",
  whatsapp: "https://wa.me/966567833548",
  image: "assets/images/profile.jpg",
  resume: "assets/amin-resume.pdf"
};

const SOCIAL = [
  { name: "Facebook", url: "https://facebook.com/mr.amin4125", icon: "fab fa-facebook" },
  { name: "Instagram", url: "https://instagram.com/al.amin125", icon: "fab fa-instagram" },
  { name: "Threads", url: "#", icon: "fab fa-threads" },
  { name: "Behance", url: "https://behance.net/mramin125", icon: "fab fa-behance" },
  { name: "WhatsApp", url: CONTACT.whatsapp, icon: "fab fa-whatsapp" }
];

const SITE_DATA = {

  /* =======================================================================
     ENGLISH
     ======================================================================= */
  en: {
    profile: {
      name: "Mr. Amin",
      shortName: "Amin",
      title: "Web Designer & Graphic Designer",
      tagline: "I create Digital Experiences that make Businesses more Engaging, Recognizable, and Memorable to their Audience.",
      location: "Barisal, Dhaka, Bangladesh",
      email: CONTACT.email,
      phone: CONTACT.phoneDisplay,
      whatsapp: CONTACT.whatsapp,
      available: true,
      image: CONTACT.image,
      resume: CONTACT.resume,
      bio: [
        "I'm a designer and front-end builder who spends most of my time in the gap between graphic design and web development — turning brand ideas into interfaces people actually enjoy using.",
        "Over the last few years I've worked with startups, restaurants, and small studios to build sites and identities that feel considered from the first pixel to the last line of CSS. I care about the details most people scroll past: the timing of a transition, the weight of a headline, the way a button responds to a tap.",
        "When I'm not designing, I'm usually reading about type, tinkering with a side project, or rebuilding this very portfolio for the third time this year."
      ]
    },

    stats: [
      { value: 25, suffix: "+", label: "Projects" },
      { value: 3, suffix: "+", label: "Years Experience" },
      { value: 15, suffix: "+", label: "Happy Clients" },
      { value: 100, suffix: "%", label: "Commitment" }
    ],

    skills: [
      {
        category: "Web Design",
        items: [
          { name: "HTML", level: 95 },
          { name: "CSS", level: 95 },
          { name: "JavaScript", level: 80 },
          { name: "Responsive Design", level: 95 },
          { name: "UI / UX", level: 90 }
        ]
      },
      {
        category: "Graphic Design",
        items: [
          { name: "Photoshop", level: 92 },
          { name: "Illustrator", level: 88 },
          { name: "Branding", level: 90 },
          { name: "Logo Design", level: 90 },
          { name: "Social Media Design", level: 85 }
        ]
      },
      {
        category: "Development",
        items: [
          { name: "PHP", level: 75 },
          { name: "MySQL", level: 72 },
          { name: "WordPress", level: 88 }
        ]
      },
      {
        category: "App Development",
        items: [
          { name: "React Native", level: 78 },
          { name: "Flutter", level: 72 },
          { name: "Firebase", level: 80 },
          { name: "API Integration", level: 85 }
        ]
      }
    ],

    services: [
      { icon: "layout", title: "Web Design", desc: "Modern, responsive websites built around your brand and your users." },
      { icon: "cursor", title: "UI / UX Design", desc: "Clean, user-friendly interfaces for web and mobile products." },
      { icon: "palette", title: "Graphic Design", desc: "Professional branding, marketing graphics, and visual identity." },
      { icon: "wordpress", title: "WordPress", desc: "Custom WordPress builds that are fast, editable, and yours to grow." },
      { icon: "code", title: "Web Development", desc: "Functional, well-built web applications from front to back." },
      { icon: "appdev", title: "App Development", desc: "Cross-platform mobile apps, from first wireframe to app-store launch." }
    ],

    projects: [
      { id: "p1", illustration: "ecommerce", title: "Lumen — E-Commerce Website", category: "Websites", tag: "E-Commerce",
        cover: "linear-gradient(135deg, #3a2410 0%, #ff7a1e 100%)",
        description: "A full storefront redesign focused on speeding up checkout and making product discovery feel effortless on mobile.",
        problem: "The client's old store had a 68% mobile cart abandonment rate and a checkout flow that took seven steps to complete.",
        solution: "Rebuilt the store around a three-step checkout, sticky add-to-cart on product pages, and a filter system that updates results instantly without a page reload.",
        features: ["3-step guided checkout", "Instant search & filters", "Wishlist & saved carts", "Mobile-first product gallery"],
        tech: ["Figma", "HTML/CSS", "JavaScript", "WooCommerce"], link: "#" },
      { id: "p2", illustration: "corporate", title: "Northfield — Business Website", category: "Websites", tag: "Corporate",
        cover: "linear-gradient(135deg, #2a1f14 0%, #d1791f 100%)",
        description: "A calm, credibility-first site for a consulting firm that needed to look established without feeling stiff.",
        problem: "The firm's site read like a brochure from 2012 and gave prospective clients no reason to reach out.",
        solution: "Restructured the content around outcomes, added a case-study format for their work, and simplified the contact path to a single clear form.",
        features: ["Case study templates", "Team directory", "Resource library", "Lead-capture forms"],
        tech: ["Figma", "HTML/CSS", "WordPress"], link: "#" },
      { id: "p3", illustration: "hospitality", title: "Basil & Rye — Restaurant Website", category: "Websites", tag: "Hospitality",
        cover: "linear-gradient(135deg, #2e1f1a 0%, #b5652c 100%)",
        description: "A warm, appetite-driven site with online reservations and a menu that reads beautifully on a phone at arm's length.",
        problem: "Guests were calling to ask basic questions — hours, menu, whether they took reservations — because the old site buried everything.",
        solution: "Put hours, menu, and a one-tap reservation button in the first screen a visitor sees, with photography doing the rest of the talking.",
        features: ["One-tap reservations", "Seasonal menu system", "Photo-first layout", "Map & directions"],
        tech: ["Figma", "HTML/CSS", "JavaScript"], link: "#" },
      { id: "p4", illustration: "portfolio", title: "Ora — Personal Portfolio", category: "Websites", tag: "Portfolio",
        cover: "linear-gradient(135deg, #241a12 0%, #c98a2c 100%)",
        description: "A portfolio for a photographer where the work is the interface — minimal chrome, maximum image.",
        problem: "The photographer's existing Squarespace site felt identical to hundreds of others in her field.",
        solution: "Designed a full-bleed gallery system with a custom lightbox and almost no visible UI, letting the photography set the pace.",
        features: ["Full-bleed galleries", "Custom lightbox", "Lazy-loaded images", "Client proofing area"],
        tech: ["Figma", "HTML/CSS", "JavaScript"], link: "#" },
      { id: "p5", illustration: "mobileapp", title: "Pace — Mobile App UI", category: "UI/UX", tag: "Mobile App",
        cover: "linear-gradient(135deg, #222218 0%, #9e7f3f 100%)",
        description: "A running-tracker app concept designed to feel encouraging rather than clinical.",
        problem: "Most fitness apps overwhelm new runners with data before they've built the habit.",
        solution: "Designed a first-run experience that hides advanced stats until week three, and a home screen built around one clear daily goal.",
        features: ["Progressive complexity", "Goal-first home screen", "Route replay", "Dark & light modes"],
        tech: ["Figma", "Prototyping", "Design System"], link: "#" },
      { id: "p6", illustration: "dashboard", title: "Ledger — Admin Dashboard", category: "UI/UX", tag: "Dashboard",
        cover: "linear-gradient(135deg, #2e1f14 0%, #d16f4a 100%)",
        description: "An internal finance dashboard redesigned to surface the three numbers a manager actually checks each morning.",
        problem: "The original dashboard showed 40+ metrics with no hierarchy, so nothing stood out.",
        solution: "Introduced a clear three-tier hierarchy — headline numbers, trend charts, then a drill-down table — with customizable views per role.",
        features: ["Role-based views", "Custom chart builder", "Exportable reports", "Keyboard shortcuts"],
        tech: ["Figma", "Design System", "Data Viz"], link: "#" },
      { id: "p7", illustration: "branding", title: "Halcyon — Brand Identity", category: "Branding", tag: "Brand Identity",
        cover: "linear-gradient(135deg, #2a1a12 0%, #d17a47 100%)",
        description: "Full identity system for a wellness studio, from wordmark to signage to Instagram templates.",
        problem: "The studio had a name and nothing else — no mark, no palette, no consistent voice.",
        solution: "Built a logo system that works from a favicon to a storefront sign, plus a flexible palette and type pairing the team could apply themselves.",
        features: ["Logo & submark system", "Color & type guidelines", "Signage mockups", "Social templates"],
        tech: ["Illustrator", "Photoshop", "Brand Guidelines"], link: "#" },
      { id: "p8", illustration: "social", title: "Fernweh — Social Media Design", category: "Graphic Design", tag: "Social Media",
        cover: "linear-gradient(135deg, #241a12 0%, #d1962c 100%)",
        description: "A month-long content system for a travel brand's Instagram, built as reusable templates rather than one-off posts.",
        problem: "The brand's designer was rebuilding every post from scratch, which didn't scale past two posts a week.",
        solution: "Delivered a template kit covering nine post types, so the in-house team could publish daily without touching a design file from scratch.",
        features: ["9 reusable templates", "Story & carousel kits", "Consistent grid system", "Editable in Canva"],
        tech: ["Illustrator", "Photoshop"], link: "#" },
      { id: "p9", illustration: "appdev", title: "Voyage — Travel Booking App", category: "App Development", tag: "Mobile App",
        cover: "linear-gradient(135deg, #241c10 0%, #e08a1e 100%)",
        description: "A cross-platform trip-booking app built end-to-end — from onboarding flow to a working payment integration.",
        problem: "The client had a validated idea and a pile of sketches, but no working product to show investors or early users.",
        solution: "Designed and built a Flutter app with a Firebase back end, shipping a functional MVP — search, booking, and payment — in eight weeks.",
        features: ["Cross-platform (iOS & Android)", "Real-time availability search", "Stripe payment integration", "Push notifications"],
        tech: ["Flutter", "Firebase", "Stripe API"], link: "#" }
    ],

    experience: [
      { period: "2024 — Present", role: "Freelance App Developer", place: "Self-employed",
        desc: "Building cross-platform mobile apps with React Native and Flutter for independent clients, from first wireframe to app-store launch." },
      { period: "2024 — Present", role: "Freelance Web & Graphic Designer", place: "Self-employed",
        desc: "Designing and building websites and brand identities for independent clients across e-commerce, hospitality, and services." },
      { period: "2022 — 2024", role: "Web Designer", place: "Studio Nine",
        desc: "Led front-end design for client sites, working closely with developers to hand off pixel-accurate, responsive builds." },
      { period: "2021 — 2022", role: "Graphic Designer", place: "Pixel & Co.",
        desc: "Produced branding, print, and social assets for a roster of small business clients." }
    ],

    testimonials: [
      { name: "Sarah Whitfield", role: "Founder, Lumen Goods", photo: "SW", rating: 5,
        review: "Amin rebuilt our store and our mobile conversion rate nearly doubled within a month. He asks the right questions before he ever opens Figma." },
      { name: "David Chen", role: "Partner, Northfield Consulting", photo: "DC", rating: 5,
        review: "Calm, professional, and genuinely fast. He turned a messy brief into a site that actually sounds like us." },
      { name: "Maria Lopez", role: "Owner, Basil & Rye", photo: "ML", rating: 5,
        review: "Our reservation calls dropped by half the week the new site went live. Amin understood exactly what our guests needed to see first." },
      { name: "Tom Reilly", role: "Creative Director, Halcyon Studio", photo: "TR", rating: 5,
        review: "The brand system he built for us still holds up two years later. Thoughtful, disciplined design work." }
    ],

    social: SOCIAL,

    gallery: [
      'assets/images/gallery-1.jpg',
      'assets/images/gallery-2.jpg',
      'assets/images/gallery-3.jpg',
      'assets/images/gallery-4.jpg'
    ]
  },

  /* =======================================================================
     বাংলা (BENGALI) — DEFAULT
     ======================================================================= */
  bn: {
    profile: {
      name: "মিঃ আমিন",
      shortName: "আমিন",
      title: "ওয়েব ডিজাইনার ও গ্রাফিক ডিজাইনার",
      tagline: "আমি এমন ডিজিটাল অভিজ্ঞতা তৈরি করি, যা ব্যবসাকে মানুষের কাছে আরও আকর্ষণীয়, পরিচিত এবং স্মরণীয় করে তোলে ",
      location: "বরিশাল, ঢাকা, বাংলাদেশ",
      email: CONTACT.email,
      phone: CONTACT.phoneDisplay,
      whatsapp: CONTACT.whatsapp,
      available: true,
      image: CONTACT.image,
      resume: CONTACT.resume,
      bio: [
        "আমি একজন ডিজাইনার ও ফ্রন্ট-এন্ড ডেভেলপার, যিনি গ্রাফিক ডিজাইন আর ওয়েব ডেভেলপমেন্টের মাঝের জায়গাটায় কাজ করতে ভালোবাসি — ব্র্যান্ডের আইডিয়াকে এমন ইন্টারফেসে রূপ দিই যা ব্যবহার করতে মানুষ সত্যিই উপভোগ করে।",
        "গত কয়েক বছরে স্টার্টআপ, রেস্তোরাঁ ও ছোট স্টুডিওর সাথে কাজ করে এমন ওয়েবসাইট ও ব্র্যান্ড আইডেন্টিটি তৈরি করেছি, যেখানে প্রথম পিক্সেল থেকে শেষ CSS লাইন পর্যন্ত প্রতিটি খুঁটিনাটির যত্ন নেওয়া হয়েছে — একটা ট্রানজিশনের সময়, একটা হেডলাইনের ওজন, বাটনে চাপ দিলে তার সাড়া দেওয়ার ধরন।",
        "ডিজাইন না করলে সাধারণত টাইপোগ্রাফি নিয়ে পড়ি, কোনো সাইড প্রজেক্ট নিয়ে ঘাঁটাঘাঁটি করি, অথবা এই পোর্টফোলিওটাই এ বছর তৃতীয়বারের মতো নতুন করে বানাই।"
      ]
    },

    stats: [
      { value: 25, suffix: "+", label: "প্রজেক্ট" },
      { value: 3, suffix: "+", label: "বছরের অভিজ্ঞতা" },
      { value: 15, suffix: "+", label: "সন্তুষ্ট ক্লায়েন্ট" },
      { value: 100, suffix: "%", label: "প্রতিশ্রুতিবদ্ধতা" }
    ],

    skills: [
      {
        category: "ওয়েব ডিজাইন",
        items: [
          { name: "এইচটিএমএল", level: 95 },
          { name: "সিএসএস", level: 95 },
          { name: "জাভাস্ক্রিপ্ট", level: 80 },
          { name: "রেসপন্সিভ ডিজাইন", level: 95 },
          { name: "ইউআই / ইউএক্স", level: 90 }
        ]
      },
      {
        category: "গ্রাফিক ডিজাইন",
        items: [
          { name: "ফটোশপ", level: 92 },
          { name: "ইলাস্ট্রেটর", level: 88 },
          { name: "ব্র্যান্ডিং", level: 90 },
          { name: "লোগো ডিজাইন", level: 90 },
          { name: "সোশ্যাল মিডিয়া ডিজাইন", level: 85 }
        ]
      },
      {
        category: "ডেভেলপমেন্ট",
        items: [
          { name: "পিএইচপি", level: 75 },
          { name: "মাইএসকিউএল", level: 72 },
          { name: "ওয়ার্ডপ্রেস", level: 88 }
        ]
      },
      {
        category: "অ্যাপ ডেভেলপমেন্ট",
        items: [
          { name: "রিঅ্যাক্ট নেটিভ", level: 78 },
          { name: "ফ্লাটার", level: 72 },
          { name: "ফায়ারবেস", level: 80 },
          { name: "এপিআই ইন্টিগ্রেশন", level: 85 }
        ]
      }
    ],

    services: [
      { icon: "layout", title: "ওয়েব ডিজাইন", desc: "আপনার ব্র্যান্ড ও ব্যবহারকারীদের কেন্দ্র করে তৈরি আধুনিক, রেসপন্সিভ ওয়েবসাইট।" },
      { icon: "cursor", title: "UI / UX ডিজাইন", desc: "ওয়েব ও মোবাইল প্রোডাক্টের জন্য পরিচ্ছন্ন, ব্যবহারবান্ধব ইন্টারফেস।" },
      { icon: "palette", title: "গ্রাফিক ডিজাইন", desc: "পেশাদার ব্র্যান্ডিং, মার্কেটিং গ্রাফিক্স ও ভিজ্যুয়াল আইডেন্টিটি।" },
      { icon: "wordpress", title: "ওয়ার্ডপ্রেস", desc: "দ্রুতগতির, সহজে সম্পাদনাযোগ্য কাস্টম ওয়ার্ডপ্রেস ওয়েবসাইট, যা আপনি নিজেই বাড়াতে পারবেন।" },
      { icon: "code", title: "ওয়েব ডেভেলপমেন্ট", desc: "শুরু থেকে শেষ পর্যন্ত কার্যকর ও মজবুতভাবে তৈরি ওয়েব অ্যাপ্লিকেশন।" },
      { icon: "appdev", title: "অ্যাপ ডেভেলপমেন্ট", desc: "প্রথম ওয়্যারফ্রেম থেকে অ্যাপ-স্টোরে লঞ্চ পর্যন্ত ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপ।" }
    ],

    projects: [
      { id: "p1", illustration: "ecommerce", title: "Lumen — ই-কমার্স ওয়েবসাইট", category: "ওয়েবসাইট", tag: "ই-কমার্স",
        cover: "linear-gradient(135deg, #3a2410 0%, #ff7a1e 100%)",
        description: "চেকআউট দ্রুত করা এবং মোবাইলে প্রোডাক্ট খুঁজে পাওয়া সহজ করার লক্ষ্যে পুরো স্টোরফ্রন্টের রিডিজাইন।",
        problem: "ক্লায়েন্টের পুরনো স্টোরে মোবাইল কার্ট অ্যাবানডমেন্ট রেট ছিল ৬৮%, আর চেকআউট শেষ করতে সাতটি ধাপ লাগত।",
        solution: "তিন-ধাপের চেকআউট, প্রোডাক্ট পেজে স্টিকি অ্যাড-টু-কার্ট, এবং পেজ রিলোড ছাড়াই তাৎক্ষণিক ফলাফল আপডেট করা ফিল্টার সিস্টেম দিয়ে স্টোরটি নতুন করে বানানো হয়েছে।",
        features: ["৩-ধাপের গাইডেড চেকআউট", "তাৎক্ষণিক সার্চ ও ফিল্টার", "উইশলিস্ট ও সেভড কার্ট", "মোবাইল-ফার্স্ট প্রোডাক্ট গ্যালারি"],
        tech: ["Figma", "HTML/CSS", "JavaScript", "WooCommerce"], link: "#" },
      { id: "p2", illustration: "corporate", title: "Northfield — বিজনেস ওয়েবসাইট", category: "ওয়েবসাইট", tag: "কর্পোরেট",
        cover: "linear-gradient(135deg, #2a1f14 0%, #d1791f 100%)",
        description: "একটি কনসালটিং ফার্মের জন্য শান্ত, বিশ্বাসযোগ্যতা-কেন্দ্রিক সাইট, যা প্রতিষ্ঠিত মনে হবে অথচ নীরস মনে হবে না।",
        problem: "ফার্মের সাইটটি দেখতে ২০১২ সালের ব্রোশিওরের মতো ছিল, যা সম্ভাব্য ক্লায়েন্টদের যোগাযোগ করার কোনো কারণ দিত না।",
        solution: "কনটেন্টকে ফলাফলভিত্তিক করে পুনর্গঠন করা হয়েছে, তাদের কাজের জন্য কেস-স্টাডি ফরম্যাট যোগ করা হয়েছে, এবং যোগাযোগের পথকে একটি সহজ ফর্মে সরলীকৃত করা হয়েছে।",
        features: ["কেস স্টাডি টেমপ্লেট", "টিম ডিরেক্টরি", "রিসোর্স লাইব্রেরি", "লিড-ক্যাপচার ফর্ম"],
        tech: ["Figma", "HTML/CSS", "WordPress"], link: "#" },
      { id: "p3", illustration: "hospitality", title: "Basil & Rye — রেস্তোরাঁ ওয়েবসাইট", category: "ওয়েবসাইট", tag: "হসপিটালিটি",
        cover: "linear-gradient(135deg, #2e1f1a 0%, #b5652c 100%)",
        description: "অনলাইন রিজার্ভেশন সহ একটি উষ্ণ, রুচিবর্ধক সাইট, যার মেনু হাতে ধরা ফোনেও দারুণ দেখায়।",
        problem: "অতিথিরা সময়, মেনু, রিজার্ভেশন নেওয়া হয় কিনা — এসব সাধারণ প্রশ্নের জন্য ফোন করতেন, কারণ পুরনো সাইটে সবকিছু চাপা পড়ে ছিল।",
        solution: "ভিজিটর প্রথম যে স্ক্রিনটি দেখেন সেখানেই সময়, মেনু ও এক-ট্যাপ রিজার্ভেশন বাটন রাখা হয়েছে, বাকিটা বলে দেয় ছবিগুলো।",
        features: ["এক-ট্যাপ রিজার্ভেশন", "সিজনাল মেনু সিস্টেম", "ফটো-ফার্স্ট লেআউট", "ম্যাপ ও দিকনির্দেশনা"],
        tech: ["Figma", "HTML/CSS", "JavaScript"], link: "#" },
      { id: "p4", illustration: "portfolio", title: "Ora — পার্সোনাল পোর্টফোলিও", category: "ওয়েবসাইট", tag: "পোর্টফোলিও",
        cover: "linear-gradient(135deg, #241a12 0%, #c98a2c 100%)",
        description: "একজন ফটোগ্রাফারের পোর্টফোলিও, যেখানে কাজটাই ইন্টারফেস — সর্বনিম্ন ক্রোম, সর্বোচ্চ ছবি।",
        problem: "ফটোগ্রাফারের আগের Squarespace সাইটটি তার ক্ষেত্রের শত শত অন্য সাইটের মতোই মনে হচ্ছিল।",
        solution: "কাস্টম লাইটবক্স সহ একটি ফুল-ব্লিড গ্যালারি সিস্টেম ডিজাইন করা হয়েছে, প্রায় কোনো দৃশ্যমান UI ছাড়াই, যাতে ছবিগুলোই গতি নির্ধারণ করে।",
        features: ["ফুল-ব্লিড গ্যালারি", "কাস্টম লাইটবক্স", "লেজি-লোডেড ছবি", "ক্লায়েন্ট প্রুফিং এরিয়া"],
        tech: ["Figma", "HTML/CSS", "JavaScript"], link: "#" },
      { id: "p5", illustration: "mobileapp", title: "Pace — মোবাইল অ্যাপ UI", category: "UI/UX", tag: "মোবাইল অ্যাপ",
        cover: "linear-gradient(135deg, #222218 0%, #9e7f3f 100%)",
        description: "একটি রানিং-ট্র্যাকার অ্যাপ কনসেপ্ট, যা ক্লিনিক্যাল না হয়ে বরং উৎসাহব্যঞ্জক অনুভূতি দেয়।",
        problem: "বেশিরভাগ ফিটনেস অ্যাপ অভ্যাস তৈরি হওয়ার আগেই নতুন দৌড়বিদদের ডেটা দিয়ে চাপে ফেলে দেয়।",
        solution: "তৃতীয় সপ্তাহ পর্যন্ত উন্নত পরিসংখ্যান লুকিয়ে রাখা একটি ফার্স্ট-রান অভিজ্ঞতা এবং একটি স্পষ্ট দৈনিক লক্ষ্যকেন্দ্রিক হোম স্ক্রিন ডিজাইন করা হয়েছে।",
        features: ["ধাপে ধাপে জটিলতা বৃদ্ধি", "লক্ষ্য-কেন্দ্রিক হোম স্ক্রিন", "রুট রিপ্লে", "ডার্ক ও লাইট মোড"],
        tech: ["Figma", "প্রোটোটাইপিং", "ডিজাইন সিস্টেম"], link: "#" },
      { id: "p6", illustration: "dashboard", title: "Ledger — অ্যাডমিন ড্যাশবোর্ড", category: "UI/UX", tag: "ড্যাশবোর্ড",
        cover: "linear-gradient(135deg, #2e1f14 0%, #d16f4a 100%)",
        description: "একটি অভ্যন্তরীণ ফাইন্যান্স ড্যাশবোর্ড, যা প্রতিদিন সকালে ম্যানেজার আসলেই যে তিনটি সংখ্যা দেখেন সেগুলোকে সামনে আনার জন্য রিডিজাইন করা হয়েছে।",
        problem: "আগের ড্যাশবোর্ডে কোনো ক্রম ছাড়াই ৪০+ মেট্রিক দেখানো হতো, তাই কোনো কিছুই আলাদাভাবে চোখে পড়ত না।",
        solution: "একটি স্পষ্ট তিন-স্তরের কাঠামো চালু করা হয়েছে — হেডলাইন সংখ্যা, ট্রেন্ড চার্ট, তারপর ড্রিল-ডাউন টেবিল — প্রতিটি রোলের জন্য কাস্টমাইজযোগ্য ভিউ সহ।",
        features: ["রোল-ভিত্তিক ভিউ", "কাস্টম চার্ট বিল্ডার", "এক্সপোর্টযোগ্য রিপোর্ট", "কীবোর্ড শর্টকাট"],
        tech: ["Figma", "ডিজাইন সিস্টেম", "ডেটা ভিজ"], link: "#" },
      { id: "p7", illustration: "branding", title: "Halcyon — ব্র্যান্ড আইডেন্টিটি", category: "ব্র্যান্ডিং", tag: "ব্র্যান্ড আইডেন্টিটি",
        cover: "linear-gradient(135deg, #2a1a12 0%, #d17a47 100%)",
        description: "একটি ওয়েলনেস স্টুডিওর জন্য পূর্ণাঙ্গ আইডেন্টিটি সিস্টেম — ওয়ার্ডমার্ক থেকে সাইনেজ থেকে ইনস্টাগ্রাম টেমপ্লেট পর্যন্ত।",
        problem: "স্টুডিওটির শুধু একটি নাম ছাড়া আর কিছুই ছিল না — কোনো মার্ক নেই, প্যালেট নেই, ধারাবাহিক কণ্ঠস্বর নেই।",
        solution: "একটি ফ্যাভিকন থেকে শুরু করে স্টোরফ্রন্ট সাইনবোর্ড পর্যন্ত কাজ করে এমন একটি লোগো সিস্টেম, সাথে একটি নমনীয় প্যালেট ও টাইপ পেয়ারিং তৈরি করা হয়েছে, যা টিম নিজেরাই প্রয়োগ করতে পারে।",
        features: ["লোগো ও সাবমার্ক সিস্টেম", "কালার ও টাইপ গাইডলাইন", "সাইনেজ মকআপ", "সোশ্যাল টেমপ্লেট"],
        tech: ["Illustrator", "Photoshop", "ব্র্যান্ড গাইডলাইন"], link: "#" },
      { id: "p8", illustration: "social", title: "Fernweh — সোশ্যাল মিডিয়া ডিজাইন", category: "গ্রাফিক ডিজাইন", tag: "সোশ্যাল মিডিয়া",
        cover: "linear-gradient(135deg, #241a12 0%, #d1962c 100%)",
        description: "একটি ট্রাভেল ব্র্যান্ডের ইনস্টাগ্রামের জন্য এক মাসের কনটেন্ট সিস্টেম, একবারের পোস্টের বদলে পুনরায়-ব্যবহারযোগ্য টেমপ্লেট হিসেবে তৈরি।",
        problem: "ব্র্যান্ডের ডিজাইনার প্রতিটি পোস্ট শূন্য থেকে বানাচ্ছিলেন, যা সপ্তাহে দুইটির বেশি পোস্টে স্কেল করা যাচ্ছিল না।",
        solution: "নয়টি পোস্ট টাইপ কভার করা একটি টেমপ্লেট কিট দেওয়া হয়েছে, যাতে ইন-হাউস টিম ডিজাইন ফাইল শূন্য থেকে না ছুঁয়েই প্রতিদিন পোস্ট করতে পারে।",
        features: ["৯টি পুনরায়-ব্যবহারযোগ্য টেমপ্লেট", "স্টোরি ও ক্যারোসেল কিট", "সামঞ্জস্যপূর্ণ গ্রিড সিস্টেম", "Canva-তে সম্পাদনাযোগ্য"],
        tech: ["Illustrator", "Photoshop"], link: "#" },
      { id: "p9", illustration: "appdev", title: "Voyage — ট্রাভেল বুকিং অ্যাপ", category: "অ্যাপ ডেভেলপমেন্ট", tag: "মোবাইল অ্যাপ",
        cover: "linear-gradient(135deg, #241c10 0%, #e08a1e 100%)",
        description: "শুরু থেকে শেষ পর্যন্ত তৈরি একটি ক্রস-প্ল্যাটফর্ম ট্রিপ-বুকিং অ্যাপ — অনবোর্ডিং ফ্লো থেকে কার্যকর পেমেন্ট ইন্টিগ্রেশন পর্যন্ত।",
        problem: "ক্লায়েন্টের একটি যাচাইকৃত আইডিয়া ও স্কেচের স্তূপ ছিল, কিন্তু বিনিয়োগকারী বা প্রাথমিক ব্যবহারকারীদের দেখানোর মতো কোনো কার্যকর প্রোডাক্ট ছিল না।",
        solution: "Firebase ব্যাকএন্ড সহ একটি Flutter অ্যাপ ডিজাইন ও তৈরি করা হয়েছে, আট সপ্তাহে একটি কার্যকর MVP — সার্চ, বুকিং ও পেমেন্ট — চালু করা হয়েছে।",
        features: ["ক্রস-প্ল্যাটফর্ম (iOS ও Android)", "রিয়েল-টাইম availability সার্চ", "Stripe পেমেন্ট ইন্টিগ্রেশন", "পুশ নোটিফিকেশন"],
        tech: ["Flutter", "Firebase", "Stripe API"], link: "#" }
    ],

    experience: [
      { period: "২০২৪ — বর্তমান", role: "ফ্রিল্যান্স অ্যাপ ডেভেলপার", place: "সেলফ-এমপ্লয়েড",
        desc: "স্বতন্ত্র ক্লায়েন্টদের জন্য React Native ও Flutter দিয়ে ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপ তৈরি করছি — প্রথম ওয়্যারফ্রেম থেকে অ্যাপ-স্টোরে লঞ্চ পর্যন্ত।" },
      { period: "২০২৪ — বর্তমান", role: "ফ্রিল্যান্স ওয়েব ও গ্রাফিক ডিজাইনার", place: "সেলফ-এমপ্লয়েড",
        desc: "ই-কমার্স, হসপিটালিটি ও সার্ভিস খাতের স্বতন্ত্র ক্লায়েন্টদের জন্য ওয়েবসাইট ও ব্র্যান্ড আইডেন্টিটি ডিজাইন ও তৈরি করছি।" },
      { period: "২০২২ — ২০২৪", role: "ওয়েব ডিজাইনার", place: "Studio Nine",
        desc: "ক্লায়েন্ট সাইটের ফ্রন্ট-এন্ড ডিজাইনের নেতৃত্ব দিয়েছি, পিক্সেল-নিখুঁত ও রেসপন্সিভ বিল্ড হ্যান্ডঅফ করতে ডেভেলপারদের সাথে ঘনিষ্ঠভাবে কাজ করেছি।" },
      { period: "২০২১ — ২০২২", role: "গ্রাফিক ডিজাইনার", place: "Pixel & Co.",
        desc: "ছোট ব্যবসার ক্লায়েন্টদের জন্য ব্র্যান্ডিং, প্রিন্ট ও সোশ্যাল অ্যাসেট তৈরি করেছি।" }
    ],

    testimonials: [
      { name: "Sarah Whitfield", role: "প্রতিষ্ঠাতা, Lumen Goods", photo: "SW", rating: 5,
        review: "আমিন আমাদের স্টোর নতুন করে বানিয়েছে, আর এক মাসের মধ্যেই আমাদের মোবাইল কনভার্শন রেট প্রায় দ্বিগুণ হয়ে গেছে। Figma খোলার আগেই সে সঠিক প্রশ্নগুলো জিজ্ঞেস করে।" },
      { name: "David Chen", role: "পার্টনার, Northfield Consulting", photo: "DC", rating: 5,
        review: "শান্ত, পেশাদার, এবং সত্যিকার অর্থেই দ্রুত। একটা এলোমেলো ব্রিফকে এমন একটা সাইটে রূপ দিয়েছে যা সত্যিই আমাদের মতো শোনায়।" },
      { name: "Maria Lopez", role: "মালিক, Basil & Rye", photo: "ML", rating: 5,
        review: "নতুন সাইট চালু হওয়ার সপ্তাহেই আমাদের রিজার্ভেশন কল অর্ধেক কমে গেছে। অতিথিদের প্রথমে কী দেখা দরকার সেটা আমিন ঠিক বুঝেছিল।" },
      { name: "Tom Reilly", role: "ক্রিয়েটিভ ডিরেক্টর, Halcyon Studio", photo: "TR", rating: 5,
        review: "সে আমাদের জন্য যে ব্র্যান্ড সিস্টেম তৈরি করেছিল তা দুই বছর পরেও দারুণভাবে টিকে আছে। চিন্তাশীল, শৃঙ্খলাবদ্ধ ডিজাইনের কাজ।" }
    ],

    social: SOCIAL,

    gallery: [
      'assets/images/gallery-1.jpg',
      'assets/images/gallery-2.jpg',
      'assets/images/gallery-3.jpg',
      'assets/images/gallery-4.jpg'
    ]
  }
};

/* ---- Static UI strings (nav, buttons, labels, placeholders) ------------ */
const UI_STRINGS = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_about: "About",
    nav_work: "Work",
    nav_skills: "Skills",
    nav_contact: "Contact",
    nav_blog: "Blog",
    
    // Availability
    available: "Available for Work",
    booked: "Currently Booked",
    
    // Buttons
    btn_view_work: "View My Work",
    btn_lets_talk: "Let's Talk",
    btn_read_more: "Read More",
    btn_read_less: "Read Less",
    btn_send_message: "Send Message",
    btn_sending: "Sending...",
    btn_subscribe: "Subscribe",
    btn_subscribing: "Subscribing...",
    btn_visit_project: "Visit Project",
    project_view: "View Project",
    
    // Eyebrows & Headings
    eyebrow_snapshot: "Snapshot",
    eyebrow_selected_work: "Selected Work",
    heading_featured_projects: "Featured Projects",
    eyebrow_who_i_am: "Who I Am",
    heading_about_me: "About Me",
    eyebrow_where_ive_been: "Where I've Been",
    heading_experience: "Experience",
    eyebrow_what_clients_say: "What Clients Say",
    heading_testimonials: "Testimonials",
    eyebrow_portfolio: "Portfolio",
    heading_selected_work: "Selected Work",
    filter_all: "All",
    eyebrow_capabilities: "Capabilities",
    heading_skills: "Skills",
    eyebrow_how_i_can_help: "How I Can Help",
    heading_services: "Services",
    eyebrow_get_in_touch: "Get In Touch",
    heading_lets_build: "Let's Build Something Great",
    contact_sub: "Have a project in mind? Tell me a little about it and I'll get back to you within a day.",
    eyebrow_newsletter: "Newsletter",
    heading_newsletter: "Get occasional updates",
    newsletter_sub: "New projects, design notes, and the odd useful tip — no spam, unsubscribe anytime.",
    eyebrow_elsewhere: "Elsewhere",
    gallery_title: "Moments",
    gallery_sub: "Some glimpses from design, studio, and work environment",
    
    // Form Labels
    form_label_name: "Name",
    form_label_email: "Email",
    form_label_phone: "Phone",
    form_label_subject: "Subject",
    form_label_message: "Message",
    
    // Form Placeholders
    form_placeholder_name: "Your name",
    form_placeholder_email: "you@email.com",
    form_placeholder_phone: "Optional",
    form_placeholder_subject: "Project inquiry",
    form_placeholder_message: "Tell me about your project...",
    newsletter_placeholder: "you@email.com",
    
    // Form Consent
    form_consent_subscribe: "Also keep me updated on new projects (occasional emails, unsubscribe anytime)",
    
    // Form Notes
    form_note_sent: "Message sent — I'll be in touch soon.",
    contact_error: "Something went wrong. Please try again.",
    newsletter_success: "You're subscribed — thanks!",
    newsletter_already: "You're already on the list!",
    newsletter_error: "Something went wrong. Please try again.",
    
    // Contact Info Labels
    label_email: "Email",
    label_phone: "Phone",
    label_whatsapp: "WhatsApp",
    label_location: "Location",
    value_chat_now: "Chat Now",
    
    // Footer
    footer_name: "Mr. Amin",
    footer_tagline: "Designed & built with care.",
    
    // Sheet
    sheet_problem: "The Problem",
    sheet_solution: "The Solution",
    sheet_features: "Key Features",
    sheet_technologies: "Technologies",
    
    // Language Toggle
    lang_toggle_to: "বাং"
  },
  bn: {
    // Navigation
    nav_home: "হোম",
    nav_about: "সম্পর্কে",
    nav_work: "কাজ",
    nav_skills: "দক্ষতা",
    nav_contact: "যোগাযোগ",
    nav_blog: "ব্লগ",
    
    // Availability
    available: "কাজের জন্য উপলব্ধ",
    booked: "বর্তমানে ব্যস্ত",
    
    // Buttons
    btn_view_work: "আমার কাজ দেখুন",
    btn_lets_talk: "চলুন কথা বলি",
    btn_read_more: "আরও পড়ুন",
    btn_read_less: "কম দেখুন",
    btn_send_message: "বার্তা পাঠান",
    btn_sending: "পাঠানো হচ্ছে...",
    btn_subscribe: "সাবস্ক্রাইব",
    btn_subscribing: "সাবস্ক্রাইব হচ্ছে...",
    btn_visit_project: "প্রজেক্ট দেখুন",
    project_view: "প্রজেক্ট দেখুন",
    
    // Eyebrows & Headings
    eyebrow_snapshot: "সংক্ষিপ্ত পরিচয়",
    eyebrow_selected_work: "নির্বাচিত কাজ",
    heading_featured_projects: "বিশেষ প্রজেক্টসমূহ",
    eyebrow_who_i_am: "আমি যেমন",
    heading_about_me: "আমার সম্পর্কে",
    eyebrow_where_ive_been: "কর্ম অভিজ্ঞতা",
    heading_experience: "অভিজ্ঞতা",
    eyebrow_what_clients_say: "ক্লায়েন্টদের মতামত",
    heading_testimonials: "প্রশংসাপত্র",
    eyebrow_portfolio: "পোর্টফোলিও",
    heading_selected_work: "নির্বাচিত কাজ",
    filter_all: "সবগুলো",
    eyebrow_capabilities: "সক্ষমতা",
    heading_skills: "দক্ষতা",
    eyebrow_how_i_can_help: "যেভাবে সাহায্য করতে পারি",
    heading_services: "সেবাসমূহ",
    eyebrow_get_in_touch: "যোগাযোগ",
    heading_lets_build: "একটি দুর্দান্ত কিছু তৈরি করি",
    contact_sub: "আপনার কি একটি প্রকল্প আছে? আমাকে কিছু বলুন, আমি একদিনের মধ্যে ফিরে আসব।",
    eyebrow_newsletter: "নিউজলেটার",
    heading_newsletter: "মাঝে মাঝে আপডেট পান",
    newsletter_sub: "নতুন প্রকল্প, ডিজাইন নোট, এবং দরকারি টিপস — কোনো স্প্যাম নয়, যেকোনো সময় আনসাবস্ক্রাইব করুন।",
    eyebrow_elsewhere: "অন্যান্য মাধ্যম",
    gallery_title: "গ্যালারি",
    gallery_sub: "ডিজাইন, স্টুডিও, এবং কাজের পরিবেশ থেকে কিছু ছবি",
    
    // Form Labels
    form_label_name: "নাম",
    form_label_email: "ইমেইল",
    form_label_phone: "ফোন",
    form_label_subject: "বিষয়",
    form_label_message: "বার্তা",
    
    // Form Placeholders
    form_placeholder_name: "আপনার নাম",
    form_placeholder_email: "you@email.com",
    form_placeholder_phone: "ঐচ্ছিক",
    form_placeholder_subject: "প্রকল্প অনুসন্ধান",
    form_placeholder_message: "আপনার প্রকল্প সম্পর্কে বলুন...",
    newsletter_placeholder: "you@email.com",
    
    // Form Consent
    form_consent_subscribe: "আমাকে নতুন প্রকল্প সম্পর্কে আপডেট রাখুন (মাঝে মাঝে ইমেইল, যেকোনো সময় আনসাবস্ক্রাইব করুন)",
    
    // Form Notes
    form_note_sent: "বার্তা পাঠানো হয়েছে — শীঘ্রই যোগাযোগ করব।",
    contact_error: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    newsletter_success: "আপনি সাবস্ক্রাইব করেছেন — ধন্যবাদ!",
    newsletter_already: "আপনি ইতিমধ্যে তালিকায় আছেন!",
    newsletter_error: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    
    // Contact Info Labels
    label_email: "ইমেইল",
    label_phone: "ফোন",
    label_whatsapp: "হোয়াটসঅ্যাপ",
    label_location: "ঠিকানা",
    value_chat_now: "এখনই চ্যাট করুন",
    
    // Footer
    footer_name: "মি. আমিন",
//  footer_tagline: "যত্ন সহকারে ডিজাইন তৈরি।",
    
    // Sheet
    sheet_problem: "সমস্যা",
    sheet_solution: "সমাধান",
    sheet_features: "প্রধান বৈশিষ্ট্য",
    sheet_technologies: "প্রযুক্তি",
    
    // Language Toggle
    lang_toggle_to: "EN"
  }
};