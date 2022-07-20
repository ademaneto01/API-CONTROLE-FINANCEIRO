import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Redirect from '../../components/redirect/index';
import api from '../../services/api';
import Logo from '../../assets/Logo.svg';
import './signup.css';

function SignUp() {
    const [form, setForm] = useState({ nome: '', email: '', password1: '', password2: '' })
    const navigate = useNavigate();
    const [warning, setWarning] = useState({ msg: '' });

    function onChange(evt) {
        const value = evt.target.value;
        const key = evt.target.name;

        setForm(old => ({
            ...old,
            [key]: value
        }))
    }
    function turnBack() {
        navigate('/')
    }

    async function handleSubmit(evt) {
        evt.preventDefault();
        if (form.password1 !== form.password2) {
            return setWarning({
                msg: 'Senha inválida'
            });
        }

        try {
            await api.post('/usuario', {
                nome: form.nome,
                email: form.email,
                senha: form.password1
            });

            navigate('/');
        } catch (error) {
            setWarning({
                msg: error.response.data.mensagem
            });
        }
    }

    return (
        <Redirect>
            <div className="containerSignUp">
                <header className='logo' id='logoLogin'>
                    <img src={Logo} />
                </header>

                <div className="register" >
                    <form className='registerform' onSubmit={handleSubmit}>
                        <h1>Cadastre-se</h1>
                        <div className='registerInput'>
                            <label className='labelRegister'>Nome</label>
                            <input id='nome' className='form-login__input' type='text' name='nome' value={form.nome} onChange={onChange} />
                        </div>
                        <div className='registerInput'>
                            <label className='labelRegister'>E-mail</label>
                            <input id='email' className='form-login__input' type='email' name='email' value={form.email} onChange={onChange} />
                        </div>
                        <div className='registerInput'>
                            <label className='labelRegister'>Senha</label>
                            <input id='password1' className='form-login__input' type='password' name='password1' value={form.password1} onChange={onChange} />
                        </div>
                        <div className='registerInput'>
                            <label className='labelRegister'>Confirmação de senha</label>
                            <input id='password2' className='form-login__input' type='password' name='password2' value={form.password2} onChange={onChange} />
                        </div>
                        <button className='btn-submit' type='submit' onClick={handleSubmit}>Cadastrar</button>
                        <button className='btn-back' type='button' onClick={turnBack}><strong>Ja tem cadastro? clique aqui!</strong></button>
                        <span className='warn-register'>{warning && warning.msg}</span>
                    </form>
                </div >
            </div>

        </Redirect >
    );

}
export default SignUp;