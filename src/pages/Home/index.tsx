import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './styles.css';
import logo from '../../assets/logo.png'

const Home = () => {
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta" />
                </header>

                <main>
                    <h1>Seu principal portal de denúncias</h1>
                    <p>Informe-se. E por favor nos ajude a informar ;)</p>

                    <Link to="/create-point">
                        <span> <FiArrowRight /> </span>
                        <strong> Cadastre um ponto de coleta </strong>
                    </Link>
                </main>
            </div>
        </div>
    );
};

export default Home;