import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Redirect({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate("/Main");
        }
    }, []);

    return (children)
}

export default Redirect;