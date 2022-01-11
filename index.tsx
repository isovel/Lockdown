
/* ——————— Copyright (c) 2021-2022 toastythetoaster. All rights reserved. ———————
 *
 * Lockdown Plugin
 *
 * —————————————————————————————————————————————————————————————————————————————— */

import crypto from 'crypto';

import { UPlugin, StyleSheet, SettingsObject } from '@classes';
//@ts-ignore
import { openModal, openConfirmationModal, closeModal, closeAllModals } from '@modules/Modals';
import { autoBind } from '@util';
import { React } from '@webpack';

import { LockdownSettings, LockModal, NewUserModal } from './components';

let LoafLib: any | null = null;
try {
  LoafLib = require('../LoafLib');
} catch (e) {
  if (window.LoafLib) ({ LoafLib } = window);
  else {
    const { Text } = require('@webpack').DNGetter;
    openConfirmationModal(
      'Missing Library',
      <Text color={Text.Colors.STANDARD} size={Text.Sizes.SIZE_16}>
        The library <strong>LoafLib</strong> required for <strong>Lockdown</strong> is missing.
        Please click Download Now to download it.
      </Text>,
      {
        cancelText: 'Cancel',
        confirmText: 'Download Now',
        modalKey: 'Lockdown_DEP_MODAL',
        onConfirm: () => {
          const path = require('path');
          const git = require('isomorphic-git');
          const http = require('isomorphic-git/http/node');
          const fs = require('fs');
          git.clone({ fs, http, dir: path.join(__dirname, '../', 'LoafLib'), url: 'https://github.com/toastythetoaster/LoafLib' }).then(() => {
            Astra.plugins.reload('Lockdown');
          });
        }
      }
    );
  }
}

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
    if (LoafLib === null) return;
    style.attach();
    // eslint-disable-next-line curly
    if (!settings.get('pwd_salt', false) || !settings.get('pwd_hash', false)) {
      this._onboardUser();
    } else {
      this.__uSettingsTabs = {
        sections: [
          {
            section: 'Lockdown',
            label: 'Lockdown',
            element: () => <LockdownSettings onSetPasscode={this._setPasscode}/>
          }
        ]
      };
      window.addEventListener('mousemove', this._mousemoveCallback, false);
      window.addEventListener('keydown', this._keydownCallback, false);
      window.addEventListener('keydown', this._debugCallback, false);
      this._setInterval();
      this._lock();
    }
  }

  stop(): void {
    if (LoafLib === null) return;
    this._clearInterval();
    window.removeEventListener('keydown', this._debugCallback, false);
    window.removeEventListener('keydown', this._keydownCallback, false);
    window.removeEventListener('mousemove', this._mousemoveCallback, false);
    style.detach();
  }

  // Handle user onboarding
  private _onboardUser(): void {
    //@ts-ignore
    const modal = openModal(props => <NewUserModal {...props} onSetPasscode={this._setPasscode} onFinish={() => Astra.plugins.reload('Lockdown') && closeModal(modal)} onClose={() => Astra.plugins.disable('Lockdown') && closeModal(modal)}/>, { onCloseRequest: () => Astra.plugins.disable('Lockdown') && closeModal(modal) });
  }

  // Set passcode
  private _setPasscode(currentPasscode: string, newPasscode: string, onboarding?: boolean): void | string {
    if (this.locked) return 'Cannot change passcode while client is locked!';
    if (!onboarding && !this._checkPasscode(currentPasscode)) return 'Incorrect passcode!';
    const salt = crypto.randomBytes(16).toString('hex');
    settings.set('pwd_salt', salt);
    settings.set('pwd_hash', crypto.pbkdf2Sync(newPasscode, salt, 1000, 64, 'sha512').toString('hex'));
  }

  // Check pascode against stored hash
  private _checkPasscode(passcode: string): boolean {
    return crypto.pbkdf2Sync(passcode, settings.get('pwd_salt', ''), 1000, 64, 'sha512').toString('hex') === settings.get('pwd_hash', '');
  }

  // Lock the client
  private _lock(): void | boolean {
    if (this.locked) return false;
    closeAllModals();
    //@ts-ignore
    this.lockModal = openModal(props => <LockModal {...props} onUnlock={(passcode): void | boolean => this._unlock(passcode)}/>, { onCloseRequest: () => null });
  }

  // Unlock the client
  private _unlock(passcode: string): void | boolean {
    if (!this.locked) return false;
    if (this._checkPasscode(passcode)) {
      this.lastFocus = Date.now();
      closeModal(this.lockModal);
      this.lockModal = null;
    } else return false;
    
    return true;
  }

  // Set locking timeout interval
  private _setInterval(): void {
    this.interval && clearInterval(this.interval);
    this.interval = setInterval(this._intervalCallback, 1000);
  }

  // Clear locking timeout interval
  private _clearInterval(): void {
    this.interval && clearInterval(this.interval);
  }

  // Check if the client has been idle for too long
  private _compareTime(n): boolean {
    if (this.timeoutTime === 0) return false;
    if (!this.locked && ((n - this.lastFocus) / 1000) >= (this.timeoutTime * 60)) return true;
    return false;
  }

  // Reset lock timeout on mouse movement
  private _mousemoveCallback(_ev: MouseEvent): void {
    try {
      this.lastFocus = Date.now();
    } catch (e) {
      Astra.error(e);
    }
  }

  // Reset lock timeout on keypress
  private _keydownCallback(ev: KeyboardEvent): void {
    try {
      this.lastFocus = Date.now();
      if (!ev.repeat && ev.ctrlKey && ev.key === 'l') this._lock();
    } catch (e) {
      Astra.error(e);
    }
  }

  // Lock the client if it has been idle for too long
  private _intervalCallback(): void {
    try {
      if (this._compareTime(Date.now())) this._lock();
    } catch (e) {
      Astra.error(e);
    }
  }

  // Unlock the client if the debug keystroke is enabled and pressed
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
