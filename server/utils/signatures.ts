export type SignatureInfo = {
  homeownerName: string;
  contractorName: string;
};

/**
 * Build an underscore-padded line with the name centered.
 * - totalLength defaults to 32
 * - minPadding defaults to 3 underscores per side
 * - If the name cannot fit with the minimum padding, falls back to "___name___"
 */
export function buildCenteredNameLine(
  name: string,
  totalLength = 32,
  minPadding = 3
): string {
  const safeName = (name ?? '').replace(/\s+/g, '');

  if (!safeName) {
    return '_'.repeat(totalLength);
  }

  // If the name is too long to allow minPadding on both sides, fallback.
  if (safeName.length > totalLength - 2 * minPadding) {
    return `___${safeName}___`;
  }

  const available = totalLength - safeName.length;
  const left = Math.floor(available / 2);
  const right = available - left;

  if (left < minPadding || right < minPadding) {
    return `___${safeName}___`;
  }

  return `${'_'.repeat(left)}${safeName}${'_'.repeat(right)}`;
}

/**
 * Append a formatted Signatures section to the contract markdown.
 */
export function appendSignaturesSection(
  contractMarkdown: string,
  signatures: SignatureInfo
): string {
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

// Demo
console.log(buildCenteredNameLine('Kunal'));
console.log(
  appendSignaturesSection('Contract body here.', {
    homeownerName: 'Kunal',
    contractorName: 'Rohit',
  })
);
