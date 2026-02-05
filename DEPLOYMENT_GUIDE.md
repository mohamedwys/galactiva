# 📦 Dermadia AI Skin Analyzer - Deployment Guide

**Production-Ready Implementation for Shopify Dawn Theme**

---

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] n8n webhook is active and responding correctly
- [ ] Test image analysis with real photos (various skin types)
- [ ] All assets are uploaded to Shopify
- [ ] Page is created in Shopify admin
- [ ] Hero image is optimized and uploaded
- [ ] Mobile testing completed
- [ ] Error handling tested
- [ ] GDPR compliance verified

---

## 📁 Files Overview

### Assets (to be uploaded to `Shopify Admin > Online Store > Themes > ... > Actions > Edit code > Assets`)

1. **skin-analyzer.js** (Production JavaScript)
   - Image optimization
   - n8n webhook integration
   - Toast notifications
   - Rate limiting
   - Defensive programming

2. **skin-analyzer.css** (Modern Design System)
   - Responsive design
   - Toast notifications
   - Loading states
   - Accessibility features

### Templates (already in theme)

3. **page.skin-analyzer.liquid** (Page Template)
   - Asset loading
   - Section rendering

4. **skin-analyzer-content.liquid** (Section)
   - Full UI structure
   - Hero section
   - Results sections
   - FAQ

---

## 🚀 Step-by-Step Deployment

### Step 1: Upload Assets

1. Go to: **Shopify Admin > Online Store > Themes**
2. Click **Actions > Edit code** on your Dawn theme
3. Navigate to **Assets** folder
4. Upload or update:
   - `skin-analyzer.js`
   - `skin-analyzer.css`

### Step 2: Verify Templates & Sections

1. In the code editor, check:
   - `templates/page.skin-analyzer.liquid` exists
   - `sections/skin-analyzer-content.liquid` exists
2. If missing, create them with the provided code

### Step 3: Create the Page

1. Go to: **Shopify Admin > Online Store > Pages**
2. Click **Add page**
3. Fill in:
   - **Title**: `Analyse de Peau IA` (or your preferred title)
   - **Content**: Leave empty (the template handles everything)
4. Scroll down to **Theme templates**
5. Click **Change template**
6. Select: **page.skin-analyzer**
7. Click **Save**

### Step 4: Configure Section Settings (Optional)

1. Go to: **Online Store > Themes > Customize**
2. Navigate to the Skin Analyzer page
3. Click on the **Skin Analyzer** section
4. Upload a hero image (recommended: 2000x1200px)
5. Customize hero title/subtitle if desired
6. Click **Save**

### Step 5: Set Page Visibility

1. In Pages, find your Skin Analyzer page
2. Under **Online Store** visibility:
   - Check **Visible** to make it public
3. **Save**

### Step 6: Add to Navigation (Optional)

1. Go to: **Shopify Admin > Online Store > Navigation**
2. Edit your main menu
3. Add menu item:
   - **Name**: `Analyse de Peau`
   - **Link**: Select your skin analyzer page
4. **Save**

---

## 🔧 Configuration

### Webhook URL

The webhook URL is hardcoded in `skin-analyzer.js` line 13:

```javascript
webhookUrl: 'https://dermadia.app.n8n.cloud/webhook/image-analysis',
```

**To change it:**
1. Edit `assets/skin-analyzer.js`
2. Update line 13 with your webhook URL
3. Save

### Rate Limiting

Default: 10 seconds between analyses (client-side only).

**To adjust:**
1. Edit `assets/skin-analyzer.js`
2. Line 28: `minTimeBetweenRequests: 10000`
3. Change value (milliseconds)

### Image Optimization Settings

**To adjust:**
1. Edit `assets/skin-analyzer.js`
2. Lines 16-19:
   ```javascript
   maxImageWidth: 1200,
   maxImageHeight: 1200,
   imageQuality: 0.85,
   ```

---

## 🧪 Post-Deployment Testing

After deployment, test:

### ✅ Basic Functionality
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] "Commencer mon analyse" button works
- [ ] File upload triggers on click
- [ ] Drag & drop works

### ✅ Upload & Analysis
- [ ] JPG upload works
- [ ] PNG upload works
- [ ] WEBP upload works
- [ ] File size validation (reject >10MB)
- [ ] Format validation (reject .gif, .bmp, etc.)
- [ ] Loading overlay appears
- [ ] Analysis completes successfully
- [ ] Results display correctly

### ✅ Results Display
- [ ] Skin type extracted and displayed
- [ ] Gamme Dermadia recommendation shown
- [ ] Observations list populated
- [ ] Priorities list populated
- [ ] Morning routine generated
- [ ] Evening routine generated
- [ ] Products displayed with images
- [ ] Product buttons link correctly

### ✅ Error Handling
- [ ] Invalid file format shows error toast
- [ ] Oversized file shows error toast
- [ ] Network timeout shows error toast
- [ ] Rate limiting works (< 10 seconds)
- [ ] n8n error handled gracefully

### ✅ Mobile Testing
- [ ] Responsive layout on iPhone
- [ ] Responsive layout on Android
- [ ] Touch interactions work
- [ ] Camera access works (mobile)
- [ ] Toasts display correctly
- [ ] Loading overlay centers correctly

### ✅ Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Firefox
- [ ] Edge

### ✅ Performance
- [ ] Page loads in < 3 seconds
- [ ] Images lazy load
- [ ] No console errors
- [ ] No layout shift (CLS)
- [ ] Smooth scrolling

---

## 🐛 Troubleshooting

### Issue: Page returns 404

**Solution:**
- Ensure the page template is named exactly: `page.skin-analyzer.liquid`
- Verify the page is using the correct template in Shopify admin

### Issue: JavaScript not running

**Solution:**
1. Check browser console for errors
2. Verify `skin-analyzer.js` is uploaded to Assets
3. Clear Shopify theme cache
4. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: CSS not loading

**Solution:**
1. Verify `skin-analyzer.css` is in Assets
2. Check template includes: `{{ 'skin-analyzer.css' | asset_url | stylesheet_tag }}`
3. Clear browser cache

### Issue: Analysis fails silently

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Verify n8n webhook is active
4. Test webhook with Postman/curl
5. Check CORS settings on n8n

### Issue: Products not linking correctly

**Solution:**
1. Verify product handles in n8n response match Shopify products
2. Check handle format: `product-name-lowercase-with-dashes`
3. Ensure products are published

### Issue: Loading never stops

**Solution:**
1. Check network tab for failed requests
2. Verify webhook timeout (90s default)
3. Check n8n workflow for errors
4. Ensure Claude API key is valid

---

## 🔐 Security Notes

### Client-Side Rate Limiting
- Basic protection: 10 seconds between requests
- NOT secure against determined abuse
- Consider server-side rate limiting for production

### Webhook Exposure
- Webhook URL is visible in JavaScript
- n8n should validate requests
- Consider adding request signing

### GDPR Compliance
- Images are NOT stored (client-side only)
- Base64 sent to n8n → Claude → deleted
- No cookies used
- No tracking implemented

---

## 📊 Monitoring

### Key Metrics to Track

1. **Usage Analytics**
   - Number of analyses per day
   - Completion rate
   - Error rate

2. **Performance**
   - Average analysis time
   - Image upload time
   - n8n response time

3. **User Behavior**
   - Bounce rate on page
   - Product click-through rate
   - Return analysis rate

### Recommended Tools
- Google Analytics 4
- Shopify Analytics
- n8n execution logs
- Sentry (for error tracking)

---

## 🔄 Maintenance

### Regular Checks (Weekly)
- [ ] n8n workflow execution logs
- [ ] Error rate in browser console
- [ ] Product handle mapping accuracy
- [ ] Mobile compatibility

### Monthly Review
- [ ] Claude API usage/costs
- [ ] User feedback
- [ ] Results accuracy
- [ ] A/B testing opportunities

---

## 🆘 Support

### Getting Help

1. **Check browser console** (F12) for errors
2. **Review n8n logs** for webhook issues
3. **Test webhook directly** with curl/Postman
4. **Verify Shopify theme** is Dawn or compatible

### Common Issues

**Q: Can I use this on a theme other than Dawn?**
A: Yes, but you may need to adjust CSS variable names and container classes.

**Q: How do I change the French text to another language?**
A: Edit the text directly in `skin-analyzer-content.liquid` and `skin-analyzer.js` (toast messages, etc.)

**Q: Can I add more product recommendations?**
A: Yes, the JavaScript handles up to 6 products. Modify n8n workflow to return more.

**Q: How do I add authentication/login requirement?**
A: Wrap the page in a template that requires login, or add custom Liquid logic at the top of `page.skin-analyzer.liquid`.

---

## ✅ Production Checklist

Before going live:

- [ ] All tests passing
- [ ] Mobile tested on real devices
- [ ] Error handling verified
- [ ] Loading states tested
- [ ] Products linking correctly
- [ ] n8n webhook stable
- [ ] Claude API quota sufficient
- [ ] Legal disclaimer visible
- [ ] Privacy policy updated (if needed)
- [ ] Hero image optimized
- [ ] Page SEO optimized
- [ ] Analytics tracking added

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Version:** 1.0.0 Production
