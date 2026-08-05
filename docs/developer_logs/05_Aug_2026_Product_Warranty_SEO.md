# 📝 Developer Log: Product Warranty & SEO Integration
**তারিখ:** ০৫ আগস্ট, ২০২৬

---

## 🎯 প্রজেক্টের ওভারভিউ
আজকের মূল টার্গেট ছিল সিস্টেমের প্রডাক্ট মডিউলে **Warranty (ওয়ারেন্টি)** এবং **SEO Metadata** যুক্ত করা। যেহেতু এটি একটি ইকমার্স/ইনভেন্টরি সিস্টেম, তাই প্রডাক্টের সাথে এই ইনফরমেশনগুলো থাকাটা বিজনেসের জন্য অত্যন্ত গুরুত্বপূর্ণ। 

নিচে বিস্তারিতভাবে "কী, কেন, কীভাবে এবং কোথায়" কাজ করা হয়েছে তার লগ দেওয়া হলো:

---

## ১. ডাটাবেস এবং স্কিমা আপডেট (Database Level)

**কী (What):** 
প্রডাক্ট স্কিমাতে `warrantyType`, `warrantyPeriod`, `isReturnable`, `returnWindow`, `metaTitle`, `metaDescription`, `metaKeywords` ফিল্ডগুলো যোগ করা হয়েছে। 

**কেন (Why):** 
- হেডফোন, পাওয়ারব্যাংকের মতো গ্যাজেটগুলোর ক্ষেত্রে ওয়ারেন্টি ট্র্যাকিং বাধ্যতামূলক।
- ভবিষ্যতে ইকমার্স ফ্রন্টএন্ডে গুগল সার্চ বা SEO থেকে অর্গানিক ট্রাফিক আনার জন্য মেটা ডেটা সেভ করে রাখা প্রয়োজন।
- সিস্টেমে যেন ইচ্ছেমতো ভুলভাল ডেটা সেভ না হয়, সেজন্য `backend.ts` এ নির্দিষ্ট কিছু টাইপ (Official, Shop) বলে দেওয়া হয়েছে।

**কীভাবে (How):** 
Mongoose স্কিমাতে নতুন প্রপার্টিগুলো অ্যাড করা হয়েছে এবং TypeScript এর `IProduct` ইন্টারফেসটি আপডেট করা হয়েছে, যেন পুরো প্রজেক্টে টাইপ-সেফটি বজায় থাকে। 

**কোথায় (Where):** 
- `src/models/Product.ts` (Mongoose Schema আপডেট)
- `src/types/backend.ts` (`WARRANTY_TYPES` Enum যুক্ত করা)
- `src/types/global.ts` (`IProduct` ইন্টারফেস আপডেট)

---

## ২. API সিকিউরিটি ও ভ্যালিডেশন (API Layer)

**কী (What):** 
Create (POST) এবং Update (PUT/PATCH) API-তে নতুন ফিল্ডগুলোর জন্য Zod ভ্যালিডেশন যোগ করা হয়েছে।

**কেন (Why):** 
ইউজার বা হ্যাকার যেন API-এর মাধ্যমে ভুল বা ক্ষতিকর কোনো ডেটা ডাটাবেসে পাঠাতে না পারে, সেটি নিশ্চিত করার জন্য। 

**কীভাবে (How):** 
`z.object()` স্কিমার ভেতরে নতুন ফিল্ডগুলোকে `z.string().optional()` এবং `z.boolean().optional()` হিসেবে ডিফাইন করা হয়েছে।

**কোথায় (Where):** 
- `src/app/api/v1/products/route.ts` (ProductCreateSchema)
- `src/app/api/v1/products/[slug]/route.ts` (ProductUpdateSchema)

---

## ৩. ড্যাশবোর্ড ইউজার ইন্টারফেস (UI/UX)

**কী (What):** 
ড্যাশবোর্ডের প্রডাক্ট অ্যাড/এডিট ফর্মে এবং বিস্তারিত পেজে নতুন ফিল্ডগুলোর UI ডিজাইন করা হয়েছে। 

**কেন (Why):** 
সিস্টেমের অ্যাডমিন বা স্টাফরা যেন খুব সহজেই প্রডাক্ট আপলোডের সময় ওয়ারেন্টি ও রিটার্ন পলিসি টিক দিয়ে সিলেক্ট করতে পারে এবং SEO ইনফো বসাতে পারে। 

**কীভাবে (How):** 
- `react-hook-form` এর `Controller` ব্যবহার করে Radix UI-এর কাস্টম `Checkbox` ইন্টিগ্রেট করা হয়েছে, যাতে ডিজাইন নেটিভ HTML-এর মতো বোরিং না হয়ে মডার্ন ড্যাশবোর্ডের সাথে ম্যাচ করে।
- প্রডাক্ট ডিটেইলস পেজে দুটি সুন্দর কার্ড (`Warranty & Return Policy` এবং `SEO Metadata`) তৈরি করে ডেটা রেন্ডার করা হয়েছে।

**কোথায় (Where):** 
- `src/components/dashboard/pages/super-admin/products/ProductModal.tsx`
- `src/components/dashboard/pages/super-admin/products/ProductDetailsClient.tsx`

---

## ৪. ইনভয়েস এবং কনফার্মেশন ইমেইল (Customer Experience)

**কী (What):** 
কাস্টমারকে দেওয়া মানি রিসিট (Invoice) এবং ইমেইলে পাঠানো Order Confirmation রিসিটে প্রডাক্টের নামের নিচে ওয়ারেন্টির মেয়াদ (যেমন: `Warranty: 1 Year`) যুক্ত করা হয়েছে।

**কেন (Why):** 
এটি একটি অত্যন্ত প্রফেশনাল অ্যাপ্রোচ। কাস্টমার যখন কিছু কিনবে, তখন ইনভয়েসেই ওয়ারেন্টি লেখা থাকলে পরবর্তীতে ক্লেইম করার সময় কোনো ঝামেলা বা কনফিউশন তৈরি হবে না। 

**কীভাবে (How):** 
- Sales API থেকে যখন ইমেইল পাঠানোর ট্রিগার হয়, তখন প্রডাক্টের ডেটা পপুলেট করে সেখান থেকে `warrantyPeriod` ইমেইল টেমপ্লেটে পাঠানো হয়েছে।
- EJS টেমপ্লেটে শর্ত দিয়ে দেওয়া হয়েছে যে, যদি ওয়ারেন্টি থাকে, তবেই সেটি রেন্ডার হবে।

**কোথায় (Where):** 
- `src/components/dashboard/pages/super-admin/sales/SaleDetailsClient.tsx` (UI Invoice)
- `src/app/api/v1/sales/route.ts` (Email data parsing)
- `src/templates/emails/order-confirmation.ejs` (HTML Email Template)

---

## ৫. ডেটা ইম্পোর্ট ও এক্সপোর্ট গ্যাপ ফিক্স (Data Integrity)

**কী (What):** 
এক্সেল (Excel) ফাইলে প্রডাক্ট ইম্পোর্ট এবং এক্সপোর্ট করার API-তে নতুন ফিল্ডগুলোর সাপোর্ট যুক্ত করা হয়েছে। 

**কেন (Why):** 
যদি এই কাজটা না করা হতো (গ্যাপ থেকে যেত), তাহলে অ্যাডমিন যখন পুরো সিস্টেমের প্রডাক্ট এক্সেলে ডাউনলোড করতেন, তখন ওয়ারেন্টি ও SEO এর কলামগুলো মিসিং থাকত। 

**কীভাবে (How):** 
এক্সপোর্টের সময় Mongoose থেকে পাওয়া ডেটা ম্যাপ করে নতুন কলাম (`Warranty Type`, `Meta Title` ইত্যাদি) বানানো হয়েছে এবং ইম্পোর্টের সময় স্প্রেডশিটের সেল (Cell) থেকে ডেটাগুলো রিড করে ডাটাবেসে সেভ করার লজিক দেওয়া হয়েছে। 

**কোথায় (Where):** 
- `src/app/api/v1/products/export/route.ts`
- `src/app/api/v1/products/import/route.ts`

---

## ৬. 💡 Business Logic: Profit Margin vs Markup
**কী (What):** 
ড্যাশবোর্ডের প্রফিট ক্যালকুলেটরে `Selling Price`-এর ওপর ভিত্তি করে গ্রস প্রফিট মার্জিন (Gross Profit Margin) হিসাব করার লজিক ঠিক রাখা হয়েছে এবং এর পেছনের বিজনেস রুলস ডকুমেন্ট করা হয়েছে।

**কেন (Why):** 
নতুন ব্যবসায়ীরা অনেক সময় `Buying Price`-এর ওপর প্রফিট হিসাব করেন (যাকে Markup বলে)। কিন্তু গ্লোবাল অ্যাকাউন্টিং স্ট্যান্ডার্ড (Tally, QuickBooks, Shopify) অনুযায়ী প্রফিট মার্জিন সবসময় `Selling Price`-এর ওপর হিসাব হয়। 
এর কারণ:
- **ডিসকাউন্ট ক্যালকুলেশন:** Sales Price-এর ওপর ডিসকাউন্ট দিলে রিয়েল মার্জিন কত থাকছে, তা সঠিকভাবে বের করতে Margin-ই লাগে, Markup নয়।
- **সেলস কমিশন:** কমিশন সবসময় Sales Volume-এর ওপর দেওয়া হয়। 
- **ফাইন্যান্সিয়াল স্টেটমেন্ট:** Income Statement-এ গ্রস প্রফিট মার্জিন সবসময় Total Revenue-এর ওপর ভিত্তি করে বের করা হয়। 

**কীভাবে (How):** 
লজিকটি হলো: `(Profit / Selling Price) * 100`। কোডে এই স্ট্যান্ডার্ড লজিকটিই অপরিবর্তিত রাখা হয়েছে যেন সিস্টেমে কোনো ফাইন্যান্সিয়াল কনফিউশন তৈরি না হয়। 

**কোথায় (Where):** 
- `src/components/shared/ProfitCalculatorInput.tsx`

---

## 🚀 ডিপ্লয়মেন্ট এবং ভেরিফিকেশন
উপরের সব কাজ শেষ করার পর প্রজেক্টে **`pnpm check`** (ESLint + TypeScript Compile + Next.js Production Build) রান করানো হয়। 

পুরো সিস্টেমে **0 Errors** পাওয়ার পর সম্পূর্ণ কোড গিটহাবে পুশ করা হয়েছে। 

**Git Commits:**
1. `feat: add Warranty and SEO Metadata fields to Product module`
2. `feat: add warranty info to product details, invoice UI, emails and export/import APIs`
