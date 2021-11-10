
/* ———————————————————— Copyright (c) 2021 toastythetoaster ————————————————————
 *
 * Lockdown Plugin
 *
 * ————————————————————————————————————————————————————————————————————————————— */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-negated-condition */
/* eslint-disable curly */

import crypto from 'crypto';

import { UPlugin, StyleSheet, SettingsObject } from '@classes';
//@ts-ignore
import { closeModal, openModal } from '@modules/Modals';
import { React } from '@webpack';

import { LockModalErrorBoundary as LockModal } from './components';

const style: StyleSheet = require('./style.scss');
const settings: SettingsObject = Astra.settings.get('Lockdown');

class Lockdown extends UPlugin {
  lastFocus: number = Date.now();
  interval: NodeJS.Timeout
  lockModal: string | null = null;
  get locked(): boolean {
    return this.lockModal !== null;
  }

  start(): void {
    this._mousemoveCallback = this._mousemoveCallback.bind(this);
    this._intervalCallback = this._intervalCallback.bind(this);
    this._keydownCallback = this._keydownCallback.bind(this);
    // this._debugCallback = this._debugCallback.bind(this);
    style.attach();
    window.addEventListener('mousemove', this._mousemoveCallback, false);
    this.interval = setInterval(this._intervalCallback, 1000);
    window.addEventListener('keydown', this._keydownCallback, false);
    // window.addEventListener('keydown', this._debugCallback, false);
  }

  stop(): void {
    // window.removeEventListener('keydown', this._debugCallback, false);
    window.removeEventListener('keydown', this._keydownCallback, false);
    clearInterval(this.interval);
    window.removeEventListener('mousemove', this._mousemoveCallback, false);
    style.detach();
  }

  private _setPasscode(passcode: string): void | boolean {
    if (this.locked) return false;
    const salt = crypto.randomBytes(16).toString('hex');
    settings.set('pwd_salt', salt);
    settings.set('pwd_hash', crypto.pbkdf2Sync(passcode, salt, 1000, 64, 'sha512').toString('hex'));
  }

  private _checkPasscode(passcode: string): boolean {
    return crypto.pbkdf2Sync(passcode, settings.get('pwd_salt', ''), 1000, 64, 'sha512').toString('hex') === settings.get('pwd_hash', '');
  }


  private _lock(): void | boolean {
    if (this.locked) return false;
    //@ts-ignore
    this.lockModal = openModal(props => <LockModal {...props} onUnlock={(passcode): void | boolean => this._unlock(passcode)}/>, { onCloseRequest: () => null });
  }

  private _unlock(passcode: string): void | boolean {
    if (!this.locked) return false;
    if (this._checkPasscode(passcode)) {
      this.lastFocus = Date.now();
      closeModal(this.lockModal);
      this.lockModal = null;
      Astra.n11s.show('Unlocked', { timeout: 1000, color: '#00ff00', contentClassName: 'lockdown-notif' });
    } else {
      Astra.n11s.show('Incorrect passcode!', { timeout: 1000, color: '#ff0000', contentClassName: 'lockdown-notif' });
      return false;
    }
    return true;
  }

  private _compareTime(n): boolean {
    let val = false;
    // if (!this.locked && ((n - this.lastFocus) / 1000) >= 1) console.debug(Math.floor(((n - this.lastFocus) / 1000)));
    if (!this.locked && ((n - this.lastFocus) / 1000) >= (5 * 60)) val = true;
    return val;
  }

  private _mousemoveCallback(_ev: MouseEvent): void {
    try {
      this.lastFocus = Date.now();
    } catch (e) {
      Astra.error(e);
    }
  }

  private _keydownCallback(ev: KeyboardEvent): void {
    if (!ev.repeat && ev.ctrlKey && ev.key === 'l') {
      try {
        this._lock();
      } catch (e) {
        Astra.error(e);
      }
    }
  }

  private _intervalCallback(): void {
    try {
      if (this._compareTime(Date.now())) {
        this._lock();
      }
    } catch (e) {
      Astra.error(e);
    }
  }

  // private _debugCallback(ev: KeyboardEvent): void {
  //   if (this.locked && !ev.repeat && ev.shiftKey && ev.key === 'Escape') {
  //     try {
  //       closeModal(this.lockModal);
  //       this.lockModal = null;
  //     } catch (e) {
  //       Astra.error(e);
  //     }
  //   }
  // }
}

module.exports = Lockdown;
