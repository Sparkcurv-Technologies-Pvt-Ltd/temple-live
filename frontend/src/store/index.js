import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk"
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import rootReducer from "src/store/rootReducer";

const persistConfig ={
    key:'root',
    version:1,
    storage,
    whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig,rootReducer);

export const store = configureStore({
    reducer:persistedReducer,
    middleware:[thunk],
    devTools:true
});

export const persistor = persistStore(store);