import get from "lodash/get";
import { States } from "../types";

export const createStateMachine = <TEnum extends States, TMachine>(
  stateMachine: TMachine,
  stateGetter: () => TEnum,
  stateSetter: (state: TEnum) => void
) => async (nextState: TEnum, ...args: unknown[]): Promise<void> => {
  const next = get(stateMachine, [stateGetter(), nextState], null);
  if (next === null) {
    throw new Error(
      `Illegal state transition. ${stateGetter()} does not support transition ${stateGetter()} -> ${nextState}`
    );
  }
  /* We want to reassign the parameter here as a side effect */
  // eslint-disable-next-line no-param-reassign
  stateSetter(nextState);
  await next(...args);
};

export default createStateMachine;
