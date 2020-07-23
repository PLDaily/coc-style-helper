import { workspace } from 'coc.nvim';

// The JSX style attribute accepts a JavaScript object.
// If the active word is in an object, it seems like to completing style.
// EXP-1: style={ p|
// EXP-2: style={ \n p|
// EXP-3: position: 'relative', \n p|

export default async function isEditStyleKey(word: string, line: number) {
  let isEditStyle = false;

  const document = await workspace.document;
  if (!document) return false;
  const currentLineText = await workspace.getLine(document.uri, line);
  const previousLineText = await workspace.getLine(document.uri, line - 1);

  if (
    // EXP: marginLeft, margin-left
    /^[a-zA-Z-]+$/.test(word) &&
    // The JSX style attribute accepts a JavaScript object
    (currentLineText.indexOf('{') > -1 ||
      previousLineText.endsWith('{') ||
      previousLineText.endsWith(','))
  ) {
    isEditStyle = true;
  }

  return isEditStyle;
}
