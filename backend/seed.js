import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

// ─── Inline Models (paste your actual model paths if different) ───────────────
import productModel from "./models/productModel.js";
import userModel from "./models/userModel.js";
import orderModel from "./models/orderModel.js";

// ─── DB Connect ───────────────────────────────────────────────────────────────
const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB Connected");
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS  (52 items — Men / Women / Kids × Topwear / Bottomwear / Winterwear)
// Images use placeholder URLs; swap with your real Cloudinary URLs anytime.
// ─────────────────────────────────────────────────────────────────────────────
const products = [
  // ── MEN · TOPWEAR ──────────────────────────────────────────────────────────
  {
    name: "Classic White Oxford Shirt",
    description: "A timeless white Oxford shirt crafted from 100% premium cotton. Features a button-down collar, chest pocket, and a relaxed fit perfect for both formal and casual occasions.",
    price: 1299,
    image: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Navy Blue Polo T-Shirt",
    description: "A premium navy polo shirt made from breathable pique cotton. The classic three-button placket and ribbed collar make it ideal for smart-casual outings.",
    price: 899,
    image: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Slim Fit Graphic Tee – Mountain",
    description: "A slim-fit graphic tee featuring a minimalist mountain print. Made from soft ring-spun cotton for all-day comfort. Great for weekend adventures.",
    price: 599,
    image: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Striped Linen Shirt – Beige",
    description: "A lightweight striped linen shirt in natural beige tones. Breathable and relaxed — the perfect summer shirt for brunches or beach outings.",
    price: 1499,
    image: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Henley Full-Sleeve Tee – Olive",
    description: "A full-sleeve Henley tee in earthy olive, crafted from a cotton-blend fabric. The button neckline adds a subtle style edge to your casual wardrobe.",
    price: 799,
    image: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 8 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Formal Mandarin Collar Shirt – Black",
    description: "A sleek black Mandarin collar shirt made from wrinkle-resistant fabric. Pairs perfectly with trousers for formal events or evening dinners.",
    price: 1699,
    image: ["https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=400"],
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },

  // ── MEN · BOTTOMWEAR ────────────────────────────────────────────────────────
  {
    name: "Slim Fit Chinos – Khaki",
    description: "Khaki slim-fit chinos cut from a stretch-cotton blend for maximum comfort and a clean silhouette. Versatile enough to go from office to dinner.",
    price: 1799,
    image: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Classic Blue Denim Jeans",
    description: "Medium-wash straight-fit jeans made from premium denim with a hint of stretch. A wardrobe essential that pairs with everything.",
    price: 2199,
    image: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 18 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Drawstring Track Pants – Grey",
    description: "Comfortable grey track pants with an elasticated waistband and drawstring. Made from soft French terry cotton — ideal for workouts and lazy Sundays alike.",
    price: 999,
    image: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=400"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 25 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Formal Slim Trousers – Navy",
    description: "Navy formal trousers with a flat front and slim cut. Crafted from a polyester-viscose blend for a sharp drape that lasts all day.",
    price: 1999,
    image: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400"],
    category: "Men",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },

  // ── MEN · WINTERWEAR ────────────────────────────────────────────────────────
  {
    name: "Fleece Zip-Up Hoodie – Charcoal",
    description: "A full-zip charcoal fleece hoodie with a kangaroo pocket and adjustable drawstring hood. Super cozy for winter mornings and evening walks.",
    price: 2499,
    image: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Puffer Jacket – Midnight Blue",
    description: "A lightweight yet warm puffer jacket with a water-resistant outer shell and down-alternative fill. Packable and perfect for travel.",
    price: 3999,
    image: ["https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=400"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Cable Knit Sweater – Cream",
    description: "A classic cream cable-knit sweater made from a wool-acrylic blend. The ribbed hem and cuffs add a polished finish to this winter essential.",
    price: 2299,
    image: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Sherpa Lined Denim Jacket",
    description: "A rugged denim jacket with a warm sherpa lining — the perfect layering piece for those chilly winter days when you still want to look stylish.",
    price: 3299,
    image: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400"],
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 22 * 24 * 60 * 60 * 1000,
  },

  // ── WOMEN · TOPWEAR ─────────────────────────────────────────────────────────
  {
    name: "Floral Print Wrap Blouse",
    description: "A flowing floral wrap blouse in a vibrant print. Made from lightweight chiffon, it drapes beautifully and transitions effortlessly from day to evening.",
    price: 1099,
    image: ["https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Solid Crop Top – Dusty Rose",
    description: "A chic dusty-rose crop top with a square neckline and short puff sleeves. Made from a soft cotton-blend fabric, it pairs perfectly with high-waist bottoms.",
    price: 699,
    image: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Striped Button-Down Shirt – White & Blue",
    description: "A classic striped shirt with a relaxed fit and roll-up sleeves. A versatile wardrobe staple that works as well at the office as it does on weekends.",
    price: 1299,
    image: ["https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 11 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Embroidered Kurta – Ivory",
    description: "An elegant ivory kurta with delicate floral embroidery at the neckline. Made from soft cotton, it's perfect for festive occasions and casual ethnic wear.",
    price: 1899,
    image: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 9 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Fitted Ribbed Tank Top – Black",
    description: "A versatile black ribbed tank top with a scoop neckline. Made from a stretchy cotton-blend, it's the perfect base layer or standalone top for warm days.",
    price: 549,
    image: ["https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400"],
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 16 * 24 * 60 * 60 * 1000,
  },

  // ── WOMEN · BOTTOMWEAR ──────────────────────────────────────────────────────
  {
    name: "High-Waist Flared Jeans – Dark Indigo",
    description: "Dark indigo high-waist flared jeans crafted from stretch denim. The flared hem adds a retro-chic touch while keeping you comfortable all day.",
    price: 2399,
    image: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400"],
    category: "Women",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 13 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Floral Midi Skirt – Sage Green",
    description: "A flowy sage-green midi skirt with an all-over floral print and elasticated waistband. Perfect for spring brunches and garden parties.",
    price: 1599,
    image: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400"],
    category: "Women",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 17 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Slim Fit Palazzo Pants – Beige",
    description: "Elegant wide-leg palazzo pants in a neutral beige. Made from a flowy fabric, they're comfortable enough for long hours while looking effortlessly stylish.",
    price: 1299,
    image: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400"],
    category: "Women",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 21 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Yoga Leggings – Midnight Black",
    description: "High-performance midnight black yoga leggings with a wide waistband and four-way stretch fabric. Perfect for yoga, gym sessions, or casual wear.",
    price: 1099,
    image: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400"],
    category: "Women",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 28 * 24 * 60 * 60 * 1000,
  },

  // ── WOMEN · WINTERWEAR ──────────────────────────────────────────────────────
  {
    name: "Oversized Turtleneck Sweater – Camel",
    description: "A luxuriously soft camel turtleneck sweater with an oversized fit. Made from a premium wool-blend, it's the ultimate cozy winter wardrobe staple.",
    price: 2799,
    image: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Long Woolen Coat – Charcoal Grey",
    description: "A tailored charcoal-grey woolen coat with double-breasted buttons and a belted waist. A timeless investment piece for the colder months.",
    price: 5999,
    image: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Quilted Puffer Vest – Burgundy",
    description: "A sleeveless burgundy quilted vest with a zip-up front and side pockets. Great as a mid-layer on cold days without restricting arm movement.",
    price: 2199,
    image: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 19 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Fleece Pullover Hoodie – Lavender",
    description: "A soft lavender fleece pullover hoodie with a kangaroo pocket. Lightweight yet warm — perfect for indoor lounging and casual outings during winter.",
    price: 1899,
    image: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400"],
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 26 * 24 * 60 * 60 * 1000,
  },

  // ── KIDS · TOPWEAR ──────────────────────────────────────────────────────────
  {
    name: "Cartoon Graphic Tee – Dino Print",
    description: "A fun dino-print graphic tee for kids made from 100% soft cotton. The vibrant print and comfortable fit make it a favourite for school and playdates.",
    price: 449,
    image: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Pastel Striped Polo – Sky Blue",
    description: "A neat sky-blue striped polo for kids with a classic collar and short sleeves. Soft, easy to wash, and perfect for both school and casual outings.",
    price: 599,
    image: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 9 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Hooded Sweatshirt – Orange",
    description: "A bright orange hooded sweatshirt for kids with a front kangaroo pocket. Warm, durable, and easy to layer for school mornings.",
    price: 799,
    image: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Full Sleeve Henley – Mint Green",
    description: "A mint-green full-sleeve Henley for kids made from soft cotton. The button placket and relaxed fit keep little ones comfortable all day long.",
    price: 549,
    image: ["https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400"],
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 16 * 24 * 60 * 60 * 1000,
  },

  // ── KIDS · BOTTOMWEAR ───────────────────────────────────────────────────────
  {
    name: "Elastic Waist Joggers – Heather Grey",
    description: "Comfortable heather-grey joggers with an elastic waistband and tapered fit. Made from soft cotton-blend fleece — great for school, play, and lounging.",
    price: 699,
    image: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"],
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Denim Shorts – Light Wash",
    description: "Light-wash denim shorts with an adjustable waistband and two front pockets. Durable and perfect for active kids during summer months.",
    price: 799,
    image: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400"],
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 23 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Printed Leggings – Unicorn Pattern",
    description: "Fun unicorn-print leggings for kids made from a soft stretchy fabric. Full-length with an elastic waist, they're comfortable for all-day wear.",
    price: 499,
    image: ["https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400"],
    category: "Kids",
    subCategory: "Bottomwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },

  // ── KIDS · WINTERWEAR ───────────────────────────────────────────────────────
  {
    name: "Puffer Jacket – Red",
    description: "A bright red puffer jacket for kids with a zip-up front, hood, and cozy filling. Lightweight enough for school commutes, warm enough for winter days.",
    price: 1999,
    image: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"],
    category: "Kids",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Fleece Zip Hoodie – Navy",
    description: "A navy fleece zip-up hoodie for kids with thumb-hole cuffs and a soft inner lining. Perfect for layering on cold school mornings.",
    price: 1299,
    image: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=400"],
    category: "Kids",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Knit Sweater – Reindeer Print",
    description: "A festive reindeer-print knit sweater for kids — warm, playful, and perfect for the holiday season. Made from a soft acrylic blend with ribbed cuffs.",
    price: 999,
    image: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400"],
    category: "Kids",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: true,
    date: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Sherpa Lined Bomber Jacket – Brown",
    description: "A stylish brown bomber jacket for kids with sherpa lining, zip-up front, and ribbed collar. Warm, durable, and great for outdoor activities.",
    price: 2499,
    image: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400"],
    category: "Kids",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    bestseller: false,
    date: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// USERS (10 users — passwords hashed)
// ─────────────────────────────────────────────────────────────────────────────
const rawUsers = [
  { name: "Aarav Sharma",    email: "aarav.sharma@gmail.com",    password: "Test@1234" },
  { name: "Priya Mehta",     email: "priya.mehta@gmail.com",     password: "Test@1234" },
  { name: "Rohan Gupta",     email: "rohan.gupta@gmail.com",     password: "Test@1234" },
  { name: "Sneha Kapoor",    email: "sneha.kapoor@gmail.com",    password: "Test@1234" },
  { name: "Karan Verma",     email: "karan.verma@gmail.com",     password: "Test@1234" },
  { name: "Anjali Singh",    email: "anjali.singh@gmail.com",    password: "Test@1234" },
  { name: "Vikram Nair",     email: "vikram.nair@gmail.com",     password: "Test@1234" },
  { name: "Pooja Iyer",      email: "pooja.iyer@gmail.com",      password: "Test@1234" },
  { name: "Arjun Malhotra",  email: "arjun.malhotra@gmail.com",  password: "Test@1234" },
  { name: "Deepika Reddy",   email: "deepika.reddy@gmail.com",   password: "Test@1234" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESSES (reused across orders)
// ─────────────────────────────────────────────────────────────────────────────
const addresses = [
  { firstName:"Aarav",   lastName:"Sharma",   email:"aarav.sharma@gmail.com",   street:"12 Rajouri Garden",     city:"New Delhi",  state:"Delhi",         zipcode:"110027", country:"India", phone:"9876543210" },
  { firstName:"Priya",   lastName:"Mehta",    email:"priya.mehta@gmail.com",    street:"45 Bandra West",        city:"Mumbai",     state:"Maharashtra",   zipcode:"400050", country:"India", phone:"9823456781" },
  { firstName:"Rohan",   lastName:"Gupta",    email:"rohan.gupta@gmail.com",    street:"7 Salt Lake Sector V",  city:"Kolkata",    state:"West Bengal",   zipcode:"700091", country:"India", phone:"9734567892" },
  { firstName:"Sneha",   lastName:"Kapoor",   email:"sneha.kapoor@gmail.com",   street:"23 Indiranagar",        city:"Bengaluru",  state:"Karnataka",     zipcode:"560038", country:"India", phone:"9645678903" },
  { firstName:"Karan",   lastName:"Verma",    email:"karan.verma@gmail.com",    street:"88 Anna Nagar East",    city:"Chennai",    state:"Tamil Nadu",    zipcode:"600102", country:"India", phone:"9556789014" },
  { firstName:"Anjali",  lastName:"Singh",    email:"anjali.singh@gmail.com",   street:"3 Civil Lines",         city:"Jaipur",     state:"Rajasthan",     zipcode:"302006", country:"India", phone:"9467890125" },
  { firstName:"Vikram",  lastName:"Nair",     email:"vikram.nair@gmail.com",    street:"15 Thrippunithura",     city:"Kochi",      state:"Kerala",        zipcode:"682301", country:"India", phone:"9378901236" },
  { firstName:"Pooja",   lastName:"Iyer",     email:"pooja.iyer@gmail.com",     street:"56 Madhapur",           city:"Hyderabad",  state:"Telangana",     zipcode:"500081", country:"India", phone:"9289012347" },
  { firstName:"Arjun",   lastName:"Malhotra", email:"arjun.malhotra@gmail.com", street:"9 Model Town",          city:"Ludhiana",   state:"Punjab",        zipcode:"141002", country:"India", phone:"9190123458" },
  { firstName:"Deepika", lastName:"Reddy",    email:"deepika.reddy@gmail.com",  street:"34 Jubilee Hills",      city:"Hyderabad",  state:"Telangana",     zipcode:"500033", country:"India", phone:"9001234569" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
const seed = async () => {
  await connectDB();

  // ── Clear existing data ──
  await productModel.deleteMany({});
  await userModel.deleteMany({});
  await orderModel.deleteMany({});
  console.log("🗑️  Cleared existing products, users, orders");

  // ── Insert Products ──
  const insertedProducts = await productModel.insertMany(products);
  console.log(`✅ Inserted ${insertedProducts.length} products`);

  // ── Insert Users (with hashed passwords) ──
  const hashedUsers = await Promise.all(
    rawUsers.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
      cartData: {},
    }))
  );
  const insertedUsers = await userModel.insertMany(hashedUsers);
  console.log(`✅ Inserted ${insertedUsers.length} users`);

  // ── Build Orders ──
  const productIds = insertedProducts.map((p) => p._id.toString());
  const statuses   = ["Order Placed", "Packing", "Shipped", "Out for Delivery", "Delivered"];
  const methods    = ["COD", "Razorpay", "Stripe"];

  const orders = [];

  insertedUsers.forEach((user, i) => {
    // Each user gets 3-5 orders
    const numOrders = 3 + (i % 3);

    for (let o = 0; o < numOrders; o++) {
      // Each order has 1-4 items
      const numItems = 1 + ((i + o) % 4);
      const items = [];
      let amount = 0;

      for (let k = 0; k < numItems; k++) {
        const prod = insertedProducts[(i * 5 + o * 3 + k) % insertedProducts.length];
        const qty  = 1 + (k % 3);
        items.push({
          _id:      prod._id.toString(),
          name:     prod.name,
          price:    prod.price,
          quantity: qty,
          size:     prod.sizes[(k) % prod.sizes.length],
          image:    prod.image,
        });
        amount += prod.price * qty;
      }

      amount += 199; // delivery fee

      orders.push({
        userId:        user._id.toString(),
        items,
        amount,
        address:       addresses[i],
        status:        statuses[(i + o) % statuses.length],
        paymentMethod: methods[(i + o) % methods.length],
        payment:       (i + o) % 3 !== 0,
        date:          Date.now() - (i * 7 + o * 2) * 24 * 60 * 60 * 1000,
      });
    }
  });

  const insertedOrders = await orderModel.insertMany(orders);
  console.log(`✅ Inserted ${insertedOrders.length} orders`);

  // ── Summary ──
  console.log("\n📦 Seed Summary");
  console.log("─────────────────────────────────");
  console.log(`Products : ${insertedProducts.length}`);
  console.log(`Users    : ${insertedUsers.length}   (password: Test@1234 for all)`);
  console.log(`Orders   : ${insertedOrders.length}`);
  console.log("─────────────────────────────────");
  console.log("🎉 Database seeded successfully!\n");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});