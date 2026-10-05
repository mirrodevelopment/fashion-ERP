/**
 * =======================================================================
 * HAULO BOUTIQUE ERP — CENTRAL BRAND IDENTITY & UNIVERSAL DOM HYDRATOR
 * Path: front end/fragments/brand-identity/brand-identity.js
 * 
 * Single source of truth for all brand metadata, naming, slogans,
 * contact channels, multi-tier emails, support protocols, legal data,
 * and declarative DOM bindings. Eliminates raw hardcoded brand names.
 * =======================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BrandIdentity = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1. Canonical Atelier Brand Constants (Established 2026 — Coimbatore Gandhipuram)
  const INITIAL_BRAND_DATA = {
    // ─────────────────────────────────────────────────────────────
    // Core Naming & Brand Identity
    // ─────────────────────────────────────────────────────────────
    brandName: 'Haulo',
    shortName: 'HAULO',
    legalName: 'Haulo Designs Private Limited',
    companyName: 'Haulo Designs',
    tradeName: 'HAULO ATELIER',
    systemName: 'Haulo Boutique ERP',
    systemSub: 'BOUTIQUE ERP',
    appTitle: 'Haulo Boutique ERP — Luxury Fashion Operating System',
    businessType: 'Bespoke Haute Couture Atelier & Luxury Fashion House',
    establishedYear: 2026,
    motto: 'Artistry in Every Stitch, Precision in Every Detail',
    tagline: 'Bespoke Couture · Luxury Tailoring',
    slogan: 'Threading Businesses Towards a Brighter Tomorrow',
    subTagline: 'Fashion Businesses Simplified · From Design to Delivery',
    monogram: 'HB',
    initials: 'HB',
    version: 'v2.6.0',
    edition: 'Enterprise Edition',

    // ─────────────────────────────────────────────────────────────
    // Contact Channels (Mobile & Telephony Suite)
    // ─────────────────────────────────────────────────────────────
    telephony: {
      primaryMobile: '+91 98765 43210',
      secondaryMobile: '+91 98765 43211',
      helpline: '+91 98765 43210',
      vipConciergePhone: '+91 98765 43299',
      tollFree: '1800-555-4285',
      emergencyHotline: '+91 98765 43200',
      whatsapp: '+91 98765 43210',
      whatsappDisplay: '+91 98765 43210',
      whatsappDirectUrl: 'https://wa.me/919876543210?text=Hello%20Haulo%20Concierge',
      fax: '+91 422 2345 678'
    },

    // ─────────────────────────────────────────────────────────────
    // Specialized Departmental Mail IDs
    // ─────────────────────────────────────────────────────────────
    emails: {
      general: 'info@haulo.luxury',
      concierge: 'concierge@haulo.luxury',
      support: 'support@haulo.luxury',
      admin: 'admin@haulo.luxury',
      orders: 'orders@haulo.luxury',
      fittings: 'fittings@haulo.luxury',
      billing: 'billing@haulo.luxury',
      security: 'security@haulo.luxury',
      privacy: 'privacy@haulo.luxury',
      careers: 'careers@haulo.luxury',
      press: 'press@haulo.luxury',
      suppliers: 'procurement@haulo.luxury'
    },

    // ─────────────────────────────────────────────────────────────
    // Multi-Tier Support Identifiers & Desk Protocols
    // ─────────────────────────────────────────────────────────────
    support: {
      deskName: 'Haulo VIP Concierge & Technical Desk',
      supportEmail: 'support@haulo.luxury',
      conciergeEmail: 'concierge@haulo.luxury',
      securityEmail: 'security@haulo.luxury',
      adminEmail: 'admin@haulo.luxury',
      helpdeskUrl: 'https://help.haulo.luxury',
      portalUrl: 'https://concierge.haulo.luxury',
      knowledgeBaseUrl: 'https://docs.haulo.luxury',
      ticketPrefix: 'HAULO-SUP-',
      orderTicketPrefix: 'HAULO-ORD-',
      securityTicketPrefix: 'HAULO-SEC-',
      incidentPrefix: 'HAULO-INC-',
      standardResponseTime: 'Under 1 hour',
      vipResponseTime: 'Instant / Under 15 minutes',
      slaTier: '24/7/365 Bespoke Tier-1 Concierge'
    },

    // ─────────────────────────────────────────────────────────────
    // Physical Atelier Headquarters (Coimbatore Gandhipuram)
    // ─────────────────────────────────────────────────────────────
    headquarters: {
      atelierNumber: 'Atelier Suites 4 & 5',
      building: 'Haulo Heritage Tower',
      streetAddress: 'Cross Cut Road, Gandhipuram',
      locality: 'Gandhipuram',
      city: 'Coimbatore',
      shortCity: 'CBE',
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      stateCode: 'TN',
      pinCode: '641012',
      country: 'India',
      countryCode: 'IN',
      mapsUrl: 'https://maps.google.com/?q=Gandhipuram+Coimbatore+Tamil+Nadu',
      formattedAddress: 'Atelier Suites 4 & 5, Haulo Heritage Tower, Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu 641012, India'
    },

    // ─────────────────────────────────────────────────────────────
    // Legal, Tax & Corporate Compliance (Tamil Nadu / India)
    // ─────────────────────────────────────────────────────────────
    compliance: {
      cin: 'U18101TZ2026PTC034567',
      gstin: '33AABCH1234F1Z9',               // 33 = Tamil Nadu State GST Code
      pan: 'AABCH1234F',
      tan: 'CHTH12345E',
      msmeRegistration: 'UDYAM-TN-03-0045678',
      trademarkRegistration: 'Reg. No. 5892341 (Class 25 & Class 42)',
      exportImportCode: '0304918274',
      jurisdiction: 'Coimbatore Judicial District, Madras High Court, India',
      registeredOffice: 'Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu 641012'
    },

    // ─────────────────────────────────────────────────────────────
    // Social & Digital Channels
    // ─────────────────────────────────────────────────────────────
    social: {
      instagram: {
        handle: '@haulo.official',
        url: 'https://instagram.com/haulo.official'
      },
      linkedin: {
        handle: 'haulo-designs',
        url: 'https://linkedin.com/company/haulo-designs'
      },
      pinterest: {
        handle: '@haulocouture',
        url: 'https://pinterest.com/haulocouture'
      },
      facebook: {
        handle: 'HauloDesignsOfficial',
        url: 'https://facebook.com/HauloDesignsOfficial'
      },
      youtube: {
        handle: '@HauloAtelier',
        url: 'https://youtube.com/@HauloAtelier'
      },
      twitter: {
        handle: '@HauloLuxury',
        url: 'https://x.com/HauloLuxury'
      }
    },

    // ─────────────────────────────────────────────────────────────
    // Backwards-Compatible Contact Mirror
    // ─────────────────────────────────────────────────────────────
    contact: {
      supportEmail: 'support@haulo.luxury',
      conciergeEmail: 'concierge@haulo.luxury',
      generalEmail: 'info@haulo.luxury',
      phone: '+91 98765 43210',
      primaryMobile: '+91 98765 43210',
      secondaryMobile: '+91 98765 43211',
      helpline: '+91 98765 43210',
      vipPhone: '+91 98765 43299',
      tollFree: '1800-555-4285',
      whatsapp: '+91 98765 43210',
      website: 'https://haulo.luxury',
      streetAddress: 'Cross Cut Road, Gandhipuram',
      locality: 'Gandhipuram',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pinCode: '641012',
      country: 'India',
      formattedAddress: 'Atelier Suites 4 & 5, Haulo Heritage Tower, Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu 641012, India'
    }
  };

  // Canonical Brand state — Strictly IMMUTABLE (Our Platform Brand)
  const _activeBrand = Object.freeze(JSON.parse(JSON.stringify(INITIAL_BRAND_DATA)));

  // Public Interface
  const BrandIdentity = {
    /**
     * Safely retrieves any property by key or dot-notation path.
     * Example: BrandIdentity.get('telephony.primaryMobile') or BrandIdentity.get('compliance.gstin')
     */
    get(keyPath, fallback = '') {
      if (!keyPath) return _activeBrand;
      const keys = String(keyPath).split('.');
      let current = _activeBrand;
      for (const k of keys) {
        if (current && Object.prototype.hasOwnProperty.call(current, k)) {
          current = current[k];
        } else {
          return fallback;
        }
      }
      return current !== undefined && current !== null ? current : fallback;
    },

    /**
     * Returns a deep clone of the entire brand identity model.
     */
    getAll() {
      return JSON.parse(JSON.stringify(_activeBrand));
    },

    /**
     * Standardizes document page titles across all ERP and System pages.
     * Example: BrandIdentity.formatTitle('Orders') -> "Orders — Haulo Boutique ERP"
     */
    formatTitle(pageTitle) {
      const clean = String(pageTitle || '').trim();
      const sysName = _activeBrand.systemName || 'Haulo Boutique ERP';
      if (!clean || clean.toLowerCase() === 'home') {
        return _activeBrand.appTitle || sysName;
      }
      return `${clean} — ${sysName}`;
    },

    /**
     * Formats current branch label with company name.
     */
    formatBranch(branchName) {
      let b = branchName;
      if (!b && typeof localStorage !== 'undefined') {
        b = localStorage.getItem('haulo_active_branch');
      }
      b = b || 'Main Atelier';
      return `${_activeBrand.companyName} — ${b}`;
    },

    /**
     * Generates a legally compliant copyright string.
     */
    getCopyright(customYear) {
      const year = customYear || new Date().getFullYear();
      return `© ${year} ${_activeBrand.companyName}. All rights reserved.`;
    },

    /**
     * Scans and hydrates all declarative [data-brand] attributes across the DOM.
     * Note: BrandIdentity strictly hydrates platform data, NEVER customer company data.
     */
    applyToDOM(root = (typeof document !== 'undefined' ? document : null)) {
      if (!root) return;

      const activeBranch = (typeof localStorage !== 'undefined' && localStorage.getItem('haulo_active_branch')) || 'Gandhipuram Atelier';
      const currentYear = new Date().getFullYear();

      // 1. Hydrate document title if data-brand-title exists
      if (document && document.title) {
        const titleEl = document.querySelector('title[data-brand-title]');
        if (titleEl) {
          const pageTitle = titleEl.getAttribute('data-brand-title') || titleEl.textContent;
          document.title = this.formatTitle(pageTitle);
        } else {
          const parts = document.title.split(/ [—|] /);
          if (parts.length > 1) {
            const pagePart = parts[0].trim();
            document.title = this.formatTitle(pagePart);
          }
        }
      }

      // 2. Query all elements with data-brand or data-brand-field
      const selector = '[data-brand], [data-brand-field]';
      root.querySelectorAll(selector).forEach((el) => {
        const field = el.getAttribute('data-brand') || 
                      el.getAttribute('data-brand-field');
        if (!field) return;

        switch (field) {
          // ── Brand Naming ──
          case 'name':
          case 'brandName':
            el.textContent = _activeBrand.brandName;
            break;

          case 'shortName':
            el.textContent = _activeBrand.shortName;
            break;

          case 'shortNameUpper':
            el.textContent = _activeBrand.shortName.toUpperCase();
            break;

          case 'legalName':
          case 'companyName':
            el.textContent = _activeBrand.companyName;
            break;

          case 'companyNameUpper':
            el.textContent = _activeBrand.companyName.toUpperCase();
            break;

          case 'systemName':
            el.textContent = _activeBrand.systemName;
            break;

          case 'systemSub':
          case 'systemSubtitle':
            el.textContent = _activeBrand.systemSub;
            break;

          case 'appTitle':
            el.textContent = _activeBrand.appTitle;
            break;

          case 'tagline':
            el.textContent = _activeBrand.tagline;
            break;

          case 'slogan':
            el.textContent = _activeBrand.slogan;
            break;

          case 'subTagline':
            el.textContent = _activeBrand.subTagline;
            break;

          case 'motto':
            el.textContent = _activeBrand.motto;
            break;

          case 'businessType':
            el.textContent = _activeBrand.businessType;
            break;

          case 'establishedYear':
            el.textContent = String(_activeBrand.establishedYear);
            break;

          case 'initials':
          case 'monogram':
            el.textContent = _activeBrand.monogram;
            break;

          case 'version':
            el.textContent = _activeBrand.version;
            break;

          case 'edition':
            el.textContent = _activeBrand.edition;
            break;

          case 'branchTitle':
            el.textContent = `${_activeBrand.companyName} — ${activeBranch}`;
            break;

          case 'copyright':
            el.innerHTML = `&copy; ${currentYear} ${_activeBrand.companyName}. All rights reserved.`;
            break;

          // ── Telephony & Mobile ──
          case 'mobile':
          case 'primaryMobile':
          case 'phone':
          case 'primaryPhone':
          case 'helpline':
            el.textContent = _activeBrand.telephony.primaryMobile;
            if (el.tagName === 'A') el.href = `tel:${_activeBrand.telephony.primaryMobile.replace(/\s+/g, '')}`;
            break;

          case 'secondaryMobile':
          case 'secondaryPhone':
            el.textContent = _activeBrand.telephony.secondaryMobile;
            if (el.tagName === 'A') el.href = `tel:${_activeBrand.telephony.secondaryMobile.replace(/\s+/g, '')}`;
            break;

          case 'phoneDisplay':
            el.textContent = _activeBrand.telephony.primaryMobile;
            break;

          case 'tollFree':
            el.textContent = _activeBrand.telephony.tollFree;
            if (el.tagName === 'A') el.href = `tel:${_activeBrand.telephony.tollFree.replace(/[^0-9]/g, '')}`;
            break;

          case 'vipPhone':
          case 'vipConciergePhone':
            el.textContent = _activeBrand.telephony.vipConciergePhone;
            if (el.tagName === 'A') el.href = `tel:${_activeBrand.telephony.vipConciergePhone.replace(/\s+/g, '')}`;
            break;

          case 'emergencyHotline':
            el.textContent = _activeBrand.telephony.emergencyHotline;
            if (el.tagName === 'A') el.href = `tel:${_activeBrand.telephony.emergencyHotline.replace(/\s+/g, '')}`;
            break;

          case 'whatsapp':
          case 'whatsappDisplay':
            el.textContent = _activeBrand.telephony.whatsappDisplay;
            if (el.tagName === 'A') el.href = _activeBrand.telephony.whatsappDirectUrl;
            break;

          case 'fax':
            el.textContent = _activeBrand.telephony.fax;
            break;

          // ── Emails ──
          case 'email':
          case 'supportEmail':
            el.textContent = _activeBrand.emails.support;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.support}`;
            break;

          case 'conciergeEmail':
            el.textContent = _activeBrand.emails.concierge;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.concierge}`;
            break;

          case 'generalEmail':
            el.textContent = _activeBrand.emails.general;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.general}`;
            break;

          case 'ordersEmail':
            el.textContent = _activeBrand.emails.orders;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.orders}`;
            break;

          case 'fittingsEmail':
            el.textContent = _activeBrand.emails.fittings;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.fittings}`;
            break;

          case 'adminEmail':
            el.textContent = _activeBrand.emails.admin;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.admin}`;
            break;

          case 'billingEmail':
            el.textContent = _activeBrand.emails.billing;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.billing}`;
            break;

          case 'securityEmail':
            el.textContent = _activeBrand.emails.security;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.security}`;
            break;

          case 'privacyEmail':
            el.textContent = _activeBrand.emails.privacy;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.privacy}`;
            break;

          case 'careersEmail':
            el.textContent = _activeBrand.emails.careers;
            if (el.tagName === 'A') el.href = `mailto:${_activeBrand.emails.careers}`;
            break;

          // ── Support Identifiers ──
          case 'deskName':
            el.textContent = _activeBrand.support.deskName;
            break;

          case 'helpdeskUrl':
            el.textContent = _activeBrand.support.helpdeskUrl;
            if (el.tagName === 'A') el.href = _activeBrand.support.helpdeskUrl;
            break;

          case 'portalUrl':
            el.textContent = _activeBrand.support.portalUrl;
            if (el.tagName === 'A') el.href = _activeBrand.support.portalUrl;
            break;

          case 'knowledgeBaseUrl':
            el.textContent = _activeBrand.support.knowledgeBaseUrl;
            if (el.tagName === 'A') el.href = _activeBrand.support.knowledgeBaseUrl;
            break;

          case 'ticketPrefix':
            el.textContent = _activeBrand.support.ticketPrefix;
            break;

          case 'slaTier':
            el.textContent = _activeBrand.support.slaTier;
            break;

          // ── Physical Location ──
          case 'building':
            el.textContent = _activeBrand.headquarters.building;
            break;

          case 'locality':
            el.textContent = _activeBrand.headquarters.locality;
            break;

          case 'city':
            el.textContent = _activeBrand.headquarters.city;
            break;

          case 'shortCity':
            el.textContent = _activeBrand.headquarters.shortCity;
            break;

          case 'district':
            el.textContent = _activeBrand.headquarters.district;
            break;

          case 'state':
            el.textContent = _activeBrand.headquarters.state;
            break;

          case 'pinCode':
            el.textContent = _activeBrand.headquarters.pinCode;
            break;

          case 'country':
            el.textContent = _activeBrand.headquarters.country;
            break;

          case 'address':
          case 'addressFull':
            el.textContent = _activeBrand.headquarters.formattedAddress;
            if (el.tagName === 'A') el.href = _activeBrand.headquarters.mapsUrl;
            break;

          case 'mapsUrl':
            if (el.tagName === 'A') el.href = _activeBrand.headquarters.mapsUrl;
            break;

          // ── Legal, Tax & Compliance ──
          case 'cin':
            el.textContent = _activeBrand.compliance.cin;
            break;

          case 'gstin':
            el.textContent = _activeBrand.compliance.gstin;
            break;

          case 'pan':
            el.textContent = _activeBrand.compliance.pan;
            break;

          case 'tan':
            el.textContent = _activeBrand.compliance.tan;
            break;

          case 'msme':
          case 'msmeRegistration':
            el.textContent = _activeBrand.compliance.msmeRegistration;
            break;

          case 'trademark':
          case 'trademarkRegistration':
            el.textContent = _activeBrand.compliance.trademarkRegistration;
            break;

          // ── Social & Digital Handles ──
          case 'instagram':
            el.textContent = _activeBrand.social.instagram.handle;
            if (el.tagName === 'A') el.href = _activeBrand.social.instagram.url;
            break;

          case 'instagramUrl':
            if (el.tagName === 'A') el.href = _activeBrand.social.instagram.url;
            break;

          case 'linkedin':
            el.textContent = _activeBrand.social.linkedin.handle;
            if (el.tagName === 'A') el.href = _activeBrand.social.linkedin.url;
            break;

          case 'linkedinUrl':
            if (el.tagName === 'A') el.href = _activeBrand.social.linkedin.url;
            break;

          case 'pinterest':
            el.textContent = _activeBrand.social.pinterest.handle;
            if (el.tagName === 'A') el.href = _activeBrand.social.pinterest.url;
            break;

          case 'facebook':
            el.textContent = _activeBrand.social.facebook.handle;
            if (el.tagName === 'A') el.href = _activeBrand.social.facebook.url;
            break;

          case 'youtube':
            el.textContent = _activeBrand.social.youtube.handle;
            if (el.tagName === 'A') el.href = _activeBrand.social.youtube.url;
            break;

          case 'twitter':
            el.textContent = _activeBrand.social.twitter.handle;
            if (el.tagName === 'A') el.href = _activeBrand.social.twitter.url;
            break;

          case 'website':
            el.textContent = _activeBrand.contact.website;
            if (el.tagName === 'A') el.href = _activeBrand.contact.website;
            break;
        }
      });

      // 3. Hydrate link href attributes via [data-brand-href]
      root.querySelectorAll('[data-brand-href]').forEach((el) => {
        if (el.tagName !== 'A') return;
        const key = el.getAttribute('data-brand-href');
        switch (key) {
          case 'supportEmail':
          case 'email':
            el.href = `mailto:${_activeBrand.emails.support}`;
            break;
          case 'conciergeEmail':
            el.href = `mailto:${_activeBrand.emails.concierge}`;
            break;
          case 'generalEmail':
            el.href = `mailto:${_activeBrand.emails.general}`;
            break;
          case 'phone':
          case 'primaryPhone':
          case 'helpline':
            el.href = `tel:${_activeBrand.telephony.primaryMobile.replace(/\s+/g, '')}`;
            break;
          case 'secondaryPhone':
          case 'secondaryMobile':
            el.href = `tel:${_activeBrand.telephony.secondaryMobile.replace(/\s+/g, '')}`;
            break;
          case 'emergencyHotline':
            el.href = `tel:${_activeBrand.telephony.emergencyHotline.replace(/\s+/g, '')}`;
            break;
          case 'vipPhone':
            el.href = `tel:${_activeBrand.telephony.vipConciergePhone.replace(/\s+/g, '')}`;
            break;
          case 'whatsapp':
            el.href = _activeBrand.telephony.whatsappDirectUrl;
            break;
          case 'website':
            el.href = _activeBrand.contact.website;
            break;
          default: {
            const val = BrandIdentity.get(key);
            if (val) {
              if (String(val).includes('@')) el.href = `mailto:${val}`;
              else if (/^[\d+\s-]+$/.test(String(val))) el.href = `tel:${String(val).replace(/\s+/g, '')}`;
              else el.href = String(val);
            }
            break;
          }
        }
      });

      // 3. Hydrate input/textarea placeholders via [data-brand-placeholder]
      //    Key examples: "phone", "email", "branchEmail", "alertsEmail", "website"
      const _emailDomain = (() => {
        try {
          const e = _activeBrand.emails && _activeBrand.emails.general;
          return e ? e.split('@')[1] : 'yourdomain.com';
        } catch (_) { return 'yourdomain.com'; }
      })();
      root.querySelectorAll('[data-brand-placeholder]').forEach((el) => {
        if (el.placeholder === undefined) return; // skip non-input elements
        const key = el.getAttribute('data-brand-placeholder');
        let val = '';
        switch (key) {
          case 'phone':
          case 'mobile':
          case 'whatsapp':
            val = '+91 XXXXX XXXXX';
            break;
          case 'email':
          case 'employeeEmail':
            val = `employee@${_emailDomain}`;
            break;
          case 'branchEmail':
            val = `branch@${_emailDomain}`;
            break;
          case 'alertsEmail':
          case 'notifEmail':
            val = `alerts@${_emailDomain}`;
            break;
          case 'supportEmail':
            val = (_activeBrand.emails && _activeBrand.emails.support) || `support@${_emailDomain}`;
            break;
          case 'generalEmail':
            val = (_activeBrand.emails && _activeBrand.emails.general) || `info@${_emailDomain}`;
            break;
          case 'website':
            val = (_activeBrand.contact && _activeBrand.contact.website) || `https://${_emailDomain}`;
            break;
          case 'gstin':
            val = (_activeBrand.compliance && _activeBrand.compliance.gstin) || 'e.g. 33XXXXX1234F1Z9';
            break;
          case 'pan':
            val = (_activeBrand.compliance && _activeBrand.compliance.pan) || 'e.g. XXXXX1234F';
            break;
          default:
            // Allow dot-path lookups, e.g. data-brand-placeholder="telephony.primaryMobile"
            val = String(BrandIdentity.get(key) || '');
            break;
        }
        if (val) el.placeholder = val;
      });
    },

    /**
     * Initializes the module and triggers hydration.
     */
    init() {
      this.applyToDOM();
    }
  };

  // Auto-initialize on load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => BrandIdentity.init());
    } else {
      BrandIdentity.init();
    }
  }

  return BrandIdentity;
});
