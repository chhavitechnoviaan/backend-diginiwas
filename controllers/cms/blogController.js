import BlogPage from "../../models/BlogPage.js";
import cloudinary from "../../config/cloudinary.js";

/* ==========================================================
   CLOUDINARY HELPERS
========================================================== */

const uploadBufferToCloudinary = (
  fileBuffer,
  folder = "diginiwas/blog"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(
      "Cloudinary image delete failed:",
      error.message
    );
  }
};

/* ==========================================================
   HELPERS
========================================================== */

const createSlug = (text = "") => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value).toLowerCase() === "true";
};

const parseArrayField = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* ==========================================================
   GET COMPLETE BLOG PAGE
   PUBLIC + ADMIN
========================================================== */

export const getBlogPage = async (req, res) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
    }).lean();

    /*
      First request par default BlogPage create kar denge.
    */
    if (!blog) {
      blog = await BlogPage.create({
        pageKey: "blog-page",
      });

      blog = blog.toObject();
    }

    return res.status(200).json({
      success: true,
      message: "Blog page fetched successfully.",
      data: blog,
    });
  } catch (error) {
    console.error("GET BLOG PAGE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog page.",
      error: error.message,
    });
  }
};

/* ==========================================================
   PUBLIC BLOG PAGE
   Only published articles
========================================================== */

export const getPublicBlogPage = async (req, res) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
      isActive: true,
    }).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog page not found.",
      });
    }

    blog.articles = (blog.articles || [])
      .filter((article) => article.published)
      .sort((a, b) => {
        return (
          new Date(b.publishDate) -
          new Date(a.publishDate)
        );
      });

    blog.trendingArticles = (
      blog.trendingArticles || []
    ).sort(
      (a, b) =>
        (a.sortOrder || 0) - (b.sortOrder || 0)
    );

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("PUBLIC BLOG ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch public blog page.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE HERO
========================================================== */

export const updateBlogHero = async (req, res) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      blog = await BlogPage.create({
        pageKey: "blog-page",
      });
    }

    const {
      eyebrow,
      headingLine1,
      headingLine2,
      description,
      buttonText,
      buttonLink,
      marketTag,
      aiTag,
      buyerTag,
      investmentTag,
    } = req.body;

    if (eyebrow !== undefined)
      blog.hero.eyebrow = eyebrow;

    if (headingLine1 !== undefined)
      blog.hero.headingLine1 = headingLine1;

    if (headingLine2 !== undefined)
      blog.hero.headingLine2 = headingLine2;

    if (description !== undefined)
      blog.hero.description = description;

    if (buttonText !== undefined)
      blog.hero.buttonText = buttonText;

    if (buttonLink !== undefined)
      blog.hero.buttonLink = buttonLink;

    if (marketTag !== undefined)
      blog.hero.marketTag = marketTag;

    if (aiTag !== undefined)
      blog.hero.aiTag = aiTag;

    if (buyerTag !== undefined)
      blog.hero.buyerTag = buyerTag;

    if (investmentTag !== undefined)
      blog.hero.investmentTag = investmentTag;

    /*
      Input file field:
      heroImage
    */
    if (req.file) {
      const oldPublicId =
        blog.hero?.image?.publicId || "";

      const uploaded =
        await uploadBufferToCloudinary(
          req.file.buffer,
          "diginiwas/blog/hero"
        );

      blog.hero.image = uploaded;

      if (oldPublicId) {
        await deleteCloudinaryImage(oldPublicId);
      }
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog hero updated successfully.",
      data: blog.hero,
    });
  } catch (error) {
    console.error("UPDATE BLOG HERO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update blog hero.",
      error: error.message,
    });
  }
};

/* ==========================================================
   DELETE HERO IMAGE
========================================================== */

export const deleteBlogHeroImage = async (req, res) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog page not found.",
      });
    }

    const publicId =
      blog.hero?.image?.publicId || "";

    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    blog.hero.image = {
      url: "",
      publicId: "",
    };

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Hero image deleted successfully.",
      data: blog.hero,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete hero image.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE CATEGORIES
========================================================== */

export const updateBlogCategories = async (
  req,
  res
) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      blog = await BlogPage.create({
        pageKey: "blog-page",
      });
    }

    const categories = parseArrayField(
      req.body.categories
    );

    if (!categories.length) {
      return res.status(400).json({
        success: false,
        message:
          "At least one blog category is required.",
      });
    }

    const cleanedCategories = [
      ...new Set(
        categories
          .map((item) => String(item).trim())
          .filter(Boolean)
      ),
    ];

    blog.categories = cleanedCategories;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog categories updated successfully.",
      data: blog.categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update categories.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE FEATURED ARTICLE
========================================================== */

export const updateFeaturedArticle = async (
  req,
  res
) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      blog = await BlogPage.create({
        pageKey: "blog-page",
      });
    }

    const fields = [
      "badge",
      "category",
      "readTime",
      "title",
      "description",
      "buttonText",
      "buttonLink",
      "aiHeading",
      "aiDescription",
      "aiButtonText",
      "aiButtonLink",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        blog.featuredArticle[field] =
          req.body[field];
      }
    });

    if (req.body.showAITake !== undefined) {
      blog.featuredArticle.showAITake =
        parseBoolean(
          req.body.showAITake,
          blog.featuredArticle.showAITake
        );
    }

    /*
      file field:
      featuredImage
    */
    if (req.file) {
      const oldPublicId =
        blog.featuredArticle?.image?.publicId ||
        "";

      const uploaded =
        await uploadBufferToCloudinary(
          req.file.buffer,
          "diginiwas/blog/featured"
        );

      blog.featuredArticle.image = uploaded;

      if (oldPublicId) {
        await deleteCloudinaryImage(oldPublicId);
      }
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Featured article updated successfully.",
      data: blog.featuredArticle,
    });
  } catch (error) {
    console.error(
      "FEATURED ARTICLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update featured article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   DELETE FEATURED IMAGE
========================================================== */

export const deleteFeaturedArticleImage = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog page not found.",
      });
    }

    const publicId =
      blog.featuredArticle?.image?.publicId ||
      "";

    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    blog.featuredArticle.image = {
      url: "",
      publicId: "",
    };

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Featured article image deleted.",
      data: blog.featuredArticle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to delete featured article image.",
      error: error.message,
    });
  }
};

/* ==========================================================
   CREATE ARTICLE
========================================================== */

export const createBlogArticle = async (
  req,
  res
) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      blog = await BlogPage.create({
        pageKey: "blog-page",
      });
    }

    const {
      title,
      excerpt,
      content,
      category,
      readTime,
      author,
      publishDate,
      published,
      featured,
      sortOrder,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Article title and category are required.",
      });
    }

    let articleImage = {
      url: "",
      publicId: "",
    };

    /*
      file field:
      articleImage
    */
    if (req.file) {
      articleImage =
        await uploadBufferToCloudinary(
          req.file.buffer,
          "diginiwas/blog/articles"
        );
    }

    const slugBase = createSlug(title);

    const duplicate = blog.articles.some(
      (article) => article.slug === slugBase
    );

    const slug = duplicate
      ? `${slugBase}-${Date.now()}`
      : slugBase;

    blog.articles.push({
      title,
      slug,
      excerpt: excerpt || "",
      content: content || "",
      category,
      readTime: readTime || "5 min read",
      author: author || "DigiNiwas Team",
      publishDate: publishDate
        ? new Date(publishDate)
        : new Date(),
      image: articleImage,
      published: parseBoolean(
        published,
        false
      ),
      featured: parseBoolean(
        featured,
        false
      ),
      sortOrder: Number(sortOrder) || 0,
    });

    await blog.save();

    const createdArticle =
      blog.articles[blog.articles.length - 1];

    return res.status(201).json({
      success: true,
      message:
        "Blog article created successfully.",
      data: createdArticle,
    });
  } catch (error) {
    console.error(
      "CREATE BLOG ARTICLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create blog article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET ALL ARTICLES
========================================================== */

export const getAllBlogArticles = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    }).lean();

    if (!blog) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    let articles = blog.articles || [];

    const {
      category,
      published,
      search,
    } = req.query;

    if (category) {
      articles = articles.filter(
        (article) =>
          article.category?.toLowerCase() ===
          String(category).toLowerCase()
      );
    }

    if (published !== undefined) {
      const desired =
        String(published).toLowerCase() ===
        "true";

      articles = articles.filter(
        (article) =>
          article.published === desired
      );
    }

    if (search) {
      const q = String(search).toLowerCase();

      articles = articles.filter(
        (article) =>
          article.title
            ?.toLowerCase()
            .includes(q) ||
          article.excerpt
            ?.toLowerCase()
            .includes(q) ||
          article.category
            ?.toLowerCase()
            .includes(q) ||
          article.author
            ?.toLowerCase()
            .includes(q)
      );
    }

    articles.sort(
      (a, b) =>
        new Date(b.publishDate) -
        new Date(a.publishDate)
    );

    return res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch articles.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET SINGLE ARTICLE
========================================================== */

export const getBlogArticleById = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    }).lean();

    const article = blog?.articles?.find(
      (item) =>
        item._id.toString() === req.params.articleId
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET ARTICLE BY SLUG
========================================================== */

export const getArticleBySlug = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
      "articles.slug": req.params.slug,
    }).lean();

    const article = blog?.articles?.find(
      (item) =>
        item.slug === req.params.slug &&
        item.published
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE ARTICLE
========================================================== */

export const updateBlogArticle = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog page not found.",
      });
    }

    const article =
      blog.articles.id(req.params.articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Blog article not found.",
      });
    }

    const oldImagePublicId =
      article.image?.publicId || "";

    const fields = [
      "title",
      "excerpt",
      "content",
      "category",
      "readTime",
      "author",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        article[field] = req.body[field];
      }
    });

    if (req.body.title !== undefined) {
      article.slug = createSlug(
        req.body.title
      );
    }

    if (req.body.publishDate) {
      article.publishDate = new Date(
        req.body.publishDate
      );
    }

    if (req.body.published !== undefined) {
      article.published = parseBoolean(
        req.body.published,
        article.published
      );
    }

    if (req.body.featured !== undefined) {
      article.featured = parseBoolean(
        req.body.featured,
        article.featured
      );
    }

    if (req.body.sortOrder !== undefined) {
      article.sortOrder =
        Number(req.body.sortOrder) || 0;
    }

    if (req.file) {
      const uploaded =
        await uploadBufferToCloudinary(
          req.file.buffer,
          "diginiwas/blog/articles"
        );

      article.image = uploaded;

      if (oldImagePublicId) {
        await deleteCloudinaryImage(
          oldImagePublicId
        );
      }
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Blog article updated successfully.",
      data: article,
    });
  } catch (error) {
    console.error(
      "UPDATE ARTICLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   DELETE ARTICLE IMAGE ONLY
========================================================== */

export const deleteBlogArticleImage = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog page not found.",
      });
    }

    const article =
      blog.articles.id(req.params.articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    const publicId =
      article.image?.publicId || "";

    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    article.image = {
      url: "",
      publicId: "",
    };

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Article image deleted successfully.",
      data: article,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to delete article image.",
      error: error.message,
    });
  }
};

/* ==========================================================
   DELETE COMPLETE ARTICLE
========================================================== */

export const deleteBlogArticle = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog page not found.",
      });
    }

    const article =
      blog.articles.id(req.params.articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Blog article not found.",
      });
    }

    const publicId =
      article.image?.publicId || "";

    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    article.deleteOne();

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Blog article deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE ARTICLE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE NIWAS AI
========================================================== */

export const updateBlogNiwasAI = async (
  req,
  res
) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      blog = await BlogPage.create({
        pageKey: "blog-page",
      });
    }

    const {
      heading,
      title,
      description,
      buttonText,
      buttonLink,
    } = req.body;

    if (heading !== undefined)
      blog.niwasAI.heading = heading;

    if (title !== undefined)
      blog.niwasAI.title = title;

    if (description !== undefined)
      blog.niwasAI.description = description;

    if (buttonText !== undefined)
      blog.niwasAI.buttonText = buttonText;

    if (buttonLink !== undefined)
      blog.niwasAI.buttonLink = buttonLink;

    if (req.body.questions !== undefined) {
      blog.niwasAI.questions =
        parseArrayField(req.body.questions);
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Niwas AI section updated successfully.",
      data: blog.niwasAI,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to update Niwas AI section.",
      error: error.message,
    });
  }
};

/* ==========================================================
   CREATE TRENDING ARTICLE
========================================================== */

export const createTrendingArticle = async (
  req,
  res
) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      blog = await BlogPage.create({
        pageKey: "blog-page",
      });
    }

    const {
      title,
      category,
      articleId,
      link,
      sortOrder,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message:
          "Trending article title is required.",
      });
    }

    let image = {
      url: "",
      publicId: "",
    };

    if (req.file) {
      image =
        await uploadBufferToCloudinary(
          req.file.buffer,
          "diginiwas/blog/trending"
        );
    }

    blog.trendingArticles.push({
      title,
      category:
        category || "Market Trends",
      articleId: articleId || null,
      link: link || "",
      sortOrder: Number(sortOrder) || 0,
      image,
    });

    await blog.save();

    const created =
      blog.trendingArticles[
        blog.trendingArticles.length - 1
      ];

    return res.status(201).json({
      success: true,
      message:
        "Trending article created successfully.",
      data: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to create trending article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE TRENDING ARTICLE
========================================================== */

export const updateTrendingArticle = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog page not found.",
      });
    }

    const trending =
      blog.trendingArticles.id(
        req.params.trendingId
      );

    if (!trending) {
      return res.status(404).json({
        success: false,
        message:
          "Trending article not found.",
      });
    }

    const fields = [
      "title",
      "category",
      "link",
      "articleId",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        trending[field] = req.body[field];
      }
    });

    if (req.body.sortOrder !== undefined) {
      trending.sortOrder =
        Number(req.body.sortOrder) || 0;
    }

    if (req.file) {
      const oldPublicId =
        trending.image?.publicId || "";

      const image =
        await uploadBufferToCloudinary(
          req.file.buffer,
          "diginiwas/blog/trending"
        );

      trending.image = image;

      if (oldPublicId) {
        await deleteCloudinaryImage(
          oldPublicId
        );
      }
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Trending article updated successfully.",
      data: trending,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to update trending article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   DELETE TRENDING ARTICLE
========================================================== */

export const deleteTrendingArticle = async (
  req,
  res
) => {
  try {
    const blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog page not found.",
      });
    }

    const trending =
      blog.trendingArticles.id(
        req.params.trendingId
      );

    if (!trending) {
      return res.status(404).json({
        success: false,
        message:
          "Trending article not found.",
      });
    }

    const publicId =
      trending.image?.publicId || "";

    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    trending.deleteOne();

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Trending article deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to delete trending article.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE NEWSLETTER
========================================================== */

export const updateBlogNewsletter = async (
  req,
  res
) => {
  try {
    let blog = await BlogPage.findOne({
      pageKey: "blog-page",
    });

    if (!blog) {
      blog = await BlogPage.create({
        pageKey: "blog-page",
      });
    }

    const fields = [
      "headingLine1",
      "headingLine2",
      "description",
      "placeholder",
      "buttonText",
      "successMessage",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        blog.newsletter[field] =
          req.body[field];
      }
    });

    if (req.body.enabled !== undefined) {
      blog.newsletter.enabled =
        parseBoolean(
          req.body.enabled,
          blog.newsletter.enabled
        );
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message:
        "Blog newsletter updated successfully.",
      data: blog.newsletter,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to update newsletter.",
      error: error.message,
    });
  }
};