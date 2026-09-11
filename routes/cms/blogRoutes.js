import express from "express";

import {
  getBlogPage,
  getPublicBlogPage,

  updateBlogHero,
  deleteBlogHeroImage,

  updateBlogCategories,

  updateFeaturedArticle,
  deleteFeaturedArticleImage,

  createBlogArticle,
  getAllBlogArticles,
  getBlogArticleById,
  getArticleBySlug,
  updateBlogArticle,
  deleteBlogArticleImage,
  deleteBlogArticle,

  updateBlogNiwasAI,

  createTrendingArticle,
  updateTrendingArticle,
  deleteTrendingArticle,

  updateBlogNewsletter,
} from "../../controllers/cms/blogController.js";

import blogUpload from "../../middleware/blogUpload.js";

const router = express.Router();

/* ======================================================
   PUBLIC
====================================================== */

router.get(
  "/public",
  getPublicBlogPage
);

router.get(
  "/articles/slug/:slug",
  getArticleBySlug
);

/* ======================================================
   ADMIN - COMPLETE BLOG
====================================================== */

router.get(
  "/admin",
  getBlogPage
);

/* ======================================================
   HERO
====================================================== */

router.patch(
  "/admin/hero",
  blogUpload.single("heroImage"),
  updateBlogHero
);

router.delete(
  "/admin/hero/image",
  deleteBlogHeroImage
);

/* ======================================================
   CATEGORIES
====================================================== */

router.patch(
  "/admin/categories",
  updateBlogCategories
);

/* ======================================================
   FEATURED
====================================================== */

router.patch(
  "/admin/featured",
  blogUpload.single("featuredImage"),
  updateFeaturedArticle
);

router.delete(
  "/admin/featured/image",
  deleteFeaturedArticleImage
);

/* ======================================================
   ARTICLES
====================================================== */

router.get(
  "/admin/articles",
  getAllBlogArticles
);

router.get(
  "/admin/articles/:articleId",
  getBlogArticleById
);

router.post(
  "/admin/articles",
  blogUpload.single("articleImage"),
  createBlogArticle
);

router.patch(
  "/admin/articles/:articleId",
  blogUpload.single("articleImage"),
  updateBlogArticle
);

router.delete(
  "/admin/articles/:articleId/image",
  deleteBlogArticleImage
);

router.delete(
  "/admin/articles/:articleId",
  deleteBlogArticle
);

/* ======================================================
   NIWAS AI
====================================================== */

router.patch(
  "/admin/niwas-ai",
  updateBlogNiwasAI
);

/* ======================================================
   TRENDING
====================================================== */

router.post(
  "/admin/trending",
  blogUpload.single("trendingImage"),
  createTrendingArticle
);

router.patch(
  "/admin/trending/:trendingId",
  blogUpload.single("trendingImage"),
  updateTrendingArticle
);

router.delete(
  "/admin/trending/:trendingId",
  deleteTrendingArticle
);

/* ======================================================
   NEWSLETTER
====================================================== */

router.patch(
  "/admin/newsletter",
  updateBlogNewsletter
);

export default router;