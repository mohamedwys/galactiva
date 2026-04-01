/* ============================================
   SKIN ANALYZER - PRODUCTION JAVASCRIPT
   Hardened for Dermadia Shopify Store
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    webhookUrl: 'https://dermadia.app.n8n.cloud/webhook/image-analysis',

    // Image optimization
    maxImageWidth: 1200,
    maxImageHeight: 1200,
    imageQuality: 0.85,
    maxFileSize: 10 * 1024 * 1024, // 10MB before compression
    acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

    // Timeout and retry
    analysisTimeout: 90000, // 90 seconds
    retryAttempts: 2,
    retryDelay: 2000,

    // Rate limiting (client-side basic protection)
    minTimeBetweenRequests: 10000, // 10 seconds
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const state = {
    lastRequestTime: 0,
    isAnalyzing: false,
    abortController: null,
    analysisCount: 0,
  };

  // ============================================
  // DOM ELEMENTS CACHE
  // ============================================
  const elements = {
    startButtons: null,
    fileInput: null,
    uploadBox: null,
    uploadArea: null,
    resultsSection: null,
    routineSection: null,
    productsSection: null,
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    console.log('🎨 Dermadia Skin Analyzer - Initializing...');

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
      initializeApp();
    }
  }

  function initializeApp() {
    // Cache DOM elements
    cacheElements();

    // Create file input
    createFileInput();

    // Attach event listeners
    attachEventListeners();

    // Create toast container
    createToastContainer();

    console.log('✅ Skin Analyzer initialized successfully');
  }

  // ============================================
  // CACHE DOM ELEMENTS
  // ============================================
  function cacheElements() {
    elements.startButtons = document.querySelectorAll('.skin-start-analysis');
    elements.uploadBox = document.querySelector('.upload-box');
    elements.uploadArea = document.querySelector('[data-upload-area]');
    elements.resultsSection = document.querySelector('[data-results-container]');
    elements.routineSection = document.querySelector('[data-routine-container]');
    elements.productsSection = document.querySelector('[data-products-container]');
  }

  // ============================================
  // CREATE HIDDEN FILE INPUT
  // ============================================
  function createFileInput() {
    elements.fileInput = document.createElement('input');
    elements.fileInput.type = 'file';
    elements.fileInput.accept = CONFIG.acceptedFormats.join(',');
    elements.fileInput.style.display = 'none';
    elements.fileInput.id = 'skin-analyzer-file-input';

    const container = elements.uploadBox || elements.uploadArea || document.body;
    container.appendChild(elements.fileInput);
  }

  // ============================================
  // ATTACH EVENT LISTENERS
  // ============================================
  function attachEventListeners() {
    // Start analysis buttons
    if (elements.startButtons) {
      elements.startButtons.forEach(button => {
        button.addEventListener('click', handleStartAnalysis);
      });
    }

    // File input change
    if (elements.fileInput) {
      elements.fileInput.addEventListener('change', handleFileSelect);
    }

    // Drag & drop on upload areas
    const uploadAreas = [elements.uploadBox, elements.uploadArea].filter(Boolean);
    uploadAreas.forEach(area => {
      area.addEventListener('click', () => elements.fileInput?.click());
      area.addEventListener('dragover', handleDragOver);
      area.addEventListener('dragleave', handleDragLeave);
      area.addEventListener('drop', handleDrop);
    });
  }

  // ============================================
  // HANDLE START ANALYSIS
  // ============================================
  function handleStartAnalysis(e) {
    e.preventDefault();

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastRequest = now - state.lastRequestTime;

    if (timeSinceLastRequest < CONFIG.minTimeBetweenRequests && state.lastRequestTime > 0) {
      const remainingSeconds = Math.ceil((CONFIG.minTimeBetweenRequests - timeSinceLastRequest) / 1000);
      showToast(`Veuillez attendre ${remainingSeconds} secondes avant une nouvelle analyse`, 'warning');
      return;
    }

    if (state.isAnalyzing) {
      showToast('Une analyse est déjà en cours...', 'warning');
      return;
    }

    // Scroll to upload area if exists
    if (elements.uploadArea) {
      elements.uploadArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => elements.fileInput?.click(), 500);
    } else {
      elements.fileInput?.click();
    }
  }

  // ============================================
  // FILE SELECTION HANDLERS
  // ============================================
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--color-accent, #d4a574)';
    e.currentTarget.style.backgroundColor = 'rgba(212, 165, 116, 0.05)';
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.backgroundColor = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.backgroundColor = '';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }

  // ============================================
  // FILE PROCESSING & VALIDATION
  // ============================================
  async function processFile(file) {
    // Validate file type
    if (!CONFIG.acceptedFormats.includes(file.type)) {
      showToast('Format non supporté. Utilisez JPG, PNG ou WEBP.', 'error');
      return;
    }

    // Validate file size
    if (file.size > CONFIG.maxFileSize) {
      showToast('Fichier trop volumineux. Maximum 10MB.', 'error');
      return;
    }

    try {
      showLoading('Préparation de votre image...');

      // Optimize image
      const optimizedImage = await optimizeImage(file);

      updateLoadingMessage('Analyse de votre peau en cours...');

      // Send to webhook
      await sendToWebhook(optimizedImage);

    } catch (error) {
      console.error('❌ Error processing file:', error);
      hideLoading();
      showToast('Erreur lors du traitement de l\'image. Veuillez réessayer.', 'error');
    }
  }

  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  function optimizeImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          try {
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > CONFIG.maxImageWidth || height > CONFIG.maxImageHeight) {
              const ratio = Math.min(
                CONFIG.maxImageWidth / width,
                CONFIG.maxImageHeight / height
              );
              width = Math.floor(width * ratio);
              height = Math.floor(height * ratio);
            }

            // Create canvas and draw resized image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to base64
            const base64 = canvas.toDataURL('image/jpeg', CONFIG.imageQuality);

            console.log('📸 Image optimized:', {
              original: `${img.width}x${img.height}`,
              optimized: `${width}x${height}`,
              originalSize: `${(file.size / 1024).toFixed(1)}KB`,
              optimizedSize: `${(base64.length * 0.75 / 1024).toFixed(1)}KB`
            });

            resolve(base64);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // ============================================
  // SEND TO N8N WEBHOOK
  // ============================================
  async function sendToWebhook(base64Image) {
    state.isAnalyzing = true;
    state.lastRequestTime = Date.now();
    state.analysisCount++;

    // Create abort controller for timeout
    state.abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      state.abortController.abort();
    }, CONFIG.analysisTimeout);

    // Prepare payload matching n8n workflow expectations
    const payload = {
      shop: window.Shopify?.shop || 'dermadiacosmetique.myshopify.com',
      sessionId: `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      image: base64Image,
      fileName: `skin-analysis-${Date.now()}.jpg`,
      context: {
        locale: document.documentElement.lang || 'fr',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };

    try {
      const response = await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: state.abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      hideLoading();

      if (data.success === false) {
        throw new Error(data.error || 'Analysis failed');
      }

      handleAnalysisSuccess(data);

    } catch (error) {
      clearTimeout(timeoutId);
      hideLoading();

      if (error.name === 'AbortError') {
        showToast('L\'analyse prend trop de temps. Veuillez réessayer avec une photo plus claire.', 'error');
      } else {
        console.error('❌ Webhook error:', error);
        showToast('Une erreur est survenue. Veuillez réessayer dans quelques instants.', 'error');
      }
    } finally {
      state.isAnalyzing = false;
      state.abortController = null;
    }
  }

  // ============================================
  // HANDLE SUCCESSFUL ANALYSIS
  // ============================================
  function handleAnalysisSuccess(data) {
    console.log('✅ Analysis received:', data);

    // Parse Claude's message
    const parsedData = parseClaudeResponse(data);

    // Update UI sections
    updateResults(parsedData);
    updateRoutine(parsedData);
    updateProducts(data.products || data.recommendations || []);

    // Show sections with animation
    showSection(elements.resultsSection);
    showSection(elements.routineSection);

    if ((data.products || data.recommendations || []).length > 0) {
      showSection(elements.productsSection);
    }

    // Add success animation to result card
    setTimeout(() => {
      const resultCard = elements.resultsSection?.querySelector('.result-card-modern');
      if (resultCard) {
        resultCard.style.opacity = '0';
        resultCard.style.transform = 'translateY(20px)';
        resultCard.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

        setTimeout(() => {
          resultCard.style.opacity = '1';
          resultCard.style.transform = 'translateY(0)';
        }, 50);
      }
    }, 100);

    // Scroll to results
    setTimeout(() => {
      elements.resultsSection?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 400);

    // Success feedback
    showToast('✨ Analyse terminée ! Découvrez vos résultats ci-dessous.', 'success');

    // Optional: Add confetti effect (simple CSS-based celebration)
    createSuccessCelebration();
  }

  // ============================================
  // PARSE CLAUDE'S TEXT RESPONSE
  // ============================================
  function parseClaudeResponse(data) {
    const message = data.message || data.analysis || '';

    // Extract skin type
    let skinType = 'Type de peau';
    const skinTypePatterns = [
      /peau (grasse|sèche|mixte|normale|sensible)/i,
      /(grasse|sèche|mixte|normale|sensible)/i
    ];

    for (const pattern of skinTypePatterns) {
      const match = message.match(pattern);
      if (match) {
        skinType = `Peau ${match[1].toLowerCase()}`;
        break;
      }
    }

    // Extract Dermadia range recommendation
    let recommendedRange = '';
    const rangePatterns = [
      /gamme (Sebocylique|Retilift|Vitalight|Hydramelon)/gi,
      /(Sebocylique|Retilift|Vitalight|Hydramelon)/gi
    ];

    for (const pattern of rangePatterns) {
      const match = message.match(pattern);
      if (match) {
        recommendedRange = match[1] || match[0];
        break;
      }
    }

    // Split message into sections
    const lines = message.split('\n').filter(line => line.trim());

    // Extract observations (first 2-3 sentences or bullets)
    const observations = [];
    const priorities = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]/)) {
        // Bullet point
        const cleaned = trimmed.replace(/^[-•*]\s*/, '');
        if (cleaned) observations.push(cleaned);
      } else if (trimmed.match(/présence|aspect|teint|peau|rides|taches|sécheresse/i)) {
        // Skin-related sentence
        if (observations.length < 4) observations.push(trimmed);
      }
    });

    // Generate priorities based on content
    if (message.match(/acné|imperfections|sébum/i)) {
      priorities.push('Réguler l\'excès de sébum et les imperfections');
    }
    if (message.match(/rides|ridules|relâchement|âge/i)) {
      priorities.push('Atténuer les signes de l\'âge');
    }
    if (message.match(/taches|teint terne|éclat/i)) {
      priorities.push('Unifier le teint et apporter de l\'éclat');
    }
    if (message.match(/sécheresse|déshydratation|tiraillements/i)) {
      priorities.push('Hydrater et nourrir en profondeur');
    }
    if (message.match(/sensible|rougeurs|irritations/i)) {
      priorities.push('Apaiser et renforcer la barrière cutanée');
    }

    // Fallback
    if (observations.length === 0) {
      observations.push('Analyse détaillée de votre peau effectuée');
      observations.push(message.substring(0, 200) + '...');
    }

    if (priorities.length === 0) {
      priorities.push('Routine personnalisée adaptée à votre type de peau');
    }

    return {
      skinType,
      recommendedRange,
      globalAppearance: message,
      observations: observations.slice(0, 4),
      priorities: priorities.slice(0, 3),
      fullMessage: message
    };
  }

  // ============================================
  // UPDATE RESULTS SECTION
  // ============================================
  function updateResults(parsedData) {
    if (!elements.resultsSection) return;

    // Update skin type
    const skinTypeEl = elements.resultsSection.querySelector('.skin-type-label, [data-skin-type]');
    if (skinTypeEl) {
      skinTypeEl.textContent = parsedData.skinType;
    }

    // Update recommended range
    const rangeEl = elements.resultsSection.querySelector('[data-recommended-range]');
    if (rangeEl && parsedData.recommendedRange) {
      rangeEl.textContent = `Gamme recommandée: ${parsedData.recommendedRange}`;
      rangeEl.style.display = 'block';
    }

    // Update global appearance (split into paragraphs for readability)
    const appearanceEl = elements.resultsSection.querySelector('.global-appearance, [data-global-appearance], .skin-description-modern');
    if (appearanceEl) {
      // Split into paragraphs if contains line breaks
      const paragraphs = parsedData.globalAppearance.split('\n').filter(p => p.trim());
      if (paragraphs.length > 1) {
        appearanceEl.innerHTML = paragraphs
          .map(para => `<p>${escapeHtml(para.trim())}</p>`)
          .join('');
      } else {
        appearanceEl.textContent = parsedData.globalAppearance;
      }
    }

    // Update observations list
    const observationsEl = elements.resultsSection.querySelector('.observations-list, [data-observations-list]');
    if (observationsEl && parsedData.observations.length > 0) {
      observationsEl.innerHTML = parsedData.observations
        .map(obs => `<li>${escapeHtml(obs)}</li>`)
        .join('');
    }

    // Update priorities list
    const prioritiesEl = elements.resultsSection.querySelector('.priorities-list, [data-priorities-list]');
    if (prioritiesEl && parsedData.priorities.length > 0) {
      prioritiesEl.innerHTML = parsedData.priorities
        .map(priority => `<li>${escapeHtml(priority)}</li>`)
        .join('');
    }
  }

  // ============================================
  // UPDATE ROUTINE SECTION
  // ============================================
  function updateRoutine(parsedData) {
    if (!elements.routineSection) return;

    // Generate smart routine based on skin type and range
    const routine = generateSmartRoutine(parsedData);

    // Update morning routine
    const morningList = elements.routineSection.querySelector('.routine-morning .routine-steps, [data-morning-routine]');
    if (morningList) {
      morningList.innerHTML = routine.morning
        .map((step, index) => `
          <li class="routine-step">
            <span class="step-role">${escapeHtml(step.role)}</span>
            <p class="step-benefit">${escapeHtml(step.benefit)}</p>
            ${step.tip ? `<p class="step-tip">${escapeHtml(step.tip)}</p>` : ''}
          </li>
        `)
        .join('');
    }

    // Update evening routine
    const eveningList = elements.routineSection.querySelector('.routine-evening .routine-steps, [data-evening-routine]');
    if (eveningList) {
      eveningList.innerHTML = routine.evening
        .map((step, index) => `
          <li class="routine-step">
            <span class="step-role">${escapeHtml(step.role)}</span>
            <p class="step-benefit">${escapeHtml(step.benefit)}</p>
            ${step.tip ? `<p class="step-tip">${escapeHtml(step.tip)}</p>` : ''}
          </li>
        `)
        .join('');
    }
  }

  // ============================================
  // GENERATE SMART ROUTINE
  // ============================================
  function generateSmartRoutine(parsedData) {
    const range = (parsedData.recommendedRange || '').toLowerCase();
    const message = (parsedData.fullMessage || '').toLowerCase();

    // Base routine
    const morning = [
      { role: 'Nettoyage', benefit: 'Nettoyer délicatement sans agresser', tip: 'Masser en mouvements circulaires puis rincer à l\'eau tiède' },
      { role: 'Sérum', benefit: 'Cibler vos besoins spécifiques', tip: 'Appliquer 2-3 gouttes sur peau humide' },
      { role: 'Hydratation', benefit: 'Protéger et hydrater toute la journée', tip: 'Masser jusqu\'à absorption complète' },
      { role: 'Protection SPF', benefit: 'Protéger contre les UV et le vieillissement', tip: 'Indispensable même par temps nuageux' }
    ];

    const evening = [
      { role: 'Démaquillage', benefit: 'Retirer toutes les impuretés de la journée', tip: 'Insister sur les zones maquillées' },
      { role: 'Nettoyage', benefit: 'Purifier en profondeur', tip: 'Double nettoyage pour une peau parfaitement propre' },
      { role: 'Sérum nuit', benefit: 'Booster la régénération nocturne', tip: 'La nuit est le moment idéal pour les actifs concentrés' },
      { role: 'Crème nuit', benefit: 'Nourrir et réparer pendant le sommeil', tip: 'Appliquer en mouvements ascendants' }
    ];

    // Customize based on range
    if (range.includes('sebocylique')) {
      morning[1].benefit = 'Réguler le sébum et affiner le grain de peau';
      evening[2].benefit = 'Purifier et prévenir les imperfections';
      evening.push({
        role: 'Soin ciblé',
        benefit: 'Traiter localement les imperfections',
        tip: 'Appliquer directement sur les zones concernées'
      });
    } else if (range.includes('retilift')) {
      morning[1].benefit = 'Lifter et lisser les rides';
      evening[2].benefit = 'Stimuler le renouvellement cellulaire';
      evening.push({
        role: 'Soin contour des yeux',
        benefit: 'Atténuer rides et cernes',
        tip: 'Tapoter délicatement du bout des doigts'
      });
    } else if (range.includes('vitalight')) {
      morning[1].benefit = 'Illuminer et unifier le teint';
      evening[2].benefit = 'Estomper les taches et raviver l\'éclat';
      morning[3].benefit = 'Protéger contre les taches pigmentaires';
    } else if (range.includes('hydramelon')) {
      morning[1].benefit = 'Hydrater intensément et apaiser';
      morning[2].benefit = 'Confort et douceur longue durée';
      evening[2].benefit = 'Régénérer et restaurer la barrière cutanée';
    }

    return { morning, evening };
  }

  // ============================================
  // UPDATE PRODUCTS SECTION
  // ============================================
  function updateProducts(products) {
    console.log('[Products] Received products:', products);

    if (!elements.productsSection) {
      console.warn('[Products] Products section element not found');
      return;
    }

    if (!Array.isArray(products)) {
      console.warn('[Products] Products is not an array:', typeof products);
      return;
    }

    if (products.length === 0) {
      console.log('[Products] No products to display');
      return;
    }

    const productsGrid = elements.productsSection.querySelector('.products-grid, [data-products-grid]');
    if (!productsGrid) {
      console.error('[Products] Products grid element not found');
      return;
    }

    // Clear existing products
    productsGrid.innerHTML = '';

    // Create product cards (max 6)
    const productsToShow = products.slice(0, 6);
    console.log(`[Products] Rendering ${productsToShow.length} product cards`);

    productsToShow.forEach((product, index) => {
      try {
        const card = createProductCard(product);
        productsGrid.appendChild(card);
        console.log(`[Products] Card ${index + 1} rendered:`, product.title || 'Untitled');
      } catch (error) {
        console.error(`[Products] Error creating card ${index + 1}:`, error, product);
      }
    });

    console.log('[Products] All product cards rendered successfully');
  }

  // ============================================
  // CREATE PRODUCT CARD
  // ============================================
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Handle multiple image URL formats from n8n webhook
    let imageUrl = '';
    if (product.image) {
      imageUrl = product.image;
    } else if (product.featuredImage?.url) {
      imageUrl = product.featuredImage.url;
    } else if (product.featured_image) {
      imageUrl = product.featured_image;
    } else if (product.images && product.images.length > 0) {
      imageUrl = product.images[0].src || product.images[0];
    }

    // Ensure Shopify CDN images have proper sizing
    if (imageUrl && imageUrl.includes('cdn.shopify.com')) {
      // Remove any existing size parameters
      imageUrl = imageUrl.replace(/(_\d+x\d+|\d+x\d+|_\d+x|x\d+)\.(jpg|jpeg|png|webp|gif)/i, '.$2');
      // Add consistent size parameter (720px width for product cards)
      if (!imageUrl.includes('?')) {
        imageUrl += '?width=720';
      }
    }

    // Handle price formatting
    const price = product.priceFormatted || product.price_formatted || product.price || '';
    const title = escapeHtml(product.title || 'Produit Dermadia');
    const description = escapeHtml((product.description || '').substring(0, 100));
    const handle = product.handle || '';

    card.innerHTML = `
      ${imageUrl ? `
        <div class="product-image-modern">
          <img src="${escapeHtml(imageUrl)}" alt="${title}" loading="lazy" width="720" height="720">
        </div>
      ` : `
        <div class="product-image-modern">
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f8f8f8; color: #666;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        </div>
      `}
      <div class="product-info-modern">
        <h3 class="product-name-modern">${title}</h3>
        ${description ? `<p class="product-description-modern">${description}</p>` : ''}
        <div class="product-footer-modern">
          ${price ? `<span class="product-price-modern">${escapeHtml(price)}</span>` : ''}
          <button class="btn-add-modern" data-product-handle="${escapeHtml(handle)}">
            Découvrir
          </button>
        </div>
      </div>
    `;

    // Attach click handler to button
    const button = card.querySelector('[data-product-handle]');
    if (button && handle) {
      button.addEventListener('click', () => {
        window.location.href = `/products/${handle}`;
      });
    }

    return card;
  }

  // ============================================
  // SHOW/HIDE SECTIONS
  // ============================================
  function showSection(section) {
    if (section) {
      section.style.display = 'block';
      section.classList.remove('hidden');
      section.classList.add('visible');
    }
  }

  function hideSection(section) {
    if (section) {
      section.style.display = 'none';
      section.classList.add('hidden');
      section.classList.remove('visible');
    }
  }

  // ============================================
  // LOADING OVERLAY
  // ============================================
  let loadingProgressInterval = null;
  let loadingStepIndex = 0;

  function showLoading(message = 'Chargement...') {
    hideLoading();

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'skin-analyzer-loading';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-brand">✨</div>
        <div class="loading-spinner"></div>
        <div class="loading-text">${escapeHtml(message)}</div>
        <div class="loading-subtext">Notre IA analyse votre peau avec précision...</div>
        <div class="loading-progress">
          <div class="loading-step active" data-step="0">
            <div class="loading-step-icon">1</div>
            <div class="loading-step-text">Optimisation de l'image</div>
          </div>
          <div class="loading-step" data-step="1">
            <div class="loading-step-icon">2</div>
            <div class="loading-step-text">Analyse IA en cours</div>
          </div>
          <div class="loading-step" data-step="2">
            <div class="loading-step-icon">3</div>
            <div class="loading-step-text">Recherche des produits adaptés</div>
          </div>
          <div class="loading-step" data-step="3">
            <div class="loading-step-icon">4</div>
            <div class="loading-step-text">Génération de votre routine</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Animate progress steps
    loadingStepIndex = 0;
    loadingProgressInterval = setInterval(() => {
      const currentStep = overlay.querySelector(`.loading-step[data-step="${loadingStepIndex}"]`);
      if (currentStep) {
        currentStep.classList.remove('active');
        currentStep.classList.add('complete');

        const icon = currentStep.querySelector('.loading-step-icon');
        icon.textContent = '✓';
      }

      loadingStepIndex++;
      const nextStep = overlay.querySelector(`.loading-step[data-step="${loadingStepIndex}"]`);
      if (nextStep) {
        nextStep.classList.add('active');
      }

      if (loadingStepIndex >= 4) {
        clearInterval(loadingProgressInterval);
      }
    }, 4000); // Each step takes 4 seconds
  }

  function updateLoadingMessage(message) {
    const loadingText = document.querySelector('#skin-analyzer-loading .loading-text');
    if (loadingText) {
      loadingText.textContent = message;
    }
  }

  function hideLoading() {
    // Clear interval
    if (loadingProgressInterval) {
      clearInterval(loadingProgressInterval);
      loadingProgressInterval = null;
    }

    const overlay = document.getElementById('skin-analyzer-loading');
    if (overlay) {
      // Fade out
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s ease-out';

      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 300);
    } else {
      document.body.style.overflow = '';
    }
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  function createToastContainer() {
    if (document.getElementById('toast-container')) return;

    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) {
      createToastContainer();
      return showToast(message, type);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Auto remove
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // ============================================
  // SUCCESS CELEBRATION
  // ============================================
  function createSuccessCelebration() {
    // Create simple confetti effect
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;

    // Create 20 confetti pieces
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.textContent = ['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)];
      confetti.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 20 + 15}px;
        left: ${Math.random() * 100}%;
        top: -50px;
        animation: confettiFall ${Math.random() * 2 + 2}s ease-out forwards;
        opacity: 0.8;
      `;
      container.appendChild(confetti);
    }

    // Add keyframe animation
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(container);

    // Remove after animation
    setTimeout(() => {
      container.remove();
    }, 4000);
  }

  // ============================================
  // UTILITY: ESCAPE HTML
  // ============================================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // START APPLICATION
  // ============================================
  init();

})();
