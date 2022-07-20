import { useNavigate } from "react-router-dom";

function HandleLogOut() {
    const navigate = useNavigate();
    localStorage.clear()

    navigate('/');

}

export default HandleLogOut;