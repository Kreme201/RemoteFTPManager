import * as vscode from 'vscode';
import { FTPManagerSettings } from './FTPManagerSettings';


export function activate(context: vscode.ExtensionContext) {

    let ftpManagerSettings: FTPManagerSettings = new FTPManagerSettings();


    // Add Commands
    context.subscriptions.push( vscode.commands.registerCommand( 'extension.editSettings', () => { ftpManagerSettings.openSettingFile(); } ) );

}

export function deactivate() {



}