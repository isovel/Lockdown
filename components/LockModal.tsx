
/* ——————— Copyright (c) 2021-2022 toastythetoaster. All rights reserved. ———————
 *
 * Lock Modal Component
 *
 * —————————————————————————————————————————————————————————————————————————————— */

import { React, DNGetter, getByProps } from '@webpack';
import { makeLazy } from '@util';
import { ErrorBoundary } from '@components';
import { Modals } from '@modules';
import LockIcon from './LockIcon';

const LockModal = makeLazy({
  promise: () => {

    //@ts-ignore
    const { ModalRoot, ModalSize, ModalHeader, ModalContent, ModalFooter } = Modals.Components;

    const { Text } = DNGetter;

    const ButtonOptions = getByProps('ButtonLink');
    const Button = ButtonOptions.default;

    const InputModule = getByProps('Input');
    const { Input } = InputModule;

    interface LockModalProps {
      transitionState: number
      onClose(): void
      onUnlock(passcode: string): boolean
    }

    interface LockModalState {
      passcode: string
      submitError: string | null
    }

    class LockModal extends React.PureComponent<LockModalProps, LockModalState> {
      state = {
        passcode: '',
        submitError: null
      };
      render(): any {
        return (
          <div className='lockdown-modal-container'>
            <ModalRoot className='lockdown-modal' transitionState={this.props.transitionState} size={ModalSize.SMALL}>
              <ModalHeader separator={false} className='header-1LEkUo'>
                <Text color={Text.Colors.HEADER_PRIMARY} size={Text.Sizes.SIZE_24} className='title-2tnl9d'>
                  Locked
                  <LockIcon height='24px' style={{ marginLeft: '0.25em' }} />
                </Text>
              </ModalHeader>
              <form onSubmit={(e): void => {
                e.preventDefault();
                if (this.props.onUnlock(this.state.passcode) === false) this.setState({
                  passcode: '',
                  submitError: 'Incorrect passcode' 
                });
              }}>
                <ModalContent className='content-qdMtCa'>
                  <Input label='Passcode' name='Passcode' autoFocus={true} value={this.state.passcode} onChange={(passcode: string): void => this.setState({ passcode, submitError: null })} error={this.state.submitError} type='password'/>
                </ModalContent>
                <ModalFooter>
                  <Button color={this.state.submitError ? Button.Colors.PRIMARY : Button.Colors.BRAND} disabled={!!this.state.submitError} className='lockdown-btn-unlock' type='submit'>
                    Unlock
                  </Button>
                </ModalFooter>
              </form>
            </ModalRoot>
          </div>
        );
      }
    }

    return Promise.resolve(LockModal);
  },
  displayName: 'LockModal'
});

class LockModalErrorBoundary extends ErrorBoundary {
  constructor(props) {
    props.label = 'Lock modal';
    super(props);
  }
  renderChildren(): any {
    return <LockModal {...this.props}/>;
  }
}
export { LockModalErrorBoundary as LockModal };
