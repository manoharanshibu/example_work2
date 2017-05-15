/**
 * @param to
 * @returns {{onEnter: onEnter}}
 */
export const indexRedirect = (to) =>{
    return {
        path: '/',
        onEnter: (next, replace) => {
            replace(`/${to}`)
        }
    }
};

/**
 * @param to
 * @returns {{onEnter: (function())}}
 */
export const indexRoute = (to) => {
    return {
        onEnter: (next, replace) => {
            replace(`/${to}`)
        }
    }
}

/**
 * Forces authentication when no valid session
 * @param nextState
 * @param redirectTo
 */
export const checkAuth = (next, replace) => {
    if (!App.session.request('loggedIn')) {
        replace({nextPathname: next.location.pathname}, `/login`);
    }
};

/**
 * Check if already authourized and redirects to homepage if so.  Primarily used
 * when navigating to 'login'.
 * @param next
 * @param replace
 */
export const alreadyAuthed = (next, replace) => {
    if (App.session.request('loggedIn')) {
        replace({nextPathname: next.location.pathname}, `/`);
    }
};
