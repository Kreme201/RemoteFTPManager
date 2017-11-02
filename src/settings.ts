import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Session {

    name: string;     // the name that the user defines for the Session
    rootPath: string; // the root path of this Session
    paths: string[];  // the 'other paths' when you have multifolder Session
    group: string;    // the group(s) that it belongs to

};

export interface SessionList extends Array<Session> {};

class SessionItem implements Session {

    public name: string;     // the name that the user defines for the Session
    public rootPath: string; // the root path of this Session
    public paths: string[];  // the 'other paths' when you have multifolder Session
    public group: string;    // the group(s) that it belongs to

    constructor( pname: string, prootPath: string ) {

        this.name = pname;
        this.rootPath = prootPath;
        this.paths = [];
        this.group = "";

    }
}

export class SettingHandler {

    private filename: string;
    private sessionList: SessionList;

    constructor () {

        this.filename = this.getFileName();
        this.sessionList   = <SessionList> [];

    }

    /**
     * Adds a Session to the list
     *
     * @param `name` The [Session Name](#Session.name)
     * @param `rootPath` The [Session Rooth Path](#Session.rootPath)
     * @param `rootPath` The [Session Group](#Session.group)
     *
     * @return `void`
     */
    public push( name: string, rootPath: string, group: string ): void {

        this.sessionList.push( new SessionItem( name, rootPath ) );
        return;

    }

    /**
     * Removes a Session to the list
     *
     * @param `name` The [Session Name](#Session.name)
     *
     * @return The [Session](#Session) that was removed
     */
    public pop( name: string ): Session {

        for ( let index = 0; index < this.sessionList.length; index++ ) {

            let element: Session = this.sessionList[index];

            if ( element.name.toLowerCase() === name.toLowerCase() ) {

                return this.sessionList.splice( index, 1 )[ 0 ];

            }

        }

    }

    /**
     * Adds another `path` to a Session
     *
     * @param `name` The [Session Name](#Session.name)
     * @param `path` The [Session Path](#Session.paths)
     *
     * @return `void`
     */
    public addPath( name: string, path: string ): void {

        for ( let element of this.sessionList ) {

            if ( element.name.toLowerCase() === name.toLowerCase() ) {

                element.paths.push( path );

            }

        }

    }

    /**
     * Updates the `rootPath` of a Session
     *
     * @param `name` The [Session Name](#Session.name)
     * @param `name` The [Session Root Path](#Session.rootPath)
     *
     * @return `void`
     */
    public updateRootPath( name: string, path: string ): void {

        for ( let element of this.sessionList ) {

            if ( element.name.toLowerCase() === name.toLowerCase() ) {

                element.rootPath = path;

            }

        }

    }

    /**
     * Removes a `path` from a Session
     *
     * @param `name` The [Session Name](#Session.name)
     * @param `path` The [Session Path](#Session.paths)
     *
     * @return `void`
     */
    public removePath( name: string, path: string ): void {

        for ( let element of this.sessionList ) {

            if ( element.name.toLowerCase() === name.toLowerCase() ) {

                for ( let indexPath = 0; indexPath < element.paths.length; indexPath++ ) {

                    let elementPath = element.paths[ indexPath ];

                    if ( elementPath.toLowerCase() === path.toLowerCase() ) {

                        element.paths.splice( indexPath, 1 );
                        return;

                    }

                }

            }

        }

    }

    /**
     * Checks if exists a Session with a given `name`
     *
     * @param `name` The [Session Name](#Session.name) to search for Sessions
     *
     * @return `true` or `false`
     */
    public exists( name: string ): boolean {

        let found: boolean = false;

        for ( let element of this.sessionList ) {

            if ( element.name.toLocaleLowerCase() === name.toLocaleLowerCase() ) {

                found = true;

            }

        }

        return found;
    }

    /**
     * Checks if exists a Session with a given `rootPath`
     *
     * @param `rootPath` The path to search for Sessions
     *
     * @return A [Session](#Session) with the given `rootPath`
     */
    /*
    public existsWithRootPath(rootPath: string): Session {
        let rootPathUsingHome: string = PathUtils.compactHomePath(rootPath).toLocaleLowerCase();

        for (let element of this.sessionList) {
            if ((element.rootPath.toLocaleLowerCase() === rootPath.toLocaleLowerCase()) || (element.rootPath.toLocaleLowerCase() === rootPathUsingHome)) {
                return element;
            }
        }
    }
    */

    /**
     * Returns the number of Sessions stored in `remote_ftp_manager.json`
     *
     * > The _dynamic Sessions_ like VSCode and Git aren't present
     *
     * @return The number of Sessions
     */
    public length(): number {

        return this.sessionList.length;

    }

    /**
     * Loads the `remote_ftp_manager.json` file
     *
     * @return A `string` containing the _Error Message_ in case something goes wrong.
     *         An **empty string** if everything is ok.
     */
    public load(): string {

        let items = [];

        // missing file (new install)
        if ( ! fs.existsSync( this.filename ) ) {

            this.sessionList = items as SessionList;
            return '';

        }

        try {

            items = JSON.parse( fs.readFileSync( this.filename ).toString());

            if ( ( items.length > 0 ) && ( items[ 0 ].label ) ) { // OLD format

                for ( let element of items ) {

                    this.sessionList.push( new SessionItem( element.label, element.description ) );

                }

                this.save(); // save updated

            } else { // NEW format

                this.sessionList = items as SessionList;

            }

            return '';

        } catch ( error ) {

            console.log( error );
            return error.toString();

        }

    }

    /**
     * Reloads the `remote_ftp_manager.json` file.
     *
     * > Using a forced _reload_ instead of a _watcher_
     *
     * @return `void`
     */
    public reload() {

        let items = [];


        if ( ! fs.existsSync( this.filename ) ) { // missing file (new install)

            this.sessionList = items as SessionList;

        } else {

            items = JSON.parse( fs.readFileSync( this.filename ).toString() );
            this.sessionList = items as SessionList;

        }

    }

    /**
     * Saves the `remote_ftp_manager.json` file to disk
     *
     * @return `void`
     */
    public save() {

        fs.writeFileSync( this.filename, JSON.stringify( this.sessionList, null, '\t' ) );

    }

    /**
     * Maps the Sessions to be used by a `showQuickPick`
     *
     * @return A list of Sessions `{[label, description]}` to be used on a `showQuickPick`
     */
    public map(): any {

        let newItems = this.sessionList.map( item => {

            return {

                label: item.name,
                description: item.rootPath

            };

        } );

        return newItems;

    }

    public open() {

        vscode.workspace.openTextDocument( this.filename ).then( doc => {

            vscode.window.showTextDocument( doc );

        } );

    }

    private getFileName() {

        let settingFile: string = '';
        let appdata: string     = process.env.APPDATA || ( process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : '/var/local' );
        let channelPath: string = ( vscode.env.appName.indexOf( 'Insiders' ) > 0 ? 'Code - Insiders' : 'Code' );

        settingFile = path.join( appdata, channelPath, 'User', 'remote_ftp_manager.json' );

        // in linux, it may not work with /var/local, then try to use /home/myuser/.config
        if ( ( process.platform === 'linux' ) && ( ! fs.existsSync( settingFile ) ) ) {

            settingFile = path.join( os.homedir(), '.config/', channelPath, 'User', 'remote_ftp_manager.json' );

        }

        if ( ! fs.existsSync( settingFile ) ) {

            this.save();

        }

        return settingFile;

    }

}