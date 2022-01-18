
/* ——————— Copyright (c) 2021-2022 toastythetoaster. All rights reserved. ———————
*
* Common typedefs for plugin
*
* ——————————————————————————————————————————————————————————————————————————————— */
/* eslint-disable no-void */

import { Float } from 'type-fest';

export interface LockdownSettings {
  timeoutTime: number
  enableDebugKeybind: boolean
}

export interface NotificationOptions {
  onclick(): void
  tag: string
  sound: string
  volume: Float
  playSoundIfDisabled: boolean
  trackingProps: any
}

export type NotificationArgs = [string, string, string, NotificationOptions]
