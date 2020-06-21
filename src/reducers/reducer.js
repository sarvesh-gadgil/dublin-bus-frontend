import { LOGIN_ACTION, LOGOUT_ACTION } from '../constants';
import { assign } from 'lodash';

const initialState = {
    isAuthenticated: false,
    user: {}
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_ACTION:
            return assign({}, state, {
                isAuthenticated: true,
                user: action.user
            });
        case LOGOUT_ACTION:
            return assign({}, state, {
                isAuthenticated: false,
                user: {}
            });

        default:
            return state;
    }
}

export default reducer;