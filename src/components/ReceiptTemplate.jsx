// src/components/ReceiptTemplate.jsx
import React, { forwardRef, useImperativeHandle } from "react";

/**
 * ReceiptTemplate
 * - props: billItems, grandTotal, restaurant details (optional)
 * - Exposes getHtml() via ref so parent can open print window with this HTML
 */
const ReceiptTemplate = forwardRef(
  ({ billItems = [], grandTotal = 0, customerName = "" }, ref) => {
    const date = new Date();
    const invoiceNo =
      "INV-" +
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      "-" +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const vat = +(grandTotal * 0.05 || 0).toFixed(2);
    const totalWithVat = +(grandTotal + vat).toFixed(2);

    // expose getHtml to parent via ref
    useImperativeHandle(ref, () => ({
      getHtml: () => {
        const style = `
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
            }
            body {
              font-family: monospace;
              font-size: 12px;
              color: #000;
              width: 300px;
              margin: 0 auto;
              padding: 8px;
            }
            .center { text-align: center; }
            .bold { font-weight: 700; }
            .small { font-size: 11px; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 2px 0; vertical-align: top; }
            th { text-align: left; border-bottom: 1px dashed #000; }
            .right { text-align: right; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .footer { margin-top: 6px; border-top: 1px solid #000; padding-top: 6px; text-align:center; font-size:11px; }
          </style>
        `;

        const rows = billItems
          .map(
            (it, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${escapeHtml(it.name)}</td>
                <td class="right">${it.quantity}</td>
                <td class="right">${it.price.toFixed(2)}</td>
                <td class="right">${(it.price * it.quantity).toFixed(2)}</td>
              </tr>`
          )
          .join("");

        const html = `
          <!doctype html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>Invoice ${invoiceNo}</title>
              ${style}
            </head>
            <body>
              <div class="center bold" style="font-size:14px">JUMAIRA RESTAURANT</div>
              <div class="center small">Near Shamsu Trading and Khalifa Masjid</div>
              <div class="center small">Airport Road, Abudhabi</div>
              <div class="center small">Tel : 02-6214 605 | Mob : 050 – 522 60 62</div>
              <div class="center small">TRN : 100230364000003</div>
              <div class="divider"></div>

              <div class="small">
                <div><strong>Invoice No:</strong> ${invoiceNo}</div>
                <div><strong>Date:</strong> ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                <div><strong>Customer:</strong> ${escapeHtml(customerName || "N/A")}</div>
              </div>

              <div class="divider"></div>

              <table>
                <thead>
                  <tr>
                    <th style="width:20px;">#</th>
                    <th>Item</th>
                    <th class="right" style="width:35px;">Qty</th>
                    <th class="right" style="width:50px;">Unit</th>
                    <th class="right" style="width:60px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>

              <div class="divider"></div>

              <table>
                <tr>
                  <td colspan="4">Subtotal</td>
                  <td class="right">${grandTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="4">VAT 5%</td>
                  <td class="right">${vat.toFixed(2)}</td>
                </tr>
                <tr class="bold">
                  <td colspan="4">Total (AED)</td>
                  <td class="right">${totalWithVat.toFixed(2)}</td>
                </tr>
              </table>

              <div class="footer">
                <div>THANK YOU! VISIT AGAIN</div>
                <div>ALL PRICES IN AED (Inclusive of VAT)</div>
              </div>
            </body>
          </html>
        `;
        return html;
      },
      getInvoiceNo: () => invoiceNo,
    }));

    function escapeHtml(str = "") {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    return null;
  }
);

export default ReceiptTemplate;
