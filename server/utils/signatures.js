/**
 * @typedef {Object} SignatureInfo
 * @property {string} homeownerName
 * @property {string} contractorName
 */

/**
 * Build an underscore-padded line with the name centered.
 * - totalLength defaults to 32
 * - minPadding defaults to 3 underscores per side
 * - If the name cannot fit with the minimum padding, falls back to "___name___"
 * @param {string} name
 * @param {number} [totalLength=32]
 * @param {number} [minPadding=3]
 * @returns {string}
 */
function buildCenteredNameLine(name, totalLength = 32, minPadding = 3) {
  const rawName = name ?? '';
  const trimmed = rawName.replace(/\s+/g, '');

  if (!trimmed) {
    return '_'.repeat(totalLength);
  }

  if (trimmed.length > totalLength - 2 * minPadding) {
    return `___${trimmed}___`;
  }

  const available = totalLength - trimmed.length;
  const left = Math.floor(available / 2);
  const right = available - left;

  if (left < minPadding || right < minPadding) {
    return `___${trimmed}___`;
  }

  return `${'_'.repeat(left)}${trimmed}${'_'.repeat(right)}`;
}

/**
 * Append a formatted Signatures section to the contract markdown.
 * @param {string} contractMarkdown
 * @param {SignatureInfo} signatures
 * @returns {string}
 */
function appendSignaturesSection(contractMarkdown, signatures) {
  const lines = [
    contractMarkdown.trimEnd(),
    '',
    'Signatures',
    '',
    buildCenteredNameLine(signatures.homeownerName),
    'Homeowner Printed Name',
    '',
    buildCenteredNameLine(signatures.contractorName),
    'Contractor Printed Name',
  ];

  return lines.join('\n');
}

module.exports = {
  buildCenteredNameLine,
  appendSignaturesSection,
};

// Demo
console.log(buildCenteredNameLine('Kunal'));
console.log(
  appendSignaturesSection('Contract body here.', {
    homeownerName: 'Kunal',
    contractorName: 'Rohit',
  })
);
