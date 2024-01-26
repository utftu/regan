import {createContext} from '../context/context.tsx';

const defaultErrorHandler = () => null;
export const errorContext = createContext('system error', defaultErrorHandler);
