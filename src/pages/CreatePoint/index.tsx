import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import Dropzone from '../../components/Dropzone';
import logo from '../../assets/logo.png'
import './styles.css';

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint = () => {
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>();
    const [formData, setFormData] = useState({
        hora: '',
        crime: '',
        descricao: '',
    });

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }

        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);
                setCities(cityNames);
            });
    }, [selectedUf]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value} = event.target;

        setFormData({...formData, [name]: value});
    }

    // function handleTextAreaChange(event: ChangeEvent<HTMLInputElement>) {
    //     const {name, value} = event.target;

    //     setFormData({...formData, [name]: value});
    // }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const { hora, crime, descricao } = formData; // MUDAR AQUI
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = 1;

        const data = new FormData();
        data.append('hora', hora);
        data.append('crime', crime);
        data.append('descricao', descricao);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', String(items));

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        await api.post('points', data);
        alert('Ponto de coleta criado!');
        history.push('/');
    }

    return (
        <div id="page-create-point" >
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Faça sua denúncia</h1>

                {/* Campo de Formulrio 1 */}
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="hora">Horário</label>
                        <input
                            type="text"
                            name="hora"
                            id="hora"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="crime">Tipo de crime</label>
                        <input
                            type="text"
                            name="crime"
                            id="crime"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field relato">
                        <label htmlFor="descricao">Relato</label>
                        <input
                            type="text"
                            name="descricao"
                            id="descricao"
                            onChange={handleInputChange}
                        />
                    </div>
                </fieldset>

                {/* Campo de Formulário 2 */}
                <fieldset>
                    <legend>
                        <h2>Local no mapa</h2>
                        <span>Escolha no mapa a região</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        {/* UF */}
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}> {uf} </option>
                                ))}
                            </select>
                        </div>
                        {/* Cidade */}
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}> {city} </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <legend>
                    <h2>Imagem</h2>
                    <span> Adicione qualquer imagem que ajude a identificação do local </span>
                </legend>

                <Dropzone onFileUploaded={setSelectedFile} />

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;