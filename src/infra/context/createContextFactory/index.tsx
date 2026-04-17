import type {
  Dispatch,
  SetStateAction,
  PropsWithChildren,
} from 'react';
import {
  createContext as reactCreateContext,
  useContext as reactUseContext,
  useMemo,
  useState,
  useCallback,
} from 'react';

import useDidMountAndUpdate from '@/hooks/useDidMountAndUpdate';

export type ContextType<StateType> = {
  setState: Dispatch<SetStateAction<StateType>>;
  state: StateType;
};

function isFunctionalState<StateType>(
  action: SetStateAction<StateType>,
): action is (newState: StateType) => StateType {
  return typeof action === 'function';
}

function createContextFactory<StateType>(defaultValue: StateType) {
  /**
   * Objeto que armazena o state para poder ser acessado e atualizado através
   * do Holder.
   */
  let staticState: ContextType<StateType> = {
    state: defaultValue,
    setState: /* istanbul ignore next -- @preserve */ () => {
      // define uma função vazia para evitar erros caso algum evento tente chamar
      // a função antes do provider ser montado
    },
  };

  const Context = reactCreateContext<ContextType<StateType>>({ ...staticState });

  type ProviderPropsType = PropsWithChildren<{
    value?: StateType;
  }>;

  const Provider = ({ value: initialValue, children }: ProviderPropsType) => {
    const originalState = initialValue ?? defaultValue;
    const [state, setState] = useState(originalState);

    const updateState: Dispatch<SetStateAction<StateType>> = useCallback(action => {
      staticState.state = isFunctionalState(action)
        ? action(staticState.state)
        : action;
      setState(action);
    }, []);

    useDidMountAndUpdate(() => {
      staticState.state = state;
      staticState.setState = updateState;
      return function unmount() {
        // limpa a variável global ao destruir o provider para evitar vazamento de memória
        staticState = {
          state: defaultValue,

          setState: /* istanbul ignore next -- @preserve */ () => { // NOSONAR
            // define uma função vazia para evitar erros caso algum evento tente
            // chamar a função após o unmount
          },
        };
      };
    }, [state]);

    const value: ContextType<StateType> = useMemo(() => ({
      state,
      setState: updateState,
    }), [state, updateState]);

    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  };

  const Holder = {
    getState() {
      return staticState.state;
    },
    /**
     * Substitui o objeto completo no state dentro do Context API
     * @param state
     */
    setState(state: SetStateAction<StateType>) {
      staticState.setState(state);
    },
    /**
     * Atualiza o objeto do state com apenas as propriedades fornecidas
     * @param state
     */
    updateState(state: Partial<StateType>) {
      staticState.setState(prevState => ({
        ...prevState,
        ...state,
      }));
    },
  };

  const useContext = () => reactUseContext(Context);

  return {
    Provider,
    Holder,
    useContext,
  };
}

export default createContextFactory;
