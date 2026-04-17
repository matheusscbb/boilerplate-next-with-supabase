
import { render, act, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useDidMount from '@/hooks/useDidMount';

import createContextFactory from '.';

type StateType = {
  key1: string;
  key2?: string;
} | null;

const DEFAULT_STATE = {
  key1: 'default 1', key2: 'default 2',
};

const {
  Holder: TestHolder,
  Provider: TestProvider,
  useContext: useTestContext,
} = createContextFactory<StateType>(DEFAULT_STATE);

const FakeScreen: React.FC = () => {
  const { state, setState } = useTestContext();

  const handleUpdateState = () => {
    setState({
      key1: 'updated by hook',
    });
  };

  return (
    <>
      <div>{JSON.stringify(state)}</div>
      <button onClick={handleUpdateState}>
        Update state
      </button>
    </>
  );
};

const renderScreen = (initialValue?: StateType) => {
  const screen = render(
    <TestProvider value={initialValue}>
      <FakeScreen />
    </TestProvider>,
  );

  return screen;
};

const NoProviderScreen = () => {
  const { state, setState } = useTestContext();
  useDidMount(() => {
    setState({ key1: 'no provider' });
  });
  return <div>{JSON.stringify(state)}</div>;
};

describe('createContextFactory', () => {
  it('should check default state', () => {
    const screen = renderScreen();

    screen.getByText(JSON.stringify(DEFAULT_STATE));
  });

  it('should check initial state', () => {
    const screen = renderScreen({ key1: 'initial 1', key2: 'initial 2' });

    screen.getByText(JSON.stringify({
      key1: 'initial 1',
      key2: 'initial 2',
    }));
  });

  it('should set new state', () => {
    const screen = renderScreen();

    act(() => {
      TestHolder.setState({ key1: 'value' });
    });

    screen.getByText(JSON.stringify({
      key1: 'value',
    }));
  });

  it('should update new state', () => {
    const screen = renderScreen();

    act(() => {
      TestHolder.updateState({ key1: 'value' });
    });

    screen.getByText(JSON.stringify({
      key1: 'value',
      key2: 'default 2',
    }));
  });

  it('should get state with holder', () => {
    renderScreen();

    expect(TestHolder.getState()).toEqual({
      key1: 'default 1',
      key2: 'default 2',
    });

    act(() => {
      TestHolder.setState({ key1: 'value' });
    });

    expect(TestHolder.getState()).toEqual({
      key1: 'value',
    });
  });

  it('should update state with holder function', () => {
    renderScreen();

    expect(TestHolder.getState()).toEqual({
      key1: 'default 1',
      key2: 'default 2',
    });

    act(() => {
      TestHolder.setState(prevState => ({ ...prevState, key1: 'new value' }));
    });

    expect(TestHolder.getState()).toEqual({
      key1: 'new value',
      key2: 'default 2',
    });
  });

  it('should clear state and ignore future updates on unmount', () => {
    const initialState = { key1: 'initial 1' };
    const screen = renderScreen(initialState);
    expect(TestHolder.getState()).toEqual(initialState);

    const newState = { key1: 'new value 1', key2: 'new value 2' };
    act(() => {
      TestHolder.setState(newState);
    });
    expect(TestHolder.getState()).toEqual(newState);

    screen.unmount();

    expect(TestHolder.getState()).toEqual(DEFAULT_STATE);

    act(() => {
      TestHolder.setState({ key1: 'new value to be ignored' });
    });

    expect(TestHolder.getState()).toEqual(DEFAULT_STATE);
  });

  it('should update state with hook', () => {
    const screen = renderScreen();

    const button = screen.getByText('Update state');

    fireEvent.click(button);

    screen.getByText(JSON.stringify({
      key1: 'updated by hook',
    }));
  });

  it('should not update without provider', () => {
    const screen = render(
      <NoProviderScreen />,
    );

    act(() => {
      TestHolder.setState(prevState => ({ ...prevState, key1: 'new value' }));
    });

    screen.getByText(JSON.stringify({
      key1: 'default 1',
      key2: 'default 2',
    }));
  });

});
