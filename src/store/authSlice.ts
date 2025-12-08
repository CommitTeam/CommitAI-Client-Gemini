import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface AuthState{
    username:string;
    password:string;
    email:string;
    accessToken:string;
    refreshToken:string;
    coins:number;
}

const initialState:AuthState={
    username:'',
    password: '',
    email: '',
    accessToken: '',
    refreshToken: '',
    coins:0,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUsername: (state, action: PayloadAction<string>) => {
            state.username = action.payload;
        },
        setPassword: (state, action: PayloadAction<string>) => {
            state.password = action.payload;
        },
        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        setRefreshToken: (state, action: PayloadAction<string>) => {
            state.refreshToken = action.payload;
        },
        setCoins: (state, action: PayloadAction<number>) => {
            state.coins = action.payload;
        },
        login: (state, action: PayloadAction<{ email: string; password: string; accessToken: string; refreshToken: string; }>) => {
            state.email = action.payload.email;
            state.password = action.payload.password;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        resetAuth: () =>  initialState,
    }
})

export const {setUsername, setPassword, setEmail, setAccessToken, setRefreshToken, setCoins, login, resetAuth} = authSlice.actions
export default authSlice.reducer;