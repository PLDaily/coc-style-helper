import { ExtensionContext } from 'coc.nvim';
import styleInfoViewer from './styleInfoViewer';
import cssClassAutoCompete from './cssClassAutoCompete';
import inlineStyleAutoComplete from './inlineStyleAutoComplete';
import sassVariablesViewer from './sassVariablesViewer';

export async function activate(context: ExtensionContext): Promise<void> {
  styleInfoViewer(context);
  cssClassAutoCompete(context);
  inlineStyleAutoComplete(context);
  sassVariablesViewer(context);
}
