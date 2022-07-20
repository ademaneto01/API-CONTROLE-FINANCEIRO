import './main.css';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import api from '../../services/api';
import Logo from '../../assets/Logo.svg';
import UserIcon from '../../assets/user.svg';
import LogoutIcon from '../../assets/logout.svg';
import FilterIcon from '../../assets/filter.svg';
import CloseIcon from '../../assets/more.svg';
import btneditar from '../../assets/editar.svg';
import lixo from '../../assets/lixo.svg';
import xIcon from '../../assets/x.png';
import addIcon from '../../assets/+.png';
import poligonoUp from '../../assets/Polygon.svg';
import poligonoDown from '../../assets/PolygonDown.svg';
import poligonoModal from '../../assets/Polygon-4.png';
import { parse } from 'date-fns';
const arrayListarCategorias = [];

function Main() {
  const navigate = useNavigate();
  const [showModalUser, setShowModalUser] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [arrayCategorias, setArrayCategorias] = useState([]);
  const [arrayCategoriasLocal, setArrayCategoriasLocal] = useState([]);
  const [listarTransacoes, setListarTransacoes] = useState([]);
  const [listaBackUp, setListaBackUp] = useState([]);
  const [listTest, setListaTest] = useState([]);
  const [nameUser, setNameUser] = useState({ nome: '' });
  const [arrayUsuario, setArrayUsuario] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', password1: '', password2: '' });
  const [showModalEditTransacao, setShowModalEditTransacao] = useState(false);
  const [arrayEditarRegistro, setArrayEditarRegistro] = useState({ id: '', descricao: '', valor: '', data: '', categoria: '', tipo: '' })
  const [modalExcluir, setModalExcluir] = useState(false);
  const [numIdTransacao, setNumIdTransacao] = useState([]);
  const [extratoTransacoes, setExtratoTransacoes] = useState({ entrada: '', saida: '', saldo: '' });
  const [modalAddRegistro, setModalAddRegistro] = useState(false);
  const token = localStorage.getItem('token');
  const [warning, setWarning] = useState({ msg: '', show: false });
  const [dataCrescente, setDataCrescente] = useState(false);
  const [formCadastrarTransacao, setFormaCadastrarTransacao] = useState({
    descricao: "",
    valor: '',
    data: '',
    categoria_id: '',
    tipo: 'saida'
  });

  const HandleFiltrarLista = (index) => {
    arrayCategorias[index].check = !arrayCategorias[index].check;
    setArrayCategorias([...arrayCategorias]);
  }

  const AplicarFiltro = () => {
    const localArrayCategoria = arrayCategorias.filter(({ check }) => check);
    setArrayCategoriasLocal(localArrayCategoria);

    if (!localArrayCategoria.length) { return setListarTransacoes(listaBackUp) }
    const listaFiltrada = listaBackUp.filter((lista) => {
      return localArrayCategoria.some(item => {
        return item.id === lista.categoria_id;
      });
    });

    if (!listaFiltrada.length) { return setListarTransacoes(listaBackUp) }
    setListarTransacoes(listaFiltrada);
  }

  const LimparFiltro = () => {
    for (const limpandoFiltro of arrayCategorias) {
      limpandoFiltro.check = false
    }

    setArrayCategorias([...arrayCategorias]);
    setListarTransacoes(listTest);
  }


  function HandleLogOut() {
    localStorage.clear();
    return navigate('/');
  }

  async function Categories() {
    try {
      const response = await api.get('/categoria', {
        headers: { Authorization: `Bearer ${token}` }
      });

      response.data.map(item => item['check'] = false);
      arrayListarCategorias.push(response.data);

      setArrayCategorias(response.data);

    } catch (error) {
      return
    }
  }

  async function detalharUsuario() {
    try {
      const response = await api.get('/usuario', {
        headers: { Authorization: `Bearer ${token}` }
      });

      arrayUsuario.push(response.data);
      setArrayUsuario(arrayUsuario);

      arrayUsuario.map((user) => {
        setForm(prev => {
          return { ...prev, nome: user.nome, email: user.email }
        });

        arrayUsuario.map(user => {
          setNameUser(prev => {
            return { ...prev, nome: user.nome }
          });
        });
      });

    } catch (error) {
      return
    }
  }

  async function ListTransation() {
    try {
      const response = await api.get('/transacao', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const registro = response.data;

      registro.sort(function (a, b) {
        if (!dataCrescente) {
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        } else {
          return new Date(a.data).getTime() - new Date(b.data).getTime();
        }
      });

      setListaTest(registro);
      setListaBackUp(registro);
      setListarTransacoes(registro);

    } catch (error) {
      return
    }
  }

  useEffect(() => {
    HandleDataCrescente();
    ListTransation();
    detalharUsuario();
    ExtratoTransacoes();
  }, []);

  useEffect(() => {
    detalharUsuario();
  }, [showModalUser]);

  async function EditarTransacao(e) {
    e.preventDefault();

    try {
      await api.put(`/transacao/${arrayEditarRegistro.id}`, {
        descricao: arrayEditarRegistro.descricao,
        valor: arrayEditarRegistro.valor,
        data: arrayEditarRegistro.data,
        categoria_id: arrayEditarRegistro.categoria_id,
        tipo: arrayEditarRegistro.tipo
      }, { headers: { Authorization: `Bearer ${token}` } });

      ListTransation();
      ExtratoTransacoes();
      HandleEditTransacao(false);

    } catch (error) {
      setWarning({
        msg: error.response.data.mensagem,
        show: true
      });
    }
  }

  async function handleCadastrar(e) {
    e.preventDefault();

    const novaData = parse(formCadastrarTransacao.data, 'dd/mm/yyyy', new Date());

    try {
      await api.post('/transacao', {
        descricao: formCadastrarTransacao.descricao,
        valor: formCadastrarTransacao.valor,
        data: novaData,
        categoria_id: formCadastrarTransacao.categoria_id,
        tipo: formCadastrarTransacao.tipo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      HandleModalRegistro(false);
      setFormaCadastrarTransacao({
        descricao: "",
        valor: '',
        data: '',
        categoria_id: '',
        tipo: 'saida'
      });

      ListTransation();
      ExtratoTransacoes()

    } catch (error) {
      setWarning({
        msg: error.response.data.mensagem,
        show: true
      });
    }
  }

  async function ExtratoTransacoes() {
    try {
      const response = await api.get('/transacao/extrato', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const entradaNum = Number(response.data.entrada);
      const saidaNum = Number(response.data.saida);
      const saldo = entradaNum - saidaNum;

      setExtratoTransacoes(prev => ({
        ...prev,
        entrada: response.data.entrada,
        saida: response.data.saida,
        saldo: saldo
      }));

    } catch (error) {
      return
    }
  }

  async function ExcluirRegistro() {
    try {
      await api.delete(`/transacao/${numIdTransacao}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      ListTransation();
      ExtratoTransacoes();

    } catch (error) {
      return
    }
  }

  async function HandleEditarCadastro(e) {
    e.preventDefault();

    if (form.password1 !== form.password2) {
      setWarning({
        msg: 'senha inválida',
        show: true
      });

      return
    }

    try {
      await api.put('/usuario', {
        nome: form.nome,
        email: form.email,
        senha: form.password1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      HandleEdit(false);
      setForm(prev => {
        return { ...prev, password1: '', password2: '' }
      });

    } catch (error) {
      setWarning({
        msg: error.response.data.mensagem,
        show: true
      });
    }
  }

  function HandleModalExcluir(event) {
    setModalExcluir(event);
  }

  function HandleEdit(event) {
    setShowModalUser(event);
  }

  function HandleEditTransacao(event) {
    setShowModalEditTransacao(event);
  }

  function HandleFilter() {
    if (showFilter === false) {
      setShowFilter(true);
    } else {
      setShowFilter(false);
    }
  }

  function onChange(evt) {
    const value = evt.target.value;
    const key = evt.target.name;

    setForm(old => ({
      ...old,
      [key]: value
    }));
  }

  function handleChangeEntradas(value) {
    setArrayEditarRegistro(prev => ({
      ...prev,
      tipo: value
    }));
  }

  function onChangeTrans(evt) {
    const value = evt.target.value;
    const key = evt.target.name;

    setArrayEditarRegistro(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function onChangeCadastrar(evt) {
    const value = evt.target.value;
    const key = evt.target.name;

    setFormaCadastrarTransacao(prev => ({
      ...prev,
      [key]: value
    }));
  }

  function editdate(date) {
    const newDate = new Date(date);
    const editedDate = `${newDate.toLocaleString('pt-BR', { day: 'numeric', month: 'numeric', year: '2-digit' })}`;

    return editedDate;
  }

  function editDay(date) {
    const newDate = new Date(date);

    const day = `${newDate.toLocaleString('pt-BR', { weekday: 'long' })}`;
    const dayFirstLetter = day[0].toUpperCase();
    const dayOtherLetters = day.slice(1).replace('-feira', '');

    return (dayFirstLetter + dayOtherLetters);
  }

  function editValue(value) {
    const valueReal = (Number(value) / 100).toFixed(2);
    const editedValue = `R$ ${String(valueReal).replace('.', ',')}`;

    return editedValue;
  }

  function HandleModalRegistro(event) {
    setModalAddRegistro(event);
    Categories();
  }

  function handleChangeEntradasCadastro(event) {
    setFormaCadastrarTransacao(prev => ({
      ...prev,
      tipo: event
    }));
  }

  function HandleDataCrescente() {
    if (dataCrescente === false) {
      setDataCrescente(true);
    } else {
      setDataCrescente(false);
    }

    ListTransation();
  }

  return (
    <div className='dashMain'>
      <header className='header' id='headDash'>
        <img className='logoMain' key='logoMain' src={Logo} />
        <nav id='nav-users'>
          <img className='userImg' key='imgUser' src={UserIcon} onClick={() => {
            setWarning({
              show: false
            })
            setForm(
              { password1: '', password2: '' }
            )
            HandleEdit(true)
          }} />
          <span>{nameUser.nome}</span>
          <img className='logOut' key='imgLogOut' src={LogoutIcon} onClick={HandleLogOut} />
        </nav>
      </header>

      <div className='dash'>

        <div className='textFilter' onClick={() => HandleFilter(Categories())}>
          <img src={FilterIcon} key='filterIcon' />
          <strong>Filtrar</strong>
        </div>

        {showFilter && <div className='dashFilter'>
          <h1>Categoria</h1>
          <div className='categories'>
            {arrayCategorias.map((item, index) => {
              return (
                <div className='category' key={item.id} onClick={(e) => {
                  HandleFiltrarLista(index)
                }}
                  style={{ backgroundColor: item.check && '#7978D9' }}
                >
                  <span style={{ color: item.check && 'white' }}>{item.descricao}</span>
                  {item.check ? <img src={xIcon} /> : <img src={addIcon} />}
                </div>
              )
            })}
            <div className="btn-filter">
              <button id='btn-filter-limpar' onClick={() => LimparFiltro()}>Limpar Filtros</button>
              <button id='btn-filter-aplicar' onClick={() => { AplicarFiltro() }}>Aplicar Filtros</button>
            </div>
          </div>
        </div>
        }

        <div className="transactions">

          <div className='listTransactions' >
            <div className="columnName">
              <div className="dateBox" onClick={() => HandleDataCrescente()}>
                {dataCrescente ? <><h1 className='dateColumn'>Data</h1><img src={poligonoDown} alt='poligDown' /> </> : <> <h1 className='dateColumn'>Data</h1><img src={poligonoUp} alt='poligUp' /></>}
              </div>
              <div className="weekDayBox">
                <h1 className='weekDayColumn'>Dia da semana</h1>
              </div>
              <div className="descriptionBox">
                <h1 className='descriptionColumn'>Descrição</h1>
              </div>
              <div className="categoryBox">
                <h1 className='categoryColumn'>Categoria</h1>
              </div>
              <div className="valueBox">
                <h1 className='valueColumn'>Valor</h1>
              </div>
            </div>
            <div>
              {listarTransacoes.map(item => {
                return (
                  <div key={item.id} className='listaInterna'>
                    <div className="dateBox">
                      <span className='itemDate'>{editdate(item.data)}</span>
                    </div>
                    <div className="weekDayBox">
                      <span className='itemDay'>{editDay(item.data)}</span>
                    </div>
                    <div className="descriptionBox">
                      <span className='itemDescription'>{item.descricao}</span>
                    </div>
                    <div className="categoryBox">
                      <span className='itemCategory'>{item.categoria_nome}</span>
                    </div>
                    <div className="valueBox">
                      <span className='itemValue'
                        style={{ color: item.tipo === 'saida' ? '#FA8C10' : '#645FFB' }}
                      >{editValue(item.valor)}</span>
                    </div>
                    <div className='transactionsIcons'>
                      <div className="editTransaction">
                        <img className='imglapis' src={btneditar} onClick={(e) => {
                          HandleEditTransacao(true)
                          Categories()
                          setWarning({ show: false })
                          setArrayEditarRegistro(prev => {
                            return { ...prev, id: item.id, descricao: item.descricao, valor: item.valor, data: item.data, categoria_id: item.categoria_id, tipo: item.tipo }
                          })
                        }}
                        />
                      </div>
                      <div className="removetransaction">
                        <img className='imgLixeira' src={lixo} onClick={(e) => {
                          setNumIdTransacao(item.id);
                          setModalExcluir(item.id);
                        }} />
                        {modalExcluir === item.id &&
                          <> <img className='poligonoModal' src={poligonoModal} alt="" />
                            <div className='modalExcluir'>
                              <span>Apagar item?</span>
                              <div className='containerBtnModalExcluir'>
                                <div className='btn-yes' onClick={() => {
                                  ExcluirRegistro()
                                  setNumIdTransacao(item.id);
                                  setModalExcluir(null);
                                }} >Sim</div>
                                <div className='btn-no' onClick={() => {
                                  setModalExcluir(null)
                                }} >Não</div>
                              </div>
                            </div>
                          </>
                        }
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="viewSumary">
            <div className="summary">
              <h1>Resumo</h1>
              <div className="sumaryDetail">
                <div className="summaryDescription">
                  <h2 className='debit'>Entradas</h2>
                  <h2 className='out'>Saídas</h2>
                </div>
                <div className="summaryValue">
                  <h2 className='debitValue'>{editValue(extratoTransacoes.entrada)}</h2>
                  <h2 className='outValue'>{editValue(extratoTransacoes.saida)}</h2>
                </div>
              </div>
              <div className="balance">
                <h2 className='balanceTitle'>Saldo</h2>
                <h2 className='balanceValue' style={{ color: extratoTransacoes.saldo >= 0 ? '#3A9FF1' : '#FF576B' }} > {editValue(extratoTransacoes.saldo)}</h2>
              </div>
            </div>

            <button onClick={() => {
              setWarning({ show: false })
              HandleModalRegistro(true)
            }} className='btn-add-register'>Adicionar Registro</button>
          </div>

        </div>

        {showModalUser && <div className='modalUserAll'>
          <div className='modalUser'>
            <img className='btn-close' src={CloseIcon} onClick={() => HandleEdit(false)} />
            <h1 className='textEdit'>Editar Perfil</h1>
            <form className='editForm' onSubmit={HandleEditarCadastro}>
              <div className='editInput'>
                <label className='labelEdit'>Nome</label>
                <input id='nome' className='form-login__edit' type='text' name='nome' value={form.nome} onChange={onChange} />
              </div>
              <div className='editInput'>
                <label className='labelEdit'>E-mail</label>
                <input id='email' className='form-login__edit' type='email' name='email' value={form.email} onChange={onChange} />
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Senha</label>
                <input id='passwordEdit1' className='form-login__edit' type='password' name='password1' value={form.password1} onChange={onChange} />
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Confirmação de senha</label>
                <input id='passwordEdit2' className='form-login__edit' type='password' name='password2' value={form.password2} onChange={onChange} />
              </div>
              <div className="edit-btn">
                <button className='btn-edit' type='submit'>Editar</button>
              </div>
            </form>
            <span className='editUserError'>{warning.show && warning.msg}</span>
          </div>
        </div>}

        {showModalEditTransacao && <div className='modalEditTransacao'>
          <div className='editTransacao'>
            <img className='btn-close' src={CloseIcon} onClick={() => HandleEditTransacao(false)} />
            <h1 className='textEdit'>Editar Registro</h1>
            <form className='editForm' onSubmit={EditarTransacao}>
              <div className='containerTipo'>
                <div className='edit-debit' onClick={() => handleChangeEntradas('entrada')} style={{ backgroundColor: arrayEditarRegistro.tipo === 'entrada' ? '#3A9FF1' : '#B9B9B9' }}>Entrada</div>
                <div className='edit-out' onClick={() => handleChangeEntradas('saida')} style={{ backgroundColor: arrayEditarRegistro.tipo === 'saida' ? '#FF576B' : '#B9B9B9' }}> Saída</div>
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Valor</label>
                <input id='passwordEdit1' className='form-login__edit' type='text' name='valor' value={arrayEditarRegistro.valor} onChange={onChangeTrans} />
              </div>
              <div className='editSelect'>
                <label className='labelEdit'>Categoria</label>
                <select className='selectedCategory' name='categoria_id' onChange={onChangeTrans}>
                  <option value=""></option>
                  {arrayCategorias.map(item => {
                    return (
                      <option key={item.id} value={item.id}>{item.descricao}</option>
                    )
                  })
                  }
                </select>
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Data</label>
                <input id='passwordEdit1' className='form-login__edit' type='date' name='data' value={arrayEditarRegistro.data} onChange={onChangeTrans} />
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Descrição</label>
                <input id='passwordEdit2' className='form-login__edit' type='text' name='descricao' value={arrayEditarRegistro.descricao} onChange={onChangeTrans} />
              </div>
              <span className='editUserError'>{warning.show && warning.msg}</span>
              <div className="edit-btn">
                <button className='btn-edit' type='submit'>Confirmar</button>
              </div>
            </form>
          </div>
        </div>}

        {modalAddRegistro && <div className='modalAddTransaction'>
          <div className='modalTransaction'>
            <img className='btn-close' src={CloseIcon} onClick={() => HandleModalRegistro(false)} />
            <h1 className='textAddTransaction'>Adicionar Registro</h1>
            <form className='editForm' onSubmit={handleCadastrar}>
              <div className="checkTypeTransactyion">
                <div className="addDebit"
                  style={{ backgroundColor: formCadastrarTransacao.tipo === 'entrada' ? '#3A9FF1' : '#B9B9B9' }}
                  onClick={() => {
                    handleChangeEntradasCadastro('entrada')
                  }}>
                  <h1>Entrada</h1>
                </div>
                <div className="addOut"
                  onClick={() => {
                    handleChangeEntradasCadastro('saida')
                  }}
                  style={{ backgroundColor: formCadastrarTransacao.tipo === 'saida' ? '#FF576B' : '#B9B9B9' }}
                >
                  <h1 >Saída</h1>
                </div>
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Valor</label>
                <input id='valor' className='form-login__edit' type='text' name='valor' value={formCadastrarTransacao.valor} onChange={onChangeCadastrar} />
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Categoria</label>
                <select className='selectedCategory' name='categoria_id' onChange={onChangeCadastrar}>
                  <option value=""></option>
                  {arrayCategorias.map(item => {
                    return (
                      <option key={item.id} value={item.id}>{item.descricao}</option>
                    )
                  })
                  }
                </select>
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Data</label>
                <input id='data' className='form-login__edit' type='text' name='data' placeholder='dd/mm/yyyy' value={formCadastrarTransacao.data} onChange={onChangeCadastrar} />
              </div>
              <div className='editInput'>
                <label className='labelEdit'>Descrição</label>
                <input id='descrição' className='form-login__edit' type='text' name='descricao' value={formCadastrarTransacao.descricao} onChange={onChangeCadastrar} />
              </div>
              <span className='editUserError'>{warning.show && warning.msg}</span>
              <div className="edit-btn">
                <button className='btn-confirm' type='submit'>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
        }
      </div >
    </div >
  );
}

export default Main;
