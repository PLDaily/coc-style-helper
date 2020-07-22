import { ExtensionContext, languages, Uri, workspace } from 'coc.nvim';
import * as fs from 'fs';
import * as path from 'path';
import {
  Location,
  MarkupKind,
  Position,
  Range,
  TextDocument,
  CompletionItemKind,
} from 'vscode-languageserver-protocol';
import { getCurrentFileNameFromDocument, getCurrentWords } from '../util';
import findVariables, { IVariables } from './findVariables';
import getFullModulePath from './getFullModulePath';

const SUPPORT_LANGUAGES = ['scss', 'sass'];
const VARIABLE_REG = /^\$/; // Sass variable start with $
// Fusion sass variables. https://ice.work/docs/guide/advance/fusion
let FUSION_VARIABLES: IVariables = {};

// Markdown for key and value
function getMarkdownInfo(key: string, value: string): string {
  return `Coc Style Helper \n${key}:${value};`;
}

// Variable definition
async function provideDefinition(document: TextDocument, position: Position) {
  const fileName = getCurrentFileNameFromDocument(document);
  const word = getCurrentWords(document, position);

  if (!VARIABLE_REG.test(word)) return;

  const matchedVariable =
    findVariables(fileName)[word] || FUSION_VARIABLES[word];
  if (matchedVariable) {
    const filePath = Uri.file(matchedVariable.filePath).toString();
    const targetRange: Range = {
      start: Position.create(matchedVariable.position.line, position.character),
      end: Position.create(matchedVariable.position.line, position.character),
    };
    return Location.create(filePath, targetRange);
  }
}

// Show current variable on hover over
async function provideHover(document: TextDocument, position: Position) {
  const fileName = getCurrentFileNameFromDocument(document);
  const word = getCurrentWords(document, position);

  if (!VARIABLE_REG.test(word)) return;

  const matchedVariable =
    findVariables(fileName)[word] || FUSION_VARIABLES[word];

  if (matchedVariable) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: getMarkdownInfo(
          word,
          // Show color preview display
          `${matchedVariable.value}`,
        ),
      },
    };
  }
}

// Variables auto Complete
async function provideCompletionItems(
  document: TextDocument,
  position: Position,
) {
  const fileName = getCurrentFileNameFromDocument(document);
  const variables = Object.assign(
    {},
    FUSION_VARIABLES,
    findVariables(fileName),
  );

  return Object.keys(variables).map(variable => {
    const variableValue = variables[variable].value;
    // Show color preview display
    const variableValueText = `${variableValue}`;

    return {
      label: variable,
      detail: variable,
      kind: CompletionItemKind.Variable,
      filterText: `${variable}: ${variableValue};`,
      documentation: getMarkdownInfo(variable, variableValueText),
    };
  });
}

// Process fusion component. https://ice.work/docs/guide/advance/fusion
function processFusionVariables() {
  try {
    const rootPath = workspace.rootPath || '';
    const buildConfig = JSON.parse(
      fs.readFileSync(path.join(rootPath, 'build.json'), 'utf-8'),
    );
    const fusionConfig = buildConfig.plugins.find(
      plugin => Array.isArray(plugin) && plugin[0] === 'build-plugin-fusion',
    );
    // Get themePackage config from build.json
    if (fusionConfig[1].themePackage) {
      FUSION_VARIABLES = findVariables(
        getFullModulePath(`~${fusionConfig[1].themePackage} `),
      );
    }
  } catch (e) {
    // ignore
  }
}

export default function sassVariablesViewer(context: ExtensionContext): void {
  processFusionVariables();

  // Listen build.json change
  workspace.onDidChangeTextDocument(
    e => {
      if (/build\.json$/.test(e.textDocument.uri.toString())) {
        processFusionVariables();
      }
    },
    null,
    context.subscriptions,
  );

  // Set definitionProvider
  context.subscriptions.push(
    languages.registerDefinitionProvider(SUPPORT_LANGUAGES, {
      provideDefinition,
    }),
  );

  context.subscriptions.push(
    languages.registerHoverProvider(SUPPORT_LANGUAGES, { provideHover }),
  );

  // Set provideHover
  // Styles auto Complete
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      'coc-sassVariablesViewer',
      'stylehelper',
      SUPPORT_LANGUAGES,
      { provideCompletionItems },
      ['.'],
    ),
  );
}

