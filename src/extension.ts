import * as vscode from 'vscode';
import { SessionHandler } from './settings';


export function activate(context: vscode.ExtensionContext) {

    let sessionHandler: SessionHandler = new SessionHandler();


    // Add Commands
    context.subscriptions.push( vscode.commands.registerCommand( 'extension.editSessions', () => { sessionHandler.open(); } ) );

}