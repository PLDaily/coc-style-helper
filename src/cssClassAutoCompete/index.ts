import { ExtensionContext, languages, workspace } from 'coc.nvim';
import fs from 'fs';
import path from 'path';
import {
  CompletionItem,
  CompletionItemKind,
  Position,
  TextDocument,
} from 'vscode-languageserver-protocol';
import { getCurrentDirFromDocument, getWords } from '../util';

function unique(arr: string[]) {
  return Array.from(new Set(arr));
}

async function provideCompletionItems(
  document: TextDocument,
  position: Position,
) {
  const completions: CompletionItem[] = [];
  const { line } = await workspace.getCursorPosition();
  const currentText = await workspace.getLine(document.uri, line);
  const word = getWords(currentText, position);
  const directory = getCurrentDirFromDocument(document);

  // Completion items for className writing.
  if (word !== '.') {
    return completions;
  }

  let classNames: string[] = [];
  // Read classNames from the file which is in the same directory.
  fs.readdirSync(directory).forEach(file => {
    if (path.extname(file) === '.jsx' || path.extname(file) === '.tsx') {
      const filePath = `${directory}/${file}`;
      // Add className="xxx" and  style={styles.xxx}
      classNames = classNames.concat(
        getClassNames(filePath),
        getCSSModuleKeys(filePath),
      );
    }
  });

  return unique(classNames).map(className => {
    return {
      label: className,
      kind: CompletionItemKind.Text,
    };
  });
}

// Process className="xxx"
function getClassNames(filePath: string): string[] {
  const code = fs.readFileSync(filePath, 'utf8');
  const reg = new RegExp('className="([\\w- ]+)"', 'g');

  let classNames: string[] = [];
  let matched: RegExpExecArray | null;

  // eslint-disable-next-line
  while ((matched = reg.exec(code)) !== null) {
    const className = matched[1];
    // Process className="test1 test2"
    if (className.includes(' ')) {
      classNames = classNames.concat(className.split(' '));
    } else {
      classNames.push(className);
    }
  }
  return classNames;
}

// Process style={styles.xxx}
function getCSSModuleKeys(filePath: string): string[] {
  const code = fs.readFileSync(filePath, 'utf8');
  const reg = new RegExp('style=\\{styles\\.([\\w\\.]+)\\}', 'g');

  const CSSModuleKeys: string[] = [];
  let matched: RegExpExecArray | null;

  // eslint-disable-next-line
  while ((matched = reg.exec(code)) !== null) {
    CSSModuleKeys.push(matched[1]);
  }
  return CSSModuleKeys;
}

// Set completion
export default function cssClassAutoCompete(context: ExtensionContext): void {
  const mode = [
    { scheme: 'file', language: 'css' },
    { scheme: 'file', language: 'less' },
    { scheme: 'file', language: 'sass' },
    { scheme: 'file', language: 'scss' },
  ];

  // Register completionItem provider
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      'coc-cssClassAutoCompete',
      'stylehelper',
      mode.map(x => x.language),
      { provideCompletionItems },
      ['.'],
    ),
  );
}
