import { ExtensionContext, languages, Uri, workspace } from 'coc.nvim';
import {
  CompletionItemKind,
  Location,
  MarkupKind,
  Position,
  Range,
  TextDocument,
} from 'vscode-languageserver-protocol';
import {
  getCurrentDirFromDocument,
  getCurrentFileNameFromDocument,
  getCurrentWords,
} from '../util';
import { findStyle, IStylePosition } from './findStyle';
import { findStyleDependencies } from './findStyleDependencies';
import findStyleSelectors from './findStyleSelectors';

const SUPPORT_LANGUAGES = [
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
];

// Cmd+Click jump to style definition
async function provideDefinition(document: TextDocument, position: Position) {
  const { line } = await workspace.getCursorPosition();
  const fileName = getCurrentFileNameFromDocument(document);
  const directory = getCurrentDirFromDocument(document);
  const currentText = await workspace.getLine(document.uri, line);

  if (!/style|className/g.test(currentText)) return;

  const word = getCurrentWords(document, position);
  if (!word) return;

  const matched = findStyle(directory, word, findStyleDependencies(fileName));
  if (matched) {
    const matchedPosition: IStylePosition = matched.position;
    const filePath = Uri.file(matched.file).toString();
    const targetRange: Range = {
      start: Position.create(
        matchedPosition.start.line - 1,
        position.character,
      ),
      end: Position.create(
        matchedPosition.start.column - 1,
        position.character,
      ),
    };
    return Location.create(filePath, targetRange);
  }
}

// Show current style on hover over
async function provideHover(document: TextDocument, position: Position) {
  const { line } = await workspace.getCursorPosition();
  const fileName = getCurrentFileNameFromDocument(document);
  const directory = getCurrentDirFromDocument(document);
  const currentText = await workspace.getLine(document.uri, line);

  if (!/style|className/g.test(currentText)) return;

  const word = getCurrentWords(document, position);
  if (!word) return;

  const matched = findStyle(directory, word, findStyleDependencies(fileName));

  if (matched) {
    // Markdown css code
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: `\`\`\`css \n ${matched.code} \n \`\`\`\``,
      },
    };
  }
}

// Styles auto Complete
async function provideCompletionItems(
  document: TextDocument,
  position: Position,
) {
  const { line } = await workspace.getCursorPosition();
  const fileName = getCurrentFileNameFromDocument(document);
  const directory = getCurrentDirFromDocument(document);
  const currentText = await workspace.getLine(document.uri, line);
  if (!/style|className/g.test(currentText)) return;

  // In case of cursor shaking
  const word = currentText.substring(0, position.character);
  const styleDependencies = findStyleDependencies(fileName);

  for (let i = 0, l = styleDependencies.length; i < l; i++) {
    if (
      // className=xxx
      /className=/.test(currentText) ||
      // style={styles.xxx}
      (styleDependencies[i].identifier &&
        new RegExp(`${styleDependencies[i].identifier}\\.$`).test(word))
    ) {
      return findStyleSelectors(directory, styleDependencies).map(
        (selector: string) => {
          // Remove class selector `.`, When use styles.xxx.
          return {
            label: selector.replace('.', ''),
            kind: CompletionItemKind.Variable,
          };
        },
      );
    }
  }
}

export default function styleInfoViewer(context: ExtensionContext) {
  // Cmd+Click jump to style definition
  context.subscriptions.push(
    languages.registerDefinitionProvider(SUPPORT_LANGUAGES, {
      provideDefinition,
    }),
  );
  context.subscriptions.push(
    languages.registerHoverProvider(SUPPORT_LANGUAGES, { provideHover }),
  );

  // Show current style on hover over
  // Styles auto Complete
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      'coc-styleInfoViewer',
      'stylehelper',
      SUPPORT_LANGUAGES,
      { provideCompletionItems },
      ['.', '"', "'", ' '],
    ),
  );
}
