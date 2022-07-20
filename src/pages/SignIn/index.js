import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import Redirect from '../../components/redirect/index';
import Logo from '../../assets/Logo.svg';
import './sigin.css';

function SignIn() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [warning, setWarning] = useState({ msg: '', show: false });

    function onChange(evt) {
        const value = evt.target.value;
        const key = evt.target.name;

        setForm(old => ({
            ...old,
            [key]: value
        }));
    }

    async function handleSingIn(evt) {
        evt.preventDefault();

        try {
            const response = await api.post('/login', {
                email: form.email,
                senha: form.password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.usuario.id);

            navigate('/main');
        } catch (error) {
            setWarning({
                msg: error.response.data.mensagem,
                show: true
            });
        }
    }

    return (
        <Redirect>
            <div className='containerSignIn'>
                <header id='logoLogin'>
                    <img className='logo' src={Logo} />
                </header>
                <div className='container-main'>
                    <div className='txt'>
                        <h1>
                            Controle suas <strong>finanças</strong>,<br />
                            sem planilha chata.
                        </h1>
                        <span>
                            Organizar as suas finanças nunca foi tão fácil,<br />
                            com o DINDIN, você tem tudo num único lugar<br />
                            e em um clique de distância.
                        </span>
                        <button onClick={() => navigate('/Registro')}  >
                            Cadastre-se
                        </button>
                    </div>
                    <form className='form-login' onSubmit={handleSingIn}>
                        <h1>Login</h1>
                        <div className='group-form'>
                            <label className='form-login__label'>E-mail</label>
                            <input id='email' className='form-login__input' type='text' name='email' value={form.email} onChange={onChange} />
                        </div>

                        <div className='group-form'>
                            <label className='form-login__label'>Password</label>
                            <input id='password' className='form-login__input' type='password' name='password' value={form.password} onChange={onChange} />
                            <span className='error'>{warning.show && warning.msg}</span>
                        </div>
                        <button className='form-login__btn' type='submit' onClick={handleSingIn}>Entrar</button>
                    </form>
                </div>
            </div>
        </Redirect >
    );

}
export default SignIn;