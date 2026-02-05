/* ============================================
   SKIN ANALYZER - JAVASCRIPT
   Gestion de l'upload photo et communication avec n8n webhook
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    // ⚠️ WEBHOOK URL - À configurer dans les metafields Shopify
    // NE PAS mettre l'URL directement ici pour des raisons de sécurité
    webhookUrl: null, // Sera chargé depuis les metafields
    
    // Paramètres de l'upload
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    
    // Timeout pour l'analyse
    analysisTimeout: 60000, // 60 secondes
  };

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const elements = {
    startButtons: null,
    fileInput: null,
    uploadBox: null,
    resultsSection: null,
    routineSection: null,
    productsSection: null,
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    // Charger l'URL du webhook depuis les metafields
    loadWebhookUrl();
    
    // Récupérer les éléments DOM
    cacheElements();
    
    // Créer l'input file caché
    createFileInput();
    
    // Attacher les événements
    attachEventListeners();
    
    console.log('🎨 Skin Analyzer initialized');
  }

  // ============================================
  // LOAD WEBHOOK URL FROM SHOPIFY METAFIELDS
  // ============================================
  function loadWebhookUrl() {
    // Récupérer l'URL depuis un attribut data sur la page
    const pageElement = document.getElementById('skin-analyzer-page');
    if (pageElement && pageElement.dataset.webhookUrl) {
      CONFIG.webhookUrl = pageElement.dataset.webhookUrl;
    } else {
      console.error('⚠️ Webhook URL not configured. Please add data-webhook-url attribute.');
    }
  }

  // ============================================
  // CACHE DOM ELEMENTS
  // ============================================
  function cacheElements() {
    elements.startButtons = document.querySelectorAll('.skin-start-analysis');
    elements.uploadBox = document.querySelector('.upload-box');
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
    
    if (elements.uploadBox) {
      elements.uploadBox.appendChild(elements.fileInput);
    }
  }

  // ============================================
  // ATTACH EVENT LISTENERS
  // ============================================
  function attachEventListeners() {
    // Boutons "Commencer l'analyse"
    if (elements.startButtons) {
      elements.startButtons.forEach(button => {
        button.addEventListener('click', handleStartAnalysis);
      });
    }

    // Input file
    if (elements.fileInput) {
      elements.fileInput.addEventListener('change', handleFileSelect);
    }

    // Drag & Drop sur la upload box
    if (elements.uploadBox) {
      elements.uploadBox.addEventListener('dragover', handleDragOver);
      elements.uploadBox.addEventListener('dragleave', handleDragLeave);
      elements.uploadBox.addEventListener('drop', handleDrop);
    }
  }

  // ============================================
  // HANDLE START ANALYSIS BUTTON
  // ============================================
  function handleStartAnalysis(e) {
    e.preventDefault();
    
    if (!CONFIG.webhookUrl) {
      showError('Configuration manquante. Veuillez contacter le support.');
      return;
    }
    
    // Trigger file input
    if (elements.fileInput) {
      elements.fileInput.click();
    }
  }

  // ============================================
  // HANDLE FILE SELECTION
  // ============================================
  function handleFileSelect(e) {
    const file = e.target.files[0];
    
    if (file) {
      processFile(file);
    }
  }

  // ============================================
  // HANDLE DRAG OVER
  // ============================================
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (elements.uploadBox) {
      elements.uploadBox.style.borderColor = 'var(--color-accent)';
      elements.uploadBox.style.backgroundColor = 'rgba(212, 165, 116, 0.05)';
    }
  }

  // ============================================
  // HANDLE DRAG LEAVE
  // ============================================
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (elements.uploadBox) {
      elements.uploadBox.style.borderColor = 'var(--color-border)';
      elements.uploadBox.style.backgroundColor = 'white';
    }
  }

  // ============================================
  // HANDLE DROP
  // ============================================
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (elements.uploadBox) {
      elements.uploadBox.style.borderColor = 'var(--color-border)';
      elements.uploadBox.style.backgroundColor = 'white';
    }
    
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      processFile(files[0]);
    }
  }

  // ============================================
  // PROCESS FILE
  // ============================================
  function processFile(file) {
    // Validation du type de fichier
    if (!CONFIG.acceptedFormats.includes(file.type)) {
      showError('Format de fichier non supporté. Utilisez JPG, PNG ou WEBP.');
      return;
    }

    // Validation de la taille
    if (file.size > CONFIG.maxFileSize) {
      showError('Fichier trop volumineux. Maximum 10MB.');
      return;
    }

    // Convertir en base64 et envoyer
    convertToBase64(file)
      .then(base64Image => {
        sendToWebhook(base64Image, file.type);
      })
      .catch(error => {
        console.error('Erreur de conversion:', error);
        showError('Erreur lors du traitement de l\'image.');
      });
  }

  // ============================================
  // CONVERT FILE TO BASE64
  // ============================================
  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        // Extraire uniquement la partie base64 (sans le préfixe data:image/...)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ============================================
  // SEND TO N8N WEBHOOK
  // ============================================
  function sendToWebhook(base64Image, mimeType) {
    // Afficher le loading
    showLoading('Analyse de ta peau en cours...');

    // Préparer les données
    const payload = {
      image: base64Image,
      mimeType: mimeType,
      timestamp: new Date().toISOString(),
      // Informations optionnelles (peuvent être ajoutées)
      userAgent: navigator.userAgent,
      locale: navigator.language || 'fr-FR',
    };

    // Envoyer au webhook avec timeout
    const timeoutId = setTimeout(() => {
      hideLoading();
      showError('L\'analyse prend trop de temps. Veuillez réessayer.');
    }, CONFIG.analysisTimeout);

    fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => {
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
      })
      .then(data => {
        hideLoading();
        handleAnalysisResponse(data);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        hideLoading();
        console.error('Erreur webhook:', error);
        showError('Une erreur est survenue. Veuillez réessayer.');
      });
  }

  // ============================================
  // HANDLE ANALYSIS RESPONSE
  // ============================================
  function handleAnalysisResponse(data) {
    console.log('📊 Analysis received:', data);

    // Injecter les résultats dans le DOM
    if (data.skinType) {
      updateResults(data);
    }

    if (data.routine) {
      updateRoutine(data.routine);
    }

    if (data.products) {
      updateProducts(data.products);
    }

    // Scroll vers les résultats
    scrollToResults();
    
    // Afficher un message de succès
    showSuccess('Analyse terminée ! Découvre tes résultats ci-dessous.');
  }

  // ============================================
  // UPDATE RESULTS SECTION
  // ============================================
  function updateResults(data) {
    if (!elements.resultsSection) return;

    // Remplacer les placeholders
    let html = elements.resultsSection.innerHTML;
    
    html = html.replace('{{skin_type_label}}', data.skinType || 'Type de peau');
    html = html.replace('{{global_appearance}}', data.globalAppearance || '');
    
    // Observations
    if (data.observations && Array.isArray(data.observations)) {
      const observationsList = data.observations
        .map(obs => `<li>${obs}</li>`)
        .join('');
      html = html.replace('{{main_observations}}', observationsList);
    }
    
    // Priorités
    if (data.priorities && Array.isArray(data.priorities)) {
      const prioritiesList = data.priorities
        .map(priority => `<li>${priority}</li>`)
        .join('');
      html = html.replace('{{care_priorities}}', prioritiesList);
    }
    
    elements.resultsSection.innerHTML = html;
    elements.resultsSection.style.display = 'block';
  }

  // ============================================
  // UPDATE ROUTINE SECTION
  // ============================================
  function updateRoutine(routine) {
    if (!elements.routineSection) return;

    let html = elements.routineSection.innerHTML;
    
    // Routine matin
    if (routine.morning && Array.isArray(routine.morning)) {
      routine.morning.forEach((step, index) => {
        const num = index + 1;
        html = html.replace(`{{morning_step_${num}_role}}`, step.role || '');
        html = html.replace(`{{morning_step_${num}_benefit}}`, step.benefit || '');
        html = html.replace(`{{morning_step_${num}_tip}}`, step.tip || '');
      });
    }
    
    // Routine soir
    if (routine.evening && Array.isArray(routine.evening)) {
      routine.evening.forEach((step, index) => {
        const num = index + 1;
        html = html.replace(`{{evening_step_${num}_role}}`, step.role || '');
        html = html.replace(`{{evening_step_${num}_benefit}}`, step.benefit || '');
        html = html.replace(`{{evening_step_${num}_tip}}`, step.tip || '');
      });
    }
    
    elements.routineSection.innerHTML = html;
    elements.routineSection.style.display = 'block';
  }

  // ============================================
  // UPDATE PRODUCTS SECTION
  // ============================================
  function updateProducts(products) {
    if (!elements.productsSection || !Array.isArray(products)) return;

    let html = elements.productsSection.innerHTML;
    
    products.forEach((product, index) => {
      const num = index + 1;
      html = html.replace(`{{product_${num}_title}}`, product.title || '');
      html = html.replace(`{{product_${num}_type}}`, product.type || '');
      html = html.replace(`{{product_${num}_short_benefit}}`, product.benefit || '');
      html = html.replace(`{{product_${num}_price}}`, product.price || '');
      html = html.replace(`{{product_${num}_handle}}`, product.handle || '');
    });
    
    elements.productsSection.innerHTML = html;
    elements.productsSection.style.display = 'block';
    
    // Attacher les événements sur les boutons produits
    attachProductButtonEvents();
  }

  // ============================================
  // ATTACH PRODUCT BUTTON EVENTS
  // ============================================
  function attachProductButtonEvents() {
    const productButtons = document.querySelectorAll('[data-product-handle]');
    
    productButtons.forEach(button => {
      button.addEventListener('click', function() {
        const handle = this.getAttribute('data-product-handle');
        if (handle) {
          window.location.href = `/products/${handle}`;
        }
      });
    });
  }

  // ============================================
  // SCROLL TO RESULTS
  // ============================================
  function scrollToResults() {
    if (elements.resultsSection) {
      setTimeout(() => {
        elements.resultsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    }
  }

  // ============================================
  // SHOW LOADING OVERLAY
  // ============================================
  function showLoading(message = 'Chargement...') {
    // Supprimer l'ancien overlay s'il existe
    hideLoading();
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'skin-analyzer-loading';
    
    overlay.innerHTML = `
      <div class="loading"></div>
      <div class="loading-text">${message}</div>
    `;
    
    document.body.appendChild(overlay);
    
    // Empêcher le scroll
    document.body.style.overflow = 'hidden';
  }

  // ============================================
  // HIDE LOADING OVERLAY
  // ============================================
  function hideLoading() {
    const overlay = document.getElementById('skin-analyzer-loading');
    if (overlay) {
      overlay.remove();
    }
    
    // Réactiver le scroll
    document.body.style.overflow = '';
  }

  // ============================================
  // SHOW ERROR MESSAGE
  // ============================================
  function showError(message) {
    alert(`❌ ${message}`);
    // Ou utiliser un système de notification plus élégant
  }

  // ============================================
  // SHOW SUCCESS MESSAGE
  // ============================================
  function showSuccess(message) {
    console.log(`✅ ${message}`);
    // Ou afficher une notification
  }

  // ============================================
  // START THE APP
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();