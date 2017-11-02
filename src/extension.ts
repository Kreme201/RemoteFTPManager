import * as vscode from 'vscode';
import { SettingHandler } from './settings';


export function activate(context: vscode.ExtensionContext) {

    let settingHandler: SettingHandler = new SettingHandler();


    // Add Commands
    context.subscriptions.push( vscode.commands.registerCommand( 'extension.editSettings', () => { settingHandler.open(); } ) );

}