import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand( 'extension.sayHello', sayHello );
    context.subscriptions.push(disposable);

    function sayHello() {

        _alert( 'Hello World!' );
        _debug( 'Hello World' );

    }

}


// Custom Alert Function :: Alias vscode.window.showInfomationMessage
function _alert( msg: string ) {

    vscode.window.showInformationMessage( msg );

}

// Custom Debug Function :: Alias console.log
function _debug( obj: any ) {

    console.log( obj );

}

export function deactivate() {
}