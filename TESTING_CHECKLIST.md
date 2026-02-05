# 🧪 Dermadia AI Skin Analyzer - Testing Checklist

**Comprehensive Testing Protocol for Production Deployment**

---

## 🎯 Testing Overview

This checklist ensures the Skin Analyzer is stable, secure, and provides an excellent user experience across all scenarios.

**Test on:**
- Desktop (Chrome, Safari, Firefox, Edge)
- Mobile (iOS Safari, Android Chrome)
- Tablet (iPad, Android tablet)

---

## 1️⃣ Initial Page Load Tests

### Desktop

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Page loads without errors | No console errors, page renders | ☐ | |
| Hero section displays | Full-screen hero with image and overlay | ☐ | |
| Hero title visible | "Découvre ta peau comme jamais" | ☐ | |
| CTA button visible | "Commencer mon analyse" button clickable | ☐ | |
| Badge visible | "Optimisé par IA Claude" badge in corner | ☐ | |
| Privacy notice visible | Lock icon + privacy text | ☐ | |
| How It Works section | 4 steps displayed correctly | ☐ | |
| FAQ section | Accordion items expandable | ☐ | |
| Page width correct | No horizontal scroll | ☐ | |
| Images load | No broken image icons | ☐ | |

### Mobile

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Responsive layout | Single column, readable text | ☐ | |
| Hero height appropriate | Not too tall, content visible | ☐ | |
| Text readable | No tiny fonts | ☐ | |
| Buttons touchable | Large enough to tap easily | ☐ | |
| No side scroll | Content fits screen width | ☐ | |

---

## 2️⃣ File Upload Tests

### Click Upload

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Click CTA button | File picker opens | ☐ | |
| Select JPG file | File accepted | ☐ | |
| Select PNG file | File accepted | ☐ | |
| Select WEBP file | File accepted | ☐ | |
| Select GIF file | Error toast: "Format non supporté" | ☐ | |
| Select PDF file | Error toast shown | ☐ | |
| Select 15MB file | Error toast: "Fichier trop volumineux" | ☐ | |
| Cancel file picker | No error, returns to page | ☐ | |

### Drag & Drop (Desktop)

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Drag image over upload box | Border changes color | ☐ | |
| Drop valid image | Analysis starts | ☐ | |
| Drop invalid file | Error toast shown | ☐ | |
| Drop multiple files | Only first file processed | ☐ | |
| Drag outside and release | No error | ☐ | |

---

## 3️⃣ Analysis Process Tests

### Loading States

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Loading overlay appears | White overlay + spinner | ☐ | |
| Loading message visible | "Préparation de votre image..." | ☐ | |
| Message updates | "Analyse de votre peau en cours..." | ☐ | |
| Page scroll disabled | Cannot scroll behind overlay | ☐ | |
| Overlay centers on mobile | Spinner centered correctly | ☐ | |

### Image Optimization

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Large image (3000x3000px) | Resized to 1200x1200 | ☐ | Check console logs |
| Small image (500x500px) | Not upscaled | ☐ | |
| Portrait image | Maintains aspect ratio | ☐ | |
| Landscape image | Maintains aspect ratio | ☐ | |
| HEIC image (iOS) | Converted and sent | ☐ | Test on iPhone |

### API Communication

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Request sent to n8n | Network tab shows POST request | ☐ | |
| Payload structure correct | Contains: shop, sessionId, image | ☐ | |
| Response received | 200 status code | ☐ | |
| Response parsed | JSON parsed successfully | ☐ | |
| Timeout handling | Error after 90 seconds | ☐ | Simulate slow network |

---

## 4️⃣ Results Display Tests

### Results Section

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Results section appears | Scrolls into view smoothly | ☐ | |
| Skin type extracted | "Peau mixte", "Peau sèche", etc. | ☐ | |
| Gamme recommendation shown | "Sebocylique", "Retilift", etc. | ☐ | |
| Global appearance text | Claude's full analysis visible | ☐ | |
| Observations list | 2-4 bullet points | ☐ | |
| Priorities list | 1-3 bullet points | ☐ | |
| Note disclaimer visible | Warning icon + text | ☐ | |

### Routine Section

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Morning routine card | 4 steps displayed | ☐ | |
| Evening routine card | 4-5 steps displayed | ☐ | |
| Step numbers visible | 1, 2, 3, 4... in circles | ☐ | |
| Role text visible | "Nettoyage", "Sérum", etc. | ☐ | |
| Benefit text visible | Description under each step | ☐ | |
| Tip text visible | Italic tips visible | ☐ | |
| Customized for range | Steps match recommended range | ☐ | Check Sebocylique vs others |

### Products Section

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Products grid visible | Up to 6 products shown | ☐ | |
| Product images load | All images display | ☐ | |
| Product titles visible | Clear, readable text | ☐ | |
| Prices displayed | €X.XX format | ☐ | |
| "Découvrir" buttons work | Click redirects to product page | ☐ | |
| Hover effects | Card lifts on hover (desktop) | ☐ | |
| Mobile layout | 1 column on mobile | ☐ | |
| No products scenario | Section hidden gracefully | ☐ | Test with empty array |

---

## 5️⃣ Toast Notification Tests

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Success toast | Green border, checkmark icon | ☐ | |
| Error toast | Red border, X icon | ☐ | |
| Warning toast | Orange border, warning icon | ☐ | |
| Toast auto-dismiss | Disappears after 5 seconds | ☐ | |
| Multiple toasts | Stack vertically | ☐ | |
| Toast on mobile | Fits screen width | ☐ | |
| Toast readable | Text clear and legible | ☐ | |

---

## 6️⃣ Error Handling Tests

### Network Errors

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Disconnect WiFi mid-analysis | Error toast shown | ☐ | |
| n8n webhook down | Error toast: "Une erreur est survenue" | ☐ | |
| Timeout (>90s) | Error toast about timeout | ☐ | |
| Invalid JSON response | Error caught, toast shown | ☐ | |
| HTTP 500 error | Error toast shown | ☐ | |
| HTTP 404 error | Error toast shown | ☐ | |

### Invalid Data

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Empty response | Graceful fallback | ☐ | |
| Missing `message` field | Fallback text displayed | ☐ | |
| Empty products array | Products section hidden | ☐ | |
| Malformed product object | Product skipped, no crash | ☐ | |
| Missing image URL | Product rendered without image | ☐ | |

### User Errors

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Upload same image twice | Works both times | ☐ | |
| Rapid clicking CTA button | Rate limit prevents spam | ☐ | |
| Click during analysis | Warning toast shown | ☐ | |
| Upload immediately after (<10s) | Warning toast with countdown | ☐ | |

---

## 7️⃣ Rate Limiting Tests

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| First analysis | Proceeds normally | ☐ | |
| Second analysis after 5s | Blocked with warning | ☐ | |
| Second analysis after 11s | Allowed | ☐ | |
| Warning message accurate | Shows correct seconds remaining | ☐ | |
| Rate limit per-device | Survives page refresh | ☐ | Uses timestamp |

---

## 8️⃣ Multiple Analysis Tests

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Complete first analysis | Results displayed | ☐ | |
| Start second analysis | Upload works | ☐ | |
| Second results display | Previous results replaced | ☐ | |
| Third analysis | Still works, no memory leaks | ☐ | |
| Results accuracy | Each analysis independent | ☐ | |

---

## 9️⃣ Mobile-Specific Tests

### iOS Safari

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Camera access | Camera opens when "Take Photo" tapped | ☐ | |
| Photo library | Can select from library | ☐ | |
| HEIC images | Converted and analyzed | ☐ | |
| Portrait photos | Correct orientation | ☐ | |
| Pinch zoom disabled | Cannot zoom page | ☐ | |
| Smooth scrolling | No janky animations | ☐ | |
| Toasts visible | Above keyboard if present | ☐ | |

### Android Chrome

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Camera access | Camera app opens | ☐ | |
| Gallery access | Can select from gallery | ☐ | |
| Various manufacturers | Test Samsung, Pixel, etc. | ☐ | |
| Different screen sizes | Responsive on all | ☐ | |

---

## 🔟 Browser Compatibility Tests

### Chrome (Desktop)

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| All features work | Full functionality | ☐ | |
| Console clean | No errors or warnings | ☐ | |
| Performance good | Smooth interactions | ☐ | |

### Safari (Desktop)

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Page renders correctly | No layout issues | ☐ | |
| File upload works | Picker opens | ☐ | |
| Fetch API works | Analysis completes | ☐ | |
| Modern CSS works | No visual bugs | ☐ | |

### Firefox

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Cross-browser compatibility | Same as Chrome | ☐ | |
| No Firefox-specific bugs | All features work | ☐ | |

### Edge

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Chromium-based compatibility | Same as Chrome | ☐ | |
| No Edge-specific issues | All features work | ☐ | |

---

## 1️⃣1️⃣ Performance Tests

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Page load time | < 3 seconds on 4G | ☐ | |
| Time to interactive | < 4 seconds | ☐ | |
| Largest Contentful Paint | < 2.5 seconds | ☐ | Use Lighthouse |
| Cumulative Layout Shift | < 0.1 | ☐ | |
| First Input Delay | < 100ms | ☐ | |
| Image optimization effective | Reduced file size in logs | ☐ | Check console |
| No memory leaks | After 5+ analyses | ☐ | Use DevTools Memory |

---

## 1️⃣2️⃣ Accessibility Tests

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Keyboard navigation | Can tab through buttons | ☐ | |
| Enter key triggers upload | Works on buttons | ☐ | |
| Focus indicators visible | Blue outline on focus | ☐ | |
| Screen reader compatible | Alt text on images | ☐ | Test with VoiceOver/NVDA |
| Color contrast adequate | WCAG AA compliant | ☐ | Use contrast checker |
| Text resizable | No layout break at 200% | ☐ | |

---

## 1️⃣3️⃣ Security Tests

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| XSS prevention | HTML escaped in results | ☐ | Try `<script>alert(1)</script>` |
| No sensitive data leaked | Check network tab | ☐ | |
| CORS handled correctly | n8n allows origin | ☐ | |
| Rate limiting works | Cannot spam requests | ☐ | |
| No SQL injection vectors | N/A (no database) | ☐ | |

---

## 1️⃣4️⃣ Edge Cases

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| Very small image (50x50px) | Analyzed without error | ☐ | |
| Very large image (10000x10000px) | Resized successfully | ☐ | |
| Black and white photo | Analysis works | ☐ | |
| Low quality image | Analysis completes | ☐ | |
| Dark skin tone | Accurate analysis | ☐ | |
| Light skin tone | Accurate analysis | ☐ | |
| Male face | Analysis works | ☐ | Not just female |
| Multiple faces | Analysis focuses on main | ☐ | |
| No face visible | n8n handles gracefully | ☐ | |
| Animal photo | n8n rejects or handles | ☐ | |

---

## 1️⃣5️⃣ Integration Tests

| Test | Expected Result | Status | Notes |
|------|----------------|--------|-------|
| n8n workflow active | Webhook responds | ☐ | |
| Claude API responding | Analysis completes | ☐ | |
| Shopify products exist | All handles valid | ☐ | |
| Product links work | Redirect to product pages | ☐ | |
| Theme compatibility | Works with Dawn theme | ☐ | |

---

## 📊 Test Summary

**Total Tests:** ~150+

**Passed:** ____

**Failed:** ____

**Blocked:** ____

**Pass Rate:** ____%

---

## 🐛 Issues Found

| # | Issue Description | Severity | Status | Notes |
|---|-------------------|----------|--------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Severity Levels:**
- 🔴 **Critical**: Blocks deployment
- 🟠 **High**: Should fix before launch
- 🟡 **Medium**: Fix soon after launch
- 🟢 **Low**: Nice to have

---

## ✅ Sign-Off

**Tester Name:** _____________________

**Date:** _____________________

**Build Version:** 1.0.0 Production

**Ready for Production:** ☐ Yes ☐ No

**Additional Notes:**

_____________________________________

_____________________________________

_____________________________________
