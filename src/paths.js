import Home from './views/Home';
import Login from './views/Login';
import SignUp from './views/Signup';

export default [
    {
        path: '/',
        component: Home,
    },
    {
        path: '/login',
        component: Login,
    },
    {
        path: '/signup',
        component: SignUp,
    }
]