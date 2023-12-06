import react from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Auth from './pages/Auth';
import Encryption from './pages/Encryption';

const Rotas = ()=>{
    return(
        <BrowserRouter>
            <Routes>
                <Route element={<Home/>} path="/"/>
                <Route element={<Auth/>} path="/auth"/>
                <Route element={<Encryption/>}path="/Encryption" />
            </Routes>
        </BrowserRouter>
    );
}

export default Rotas;