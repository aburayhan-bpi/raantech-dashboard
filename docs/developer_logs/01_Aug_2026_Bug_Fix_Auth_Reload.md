# Bug Fix Report: Admin Dashboard Reload Issue (Sidebar Blank)
**Date:** 01 August 2026
**Time:** Afternoon

## ১. সমস্যাটি কী ছিল? (The Problem)
ইউজার রিপোর্ট করেন যে, এডমিন প্যানেলে লগইন করার পর যখন "Products" পেজে যাওয়া হয় তখন সবকিছু ঠিকঠাক দেখায়। কিন্তু প্রোডাক্ট পেজটি **রিলোড (Reload)** করলেই পুরো ড্যাশবোর্ড ব্ল্যাংক হয়ে যায়, সাইডবার গায়েব হয়ে যায় এবং ইউজারকে রিডাইরেক্ট করে এডমিন হোমপেজে (`/dashboard/admin`) পাঠিয়ে দেওয়া হয়। মজার ব্যাপার হলো, Super Admin-এর ক্ষেত্রে এই সমস্যাটি হচ্ছিল না, শুধুমাত্র Admin-দের ক্ষেত্রে হচ্ছিল।

## ২. কেন হচ্ছিল? (Root Cause Analysis)
সমস্যাটি ছিল বেশ ডিপ এবং কয়েকটি ঘটনার চেইন রিয়েকশন:

### স্টেপ ১: Unwanted API Call in `ProductModal`
`ProductsClient.tsx` পেজে `ProductModal` নামে একটি কম্পোনেন্ট ছিল যা পেজ লোড হওয়ার সাথে সাথেই মাউন্ট হতো। এই মডালের ভেতরে `useGetCategoriesQuery()` কল করা ছিল।
সমস্যা হলো, এডমিন ইউজারকে শুধুমাত্র `products:view` এর পারমিশন দেওয়া হয়েছিল, `categories:view` এর নয়। ফলে পেজ রিলোড হওয়ার সাথে সাথে ক্যাটাগরির API কল হতো এবং ব্যাকএন্ড থেকে **401 Unauthorized** এরর আসতো।

### স্টেপ ২: The Token Refresh Bug in `baseApi.ts`
যেকোনো 401 এরর পেলে আমাদের RTK Query এর `baseApi.ts` স্বয়ংক্রিয়ভাবে টোকেন রিফ্রেশ করার চেষ্টা করে। এই ক্ষেত্রেও সে রিফ্রেশ API (`/auth/refresh`) কল করেছিল এবং রিফ্রেশ সফলও হয়েছিল।
কিন্তু `baseApi.ts`-এ একটি বাগ ছিল: 
সে নতুন টোকেনগুলোকে রেসপন্সের রুট থেকে (`refreshResult.data.accessToken`) খুঁজছিল, অথচ ব্যাকএন্ড রেসপন্স পাঠাচ্ছিল `refreshResult.data.data.accessToken` ফরমেটে। 
যেহেতু সে টোকেন খুঁজে পায়নি, তাই সে Redux-এ `accessToken` এবং `refreshToken` কে **`undefined` (বা null)** সেট করে দেয়!

### স্টেপ ৩: The Logout Chain Reaction
টোকেন null হয়ে যাওয়ার পর, `baseApi` অরিজিনাল ক্যাটাগরি API টিকে আবার কল (retry) করে এবং স্বভাবতই আবার 401 এরর খায়। এরপর যখনই ইউজার রিলোড দেয়, তখন Redux-এ টোকেন `null` থাকায় `baseApi` সাথে সাথেই **`logout()`** ডিসপ্যাচ করে দেয়।
এর ফলে Redux-এর ইউজার স্টেট `null` হয়ে যায় এবং ব্রাউজারের LocalStorage-এ `{"user": null}` সেভ হয়ে যায়।

### স্টেপ ৪: The Infinite Dashboard Redirection
লগআউট হওয়ার পর ইউজারকে `/login` পেজে পাঠানো হয়। কিন্তু ব্রাউজারের HTTP-Only কুকিতে আগে থেকেই ভ্যালিড `auth_token` ছিল (যেটি ফ্রন্টএন্ড থেকে মোছা সম্ভব নয়)। 
তাই Next.js এর `middleware.ts` ইউজারকে লগইন পেজ থেকে আবার `/dashboard/admin`-এ রিডাইরেক্ট করে দেয়।
ড্যাশবোর্ডে আসার পর `layout.tsx` লোড হয়, কিন্তু Redux-এ ইউজার `null` থাকায় `sidebar.tsx` কোনো মেনু দেখাতে পারে না এবং পুরো সাইডবার ব্ল্যাংক হয়ে যায়!

## ৩. কীভাবে ফিক্স করা হলো? (The Solution)

আমি মূলত দুটি ফাইলে পরিবর্তন করে পুরো সমস্যাটির সমাধান করেছি:

**১. `src/redux/api/baseApi.ts` ফিক্সড করা হয়েছে:**
টোকেন রিফ্রেশের রেসপন্স পার্সিং লজিকটি আপডেট করে দিয়েছি যাতে এটি সঠিকভাবে `.data.accessToken` থেকে টোকেনগুলো নিতে পারে। 
```typescript
if (refreshResult.data) {
  const responseData = refreshResult.data as { data: { accessToken: string; refreshToken?: string } };
  
  if (responseData.data && responseData.data.accessToken) {
    api.dispatch(setTokens(responseData.data));
    // Retry original
    result = await rawBaseQuery(args, api, extraOptions);
  } else { ... }
}
```
এর ফলে ভবিষ্যতে কখনো 401 এরর এসে টোকেন রিফ্রেশ হলেও Redux-এর টোকেন আর করাপ্ট (null) হবেশে না।

**২. `src/components/dashboard/pages/super-admin/products/ProductModal.tsx` ফিক্সড করা হয়েছে:**
আমি `useGetCategoriesQuery` হুকে একটি `skip` কন্ডিশন যুক্ত করে দিয়েছি। 
```typescript
const hasCategoryViewPermission = isSuperAdmin || (user?.permissions || []).includes("categories:view");

const { data: categoriesData, refetch: refetchCategories, isFetching: isFetchingCategories } = useGetCategoriesQuery(undefined, {
  skip: !hasCategoryViewPermission
});
```
এখন যদি ইউজারের `categories:view` পারমিশন না থাকে, তবে এই API কলটি এক্সিকিউটই হবে না। ফলে অযথা 401 এরর তৈরি হয়ে সিস্টেমকে লগআউটের দিকে ঠেলে দিবে না। 

এই দুই ফিক্সের মাধ্যমে Admin ড্যাশবোর্ডের রিলোড ইস্যুটি পার্মানেন্টলি সমাধান করা হয়েছে।
