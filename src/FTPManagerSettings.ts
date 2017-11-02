import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface FTP {

    name: string;     // the name that the user defines for the project
    rootPath: string; // the root path of this project
    paths: string[];  // the 'other paths' when you have multifolder project
    group: string;    // the group(s) that it belongs to

};

export interface FTPList extends Array<FTP> {};

class FTPItem implements FTP {

    public name: string;     // the name that the user defines for the project
    public rootPath: string; // the root path of this project
    public paths: string[];  // the 'other paths' when you have multifolder project
    public group: string;    // the group(s) that it belongs to

    constructor( pname: string, prootPath: string ) {

        this.name = pname;
        this.rootPath = prootPath;
        this.paths = [];
        this.group = "";

    }
}

export class FTPManagerSettings {

    private SETTINGS_FILE: string;

    constructor () {

        this.SETTINGS_FILE = 'remote_ftp_manager.json';

    }

    public openSettingFile() {

        vscode.workspace.openTextDocument( this.getSettingFileName() ).then( doc => {

            vscode.window.showTextDocument( doc );

        } );

    }

    private getSettingFileName() {

        let settingFile: string = '';
        let appdata: string     = process.env.APPDATA || ( process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : '/var/local' );
        let channelPath: string = ( vscode.env.appName.indexOf( 'Insiders' ) > 0 ? 'Code - Insiders' : 'Code' );

        settingFile = path.join( appdata, channelPath, 'User', this.SETTINGS_FILE );

        // in linux, it may not work with /var/local, then try to use /home/myuser/.config
        if ( ( process.platform === 'linux' ) && ( ! fs.existsSync( settingFile ) ) ) {

            settingFile = path.join( os.homedir(), '.config/', channelPath, 'User', this.SETTINGS_FILE );

        }

        if ( ! fs.existsSync( settingFile ) ) {

            fs.writeFileSync( settingFile, '' );

        }

        return settingFile;

    }

}