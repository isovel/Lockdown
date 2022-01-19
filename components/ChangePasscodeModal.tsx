
/* ——————— Copyright (c) 2021-2022 toastythetoaster. All rights reserved. ———————
 *
 * Change Passcode Modal Component
 *
 * —————————————————————————————————————————————————————————————————————————————— */

import { React, DNGetter, getByProps } from '@webpack';
import { makeLazy } from '@util';
import { ErrorBoundary } from '@components';
import { Modals } from '@modules';

const ChangePasscodeModal = makeLazy({
  promise: () => {

    //@ts-ignore
    const { ModalRoot, ModalSize, ModalHeader, ModalContent, ModalFooter, ModalCloseButton } = Modals.Components;

    const { Text } = DNGetter;

    const ButtonOptions = getByProps('ButtonLink');
    const Button = ButtonOptions.default;

    const InputModule = getByProps('Input');
    const { Input } = InputModule;

    interface ChangePasscodeModalProps {
      transitionState: number
      onClose(): void
      onSetPasscode(currentPasscode: string, newPasscode: string): void | string
    }

    interface ChangePasscodeModalState {
      currentPasscode: string
      newPasscode: string
      confirmPasscode: string
      currentPasscodeError: string | null
      newPasscodeError: string | null
      confirmPasscodeError: string | null
    }

    class ChangePasscodeModal extends React.PureComponent<ChangePasscodeModalProps, ChangePasscodeModalState> {
      state = {
        currentPasscode: '',
        newPasscode: '',
        confirmPasscode: '',
        currentPasscodeError: null,
        newPasscodeError: null,
        confirmPasscodeError: null
      };
      render(): any {
        return (
          <ModalRoot transitionState={this.props.transitionState} size={ModalSize.SMALL}>
            <ModalHeader separator={false} className='header-2xfEYR'>
              <Text color={Text.Colors.HEADER_PRIMARY} size={Text.Sizes.SIZE_24} className='title-7KIelA'>
                Change your passcode
              </Text>
              <Text color={Text.Colors.HEADER_SECONDARY} size={Text.Sizes.SIZE_16} className='subtitle-2RGT-H'>
                Enter your current passcode and a new passcode.
              </Text>
              <ModalCloseButton onClick={this.props.onClose} className='modalCloseButton-1tQPZJ' />
            </ModalHeader>
            <ModalContent className='content-39mg13'>
              <Input label='Current Passcode' name='Passcode' autoFocus={true} value={this.state.currentPasscode} onChange={(currentPasscode: string): void => this.setState({ currentPasscode })} error={this.state.currentPasscodeError} type='password'/>
              <Input label='New Passcode' name='Passcode' autoFocus={false} value={this.state.newPasscode} onChange={(newPasscode: string): void => this.setState({ newPasscode })} error={this.state.newPasscodeError} className='newPassword-2xUoju' type='password'/>
              <Input label='Confirm New Passcode' name='Passcode' autoFocus={false} value={this.state.confirmPasscode} onChange={(confirmPasscode: string): void => this.setState({ confirmPasscode })} error={this.state.confirmPasscodeError} className='newPassword-2xUoju' type='password'/>
            </ModalContent>
            <ModalFooter>
              <Button color={Button.Colors.BRAND} size={Button.Sizes.MEDIUM} onClick={(): void => {
                if (this.state.currentPasscodeError || this.state.newPasscodeError || this.state.confirmPasscodeError) this.setState({ currentPasscodeError: null, newPasscodeError: null, confirmPasscodeError: null });
                if (this.state.currentPasscode === '') {
                  this.setState({ currentPasscodeError: 'Please enter your current passcode.' });
                  return;
                }
                if (this.state.newPasscode === '') {
                  this.setState({ newPasscodeError: 'Please enter a new passcode.' });
                  return;
                }
                if (this.state.confirmPasscode === '') {
                  this.setState({ confirmPasscodeError: 'Please confirm your new passcode.' });
                  return;
                }
                if (this.state.newPasscode !== this.state.confirmPasscode) {
                  this.setState({ confirmPasscodeError: 'Passcodes do not match!' });
                  return;
                }
                const ret = this.props.onSetPasscode(this.state.currentPasscode, this.state.newPasscode);
                if (typeof ret === 'string') {
                  this.setState({ currentPasscodeError: ret });
                  return;
                }
                this.props.onClose();
              }}>
                Done
              </Button>
              <Button onClick={this.props.onClose} color={Button.Colors.PRIMARY} look={Button.Looks.LINK} className='cancel-3-Mvz6'>
                Cancel
              </Button>
            </ModalFooter>
          </ModalRoot>
        );
      }
    }

    return Promise.resolve(ChangePasscodeModal);
  },
  displayName: 'ChangePasscodeModal'
});

class ChangePasscodeModalErrorBoundary extends ErrorBoundary {
  constructor(props) {
    props.label = 'Change passcode modal';
    super(props);
  }
  renderChildren(): any {
    return <ChangePasscodeModal {...this.props}/>;
  }
}
export { ChangePasscodeModalErrorBoundary as ChangePasscodeModal };
