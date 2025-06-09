import react,{createContext, useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
const AuthContext = createContext()

const AuthProvider = ({children}) => {
    const [state, setState] = react.useState({
        user: null,
        token: "",
        role: "",
    })

    
    useEffect(() => {
        const loadLocalStorageData = async () => {
            try {
                const data = await AsyncStorage.getItem('@auth');
                if (data) {
                    const loginData = JSON.parse(data);
                    console.log("Loading auth data from AsyncStorage:", loginData);
                    setState({
                        user: loginData?.user, 
                        token: loginData?.token, 
                        role: loginData?.role
                    });
                }
            } catch (error) {
                console.log("Error loading auth data from AsyncStorage:", error);
            }
        };
        loadLocalStorageData();
    }, [])

    let token = state && state.token
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    axios.defaults.baseURL = 'http://10.55.17.30:8080/api/v1'

return (
    <AuthContext.Provider value={[state, setState]}>
        {children}
    </AuthContext.Provider>
)
}
export {AuthContext, AuthProvider};
