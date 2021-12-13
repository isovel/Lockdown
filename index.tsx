
/* ———————————————————— Copyright (c) 2021 toastythetoaster ————————————————————
 *
 * Lockdown Plugin
 *
 * ————————————————————————————————————————————————————————————————————————————— */

import crypto from 'crypto';

import { UPlugin, StyleSheet, SettingsObject } from '@classes';
//@ts-ignore
import { openModal, closeModal, closeAllModals } from '@modules/Modals';
import { React } from '@webpack';

import { LockModal, LockdownSettings } from './components';
import { autoBind } from '@util';

const style: StyleSheet = require('./style.scss');
const settings: SettingsObject = Astra.settings.get('Lockdown');

class Lockdown extends UPlugin {
  lastFocus: number = Date.now();
  interval: NodeJS.Timeout
  lockModal: string | null = null;
  get locked(): boolean {
    return this.lockModal !== null;
  }
  get timeoutTime(): number {
    return settings.get('timeoutTime', 5);
  }

  constructor() {
    super();
    autoBind(this);
  }

  start(): void {
    this.__uSettingsTabs = {
      sections: [
        {
          section: 'Lockdown',
          label: 'Lockdown',
          element: () => <LockdownSettings onSetPasscode={this._setPasscode}/>
        }
      ]
    };
    style.attach();
    window.addEventListener('mousemove', this._mousemoveCallback, false);
    window.addEventListener('keydown', this._keydownCallback, false);
    window.addEventListener('keydown', this._debugCallback, false);
    this._setInterval();
  }

  stop(): void {
    this._clearInterval();
    window.removeEventListener('keydown', this._debugCallback, false);
    window.removeEventListener('keydown', this._keydownCallback, false);
    window.removeEventListener('mousemove', this._mousemoveCallback, false);
    style.detach();
  }

  private _setPasscode(currentPasscode: string, newPasscode: string): void | string {
    if (this.locked) return 'Cannot change passcode while client is locked!';
    if (!this._checkPasscode(currentPasscode)) return 'Passcode does not match.';
    const salt = crypto.randomBytes(16).toString('hex');
    settings.set('pwd_salt', salt);
    settings.set('pwd_hash', crypto.pbkdf2Sync(newPasscode, salt, 1000, 64, 'sha512').toString('hex'));
  }

  private _checkPasscode(passcode: string): boolean {
    return crypto.pbkdf2Sync(passcode, settings.get('pwd_salt', ''), 1000, 64, 'sha512').toString('hex') === settings.get('pwd_hash', '');
  }

  private _lock(): void | boolean {
    if (this.locked) return false;
    closeAllModals();
    //@ts-ignore
    this.lockModal = openModal(props => <LockModal {...props} onUnlock={(passcode): void | boolean => this._unlock(passcode)}/>, { onCloseRequest: () => null });
  }

  private _unlock(passcode: string): void | boolean {
    if (!this.locked) return false;
    if (this._checkPasscode(passcode)) {
      this.lastFocus = Date.now();
      closeModal(this.lockModal);
      this.lockModal = null;
    } else return false;
    
    return true;
  }

  private _setInterval(): void {
    this.interval && clearInterval(this.interval);
    this.interval = setInterval(this._intervalCallback, 1000);
  }

  private _clearInterval(): void {
    this.interval && clearInterval(this.interval);
  }

  private _compareTime(n): boolean {
    if (this.timeoutTime === 0) return false;
    if (!this.locked && ((n - this.lastFocus) / 1000) >= (this.timeoutTime * 60)) return true;
    return false;
  }

  private _mousemoveCallback(_ev: MouseEvent): void {
    try {
      this.lastFocus = Date.now();
    } catch (e) {
      Astra.error(e);
    }
  }

  private _keydownCallback(ev: KeyboardEvent): void {
    try {
      this.lastFocus = Date.now();
      if (!ev.repeat && ev.ctrlKey && ev.key === 'l') this._lock();
    } catch (e) {
      Astra.error(e);
    }
  }

  private _intervalCallback(): void {
    try {
      if (this._compareTime(Date.now())) this._lock();
    } catch (e) {
      Astra.error(e);
    }
  }

  private _debugCallback(ev: KeyboardEvent): void {
    if (settings.get('enableDebugKeybind', false) && this.locked && !ev.repeat && ev.shiftKey && ev.key === 'Escape') try {
      closeModal(this.lockModal);
      this.lockModal = null;
    } catch (e) {
      Astra.error(e);
    }
  }
}

module.exports = Lockdown;
