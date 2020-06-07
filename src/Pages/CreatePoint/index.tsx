import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import logo from "../../assets/logo.svg";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";

import "./styles.css";
import { Link, useHistory } from "react-router-dom";
import Axios from "axios";
import { LeafletMouseEvent, latLng } from "leaflet";

// Sempre que criarmos um estado para um Array ou Objeto, Precisamos informar manualmente o tipo da variável
interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}
interface IBGECityResponse {
    nome: string;
}

const CreatePoint: React.FC = () => {
    // Ao passar o mouse na função "userState", podemos ver que ela recebe...
    // ... uma coisa chamada "generics" que é os sinais <> logo apos o nome da funcao
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState<string>("0");
    const [selectedCity, setSelectedCity] = useState<string>("0");
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
        0,
        0,
    ]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([
        0,
        0,
    ]);
    const [formData, setFormData] = useState({
        name: "",
        whatsapp: "",
        email: "",
    });
    const history = useHistory();
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        });
    }, []);
    useEffect(() => {
        api.get("items").then((response) => {
            setItems(response.data);
        });
    }, []);

    useEffect(() => {
        Axios.get<IBGEUFResponse[]>(
            "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        ).then((response) => {
            const ufInitials = response.data.map((uf) => uf.sigla);
            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        // Carregar as cidades sempre que a UF mudar
        if (selectedUf === "0") {
            return;
        }
        Axios.get<IBGECityResponse[]>(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
        ).then((response) => {
            const cityNames = response.data.map((city) => city.nome);
            setCities(cityNames);
        });
    }, [selectedUf]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUf(event.target.value);
    }
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }
    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([event.latlng.lat, event.latlng.lng]);
    }
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        // Usamos o spread operator para herdarmos os dados do estado atual...
        // ...e alteramos a propriedade dinamicamente [name] junto com seu valor
        // Isso é necessário para alterarmos apenas a propriedade que queremos, sem mexer nos outros valores
        setFormData({ ...formData, [name]: value });
        console.log(name, value);
    }

    function handleSelectItem(itemId: number) {
        if (selectedItems.includes(itemId)) {
            const filteredItems = selectedItems.filter(
                (item) => item !== itemId
            );
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        // Reunindo os dados para submeter para a API
        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;
        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items,
        };

        await api.post("points", data);
        alert("ponto criado");
        history.push("/");
    }
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Logotipo do Ecoleta" />
                <Link to="/">
                    <FiArrowLeft /> Voltar para a Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do Ponto de Coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome</label>
                        <input
                            onChange={handleInputChange}
                            type="text"
                            name="name"
                            id="name"
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="tel"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map
                        center={initialPosition}
                        zoom={15}
                        onclick={handleMapClick}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}></Marker>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                value={selectedUf}
                                id="uf"
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione um estado</option>
                                {ufs.map((uf) => (
                                    <option key={uf} value={uf}>
                                        {uf}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="uf">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Items de coleta</h2>
                        <span>Selecione um ou mais items abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={
                                    selectedItems.includes(item.id)
                                        ? "selected"
                                        : ""
                                }
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
};

export default CreatePoint;
