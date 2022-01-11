
/* ——————— Copyright (c) 2021-2022 toastythetoaster. All rights reserved. ———————
 *
 * Lockdown Settings Component
 *
 * —————————————————————————————————————————————————————————————————————————————— */

import { ErrorBoundary, FormSection, FormDivider, FormItem, SwitchItem, Slider, TooltipWrapper } from '@components';
import { closeModal, openModal } from '@modules/Modals';
import { makeLazy, wrapSettings } from '@util';
import { React, getByProps } from '@webpack';

import { LockdownSettings } from '../types';

import { ChangePasscodeModal } from './ChangePasscodeModal';

const LockdownSettingsView = makeLazy({
  promise: () => {
    const settings = Astra.settings.get<LockdownSettings>('Lockdown');

    const ButtonOptions = getByProps('ButtonLink');
    const Button = ButtonOptions.default;

    interface ViewProps extends LockdownSettings {
      set: typeof settings.set
      onSetPasscode(currentPasscode: string, newPasscode: string): void | string
    }

    // eslint-disable-next-line prefer-arrow-callback
    const LockdownSettingsView = React.memo(function LockdownSettingsView({ set, onSetPasscode, enableDebugKeybind = false, timeoutTime = 5 }: ViewProps): React.ReactElement<FormSection> {
      return (
        <FormSection title='Security' tag='h2'>
          <FormSection>
            <FormItem>
              <Button color={Button.Colors.BRAND} size={Button.Sizes.MEDIUM} onClick={(): void => {
                const changePasscodeModal: string = openModal(props => <ChangePasscodeModal {...props} onSetPasscode={onSetPasscode} onClose={(): void => closeModal(changePasscodeModal)} />);
              }}>
                Change Passcode
              </Button>
            </FormItem>
            <FormItem title='Timeout' className='marginTop20-3TxNs6'>
              <Slider initialValue={timeoutTime} onMarkerRender={(value): string => (value === 0 ? 'Off' : `${value}m`)} onValueRender={(value): string => `${Math.round(value)} mins`} onValueChange={(value: number): void => set('timeoutTime', Math.round(value))} markers={[0, 1, 2, 3, 5, 10, 15, 30, 60]} equidistant={true} keyboardStep={1} handleSize={1} maxValue={60} minValue={1} stickToMarkers={true}/>
            </FormItem>
          </FormSection>
          <FormDivider className='marginTop40-i-78cZ marginBottom40-2vIwTv'/>
          <FormSection title='Miscellaneous' tag='h2'>
            <FormItem>
              <SwitchItem value={enableDebugKeybind} note={['Allows you to unlock the client with the keybind ', <strong key='keybind'>&nbsp;Shift + Esc</strong>]} onChange={(value: boolean): void => set('enableDebugKeybind', value)}>
                Enable debug unlock keybind
              </SwitchItem>
            </FormItem>
          </FormSection>
        </FormSection>
      );
    });

    return Promise.resolve(wrapSettings(settings, LockdownSettingsView));
  },
  displayName: 'LockdownSettingsView'
});

class LockdownSettingsErrorBoundary extends ErrorBoundary {
  constructor(props) {
    props.label = 'Lockdown settings panel';
    super(props);
  }
  renderChildren(): React.ReactElement<LockdownSettingsView> {
    return <LockdownSettingsView {...this.props}/>;
  }
}
export { LockdownSettingsErrorBoundary as LockdownSettings };
