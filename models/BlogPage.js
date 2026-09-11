import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

/* =========================
   HERO
========================= */

const blogHeroSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      default: "DigiNiwas Blog",
      trim: true,
    },

    headingLine1: {
      type: String,
      default: "Insights that move",
      trim: true,
    },

    headingLine2: {
      type: String,
      default: "you forward.",
      trim: true,
    },

    description: {
      type: String,
      default:
        "Expert perspectives, market trends and AI-powered insights to help you make smarter property decisions.",
      trim: true,
    },

    buttonText: {
      type: String,
      default: "Ask Niwas AI About Anything",
      trim: true,
    },

    buttonLink: {
      type: String,
      default: "/niwas-ai",
      trim: true,
    },

    image: {
      type: imageSchema,
      default: () => ({}),
    },

    marketTag: {
      type: String,
      default: "Market Trends",
    },

    aiTag: {
      type: String,
      default: "AI Insights",
    },

    buyerTag: {
      type: String,
      default: "Buyer Guides",
    },

    investmentTag: {
      type: String,
      default: "Investment Ideas",
    },
  },
  { _id: false }
);

/* =========================
   FEATURED ARTICLE
========================= */

const featuredArticleSchema = new mongoose.Schema(
  {
    badge: {
      type: String,
      default: "Featured",
    },

    category: {
      type: String,
      default: "Market Trends",
    },

    readTime: {
      type: String,
      default: "5 min read",
    },

    title: {
      type: String,
      default: "Where is India's Real Estate Market Headed?",
    },

    description: {
      type: String,
      default:
        "A deep dive into demand patterns, emerging micro-markets and what Niwas AI is seeing ahead.",
    },

    buttonText: {
      type: String,
      default: "Read More",
    },

    buttonLink: {
      type: String,
      default: "",
    },

    image: {
      type: imageSchema,
      default: () => ({}),
    },

    showAITake: {
      type: Boolean,
      default: true,
    },

    aiHeading: {
      type: String,
      default: "Niwas AI Take",
    },

    aiDescription: {
      type: String,
      default:
        "Demand is shifting towards well-connected, lifestyle-rich micro-markets with strong infrastructure momentum.",
    },

    aiButtonText: {
      type: String,
      default: "Ask Niwas AI",
    },

    aiButtonLink: {
      type: String,
      default: "/niwas-ai",
    },
  },
  { _id: false }
);

/* =========================
   BLOG ARTICLE
========================= */

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },

    excerpt: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    readTime: {
      type: String,
      default: "5 min read",
    },

    author: {
      type: String,
      default: "DigiNiwas Team",
    },

    publishDate: {
      type: Date,
      default: Date.now,
    },

    image: {
      type: imageSchema,
      default: () => ({}),
    },

    published: {
      type: Boolean,
      default: false,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   NIWAS AI
========================= */

const niwasAISchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      default: "Ask Niwas AI",
    },

    title: {
      type: String,
      default: "Your AI property companion",
    },

    description: {
      type: String,
      default: "Get instant answers, insights and recommendations.",
    },

    buttonText: {
      type: String,
      default: "Ask Anything",
    },

    buttonLink: {
      type: String,
      default: "/niwas-ai",
    },

    questions: {
      type: [String],
      default: [
        "Which are the fastest-growing micro-markets right now?",
        "What affects property prices the most?",
        "How can I check if a property is a good investment?",
      ],
    },
  },
  { _id: false }
);

/* =========================
   TRENDING
========================= */

const trendingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "Market Trends",
    },

    image: {
      type: imageSchema,
      default: () => ({}),
    },

    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    link: {
      type: String,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   NEWSLETTER
========================= */

const newsletterSchema = new mongoose.Schema(
  {
    headingLine1: {
      type: String,
      default: "Smarter property insights,",
    },

    headingLine2: {
      type: String,
      default: "straight to your inbox.",
    },

    description: {
      type: String,
      default:
        "Get curated real estate insights, guides and market intelligence every week.",
    },

    placeholder: {
      type: String,
      default: "Enter your email",
    },

    buttonText: {
      type: String,
      default: "Subscribe",
    },

    successMessage: {
      type: String,
      default: "You're subscribed successfully.",
    },

    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/* =========================
   MAIN BLOG PAGE
========================= */

const blogPageSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      default: "blog-page",
      unique: true,
      index: true,
    },

    hero: {
      type: blogHeroSchema,
      default: () => ({}),
    },

    categories: {
      type: [String],
      default: [
        "All Articles",
        "Niwas AI",
        "Market Trends",
        "Buying Guide",
        "Renting Guide",
        "Investment",
        "Home Loans",
        "Interior & Living",
        "Legal & Finance",
      ],
    },

    featuredArticle: {
      type: featuredArticleSchema,
      default: () => ({}),
    },

    articles: {
      type: [articleSchema],
      default: [],
    },

    niwasAI: {
      type: niwasAISchema,
      default: () => ({}),
    },

    trendingArticles: {
      type: [trendingSchema],
      default: [],
    },

    newsletter: {
      type: newsletterSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const BlogPage = mongoose.model("BlogPage", blogPageSchema);

export default BlogPage;