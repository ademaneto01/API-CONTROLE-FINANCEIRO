import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Main from './pages/Main';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp/index';

function ProtectedRoutes({ redirectTo }) {
    const token = localStorage.getItem('token')

    return token ? <Outlet /> : <Navigate to={redirectTo} />
}

function MainRoutes() {
    return (
        <Routes>
            <Route path='/' element={<SignIn />} />
            <Route path='/Registro' element={<SignUp />} />
            <Route element={<ProtectedRoutes redirectTo="/" />}>
                <Route path='/Main' element={<Main />} />
            </Route>
        </Routes>
    );
}

export default MainRoutes;