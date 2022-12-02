require("../models/database");
const Category = require("../models/Category");
const Recipe = require("../models/Recipe");

// GET /
// Homepage

exports.homepage = async (req, res) => {
  try {
    const limitNumber = 5;
    const categories = await Category.find({}).limit(limitNumber);
    const latest = await Recipe.find({}).sort({ _id: -1 }).limit(limitNumber);
    // const latest = await Recipe.find({}).limit(limitNumber);
    const thai = await Recipe.find({ category: "Thai" }).limit(limitNumber);
    const american = await Recipe.find({ category: "American" }).limit(
      limitNumber
    );
    const chinese = await Recipe.find({ category: "Chinese" }).limit(
      limitNumber
    );

    const food = { latest, thai, american, chinese };

    res.render("index", { title: "Cooking Blog - Home", categories, food });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

// GET /categories
// Categories
exports.exploreCategories = async (req, res) => {
  try {
    const limitNumber = 6;
    const categories = await Category.find({}).limit(limitNumber);
    res.render("categories", {
      title: "Cooking Blog - Categories",
      categories,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

// GET /categories/:id
// Categories By Id
exports.exploreCategoriesById = async (req, res) => {
  try {
    let categoryId = req.params.id;
    const limitNumber = 20;
    const categoryById = await Recipe.find({ category: categoryId }).limit(
      limitNumber
    );
    res.render("categories", {
      title: "Cooking Blog - Categoreis",
      categoryById,
    });
  } catch (error) {
    res.satus(500).send({ message: error.message || "Error Occured" });
  }
};

// GET /recipe/:id
// Recipe
exports.exploreRecipe = async (req, res) => {
  try {
    let recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    res.render("recipe", {
      title: "Cooking Blog - Recipe",
      recipe,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

// POST /search
// Search
exports.searchRecipe = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    let recipe = await Recipe.find({
      $text: { $search: searchTerm, $diacriticSensitive: true },
    });
    res.render("search", { title: "Cooking Blog - Search", recipe });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

// GET /explore-latest
// Explore Latest
exports.exploreLatest = async (req, res) => {
  try {
    const limitNumber = 20;
    const recipe = await Recipe.find({}).sort({ id: -1 }).limit(limitNumber);
    res.render("explore-latest", {
      title: "Cooking Blog - Explore Latest",
      recipe,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

// GET /explore-random
// Explore Random
exports.exploreRandom = async (req, res) => {
  try {
    let count = await Recipe.find().countDocuments();
    let random = Math.floor(Math.random() * count);
    let recipe = await Recipe.findOne().skip(random).exec();
    // res.json(recipe);

    res.render("explore-random", {
      title: "Cooking Blog - Explore Latest",
      recipe,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

// GET /submit-recipe
// Submit Recipe
exports.submitRecipe = async (req, res) => {
  const infoErrorObj = req.flash("infoErrors");
  const infoSubmitObj = req.flash("infoSubmit");
  res.render("submit-recipe", {
    title: "Cooking Blog - Submit Recipe",
    infoErrorObj,
    infoSubmitObj,
  });
};

// GET /submit-recipe
// Submit Recipe on Post
exports.submitRecipeOnPost = async (req, res) => {
  try {
    let imageUploadFile;
    let uploadPath;
    let newImageName;

    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("No Files were uploaded.");
    } else {
      imageUploadFile = req.files.image;
      newImageName = Date.now() + imageUploadFile.name;

      uploadPath =
        require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });
    }

    const newRecipe = new Recipe({
      name: req.body.name,
      description: req.body.description,
      email: req.body.email,
      ingredients: req.body.ingredients,
      category: req.body.category,
      image: newImageName,
    });

    await newRecipe.save();

    req.flash("infoSubmit", "Recipe has been added!");
    res.redirect("/submit-recipe");
  } catch (error) {
    req.flash("infoErrors", error);
    res.redirect("/submit-recipe");
  }
};

// async function insertDymmyRecipeData() {
//   try {
//     await Recipe.insertMany([
//       {
//         name: "Stir-fried vegetables",
//         description: `Crush the garlic and finely slice the chilli and spring onion. Peel and finely slice the red onion, and mix with the garlic, chilli and spring onion.`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "1 clove of garlic",
//           "1 fresh red chilli",
//           "3 spring onions",
//           "1 small red onion",
//           "1 handful of mangetout",
//           "a few shiitake mushrooms",
//           "1 handful of shredded green cabbage",
//         ],
//         category: "Chinese",
//         image: "stir-fried-vegetables.jpg",
//       },
//       {
//         name: "My kinda butter chicken",
//         description: `Halve and deseed the chillies. Place in a large non-stick frying pan on a high heat with the tomatoes and blacken all over, turning occasionally. Meanwhile, peel the garlic and ginger, and finely grate into a large bowl. Add most of the garam masala, a pinch of sea salt and black pepper and 1 tablespoon of yoghurt.`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "2–3 fresh mixed-colour chillies",
//           "350 g ripe mixed-colour cherry tomatoes",
//           "4 cloves of garlic",
//           "1 tablespoon garam masala",
//           "2 x 150 g free-range skinless chicken breasts",
//           "2 tablespoons smooth cashew butter",
//         ],
//         category: "Indian",
//         image: "southern-friend-chicken.jpg",
//       },
//       {
//         name: "My kinda butter chicken",
//         description: `Halve and deseed the chillies. Place in a large non-stick frying pan on a high heat with the tomatoes and blacken all over, turning occasionally. Meanwhile, peel the garlic and ginger, and finely grate into a large bowl. Add most of the garam masala, a pinch of sea salt and black pepper and 1 tablespoon of yoghurt.`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "2–3 fresh mixed-colour chillies",
//           "350 g ripe mixed-colour cherry tomatoes",
//           "4 cloves of garlic",
//           "1 tablespoon garam masala",
//           "2 x 150 g free-range skinless chicken breasts",
//           "2 tablespoons smooth cashew butter",
//         ],
//         category: "Indian",
//         image: "southern-friend-chicken.jpg",
//       },
//       {
//         name: "My kinda butter chicken",
//         description: `Halve and deseed the chillies. Place in a large non-stick frying pan on a high heat with the tomatoes and blacken all over, turning occasionally. Meanwhile, peel the garlic and ginger, and finely grate into a large bowl. Add most of the garam masala, a pinch of sea salt and black pepper and 1 tablespoon of yoghurt.`,
//         email: "recipeemail@raddy.co.uk",
//         ingredients: [
//           "2–3 fresh mixed-colour chillies",
//           "350 g ripe mixed-colour cherry tomatoes",
//           "4 cloves of garlic",
//           "1 tablespoon garam masala",
//           "2 x 150 g free-range skinless chicken breasts",
//           "2 tablespoons smooth cashew butter",
//         ],
//         category: "Indian",
//         image: "southern-friend-chicken.jpg",
//       },
//     ]);
//   } catch (error) {
//     console.log("err", +error);
//   }
// }

// insertDymmyRecipeData();

// async function insertDummyCategoryData() {
//   try {
//     await Category.insertMany([
//       {
//         name: "Thai",
//         image: "thai-food.jpg",
//       },
//       {
//         name: "American",
//         image: "american-food.jpg",
//       },
//       {
//         name: "Chinese",
//         image: "chinese-food.jpg",
//       },
//       {
//         name: "Mexican",
//         image: "mexican-food.jpg",
//       },
//       {
//         name: "Indian",
//         image: "indian-food.jpg",
//       },
//       {
//         name: "Spanish",
//         image: "spanish-food.jpg",
//       },
//     ]);
//   } catch (error) {
//     console.log("err" + error);
//   }
// }

// insertDummyCategoryData();
