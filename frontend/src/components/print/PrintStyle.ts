/**
 * Enhanced Print Styles for ERPNext Documents
 * Colorful, professional, and well-organized print output
 */

export const getEnhancedPrintStyles = () => `
  /* ============================================
     BASE STYLES
     ============================================ */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #1e293b;
    background: #ffffff;
    font-size: 14px;
  }

  .print-document {
    max-width: 210mm;
    margin: 0 auto;
    padding: 20mm;
    background: white;
  }

  /* ============================================
     DOCUMENT HEADER - Gradient & Modern
     ============================================ */
  .print-document > h1:first-child,
  .print-document > div:first-child h1,
  .document-title,
  h1.document-title {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: #f97316; /* Fallback for browsers that don't support background-clip */
    margin-bottom: 0.5rem;
    padding-bottom: 1rem;
    border-bottom: 4px solid #f97316;
    letter-spacing: -0.025em;
    text-transform: uppercase;
  }

  /* Document ID/Number - Accent Color */
  .document-id,
  .print-document > h2:first-of-type,
  .print-document > div:first-child h2 {
    font-size: 1.125rem;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 2rem;
    letter-spacing: 0.05em;
  }

  /* ============================================
     SECTION HEADERS - Colorful & Bold
     ============================================ */
  h2, h3, h4 {
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
    position: relative;
  }

  h2 {
    font-size: 1.5rem;
    color: #1e40af;
    padding-left: 1rem;
    border-left: 6px solid #3b82f6;
    background: linear-gradient(90deg, #dbeafe 0%, transparent 100%);
    padding: 0.75rem 0 0.75rem 1rem;
    margin-left: -0.5rem;
  }

  h3 {
    font-size: 1.25rem;
    color: #059669;
    padding-left: 0.75rem;
    border-left: 4px solid #10b981;
  }

  h4 {
    font-size: 1.125rem;
    color: #7c3aed;
    padding-left: 0.5rem;
    border-left: 3px solid #a78bfa;
  }

  /* ============================================
     INFORMATION SECTIONS - Vertical Layout
     ============================================ */
  
  /* Document Info Grid - FIXED: Vertical display of label and value */
  .document-info,
  .info-grid,
  .info-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .info-item,
  .field-item {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-left: 4px solid #0ea5e9;
    padding: 1rem;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column; /* VERTICAL LAYOUT */
    gap: 0.5rem;
  }

  /* Labels - Display above values */
  dt,
  .info-label,
  .field-label,
  .label {
    font-weight: 700;
    color: #0369a1;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: block;
    margin-bottom: 0.25rem;
  }

  /* Values - Display below labels */
  dd,
  .info-value,
  .field-value,
  .value {
    font-weight: 600;
    color: #0f172a;
    font-size: 1rem;
    display: block;
    margin: 0;
    word-wrap: break-word;
  }

  /* Alternative layout for label-value pairs */
  .row,
  .field-row {
    display: flex;
    flex-direction: column; /* VERTICAL */
    gap: 0.25rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 4px;
  }

  .row .label,
  .field-row .label {
    font-weight: 700;
    color: #475569;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .row .value,
  .field-row .value {
    font-weight: 600;
    color: #0f172a;
    font-size: 0.9375rem;
  }

  /* ============================================
     DESCRIPTION LISTS (dl, dt, dd)
     ============================================ */
  dl {
    margin: 1.5rem 0;
  }

  dl.horizontal-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  dl.horizontal-list dt,
  dl.horizontal-list dd {
    display: block;
  }

  /* ============================================
     PARAGRAPHS
     ============================================ */
  p {
    margin-bottom: 1rem;
    color: #475569;
    font-size: 0.9375rem;
    line-height: 1.7;
  }

  /* ============================================
     TABLES - Modern & Colorful
     ============================================ */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 2rem 0;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }

  table thead {
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
    color: white;
  }

  table th {
    padding: 14px 16px;
    text-align: left;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    white-space: nowrap;
    color: white;
  }

  table th:last-child {
    border-right: none;
  }

  table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.875rem;
    color: #1e293b;
    vertical-align: top;
  }

  table tbody tr {
    transition: background-color 0.2s;
  }

  table tbody tr:nth-child(odd) {
    background: #ffffff;
  }

  table tbody tr:nth-child(even) {
    background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
  }

  table tbody tr:hover {
    background: linear-gradient(90deg, #dbeafe 0%, #bfdbfe 100%);
  }

  table tbody tr:last-child td {
    border-bottom: none;
  }

  /* Table Totals Row - Highlighted */
  table tfoot tr,
  table tbody tr.total-row,
  table tbody tr.total,
  table tbody tr:last-child.total-row {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    font-weight: 700;
  }

  table tfoot td,
  table tbody tr.total-row td,
  table tbody tr.total td {
    border-top: 3px solid #f59e0b;
    padding: 14px 16px;
    font-size: 0.9375rem;
    color: #78350f;
    font-weight: 700;
  }

  /* Number columns - Right aligned */
  table td:last-child,
  table th:last-child,
  .text-right,
  td.text-right,
  th.text-right {
    text-align: right;
  }

  /* ============================================
     BADGES & STATUS INDICATORS
     ============================================ */
  .badge,
  .status,
  span.badge,
  span.status {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .badge-success,
  .status-approved,
  .status-completed,
  .status-paid,
  .status-active {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }

  .badge-warning,
  .status-pending,
  .status-draft,
  .status-partial {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }

  .badge-danger,
  .status-rejected,
  .status-cancelled,
  .status-overdue,
  .status-inactive {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
  }

  .badge-info,
  .status-submitted,
  .status-processing,
  .status-open {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
  }

  /* ============================================
     CARD SECTIONS - Modern Design
     ============================================ */
  .card,
  .section,
  .panel {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    margin: 2rem 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    position: relative;
  }

  .card::before,
  .section::before,
  .panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);
    border-radius: 12px 12px 0 0;
  }

  .card-header,
  .section-header,
  .panel-header {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e40af;
    margin-bottom: 1.25rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e2e8f0;
  }

  /* ============================================
     GRID LAYOUTS
     ============================================ */
  .grid {
    display: grid;
    gap: 1.5rem;
  }

  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 768px) {
    .grid-cols-2,
    .grid-cols-3,
    .grid-cols-4 {
      grid-template-columns: 1fr;
    }
  }

  /* ============================================
     UTILITY CLASSES
     ============================================ */
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .font-medium { font-weight: 500; }
  .text-muted { color: #64748b; }
  .text-sm { font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }
  .text-lg { font-size: 1.125rem; }
  .text-xl { font-size: 1.25rem; }
  
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 0.75rem; }
  .mt-4 { margin-top: 1rem; }
  
  .p-2 { padding: 0.5rem; }
  .p-3 { padding: 0.75rem; }
  .p-4 { padding: 1rem; }
  
  .rounded { border-radius: 0.375rem; }
  .rounded-lg { border-radius: 0.5rem; }

  /* ============================================
     HIGHLIGHT BOX - For Important Info
     ============================================ */
  .highlight-box,
  .important-note,
  .alert {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-left: 6px solid #f59e0b;
    padding: 1.25rem;
    border-radius: 8px;
    margin: 1.5rem 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .highlight-box h4,
  .important-note h4,
  .alert h4 {
    color: #92400e;
    margin-top: 0;
    border-left: none;
    padding-left: 0;
  }

  /* ============================================
     SIGNATURE SECTION
     ============================================ */
  .signature-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 3rem;
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 3px solid #e2e8f0;
  }

  .signature-box {
    text-align: center;
    padding: 1rem;
  }

  .signature-line {
    border-bottom: 2px solid #475569;
    margin-bottom: 0.75rem;
    height: 70px;
  }

  .signature-label {
    font-weight: 700;
    color: #475569;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .signature-date {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  /* ============================================
     DOCUMENT FOOTER
     ============================================ */
  .document-footer {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 4px solid #f97316;
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
  }

  .document-footer .company-name {
    font-weight: 700;
    color: #1e40af;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  /* ============================================
     TERMS & CONDITIONS SECTION
     ============================================ */
  .terms-section {
    margin-top: 3rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border-radius: 8px;
    border-left: 4px solid #64748b;
  }

  .terms-section h3,
  .terms-section h4 {
    color: #475569;
    font-size: 1rem;
    margin-bottom: 1rem;
    border-left: none;
    padding-left: 0;
  }

  .terms-section ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  .terms-section li {
    padding-left: 1.5rem;
    position: relative;
    margin-bottom: 0.5rem;
    font-size: 0.8125rem;
    color: #475569;
  }

  .terms-section li::before {
    content: '•';
    position: absolute;
    left: 0.5rem;
    color: #3b82f6;
    font-weight: 700;
  }

  /* ============================================
     LISTS
     ============================================ */
  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  ul li, ol li {
    margin-bottom: 0.5rem;
    color: #475569;
  }

  /* ============================================
     PRINT-SPECIFIC STYLES
     ============================================ */
  @media print {
    body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    .print-document {
      margin: 0;
      padding: 15mm;
      box-shadow: none;
    }

    .no-print {
      display: none !important;
    }

    /* Ensure colors are preserved in print */
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    /* Preserve gradients and colors */
    h1, h2, h3, h4,
    table thead,
    .badge, .status,
    .card::before,
    .section::before,
    .panel::before,
    .info-item,
    .field-item {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    table thead {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%) !important;
      color: white !important;
    }

    table tbody tr:nth-child(even) {
      background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%) !important;
    }

    table tfoot tr,
    table tbody tr.total-row,
    table tbody tr.total {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
    }

    /* Page break control */
    table {
      page-break-inside: auto;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    thead {
      display: table-header-group;
    }

    tfoot {
      display: table-footer-group;
    }

    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
    }

    .signature-section,
    .document-footer {
      page-break-before: avoid;
    }

    .card,
    .section,
    .panel {
      page-break-inside: avoid;
    }
  }

  @page {
    margin: 15mm;
    size: A4;
  }
`;

/**
 * Preview Styles (for on-screen display)
 */
export const getPreviewStyles = () => `
  ${getEnhancedPrintStyles()}
  
  /* Additional preview-specific enhancements */
  body {
    background: #f8fafc;
  }
  
  .print-document {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
  }
`;