import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Session {

    name: string;
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    remote_path: string;
    connect_timeout: number;
    localpath: string;

};

export interface SessionList extends Array<Session> {};

class SessionItem implements Session {

    public name: string;
    public type: string;
    public host: string;
    public port: number;
    public username: string;
    public password: string;
    public remote_path: string;
    public connect_timeout: number;
    public localpath: string;

    constructor ( p_name: string, p_type: string, p_host: string, p_port: number, p_username: string, p_password: string, p_remote_path: string, p_connect_timeout: number, p_localpath: string ) {

        this.name            = p_name;
        this.type            = p_type;
        this.host            = p_host;
        this.port            = p_port;
        this.username        = p_username;
        this.password        = p_password;
        this.remote_path     = p_remote_path;
        this.connect_timeout = p_connect_timeout;
        this.localpath       = p_localpath;

    }
}

export class SessionHandler {

    private filename: string;
    private sessionList: SessionList;

    constructor () {

        this.filename    = this.getFileName();
        this.sessionList = <SessionList> [];


        this.init();

    }

    public add( name: string, type: string, host: string, port: number, username: string, password: string, remote_path: string, connect_timeout: number, localpath: string ): void {

        this.sessionList.push( new SessionItem( name, type, host, port, username, password, remote_path, connect_timeout, localpath ) );
        return;

    }

    public remove( name: string ): Session {

        for ( let index = 0; index < this.sessionList.length; index++ ) {

            let element: Session = this.sessionList[index];

            if ( element.name.toLowerCase() === name.toLowerCase() ) {

                return this.sessionList.splice( index, 1 )[ 0 ];

            }

        }

    }

    public exists( name: string ): boolean {

        let found: boolean = false;

        for ( let element of this.sessionList ) {

            if ( element.name.toLocaleLowerCase() === name.toLocaleLowerCase() ) {

                found = true;

            }

        }

        return found;
    }

    public length(): number {

        return this.sessionList.length;

    }

    public load(): string {

        let items = [];

        if ( ! fs.existsSync( this.filename ) ) {

            this.sessionList = items as SessionList;
            this.save();
            return '';

        }

        try {

            items = JSON.parse( fs.readFileSync( this.filename ).toString());
            this.sessionList = items as SessionList;

            return '';

        } catch ( error ) {

            console.log( error );
            return error.toString();

        }

    }

    public reload() {

        let items = [];


        if ( ! fs.existsSync( this.filename ) ) {

            this.sessionList = items as SessionList;
            this.save();

        } else {

            items = JSON.parse( fs.readFileSync( this.filename ).toString() );
            this.sessionList = items as SessionList;

        }

    }

    public save() {

        fs.writeFileSync( this.filename, JSON.stringify( this.sessionList, null, '\t' ) );

    }

    public map(): any {

        let newItems = this.sessionList.map( item => {

            return {

                label: item.name,
                description: item.host

            };

        } );

        return newItems;

    }

    public open() {

        vscode.workspace.openTextDocument( this.filename ).then( doc => {

            vscode.window.showTextDocument( doc );

        } );

    }

    private init() {

        if ( ! fs.existsSync( this.filename ) ) {

            // set setting file with sample item
            this.add( 'name', 'type', 'host', 21, 'username', 'password', 'remote_path', 30, 'localpath' );
            this.save();

        }

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

        return settingFile;

    }

}