import { workspace } from 'coc.nvim';
import path from 'path';
import { Position, TextDocument } from 'vscode-languageserver-protocol';

export function getWords(line: string, position: Position): string {
  const text = line.slice(0, position.character);
  const index = text.search(/[a-z0-9\.\$_-]*$/i);
  if (index === -1) {
    return '';
  }

  return text.slice(index);
}

export function getCurrentWords(
  document: TextDocument,
  position: Position,
): string {
  const wordRange = workspace
    .getDocument(document.uri)
    .getWordRangeAtPosition(position, '-$');
  if (!wordRange) return '';
  return document.getText(wordRange);
}
/**
 * TODO find better way to get a file path not starting with `file:///`
 */
export function getCurrentDirFromDocument(document: TextDocument) {
  return path.dirname(document.uri).replace(/^file:\/\//, '');
}

export function getCurrentFileNameFromDocument(document: TextDocument) {
  return document.uri.replace(/^file:\/\//, '');
}
