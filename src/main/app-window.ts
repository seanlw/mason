import { BrowserWindow } from 'electron'
import * as path from 'path'
import { staticPath } from '../lib/path'
import { format as formatUrl } from 'url'
import { MenuEvent } from './menu'
import { Emitter, Disposable } from 'event-kit'
import { IUpdateState } from '../lib/app-state'

let windowStateKeeper: any | null = null
const __DEV__ = process.env.NODE_ENV === 'development'

export class AppWindow {
  private window: Electron.BrowserWindow
  private emitter = new Emitter()

  private minWidth: number = 992
  private minHeight: number = 600

  public isClosing: boolean = false

  public constructor() {
    if (!windowStateKeeper) {
      windowStateKeeper = require('electron-window-state')
    }

    const savedWindowState = windowStateKeeper({
      defaultWidth: this.minWidth,
      defaultHeight: this.minHeight
    })

    const windowOptions: Electron.BrowserWindowConstructorOptions = {
      x: savedWindowState.x,
      y: savedWindowState.y,
      width: savedWindowState.width,
      height: savedWindowState.height,
      minWidth: this.minWidth,
      minHeight: this.minHeight,
      show: false,
      backgroundColor: '#fff',
      webPreferences: {
        webSecurity: !__DEV__
      }
    }

    /* TODO: lets deail with no window frames later
    if (__DARWIN__) {
      windowOptions.titleBarStyle = 'hidden'
    }
    else if (__WIN32__) {
      windowOptions.frame = false
    }
    */

    if (__LINUX__) {
      windowOptions.icon = path.join(staticPath(), 'icon-logo.png')
    }

    this.window = new BrowserWindow(windowOptions)
    savedWindowState.manage(this.window)
  }

  public load() {
    this.window.webContents.once('did-finish-load', () => {
      this.emitDidLoad()
    })

    if (__DEV__) {
      this.window.webContents.openDevTools()
      this.window.loadURL(`http://localhost:53500`)

      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS
      } = require('electron-devtools-installer')

      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name: string) => console.log(`Added Extension:  ${name}`))
        .catch((err: Error) => console.log('An error occurred: ', err))
    }
    else {
      this.window.loadURL(formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      }))
    }
  }

  public destroy() {
    this.window.destroy()
  }

  public onClose(fn: (e: any) => void) {
    this.window.on('close', fn)
  }

  public onDidLoad(fn: () => void): Disposable {
    return this.emitter.on('did-load', fn)
  }

  public show() {
    this.window.show()
  }

  public sendMenuEvent(name: MenuEvent) {
    this.show()

    this.window.webContents.send('menu-event', { name })
  }

  public sendUpdateState(state: IUpdateState) {
    this.window.webContents.send('update-changed', { state })
  }

  public sendUpdateError(error: Error) {
    this.window.webContents.send('update-error', { error })
  }

  public sendWindowClosing() {
    this.window.webContents.send('window-closing')
  }

  private emitDidLoad() {
    this.emitter.emit('did-load', null)
  }

}