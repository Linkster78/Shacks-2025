import rats from "./rats";

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('rats', rats);