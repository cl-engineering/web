/* Shared behaviour for pre-rendered StockApp product SEO pages. */
(() => {
  'use strict';
  const data = window.CircleLinePartData || {};
  const input = document.querySelector('#qty');
  const status = document.querySelector('#status');
  function quantity() {
    const n = Number(input.value);
    if (!Number.isSafeInteger(n) || n < 1 || n > 1000000) {
      input.setCustomValidity('Please enter a valid whole-number quantity.');
      input.reportValidity();
      return null;
    }
    input.setCustomValidity('');
    return n;
  }
  input.addEventListener('input', () => input.setCustomValidity(''));
  document.querySelector('#add').addEventListener('click', () => {
    const n = quantity();
    if (n === null) return;
    try {
      const picked = JSON.parse(sessionStorage.getItem('circleLineEnquiryV1') || '{}');
      picked[data.key] = n;
      sessionStorage.setItem('circleLineEnquiryV1', JSON.stringify(picked));
      location.href = '../../#part/' + encodeURIComponent(data.key);
    } catch (_) {
      status.textContent = 'Storage unavailable; please use Email about this part.';
    }
  });
  document.querySelector('#email').addEventListener('click', () => {
    const n = quantity();
    if (n === null) return;
    const subject = 'RFQ: ' + data.code;
    const body = 'Hello Circle Line,\n\nPlease quote this part:\n\nProduct: ' + data.title +
      '\nCode: ' + data.code + '\nQuantity: ' + n + ' ' + data.unit +
      '\n\nPlease confirm specification, price, availability and lead time.\n\nThank you.';
    location.href = 'mailto:sales@circleline.co.nz?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
