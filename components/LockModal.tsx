
/* ———————————————————— Copyright (c) 2021 toastythetoaster ————————————————————
 *
 * Lock Modal Component
 *
 * ————————————————————————————————————————————————————————————————————————————— */

import { React, DNGetter, getByProps } from '@webpack';
import { makeLazy } from '@util';
import { ErrorBoundary } from '@components';
import { Modals } from '@modules';
import LockIcon from './LockIcon';

const LockModal = makeLazy({
  // eslint-disable-next-line require-await
  promise: async () => {

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
              <ModalHeader separator={false} className='header-3ydO_m'>
                <Text color={Text.Colors.HEADER_PRIMARY} size={Text.Sizes.SIZE_24} className='title-33m_XM'>
                  Locked
                </Text>
                <LockIcon width='60px' height='45px' />
              </ModalHeader>
              <form onSubmit={(e): void => {
                e.preventDefault();
                if (this.props.onUnlock(this.state.passcode) === false) {
                  this.setState({
                    passcode: '',
                    submitError: 'Incorrect passcode' 
                  });
                }
              }}>
                <ModalContent className='content-1AKki_'>
                  <Input label='Passcode' name='Passcode' autoFocus={true} value={this.state.passcode} onChange={(passcode: string): void => this.setState({ passcode, submitError: null })} error={this.state.submitError} type='password'/>
                </ModalContent>
                <ModalFooter className='footer-2YW1l'>
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
    return LockModal;
  },
  displayName: 'LockModal'
});

export class LockModalErrorBoundary extends ErrorBoundary {
  constructor(props) {
    props.label = 'Lock modal';
    super(props);
  }
  renderChildren(): any {
    return <LockModal {...this.props}/>;
  }
}
