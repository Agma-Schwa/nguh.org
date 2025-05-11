import type {Actions} from './$types';
import {signIn, signOut} from '../../auth';

export const actions: Actions = {
    login: signIn,
    logout: signOut
}